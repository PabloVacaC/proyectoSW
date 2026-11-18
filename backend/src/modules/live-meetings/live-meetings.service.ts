// backend/src/modules/live-meetings/live-meetings.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateLiveMeetingDto } from './dto/create-live-meeting.dto';
import { UpdateLiveMeetingDto } from './dto/update-live-meeting.dto';
import { LiveMeetingStatus, Role } from '@prisma/client';

@Injectable()
export class LiveMeetingsService {
  private readonly logger = new Logger(LiveMeetingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida coherencia temporal:
   * 1. endTime debe ser estrictamente posterior a startTime.
   * 2. La fecha y hora de inicio no deben ser del pasado.
   */
  private validateMeetingSchedule(dateStr: string, startTime: string, endTime: string) {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      throw new BadRequestException(
        'La hora de finalización debe ser estrictamente posterior a la hora de inicio.',
      );
    }

    // Comprobar si date + startTime ya pasó
    const [year, month, day] = dateStr.split('-').map(Number);
    const meetingStartDate = new Date(year, month - 1, day, startH, startM, 0);
    const now = new Date();

    if (meetingStartDate.getTime() < now.getTime() - 60000) {
      // 1 minuto de tolerancia
      throw new BadRequestException(
        'No se pueden programar reuniones en fechas u horarios que ya pasaron.',
      );
    }
  }

  /**
   * Resuelve el estado en tiempo real (SCHEDULED, IN_PROGRESS, FINISHED, CANCELLED)
   */
  public computeMeetingStatus(
    date: Date,
    startTime: string,
    endTime: string,
    persistedStatus: LiveMeetingStatus,
  ): LiveMeetingStatus {
    if (persistedStatus === LiveMeetingStatus.CANCELLED) {
      return LiveMeetingStatus.CANCELLED;
    }

    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const start = new Date(year, month, day, startH, startM, 0).getTime();
    const end = new Date(year, month, day, endH, endM, 0).getTime();
    const now = Date.now();

    if (now < start) {
      return LiveMeetingStatus.SCHEDULED;
    } else if (now >= start && now <= end) {
      return LiveMeetingStatus.IN_PROGRESS;
    } else {
      return LiveMeetingStatus.FINISHED;
    }
  }

  /**
   * RF-02 & RF-03: Crear una nueva reunión en vivo asociada a un curso.
   */
  async create(teacherId: string, dto: CreateLiveMeetingDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      select: { id: true, title: true, teacherId: true },
    });

    if (!course) {
      throw new NotFoundException(`El curso seleccionado con ID ${dto.courseId} no existe.`);
    }

    if (course.teacherId !== teacherId) {
      throw new ForbiddenException(
        'No tienes permisos para programar reuniones en este curso ya que no eres el docente asignado.',
      );
    }

    this.validateMeetingSchedule(dto.date, dto.startTime, dto.endTime);

    // Advertencia de reunión duplicada (CE-08)
    const existingSameSlot = await this.prisma.liveMeeting.findFirst({
      where: {
        courseId: dto.courseId,
        date: new Date(dto.date + 'T00:00:00.000Z'),
        startTime: dto.startTime,
        status: { not: LiveMeetingStatus.CANCELLED },
      },
    });

    if (existingSameSlot) {
      this.logger.warn(
        `Aviso: Ya existe una reunión programada en el curso ${course.title} para la misma fecha y hora.`,
      );
    }

    const meeting = await this.prisma.liveMeeting.create({
      data: {
        courseId: dto.courseId,
        teacherId,
        title: dto.title.trim(),
        description: dto.description.trim(),
        date: new Date(dto.date + 'T00:00:00.000Z'),
        startTime: dto.startTime,
        endTime: dto.endTime,
        meetingUrl: dto.meetingUrl.trim(),
        status: LiveMeetingStatus.SCHEDULED,
      },
      include: {
        course: { select: { id: true, title: true } },
        teacher: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      ...meeting,
      status: this.computeMeetingStatus(
        meeting.date,
        meeting.startTime,
        meeting.endTime,
        meeting.status,
      ),
    };
  }

  /**
   * RF-06, RF-07, RF-16: Consultar reuniones de un curso específico.
   * Si es estudiante, comprueba inscripción obligatoria en el backend.
   */
  async findByCourse(courseId: string, userId: string, userRole: Role) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, teacherId: true },
    });

    if (!course) {
      throw new NotFoundException(`Curso con ID ${courseId} no encontrado.`);
    }

    if (userRole === Role.STUDENT) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (!enrollment) {
        throw new ForbiddenException(
          'Debes estar inscrito en este curso para consultar las reuniones en vivo.',
        );
      }
    }

    const meetings = await this.prisma.liveMeeting.findMany({
      where: { courseId },
      include: {
        teacher: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    return meetings.map((m) => {
      const dynamicStatus = this.computeMeetingStatus(m.date, m.startTime, m.endTime, m.status);
      return {
        id: m.id,
        courseId: m.courseId,
        courseTitle: m.course?.title || '',
        teacherId: m.teacherId,
        teacherName: m.teacher?.name || 'Docente Skylearn',
        title: m.title,
        description: m.description,
        date: m.date.toISOString().split('T')[0],
        startTime: m.startTime,
        endTime: m.endTime,
        meetingUrl: m.meetingUrl,
        status: dynamicStatus,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      };
    });
  }

  /**
   * RF-14: Consultar las reuniones gestionadas por el docente autenticado.
   */
  async findByTeacher(teacherId: string) {
    const meetings = await this.prisma.liveMeeting.findMany({
      where: { teacherId },
      include: {
        course: { select: { id: true, title: true } },
        teacher: { select: { id: true, name: true } },
      },
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
    });

    return meetings.map((m) => {
      const dynamicStatus = this.computeMeetingStatus(m.date, m.startTime, m.endTime, m.status);
      return {
        id: m.id,
        courseId: m.courseId,
        courseTitle: m.course?.title || '',
        teacherId: m.teacherId,
        teacherName: m.teacher?.name || 'Docente Skylearn',
        title: m.title,
        description: m.description,
        date: m.date.toISOString().split('T')[0],
        startTime: m.startTime,
        endTime: m.endTime,
        meetingUrl: m.meetingUrl,
        status: dynamicStatus,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      };
    });
  }

  /**
   * RF-08: Consultar una reunión por ID con validación de acceso.
   */
  async findOne(id: string, userId: string, userRole: Role) {
    const meeting = await this.prisma.liveMeeting.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true, teacherId: true } },
        teacher: { select: { id: true, name: true } },
      },
    });

    if (!meeting) {
      throw new NotFoundException(`Reunión con ID ${id} no encontrada.`);
    }

    if (userRole === Role.STUDENT) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: meeting.courseId,
          },
        },
      });

      if (!enrollment) {
        throw new ForbiddenException(
          'Debes estar inscrito en este curso para acceder a los detalles de esta reunión.',
        );
      }
    } else if (userRole === Role.TEACHER && meeting.teacherId !== userId) {
      throw new ForbiddenException('No tienes permisos para consultar esta reunión de otro docente.');
    }

    const dynamicStatus = this.computeMeetingStatus(
      meeting.date,
      meeting.startTime,
      meeting.endTime,
      meeting.status,
    );

    return {
      id: meeting.id,
      courseId: meeting.courseId,
      courseTitle: meeting.course?.title || '',
      teacherId: meeting.teacherId,
      teacherName: meeting.teacher?.name || 'Docente Skylearn',
      title: meeting.title,
      description: meeting.description,
      date: meeting.date.toISOString().split('T')[0],
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      meetingUrl: meeting.meetingUrl,
      status: dynamicStatus,
      createdAt: meeting.createdAt,
      updatedAt: meeting.updatedAt,
    };
  }

  /**
   * RF-11: Modificar una reunión programada (Solo el docente creador).
   */
  async update(id: string, teacherId: string, dto: UpdateLiveMeetingDto) {
    const meeting = await this.prisma.liveMeeting.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!meeting) {
      throw new NotFoundException(`Reunión con ID ${id} no encontrada.`);
    }

    if (meeting.teacherId !== teacherId) {
      throw new ForbiddenException(
        'No tienes permisos para modificar esta reunión porque pertenece a otro docente.',
      );
    }

    if (meeting.status === LiveMeetingStatus.CANCELLED) {
      throw new BadRequestException('No se puede modificar una reunión que ya ha sido cancelada.');
    }

    // Si se cambia el curso, verificar que pertenezca al docente
    const targetCourseId = dto.courseId || meeting.courseId;
    if (dto.courseId && dto.courseId !== meeting.courseId) {
      const newCourse = await this.prisma.course.findUnique({
        where: { id: dto.courseId },
      });
      if (!newCourse) {
        throw new NotFoundException(`El nuevo curso con ID ${dto.courseId} no existe.`);
      }
      if (newCourse.teacherId !== teacherId) {
        throw new ForbiddenException(
          'No puedes transferir la reunión a un curso que no te ha sido asignado.',
        );
      }
    }

    const targetDate = dto.date || meeting.date.toISOString().split('T')[0];
    const targetStartTime = dto.startTime || meeting.startTime;
    const targetEndTime = dto.endTime || meeting.endTime;

    this.validateMeetingSchedule(targetDate, targetStartTime, targetEndTime);

    const updated = await this.prisma.liveMeeting.update({
      where: { id },
      data: {
        courseId: targetCourseId,
        title: dto.title !== undefined ? dto.title.trim() : undefined,
        description: dto.description !== undefined ? dto.description.trim() : undefined,
        date: dto.date ? new Date(dto.date + 'T00:00:00.000Z') : undefined,
        startTime: dto.startTime || undefined,
        endTime: dto.endTime || undefined,
        meetingUrl: dto.meetingUrl ? dto.meetingUrl.trim() : undefined,
      },
      include: {
        course: { select: { id: true, title: true } },
        teacher: { select: { id: true, name: true } },
      },
    });

    const dynamicStatus = this.computeMeetingStatus(
      updated.date,
      updated.startTime,
      updated.endTime,
      updated.status,
    );

    return {
      id: updated.id,
      courseId: updated.courseId,
      courseTitle: updated.course?.title || '',
      teacherId: updated.teacherId,
      teacherName: updated.teacher?.name || 'Docente Skylearn',
      title: updated.title,
      description: updated.description,
      date: updated.date.toISOString().split('T')[0],
      startTime: updated.startTime,
      endTime: updated.endTime,
      meetingUrl: updated.meetingUrl,
      status: dynamicStatus,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * RF-12: Cancelar una reunión (Soft-cancel con estado CANCELLED).
   */
  async cancel(id: string, teacherId: string) {
    const meeting = await this.prisma.liveMeeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      throw new NotFoundException(`Reunión con ID ${id} no encontrada.`);
    }

    if (meeting.teacherId !== teacherId) {
      throw new ForbiddenException(
        'No tienes permisos para cancelar esta reunión ya que pertenece a otro docente.',
      );
    }

    const cancelled = await this.prisma.liveMeeting.update({
      where: { id },
      data: {
        status: LiveMeetingStatus.CANCELLED,
      },
      include: {
        course: { select: { id: true, title: true } },
        teacher: { select: { id: true, name: true } },
      },
    });

    return {
      id: cancelled.id,
      courseId: cancelled.courseId,
      courseTitle: cancelled.course?.title || '',
      title: cancelled.title,
      status: LiveMeetingStatus.CANCELLED,
      message: 'La reunión ha sido cancelada exitosamente.',
    };
  }
}
