// backend/src/modules/live-meetings/live-meetings.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LiveMeetingsService } from './live-meetings.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { LiveMeetingStatus, Role } from '@prisma/client';

describe('LiveMeetingsService', () => {
  let service: LiveMeetingsService;
  let prisma: any;

  const mockTeacherId = 'teacher-uuid-1';
  const mockCourseId = 'course-uuid-1';
  const mockStudentId = 'student-uuid-1';

  beforeEach(async () => {
    prisma = {
      course: {
        findUnique: jest.fn(),
      },
      liveMeeting: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      enrollment: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveMeetingsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<LiveMeetingsService>(LiveMeetingsService);
  });

  it('debe crear una reunión exitosamente cuando el docente es el titular del curso y los horarios son válidos', async () => {
    prisma.course.findUnique.mockResolvedValue({
      id: mockCourseId,
      title: 'Bases de Datos',
      teacherId: mockTeacherId,
    });

    prisma.liveMeeting.findFirst.mockResolvedValue(null);

    const futureDate = '2030-10-15';
    const mockCreated = {
      id: 'meeting-1',
      courseId: mockCourseId,
      teacherId: mockTeacherId,
      title: 'Clase en vivo: SQL',
      description: 'Consultas avanzadas y subqueries',
      date: new Date(futureDate + 'T00:00:00.000Z'),
      startTime: '19:00',
      endTime: '20:30',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      status: LiveMeetingStatus.SCHEDULED,
      course: { id: mockCourseId, title: 'Bases de Datos' },
      teacher: { id: mockTeacherId, name: 'Profesor Juan' },
    };
    prisma.liveMeeting.create.mockResolvedValue(mockCreated);

    const result = await service.create(mockTeacherId, {
      courseId: mockCourseId,
      title: 'Clase en vivo: SQL',
      description: 'Consultas avanzadas y subqueries',
      date: futureDate,
      startTime: '19:00',
      endTime: '20:30',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
    });

    expect(result.id).toBe('meeting-1');
    expect(result.status).toBe(LiveMeetingStatus.SCHEDULED);
    expect(prisma.liveMeeting.create).toHaveBeenCalled();
  });

  it('debe rechazar la creación con ForbiddenException si el curso no pertenece al docente', async () => {
    prisma.course.findUnique.mockResolvedValue({
      id: mockCourseId,
      title: 'Bases de Datos',
      teacherId: 'other-teacher-id',
    });

    await expect(
      service.create(mockTeacherId, {
        courseId: mockCourseId,
        title: 'Clase no autorizada',
        description: 'Intento de programar',
        date: '2030-10-15',
        startTime: '19:00',
        endTime: '20:30',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('debe rechazar con BadRequestException si endTime es anterior o igual a startTime', async () => {
    prisma.course.findUnique.mockResolvedValue({
      id: mockCourseId,
      title: 'Bases de Datos',
      teacherId: mockTeacherId,
    });

    await expect(
      service.create(mockTeacherId, {
        courseId: mockCourseId,
        title: 'Horario invertido',
        description: 'Prueba de validación',
        date: '2030-10-15',
        startTime: '20:00',
        endTime: '19:00',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('debe impedir a un estudiante no inscrito consultar las reuniones del curso', async () => {
    prisma.course.findUnique.mockResolvedValue({
      id: mockCourseId,
      title: 'Bases de Datos',
      teacherId: mockTeacherId,
    });

    prisma.enrollment.findUnique.mockResolvedValue(null); // No inscrito

    await expect(
      service.findByCourse(mockCourseId, mockStudentId, Role.STUDENT),
    ).rejects.toThrow(ForbiddenException);
  });

  it('debe permitir a un estudiante inscrito consultar las reuniones y calcular el estado en vivo', async () => {
    prisma.course.findUnique.mockResolvedValue({
      id: mockCourseId,
      title: 'Bases de Datos',
      teacherId: mockTeacherId,
    });

    prisma.enrollment.findUnique.mockResolvedValue({
      userId: mockStudentId,
      courseId: mockCourseId,
    });

    prisma.liveMeeting.findMany.mockResolvedValue([
      {
        id: 'meeting-1',
        courseId: mockCourseId,
        teacherId: mockTeacherId,
        title: 'Clase próxima',
        description: 'Agenda',
        date: new Date('2035-01-01T00:00:00.000Z'),
        startTime: '10:00',
        endTime: '11:00',
        meetingUrl: 'https://meet.google.com/test',
        status: LiveMeetingStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date(),
        teacher: { name: 'Profesor Juan' },
        course: { title: 'Bases de Datos' },
      },
    ]);

    const result = await service.findByCourse(mockCourseId, mockStudentId, Role.STUDENT);
    expect(result.length).toBe(1);
    expect(result[0].status).toBe(LiveMeetingStatus.SCHEDULED);
  });

  it('debe cancelar una reunión cambiando el estado a CANCELLED sin eliminarla', async () => {
    prisma.liveMeeting.findUnique.mockResolvedValue({
      id: 'meeting-1',
      teacherId: mockTeacherId,
      status: LiveMeetingStatus.SCHEDULED,
    });

    prisma.liveMeeting.update.mockResolvedValue({
      id: 'meeting-1',
      title: 'Clase cancelada',
      status: LiveMeetingStatus.CANCELLED,
    });

    const res = await service.cancel('meeting-1', mockTeacherId);
    expect(res.status).toBe(LiveMeetingStatus.CANCELLED);
    expect(prisma.liveMeeting.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'meeting-1' },
        data: { status: LiveMeetingStatus.CANCELLED },
      }),
    );
  });
});
