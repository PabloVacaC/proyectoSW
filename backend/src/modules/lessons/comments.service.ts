// backend/src/modules/lessons/comments.service.ts
import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todos los comentarios raíz de una lección con sus respuestas directas (1 nivel)
   * e información pública de los autores (id, nombre, rol).
   */
  async findAllByLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });

    if (!lesson) {
      throw new NotFoundException(`Lección con ID ${lessonId} no encontrada`);
    }

    return this.prisma.lessonComment.findMany({
      where: {
        lessonId,
        parentId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Crea un comentario o respuesta a una lección.
   * Si se responde a un comentario anidado, se normaliza al hilo principal (1 nivel).
   */
  async create(lessonId: string, userId: string, dto: CreateCommentDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });

    if (!lesson) {
      throw new NotFoundException(`Lección con ID ${lessonId} no encontrada`);
    }

    let parentIdToUse: string | null = null;

    if (dto.parentId) {
      const parent = await this.prisma.lessonComment.findUnique({
        where: { id: dto.parentId },
        select: { id: true, lessonId: true, parentId: true },
      });

      if (!parent) {
        throw new NotFoundException(`Comentario padre con ID ${dto.parentId} no encontrado`);
      }

      if (parent.lessonId !== lessonId) {
        throw new ForbiddenException('El comentario padre pertenece a otra lección');
      }

      // Si el padre ya es una respuesta, aplanar al hilo raíz del padre
      parentIdToUse = parent.parentId ? parent.parentId : parent.id;
    }

    const comment = await this.prisma.lessonComment.create({
      data: {
        lessonId,
        userId,
        content: dto.content.trim(),
        parentId: parentIdToUse,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                email: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Nuevo comentario registrado por usuario ${userId} en lección ${lessonId}`);
    return comment;
  }

  /**
   * Elimina un comentario. Permitido solo al autor original o a usuarios administradores.
   */
  async remove(commentId: string, userId: string, userRole: string) {
    const comment = await this.prisma.lessonComment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true },
    });

    if (!comment) {
      throw new NotFoundException(`Comentario con ID ${commentId} no encontrado`);
    }

    const isAuthor = comment.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para eliminar este comentario');
    }

    await this.prisma.lessonComment.delete({
      where: { id: commentId },
    });

    return { success: true, message: 'Comentario eliminado correctamente' };
  }
}
