// backend/src/modules/lessons/comments.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: {
    lesson: { findUnique: jest.Mock };
    lessonComment: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; delete: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      lesson: { findUnique: jest.fn() },
      lessonComment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  describe('findAllByLesson', () => {
    it('debe lanzar NotFoundException si la lección no existe', async () => {
      prisma.lesson.findUnique.mockResolvedValue(null);

      await expect(service.findAllByLesson('non-existent-lesson')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe retornar lista de comentarios raíz con sus respuestas y autores', async () => {
      prisma.lesson.findUnique.mockResolvedValue({ id: 'lesson-1' });
      const mockComments = [
        {
          id: 'c1',
          content: 'Gran explicación del tema',
          user: { id: 'u1', name: 'Estudiante 1', role: 'STUDENT' },
          replies: [
            {
              id: 'r1',
              content: 'Gracias por tu aporte',
              user: { id: 'u2', name: 'Profesor', role: 'TEACHER' },
            },
          ],
        },
      ];
      prisma.lessonComment.findMany.mockResolvedValue(mockComments);

      const result = await service.findAllByLesson('lesson-1');
      expect(result).toEqual(mockComments);
      expect(prisma.lessonComment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { lessonId: 'lesson-1', parentId: null },
        }),
      );
    });
  });

  describe('create', () => {
    it('debe lanzar NotFoundException si la lección no existe', async () => {
      prisma.lesson.findUnique.mockResolvedValue(null);

      await expect(
        service.create('lesson-1', 'user-1', { content: 'Hola mundo' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe crear un comentario raíz correctamente', async () => {
      prisma.lesson.findUnique.mockResolvedValue({ id: 'lesson-1' });
      const createdMock = {
        id: 'new-c1',
        content: 'Pregunta sobre async/await',
        parentId: null,
      };
      prisma.lessonComment.create.mockResolvedValue(createdMock);

      const result = await service.create('lesson-1', 'user-1', {
        content: 'Pregunta sobre async/await',
      });
      expect(result).toEqual(createdMock);
      expect(prisma.lessonComment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            lessonId: 'lesson-1',
            userId: 'user-1',
            content: 'Pregunta sobre async/await',
            parentId: null,
          },
        }),
      );
    });

    it('debe aplanar una respuesta al padre raíz si el comentario al que se responde ya es una respuesta', async () => {
      prisma.lesson.findUnique.mockResolvedValue({ id: 'lesson-1' });
      // El padre es una respuesta anidada a "root-1"
      prisma.lessonComment.findUnique.mockResolvedValue({
        id: 'reply-1',
        lessonId: 'lesson-1',
        parentId: 'root-1',
      });
      prisma.lessonComment.create.mockResolvedValue({ id: 'reply-2', parentId: 'root-1' });

      await service.create('lesson-1', 'user-1', {
        content: 'Respondiendo a la respuesta',
        parentId: 'reply-1',
      });

      expect(prisma.lessonComment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            parentId: 'root-1',
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('debe permitir al autor eliminar su propio comentario', async () => {
      prisma.lessonComment.findUnique.mockResolvedValue({ id: 'c1', userId: 'user-1' });
      prisma.lessonComment.delete.mockResolvedValue({ id: 'c1' });

      const result = await service.remove('c1', 'user-1', 'STUDENT');
      expect(result.success).toBe(true);
      expect(prisma.lessonComment.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
    });

    it('debe permitir a un administrador eliminar cualquier comentario', async () => {
      prisma.lessonComment.findUnique.mockResolvedValue({ id: 'c1', userId: 'other-user' });
      prisma.lessonComment.delete.mockResolvedValue({ id: 'c1' });

      const result = await service.remove('c1', 'admin-id', 'ADMIN');
      expect(result.success).toBe(true);
      expect(prisma.lessonComment.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
    });

    it('debe arrojar ForbiddenException si un usuario distinto al autor intenta eliminar', async () => {
      prisma.lessonComment.findUnique.mockResolvedValue({ id: 'c1', userId: 'user-owner' });

      await expect(service.remove('c1', 'stranger-id', 'STUDENT')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
