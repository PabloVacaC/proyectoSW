// backend/src/modules/recommendations/recommendations.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GeminiService } from '../../common/services/gemini.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { EvaluateDiagnosticDto } from './dto/diagnostic.dto';
import { CourseStatus } from '@prisma/client';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  /**
   * RF-03.2: Genera un cuestionario simple de 3 a 5 preguntas con incisos de opción múltiple
   * elaborado a partir de los cursos y categorías activas.
   */
  async getQuiz() {
    const courses = await this.prisma.course.findMany({
      where: { status: CourseStatus.PUBLISHED },
      include: { category: true },
      take: 5,
    });

    const categoriesList = Array.from(new Set(courses.map((c) => c.category?.name || 'General')));

    return {
      title: 'Descubre qué Aprender en Skylearn',
      description: 'Responde estas breves preguntas para generar tu ruta personalizada sin costo de créditos.',
      questions: [
        {
          id: 'q-interests',
          text: '¿Qué área tecnológica te despierta mayor curiosidad aprender?',
          options: categoriesList.length > 0
            ? categoriesList
            : ['Desarrollo Web Frontend', 'Backend y APIs', 'Inteligencia Artificial', 'Diseño UI/UX'],
        },
        {
          id: 'q-experience',
          text: '¿Cuál es tu nivel de experiencia en programación?',
          options: [
            'Principiante absoluto (desde cero)',
            'Básico (he escrito código simple o HTML)',
            'Intermedio (he creado proyectos pequeños)',
          ],
        },
        {
          id: 'q-goal',
          text: '¿Cuál es tu principal objetivo de aprendizaje?',
          options: [
            'Aprender jugando y con tutoría virtual paso a paso',
            'Crear mi primera aplicación completa para mi portafolio',
            'Comprender la lógica de algoritmos y programación',
          ],
        },
      ],
    };
  }

  /**
   * RF-03.3 & RF-03.4 & RF-04.1:
   * Procesa las respuestas, ensambla la LearningPath con Gemini (o fallback) a costo 0 de créditos
   * e inscribe al alumno con enlace directo de redirección.
   */
  async submitQuiz(userId: string, dto: SubmitQuizDto) {
    this.logger.log(`Procesando respuestas del cuestionario para el usuario: ${userId}`);

    const courses = await this.prisma.course.findMany({
      where: { status: CourseStatus.PUBLISHED },
      include: {
        category: true,
        modules: {
          include: {
            lessons: { orderBy: { order: 'asc' } },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Fallback heurístico determinista si no hay cursos o si Gemini falla
    const defaultCourse = courses[0];
    const defaultLesson = defaultCourse?.modules[0]?.lessons[0];

    const fallbackGenerator = () => {
      this.logger.warn('Ejecutando compilación determinista por fallback heurístico.');
      return {
        selectedCourseId: defaultCourse?.id || 'demo-course',
        courseTitle: defaultCourse?.title || 'Curso Recomendado',
        recommendedLessonId: defaultLesson?.id || 'demo-lesson',
        pathTitle: `Ruta Adaptativa: ${defaultCourse?.title || 'General'}`,
        reason: 'Ruta secuenciada según tu nivel de partida y preferencias seleccionadas.',
      };
    };

    let aiRecommendation = fallbackGenerator();

    if (courses.length > 0) {
      const prompt = `Actúa como asesor pedagógico del LMS Skylearn.
Cursos disponibles: ${JSON.stringify(
        courses.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category?.name,
          firstLessonId: c.modules[0]?.lessons[0]?.id,
        })),
      )}.
Respuestas del estudiante al test: ${JSON.stringify(dto.answers)}.
Selecciona el curso más idóneo y responde ÚNICAMENTE en JSON con formato:
{
  "selectedCourseId": string,
  "courseTitle": string,
  "recommendedLessonId": string,
  "pathTitle": string,
  "reason": string
}`;

      aiRecommendation = await this.geminiService.generateJson(prompt, fallbackGenerator);
    }

    // Persistir la LearningPath adaptativa en base de datos
    const targetCourse = courses.find((c) => c.id === aiRecommendation.selectedCourseId) || defaultCourse;
    const targetLessonId =
      aiRecommendation.recommendedLessonId || targetCourse?.modules[0]?.lessons[0]?.id;

    let learningPathId = 'path-demo';
    if (targetCourse) {
      const learningPath = await this.prisma.learningPath.create({
        data: {
          userId,
          title: aiRecommendation.pathTitle,
          nodes: {
            create: targetCourse.modules.flatMap((m, mIdx) =>
              m.lessons.map((l, lIdx) => ({
                moduleId: m.id,
                lessonId: l.id,
                order: mIdx * 10 + lIdx + 1,
                reason: l.id === targetLessonId ? 'Punto de inicio recomendado' : 'Contenido complementario',
              })),
            ),
          },
        },
      });
      learningPathId = learningPath.id;

      // Inscribir automáticamente al alumno sin costo
      await this.prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId: targetCourse.id,
          },
        },
        update: {},
        create: {
          userId,
          courseId: targetCourse.id,
        },
      });
    }

    return {
      courseId: targetCourse?.id || 'demo-course',
      courseTitle: targetCourse?.title || 'Desarrollo Web Fullstack',
      lessonId: targetLessonId,
      redirectUrl: `/lessons/${targetLessonId}`,
      learningPathId,
      actionButton: {
        label: 'Comenzar Primera Lección',
        url: `/lessons/${targetLessonId}`,
        color: 'sky',
      },
    };
  }

  /**
   * SPEC-007 (RF-1): Obtiene módulos activos del catálogo curricular para el diagnóstico
   */
  async getAvailableModules() {
    const courses = await this.prisma.course.findMany({
      where: { status: CourseStatus.PUBLISHED },
      include: {
        category: true,
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: { id: true, title: true, order: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return courses.flatMap((course) =>
      course.modules
        .filter((mod) => mod.lessons.length > 0)
        .map((mod) => ({
          id: mod.id,
          title: mod.title,
          order: mod.order,
          courseId: course.id,
          courseTitle: course.title,
          category: course.category?.name || 'General',
          lessonsCount: mod.lessons.length,
          lessons: mod.lessons,
        })),
    );
  }

  /**
   * SPEC-007 (RF-2, RF-3, RF-4, RF-5, RF-7):
   * Genera preguntas de diagnóstico contextualizadas con los contenidos reales de las lecciones
   */
  async generateModuleDiagnostic(moduleId: string) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: { include: { category: true } },
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            exams: {
              include: {
                questions: {
                  include: { options: true },
                },
              },
            },
          },
        },
      },
    });

    if (!module || module.lessons.length === 0) {
      throw new NotFoundException(
        'El módulo seleccionado no cuenta con suficientes lecciones para generar un diagnóstico.',
      );
    }

    const lessonsData = module.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      order: l.order,
      context: l.contextText || l.title,
    }));

    const fallbackGenerator = () => {
      const fallbackQuestions = module.lessons.slice(0, 5).map((lesson, idx) => ({
        id: `diag-q-${lesson.id}-${idx}`,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        text: `¿Qué concepto clave se aborda principalmente en "${lesson.title}"?`,
        options: [
          `Fundamentos y aplicación de ${lesson.title}`,
          'Estructuras obsoletas no utilizadas',
          'Sintaxis de bibliotecas descontinuadas',
          'Configuraciones externas no relacionadas con el tema',
        ],
        correctOptionIndex: 0,
      }));

      return {
        title: `Diagnóstico de Conocimientos Previos: ${module.title}`,
        moduleId: module.id,
        moduleTitle: module.title,
        courseTitle: module.course.title,
        questions: fallbackQuestions,
      };
    };

    const prompt = `Actúa como diseñador pedagógico y evaluador de Skylearn.
Módulo curricular: "${module.title}" del curso "${module.course.title}".
Lecciones reales disponibles:
${lessonsData.map((l) => `- Lección (id: "${l.id}", orden: ${l.order}): "${l.title}". Contexto didáctico: "${l.context}"`).join('\n')}

Genera un examen de diagnóstico inteligente de conocimientos previos de entre 4 y 6 preguntas de opción múltiple (4 opciones por pregunta).
REGLAS ESTRICTAS:
1. Cada pregunta DEBE evaluar un concepto concreto de una de las lecciones reales indicadas.
2. Cada pregunta debe incluir exactamente el "lessonId" correspondiente.
3. "correctOptionIndex" debe ser un número entre 0 y 3 indicando la opción correcta.
4. Distribuye las preguntas de forma equilibrada a lo largo de las lecciones del módulo.

Responde ÚNICAMENTE en JSON válido con la siguiente estructura:
{
  "title": "Diagnóstico de Conocimientos Previos: ${module.title}",
  "moduleId": "${module.id}",
  "moduleTitle": "${module.title}",
  "courseTitle": "${module.course.title}",
  "questions": [
    {
      "id": string,
      "lessonId": string,
      "lessonTitle": string,
      "text": string,
      "options": [string, string, string, string],
      "correctOptionIndex": number
    }
  ]
}`;

    const aiResult = await this.geminiService.generateJson(prompt, fallbackGenerator);

    const validLessonIds = new Set(module.lessons.map((l) => l.id));
    const rawQuestions = Array.isArray(aiResult?.questions) ? aiResult.questions : [];
    const normalizedQuestions = rawQuestions.map((q: any, i: number) => {
      const lessonMatch = validLessonIds.has(q.lessonId)
        ? module.lessons.find((l) => l.id === q.lessonId)
        : module.lessons[i % module.lessons.length];

      return {
        id: q.id || `diag-q-${i}`,
        lessonId: lessonMatch?.id || module.lessons[0].id,
        lessonTitle: lessonMatch?.title || module.lessons[0].title,
        text: q.text || `Pregunta sobre ${lessonMatch?.title}`,
        options:
          Array.isArray(q.options) && q.options.length >= 2
            ? q.options
            : ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
        correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
      };
    });

    return {
      title: aiResult?.title || `Diagnóstico: ${module.title}`,
      moduleId: module.id,
      moduleTitle: module.title,
      courseId: module.course.id,
      courseTitle: module.course.title,
      questions: normalizedQuestions.length > 0 ? normalizedQuestions : fallbackGenerator().questions,
    };
  }

  /**
   * SPEC-007 (RF-9 a RF-16):
   * Analiza las respuestas del diagnóstico, detecta conocimientos dominados y pendientes,
   * e indica la lección exacta recomendada para comenzar el aprendizaje (costo 0 créditos).
   */
  async evaluateModuleDiagnostic(userId: string, dto: EvaluateDiagnosticDto) {
    const module = await this.prisma.module.findUnique({
      where: { id: dto.moduleId },
      include: {
        course: true,
        lessons: { orderBy: { order: 'asc' } },
      },
    });

    if (!module || module.lessons.length === 0) {
      throw new NotFoundException('Módulo no encontrado o sin lecciones disponibles.');
    }

    const lessons = module.lessons;
    const totalQuestions = dto.answers.length;
    let correctCount = 0;

    const lessonPerformance = new Map<string, { correct: number; total: number }>();
    lessons.forEach((l) => lessonPerformance.set(l.id, { correct: 0, total: 0 }));

    dto.answers.forEach((ans) => {
      const isCorrect = Boolean(ans.isCorrect);
      if (isCorrect) correctCount++;
      const current = lessonPerformance.get(ans.lessonId) || { correct: 0, total: 0 };
      current.total++;
      if (isCorrect) current.correct++;
      lessonPerformance.set(ans.lessonId, current);
    });

    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const masteredLessons: Array<{ id: string; title: string; order: number }> = [];
    const pendingLessons: Array<{ id: string; title: string; order: number; reason: string }> = [];

    lessons.forEach((l) => {
      const perf = lessonPerformance.get(l.id);
      if (!perf || perf.total === 0) {
        if (scorePercentage >= 80) {
          masteredLessons.push({ id: l.id, title: l.title, order: l.order });
        } else {
          pendingLessons.push({
            id: l.id,
            title: l.title,
            order: l.order,
            reason: 'Concepto clave por consolidar',
          });
        }
      } else if (perf.correct === perf.total && perf.total > 0) {
        masteredLessons.push({ id: l.id, title: l.title, order: l.order });
      } else {
        pendingLessons.push({
          id: l.id,
          title: l.title,
          order: l.order,
          reason: `Presentó dudas en ${perf.total - perf.correct} de ${perf.total} preguntas evaluadas`,
        });
      }
    });

    // Lección recomendada: primera lección pendiente según orden curricular
    let recommendedLesson =
      pendingLessons.length > 0
        ? lessons.find((l) => l.id === pendingLessons[0].id) || lessons[0]
        : lessons[lessons.length - 1];

    let knowledgeLevel: 'Principiante' | 'Intermedio' | 'Avanzado' = 'Principiante';
    if (scorePercentage >= 80) knowledgeLevel = 'Avanzado';
    else if (scorePercentage >= 50) knowledgeLevel = 'Intermedio';

    let justification = '';
    if (scorePercentage >= 80) {
      justification = `¡Excelente dominio! Demuestras conocimientos sólidos en la mayoría de los temas de "${module.title}". Te recomendamos comenzar directamente desde "${recommendedLesson.title}" para no repetir conceptos que ya conoces.`;
    } else if (scorePercentage >= 50) {
      justification = `Tienes una base positiva sobre los temas iniciales, pero detectamos conceptos que debes reforzar. Te sugerimos iniciar en "${recommendedLesson.title}".`;
    } else {
      justification = `Estás dando tus primeros pasos en "${module.title}". Te sugerimos comenzar desde el inicio en "${recommendedLesson.title}" para construir unas bases sólidas paso a paso.`;
    }

    // Inscribir al estudiante automáticamente al curso sin costo de créditos (RF-04.1)
    if (userId) {
      await this.prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId: module.course.id,
          },
        },
        update: {},
        create: {
          userId,
          courseId: module.course.id,
        },
      });
    }

    return {
      moduleId: module.id,
      moduleTitle: module.title,
      courseId: module.course.id,
      courseTitle: module.course.title,
      knowledgeLevel,
      scorePercentage,
      totalQuestions,
      correctAnswers: correctCount,
      masteredLessons,
      pendingLessons,
      recommendedLesson: {
        id: recommendedLesson.id,
        title: recommendedLesson.title,
        order: recommendedLesson.order,
        url: `/lessons/${recommendedLesson.id}`,
      },
      justification,
    };
  }
}
