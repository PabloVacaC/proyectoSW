// backend/src/modules/analytics/academic-analytics.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('AnalyticsService - Academic Intelligence (SPEC-003)', () => {
  let service: AnalyticsService;
  let prisma: {
    user: { count: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock };
    course: { count: jest.Mock; findMany: jest.Mock };
    enrollment: { count: jest.Mock; findMany: jest.Mock };
    examAttempt: { count: jest.Mock; findMany: jest.Mock };
    lessonProgress: { count: jest.Mock };
    question: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      user: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
      course: { count: jest.fn(), findMany: jest.fn() },
      enrollment: { count: jest.fn(), findMany: jest.fn() },
      examAttempt: { count: jest.fn(), findMany: jest.fn() },
      lessonProgress: { count: jest.fn() },
      question: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  describe('getAdminSummary', () => {
    it('debe calcular los 7 KPIs generales con precisión matemática', async () => {
      prisma.user.count.mockResolvedValue(25);
      prisma.course.count.mockResolvedValue(5);
      prisma.enrollment.findMany.mockResolvedValue([
        { userId: 'u1', courseId: 'c1' },
        { userId: 'u2', courseId: 'c1' },
        { userId: 'u1', courseId: 'c2' }, // mismo alumno en 2 cursos
      ]);
      prisma.examAttempt.findMany.mockResolvedValue([
        { score: 80, isPassed: true, userId: 'u1' },
        { score: 60, isPassed: false, userId: 'u2' },
        { score: 100, isPassed: true, userId: 'u1' },
      ]);
      prisma.lessonProgress.count.mockResolvedValue(42);

      const res = await service.getAdminSummary();

      expect(res.totalStudents).toBe(25);
      expect(res.totalCourses).toBe(5);
      expect(res.totalEnrollments).toBe(3);
      expect(res.uniqueEnrolledStudents).toBe(2);
      expect(res.averageScore).toBe(80); // (80 + 60 + 100) / 3 = 80
      expect(res.passRate).toBe(67); // 2 de 3 = 66.6% -> 67%
      expect(res.totalCompletions).toBe(42);
      expect(res.activeStudentsCount).toBe(2);
    });

    it('debe responder elegantemente con ceros si la plataforma no tiene registros', async () => {
      prisma.user.count.mockResolvedValue(0);
      prisma.course.count.mockResolvedValue(0);
      prisma.enrollment.findMany.mockResolvedValue([]);
      prisma.examAttempt.findMany.mockResolvedValue([]);
      prisma.lessonProgress.count.mockResolvedValue(0);

      const res = await service.getAdminSummary();

      expect(res.totalStudents).toBe(0);
      expect(res.averageScore).toBe(0);
      expect(res.passRate).toBe(0);
      expect(res.activeStudentsCount).toBe(0);
    });
  });

  describe('getAdminQuestionsAnalytics', () => {
    it('debe clasificar preguntas con dificultad Alta y Muestra Insuficiente según umbrales', async () => {
      prisma.question.findMany.mockResolvedValue([
        {
          id: 'q1',
          text: '¿Qué es una clave primaria?',
          exam: {
            lesson: {
              title: 'Modelado Relacional',
              module: { title: 'Módulo 1', course: { id: 'c1', title: 'Bases de Datos' } },
            },
          },
          attemptAnswers: [
            { selectedOption: { isCorrect: false } },
            { selectedOption: { isCorrect: false } },
            { selectedOption: { isCorrect: false } },
            { selectedOption: { isCorrect: true } },
          ], // 3 de 4 incorrectas = 75% error -> CRITICAL
        },
        {
          id: 'q2',
          text: 'Pregunta con 1 respuesta',
          exam: { lesson: { title: 'Intro', module: { course: { title: 'Web' } } } },
          attemptAnswers: [{ selectedOption: { isCorrect: false } }], // < 2 respuestas -> INSUFFICIENT_DATA
        },
      ]);

      const res = await service.getAdminQuestionsAnalytics();

      expect(res.length).toBe(2);
      expect(res[0].id).toBe('q1');
      expect(res[0].difficulty).toBe('CRITICAL');
      expect(res[0].incorrectRate).toBe(75);
      expect(res[1].id).toBe('q2');
      expect(res[1].difficulty).toBe('INSUFFICIENT_DATA');
    });
  });

  describe('getAdminStudentsAnalytics', () => {
    it('debe categorizar estudiantes destacados y con necesidad de refuerzo', async () => {
      prisma.user.findMany.mockResolvedValue([
        {
          id: 's1',
          name: 'Alumno Excelente',
          email: 's1@test.com',
          createdAt: new Date(),
          enrollments: [{ course: { id: 'c1', title: 'Bases de Datos' } }],
          lessonProgresses: [{ lessonId: 'l1' }],
          examAttempts: [{ score: 95, isPassed: true, createdAt: new Date() }],
        },
        {
          id: 's2',
          name: 'Alumno en Riesgo',
          email: 's2@test.com',
          createdAt: new Date(),
          enrollments: [{ course: { id: 'c1', title: 'Bases de Datos' } }],
          lessonProgresses: [],
          examAttempts: [{ score: 50, isPassed: false, createdAt: new Date() }],
        },
      ]);

      const res = await service.getAdminStudentsAnalytics();

      expect(res.topPerformers.length).toBe(1);
      expect(res.topPerformers[0].name).toBe('Alumno Excelente');
      expect(res.topPerformers[0].classification).toBe('TOP_PERFORMER');

      expect(res.needsSupport.length).toBe(1);
      expect(res.needsSupport[0].name).toBe('Alumno en Riesgo');
      expect(res.needsSupport[0].classification).toBe('NEEDS_SUPPORT');
    });
  });
});
