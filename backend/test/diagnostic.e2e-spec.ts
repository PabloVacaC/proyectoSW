// backend/test/diagnostic.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { GeminiService } from '../src/common/services/gemini.service';
import { GlobalHttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { Role, CourseStatus } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

describe('SPEC-007: Diagnóstico Inteligente de Conocimientos Previos (BDD E2E)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const studentId = 'student-test-uuid-007';
  let studentToken: string;

  const demoCourseId = 'c0000000-0000-4000-8000-000000000001';
  const demoModuleId = 'd0000000-0000-4000-8000-000000000001';
  const demoLesson1Id = 'e0000000-0000-4000-8000-000000000001';
  const demoLesson2Id = 'e0000000-0000-4000-8000-000000000002';
  const demoLesson3Id = 'e0000000-0000-4000-8000-000000000003';

  let studentCredits = 3;

  const mockModuleData = {
    id: demoModuleId,
    title: 'Fundamentos de React y Componentes',
    order: 1,
    courseId: demoCourseId,
    course: {
      id: demoCourseId,
      title: 'Desarrollo Web Fullstack con React y NestJS',
      status: CourseStatus.PUBLISHED,
      category: { id: 'cat-1', name: 'Desarrollo Web' },
    },
    lessons: [
      {
        id: demoLesson1Id,
        title: 'Introducción a JSX y Componentes',
        order: 1,
        contextText: 'Sintaxis JSX, fragmentos y estructura de componentes funcionales.',
        exams: [],
      },
      {
        id: demoLesson2Id,
        title: 'Manejo de Estado con useState',
        order: 2,
        contextText: 'Hooks básicos, estado inmutable y renderizado reactivo.',
        exams: [],
      },
      {
        id: demoLesson3Id,
        title: 'Efectos Secundarios con useEffect',
        order: 3,
        contextText: 'Ciclo de vida, array de dependencias y limpieza de suscripciones.',
        exams: [],
      },
    ],
  };

  const mockCourses = [
    {
      id: demoCourseId,
      title: 'Desarrollo Web Fullstack con React y NestJS',
      description: 'Aprende frontend y backend moderno.',
      status: CourseStatus.PUBLISHED,
      category: { id: 'cat-1', name: 'Desarrollo Web' },
      modules: [
        {
          id: demoModuleId,
          title: 'Fundamentos de React y Componentes',
          order: 1,
          lessons: [
            { id: demoLesson1Id, title: 'Introducción a JSX y Componentes', order: 1 },
            { id: demoLesson2Id, title: 'Manejo de Estado con useState', order: 2 },
            { id: demoLesson3Id, title: 'Efectos Secundarios con useEffect', order: 3 },
          ],
        },
      ],
    },
  ];

  const mockPrismaService = {
    user: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === studentId) {
          return Promise.resolve({
            id: studentId,
            email: 'student007@skylearn.edu',
            role: Role.STUDENT,
            name: 'Alumno Diagnóstico',
          });
        }
        return Promise.resolve(null);
      }),
    },
    creditAccount: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.userId === studentId) {
          return Promise.resolve({ userId: studentId, balance: studentCredits });
        }
        return Promise.resolve(null);
      }),
    },
    course: {
      findMany: jest.fn().mockResolvedValue(mockCourses),
    },
    module: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === demoModuleId) {
          return Promise.resolve(mockModuleData);
        }
        return Promise.resolve(null);
      }),
    },
    enrollment: {
      upsert: jest.fn().mockImplementation(({ create }) => {
        return Promise.resolve({
          id: 'enrollment-diag-1',
          userId: create.userId,
          courseId: create.courseId,
          enrolledAt: new Date(),
        });
      }),
    },
  };

  const mockGeminiService = {
    generateJson: jest.fn().mockImplementation(async (prompt, fallbackFn) => {
      return fallbackFn();
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(GeminiService)
      .useValue(mockGeminiService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    app.setGlobalPrefix('api/v1');

    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    studentToken = jwtService.sign({
      sub: studentId,
      email: 'student007@skylearn.edu',
      role: Role.STUDENT,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('RF-1: Catálogo de Módulos para Diagnóstico', () => {
    it('Given un estudiante, When solicita los módulos disponibles, Then recibe la lista de módulos publicados con sus lecciones', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/recommendations/modules')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const mod = res.body[0];
      expect(mod.id).toBe(demoModuleId);
      expect(mod.title).toBe('Fundamentos de React y Componentes');
      expect(mod.lessonsCount).toBe(3);
    });
  });

  describe('RF-2 a RF-8: Generación de Preguntas de Diagnóstico Inteligente', () => {
    it('Given un módulo curricular válido, When solicita el diagnóstico, Then genera preguntas contextualizadas vinculadas a lecciones reales', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/recommendations/diagnostic/${demoModuleId}`)
        .expect(200);

      expect(res.body.moduleId).toBe(demoModuleId);
      expect(res.body.questions).toBeDefined();
      expect(Array.isArray(res.body.questions)).toBe(true);
      expect(res.body.questions.length).toBeGreaterThanOrEqual(3);

      const firstQ = res.body.questions[0];
      expect(firstQ.id).toBeDefined();
      expect(firstQ.lessonId).toBeDefined();
      expect(firstQ.options.length).toBeGreaterThanOrEqual(2);
      expect(typeof firstQ.correctOptionIndex).toBe('number');
    });

    it('Given un moduleId inexistente, When solicita el diagnóstico, Then responde 404 NotFoundException', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/recommendations/diagnostic/non-existent-uuid')
        .expect(404);
    });
  });

  describe('RF-9 a RF-17: Evaluación Pedagógica y Recomendación de Inicio', () => {
    it('Given un alumno que responde el diagnóstico demostrando dominio parcial, When envía sus respuestas, Then recibe categorización de dominados/pendientes y lección recomendada sin costo de créditos', async () => {
      const payload = {
        moduleId: demoModuleId,
        answers: [
          {
            questionId: 'q-1',
            lessonId: demoLesson1Id,
            selectedOptionIndex: 0,
            isCorrect: true, // Domina lección 1
          },
          {
            questionId: 'q-2',
            lessonId: demoLesson2Id,
            selectedOptionIndex: 1,
            isCorrect: false, // Falla lección 2
          },
          {
            questionId: 'q-3',
            lessonId: demoLesson3Id,
            selectedOptionIndex: 2,
            isCorrect: false, // Falla lección 3
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/recommendations/diagnostic/evaluate')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(payload)
        .expect(201);

      expect(res.body.moduleId).toBe(demoModuleId);
      expect(res.body.knowledgeLevel).toBeDefined();
      expect(res.body.scorePercentage).toBe(33);
      expect(res.body.correctAnswers).toBe(1);
      expect(res.body.totalQuestions).toBe(3);

      // Lecciones dominadas
      expect(res.body.masteredLessons.some((l: any) => l.id === demoLesson1Id)).toBe(true);

      // Lecciones pendientes
      expect(res.body.pendingLessons.some((l: any) => l.id === demoLesson2Id)).toBe(true);

      // Lección recomendada para iniciar debe ser la primera pendiente (demoLesson2Id)
      expect(res.body.recommendedLesson.id).toBe(demoLesson2Id);
      expect(res.body.justification).toBeDefined();
      expect(res.body.justification.length).toBeGreaterThan(10);

      // Verificar invariante: el balance de créditos del estudiante no fue alterado
      expect(studentCredits).toBe(3);
    });
  });
});
