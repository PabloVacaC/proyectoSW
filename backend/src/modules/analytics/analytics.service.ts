// backend/src/modules/analytics/analytics.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AcademicFilterDto } from './dto/academic-filter.dto';

export type TrafficLightStatus = 'leaf' | 'sun' | 'coral';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper privado para construir cláusulas where de fecha
   */
  private buildDateFilter(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) return undefined;
    const dateClause: any = {};
    if (startDate) dateClause.gte = new Date(startDate);
    if (endDate) dateClause.lte = new Date(endDate);
    return dateClause;
  }

  /**
   * RF-02: Resumen general de indicadores KPI (Inteligencia Académica)
   */
  async getAdminSummary(filter?: AcademicFilterDto) {
    const dateClause = this.buildDateFilter(filter?.startDate, filter?.endDate);

    // 1. Total estudiantes registrados
    const totalStudents = await this.prisma.user.count({
      where: { role: 'STUDENT' },
    });

    // 2. Cursos publicados disponibles
    const totalCourses = await this.prisma.course.count({
      where: {
        status: 'PUBLISHED',
        ...(filter?.categoryId ? { categoryId: filter.categoryId } : {}),
      },
    });

    // 3. Total inscripciones y estudiantes únicos inscritos
    const enrollmentsWhere: any = {};
    if (dateClause) enrollmentsWhere.enrolledAt = dateClause;
    if (filter?.courseId) enrollmentsWhere.courseId = filter.courseId;
    if (filter?.categoryId) enrollmentsWhere.course = { categoryId: filter.categoryId };

    const enrollments = await this.prisma.enrollment.findMany({
      where: enrollmentsWhere,
      select: { userId: true, courseId: true },
    });
    const totalEnrollments = enrollments.length;
    const uniqueEnrolledStudents = new Set(enrollments.map((e) => e.userId)).size;

    // 4. Intentos de evaluación y cálculo de rendimiento
    const attemptsWhere: any = {};
    if (dateClause) attemptsWhere.createdAt = dateClause;
    if (filter?.courseId) {
      attemptsWhere.exam = {
        lesson: { module: { courseId: filter.courseId } },
      };
    }

    const attempts = await this.prisma.examAttempt.findMany({
      where: attemptsWhere,
      select: { score: true, isPassed: true, userId: true },
    });

    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((a) => a.isPassed).length;
    const averageScore =
      totalAttempts > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
        : 0;
    const passRate =
      totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

    // 5. Total lecciones completadas
    const progressesWhere: any = { isCompleted: true };
    if (dateClause) progressesWhere.completedAt = dateClause;
    if (filter?.courseId) {
      progressesWhere.lesson = { module: { courseId: filter.courseId } };
    }
    const totalCompletions = await this.prisma.lessonProgress.count({
      where: progressesWhere,
    });

    // 6. Estudiantes activos únicos en el período
    const activeStudentIds = new Set<string>();
    enrollments.forEach((e) => activeStudentIds.add(e.userId));
    attempts.forEach((a) => activeStudentIds.add(a.userId));
    const activeStudentsCount = activeStudentIds.size;

    return {
      totalStudents,
      activeStudentsCount,
      totalCourses,
      totalEnrollments,
      uniqueEnrolledStudents,
      averageScore,
      passRate,
      totalAttempts,
      passedAttempts,
      totalCompletions,
      analyzedPeriod: {
        startDate: filter?.startDate || null,
        endDate: filter?.endDate || null,
      },
    };
  }

  /**
   * RF-03, RF-04, RF-05: Análisis detallado de cursos, distribución y demanda
   */
  async getAdminCoursesAnalytics(filter?: AcademicFilterDto) {
    const dateClause = this.buildDateFilter(filter?.startDate, filter?.endDate);

    const courses = await this.prisma.course.findMany({
      where: {
        ...(filter?.courseId ? { id: filter.courseId } : {}),
        ...(filter?.categoryId ? { categoryId: filter.categoryId } : {}),
      },
      include: {
        category: true,
        teacher: { select: { name: true } },
        enrollments: {
          where: dateClause ? { enrolledAt: dateClause } : undefined,
          select: { userId: true, enrolledAt: true },
        },
        modules: {
          include: {
            lessons: {
              include: {
                progresses: {
                  where: { isCompleted: true },
                  select: { userId: true },
                },
                exams: {
                  include: {
                    attempts: {
                      select: { score: true, isPassed: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const totalPlatformEnrollments = courses.reduce(
      (sum, c) => sum + c.enrollments.length,
      0,
    );

    const courseList = courses.map((course) => {
      const enrolledCount = course.enrollments.length;
      const enrolledUserIds = new Set(course.enrollments.map((e) => e.userId));

      let totalLessons = 0;
      let totalCourseAttempts = 0;
      let passedCourseAttempts = 0;
      let scoreSum = 0;

      course.modules.forEach((mod) => {
        mod.lessons.forEach((lesson) => {
          totalLessons++;
          lesson.exams.forEach((exam) => {
            exam.attempts.forEach((att) => {
              totalCourseAttempts++;
              scoreSum += att.score;
              if (att.isPassed) passedCourseAttempts++;
            });
          });
        });
      });

      const passRate =
        totalCourseAttempts > 0
          ? Math.round((passedCourseAttempts / totalCourseAttempts) * 100)
          : null;
      const averageScore =
        totalCourseAttempts > 0 ? Math.round(scoreSum / totalCourseAttempts) : null;
      const sharePercentage =
        totalPlatformEnrollments > 0
          ? Math.round((enrolledCount / totalPlatformEnrollments) * 100)
          : 0;

      return {
        id: course.id,
        title: course.title,
        category: course.category?.name || 'General',
        teacherName: course.teacher?.name || 'Docente Skylearn',
        status: course.status,
        enrolledCount,
        activeStudents: enrolledUserIds.size,
        totalLessons,
        totalAttempts: totalCourseAttempts,
        averageScore,
        passRate,
        sharePercentage,
      };
    });

    // Ordenar de mayor a menor demanda/inscripciones
    courseList.sort((a, b) => b.enrolledCount - a.enrolledCount);

    // Agrupación por categorías para gráfico circular / donut
    const categoryDistribution: Record<string, number> = {};
    courseList.forEach((c) => {
      categoryDistribution[c.category] =
        (categoryDistribution[c.category] || 0) + c.enrolledCount;
    });

    const categoryList = Object.entries(categoryDistribution).map(([name, count]) => ({
      name,
      count,
      percentage:
        totalPlatformEnrollments > 0
          ? Math.round((count / totalPlatformEnrollments) * 100)
          : 0,
    }));

    return {
      courses: courseList,
      categoryDistribution: categoryList,
      mostPopularCourse: courseList[0] || null,
      leastEnrolledCourse: courseList.length > 0 ? courseList[courseList.length - 1] : null,
      totalPlatformEnrollments,
    };
  }

  /**
   * RF-07: Análisis de preguntas difíciles y cálculo de tasas de error
   */
  async getAdminQuestionsAnalytics(filter?: AcademicFilterDto) {
    const questions = await this.prisma.question.findMany({
      where: filter?.courseId
        ? { exam: { lesson: { module: { courseId: filter.courseId } } } }
        : undefined,
      include: {
        exam: {
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    course: { select: { id: true, title: true } },
                  },
                },
              },
            },
          },
        },
        options: true,
        attemptAnswers: {
          include: {
            selectedOption: true,
          },
        },
      },
    });

    const analyzedQuestions = questions.map((q) => {
      const totalAnswers = q.attemptAnswers.length;
      let correctAnswers = 0;
      let incorrectAnswers = 0;

      q.attemptAnswers.forEach((a) => {
        if (a.selectedOption?.isCorrect) {
          correctAnswers++;
        } else {
          incorrectAnswers++;
        }
      });

      const incorrectRate =
        totalAnswers > 0 ? Math.round((incorrectAnswers / totalAnswers) * 100) : 0;
      const correctRate =
        totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

      // Determinación de nivel de dificultad según RF-07
      let difficulty: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'INSUFFICIENT_DATA';
      let difficultyLabel: string;

      if (totalAnswers < 2) {
        difficulty = 'INSUFFICIENT_DATA';
        difficultyLabel = 'Muestra Insuficiente';
      } else if (incorrectRate > 70) {
        difficulty = 'CRITICAL';
        difficultyLabel = 'Muy Alta';
      } else if (incorrectRate >= 45) {
        difficulty = 'HIGH';
        difficultyLabel = 'Alta';
      } else if (incorrectRate >= 20) {
        difficulty = 'MEDIUM';
        difficultyLabel = 'Media';
      } else {
        difficulty = 'LOW';
        difficultyLabel = 'Baja';
      }

      const lesson = q.exam?.lesson;
      const module = lesson?.module;
      const course = module?.course;

      return {
        id: q.id,
        text: q.text,
        courseTitle: course?.title || 'Curso General',
        lessonTitle: lesson?.title || 'Lección Formativa',
        topic: lesson?.title || module?.title || 'Fundamentos',
        totalAnswers,
        correctAnswers,
        incorrectAnswers,
        correctRate,
        incorrectRate,
        difficulty,
        difficultyLabel,
      };
    });

    // Ordenar de mayor a menor dificultad / porcentaje de fallo
    analyzedQuestions.sort((a, b) => {
      if (a.difficulty === 'INSUFFICIENT_DATA' && b.difficulty !== 'INSUFFICIENT_DATA') return 1;
      if (b.difficulty === 'INSUFFICIENT_DATA' && a.difficulty !== 'INSUFFICIENT_DATA') return -1;
      return b.incorrectRate - a.incorrectRate;
    });

    return analyzedQuestions;
  }

  /**
   * RF-08 & RF-11: Análisis de temas difíciles y fortalezas colectivas
   */
  async getAdminTopicsAnalytics(filter?: AcademicFilterDto) {
    const questionsAnalytics = await this.getAdminQuestionsAnalytics(filter);

    const topicGroups: Record<
      string,
      {
        topic: string;
        courseTitle: string;
        questionsCount: number;
        totalAnswers: number;
        correctAnswers: number;
        incorrectAnswers: number;
      }
    > = {};

    questionsAnalytics.forEach((q) => {
      const key = `${q.courseTitle} - ${q.topic}`;
      if (!topicGroups[key]) {
        topicGroups[key] = {
          topic: q.topic,
          courseTitle: q.courseTitle,
          questionsCount: 0,
          totalAnswers: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
        };
      }
      topicGroups[key].questionsCount++;
      topicGroups[key].totalAnswers += q.totalAnswers;
      topicGroups[key].correctAnswers += q.correctAnswers;
      topicGroups[key].incorrectAnswers += q.incorrectAnswers;
    });

    const topicsList = Object.values(topicGroups).map((t) => {
      const correctRate =
        t.totalAnswers > 0 ? Math.round((t.correctAnswers / t.totalAnswers) * 100) : 0;
      const incorrectRate =
        t.totalAnswers > 0 ? Math.round((t.incorrectAnswers / t.totalAnswers) * 100) : 0;

      let status: 'STRENGTH' | 'NEUTRAL' | 'NEEDS_HELP' | 'INSUFFICIENT';
      let statusLabel: string;

      if (t.totalAnswers < 2) {
        status = 'INSUFFICIENT';
        statusLabel = 'Muestra Insuficiente';
      } else if (correctRate >= 75) {
        status = 'STRENGTH';
        statusLabel = 'Fortaleza Colectiva';
      } else if (correctRate >= 60) {
        status = 'NEUTRAL';
        statusLabel = 'Rendimiento Aceptable';
      } else {
        status = 'NEEDS_HELP';
        statusLabel = 'Requiere Refuerzo';
      }

      return {
        ...t,
        correctRate,
        incorrectRate,
        status,
        statusLabel,
      };
    });

    // Ordenar de mayor a menor dificultad (menor correctRate primero)
    topicsList.sort((a, b) => a.correctRate - b.correctRate);

    const strengths = topicsList.filter((t) => t.status === 'STRENGTH');
    const difficulties = topicsList.filter((t) => t.status === 'NEEDS_HELP');

    return {
      allTopics: topicsList,
      strengths,
      difficulties,
    };
  }

  /**
   * RF-09 & RF-10: Listado y ranking de estudiantes (Destacados vs Dificultades)
   */
  async getAdminStudentsAnalytics(filter?: AcademicFilterDto) {
    const students = await this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        enrollments: {
          include: {
            course: { select: { id: true, title: true } },
          },
        },
        lessonProgresses: {
          where: { isCompleted: true },
          select: { lessonId: true },
        },
        examAttempts: {
          select: { score: true, isPassed: true, createdAt: true },
        },
      },
    });

    const analyzedStudents = students.map((s) => {
      const totalAttempts = s.examAttempts.length;
      const passedAttempts = s.examAttempts.filter((a) => a.isPassed).length;
      const failedAttempts = totalAttempts - passedAttempts;

      const averageScore =
        totalAttempts > 0
          ? Math.round(s.examAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
          : null;

      const passRate =
        totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : null;

      // Clasificación pedagógica
      let classification: 'TOP_PERFORMER' | 'GOOD' | 'NEEDS_SUPPORT' | 'NEW';
      let classificationLabel: string;

      if (totalAttempts === 0) {
        classification = 'NEW';
        classificationLabel = 'Sin Evaluaciones Aún';
      } else if (averageScore! >= 85 && passedAttempts >= 1) {
        classification = 'TOP_PERFORMER';
        classificationLabel = 'Destacado';
      } else if (averageScore! >= 70) {
        classification = 'GOOD';
        classificationLabel = 'Regular';
      } else {
        classification = 'NEEDS_SUPPORT';
        classificationLabel = 'Requiere Apoyo';
      }

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        createdAt: s.createdAt,
        enrolledCoursesCount: s.enrollments.length,
        completedLessonsCount: s.lessonProgresses.length,
        totalAttempts,
        passedAttempts,
        failedAttempts,
        averageScore,
        passRate,
        classification,
        classificationLabel,
      };
    });

    // Separar destacados y con dificultades
    const topPerformers = analyzedStudents
      .filter((s) => s.classification === 'TOP_PERFORMER')
      .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));

    const needsSupport = analyzedStudents
      .filter((s) => s.classification === 'NEEDS_SUPPORT')
      .sort((a, b) => (a.averageScore || 0) - (b.averageScore || 0));

    return {
      allStudents: analyzedStudents,
      topPerformers,
      needsSupport,
    };
  }

  /**
   * RF-12: Perfil académico individual de un estudiante específico
   */
  async getAdminStudentProfile(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: true,
                  },
                },
              },
            },
          },
        },
        lessonProgresses: {
          where: { isCompleted: true },
          include: {
            lesson: { select: { id: true, title: true } },
          },
        },
        examAttempts: {
          include: {
            exam: {
              include: {
                lesson: { select: { id: true, title: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Estudiante con ID ${studentId} no encontrado`);
    }

    const totalAttempts = student.examAttempts.length;
    const passedAttempts = student.examAttempts.filter((a) => a.isPassed).length;
    const averageScore =
      totalAttempts > 0
        ? Math.round(student.examAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
        : null;
    const passRate =
      totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : null;

    // Cursos con progreso porcentual
    const coursesProgress = student.enrollments.map((enr) => {
      const allLessons = enr.course.modules.flatMap((m) => m.lessons);
      const totalCourseLessons = allLessons.length;
      const completedCount = allLessons.filter((l) =>
        student.lessonProgresses.some((p) => p.lessonId === l.id),
      ).length;

      const progressPercentage =
        totalCourseLessons > 0
          ? Math.round((completedCount / totalCourseLessons) * 100)
          : 0;

      return {
        courseId: enr.course.id,
        courseTitle: enr.course.title,
        enrolledAt: enr.enrolledAt,
        totalLessons: totalCourseLessons,
        completedLessons: completedCount,
        progressPercentage,
        isCompleted: progressPercentage === 100 && totalCourseLessons > 0,
      };
    });

    // Historial de exámenes
    const examsHistory = student.examAttempts.map((att) => ({
      attemptId: att.id,
      examTitle: att.exam?.title || 'Evaluación',
      lessonTitle: att.exam?.lesson?.title || 'Clase Formativa',
      score: att.score,
      isPassed: att.isPassed,
      date: att.createdAt,
    }));

    // Fortalezas (exámenes con score >= 80) y temas a reforzar (score < 70)
    const strengths = examsHistory.filter((e) => e.score >= 80);
    const weaknesses = examsHistory.filter((e) => e.score < 70);

    return {
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        createdAt: student.createdAt,
      },
      stats: {
        totalEnrolledCourses: student.enrollments.length,
        totalCompletedLessons: student.lessonProgresses.length,
        totalAttempts,
        passedAttempts,
        averageScore,
        passRate,
      },
      courses: coursesProgress,
      examsHistory,
      strengths,
      weaknesses,
    };
  }

  /**
   * RF-08.1 & RF-08.2:
   * Dashboard global docente existente (mantenido intacto)
   */
  async getTeacherDashboard(teacherId: string) {
    const courses = await this.prisma.course.findMany({
      where: { teacherId },
      include: {
        enrollments: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        modules: {
          include: {
            lessons: {
              include: {
                progresses: true,
                exams: {
                  include: {
                    attempts: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 1. KPI: Total alumnos activos (únicos)
    const uniqueStudentIds = new Set<string>();
    courses.forEach((c) => {
      c.enrollments.forEach((e) => uniqueStudentIds.add(e.userId));
    });
    const activeStudentsCount = uniqueStudentIds.size;

    // 2. KPI: Total lecciones completadas en los cursos del docente
    let totalCompletions = 0;
    courses.forEach((c) => {
      c.modules.forEach((m) => {
        m.lessons.forEach((l) => {
          totalCompletions += l.progresses.filter((p) => p.isCompleted).length;
        });
      });
    });

    // 3. KPI: Tasa promedio de aprobación en exámenes y cursos con semáforo
    let allAttemptsCount = 0;
    let passedAttemptsCount = 0;

    let criticalLessonCandidate: {
      lessonId: string;
      lessonTitle: string;
      courseTitle: string;
      passRate: number;
      totalAttempts: number;
    } | null = null;

    const courseCards = courses.map((course) => {
      let courseAttempts = 0;
      let coursePassed = 0;

      course.modules.forEach((mod) => {
        mod.lessons.forEach((lesson) => {
          lesson.exams.forEach((exam) => {
            const attempts = exam.attempts || [];
            attempts.forEach((a) => {
              allAttemptsCount++;
              courseAttempts++;
              if (a.isPassed) {
                passedAttemptsCount++;
                coursePassed++;
              }
            });

            // Analizar lección crítica
            if (attempts.length > 0) {
              const lessonPassed = attempts.filter((a) => a.isPassed).length;
              const lessonPassRate = (lessonPassed / attempts.length) * 100;

              if (
                !criticalLessonCandidate ||
                lessonPassRate < criticalLessonCandidate.passRate
              ) {
                criticalLessonCandidate = {
                  lessonId: lesson.id,
                  lessonTitle: lesson.title,
                  courseTitle: course.title,
                  passRate: lessonPassRate,
                  totalAttempts: attempts.length,
                };
              }
            }
          });
        });
      });

      const coursePassRate = courseAttempts > 0 ? (coursePassed / courseAttempts) * 100 : null;

      // Semáforo Skylearn: leaf >= 80%, sun 60-79%, coral < 60%
      let trafficLight: TrafficLightStatus | null = null;
      if (coursePassRate !== null && coursePassRate < 60) {
        trafficLight = 'coral';
      } else if (coursePassRate !== null && coursePassRate < 80) {
        trafficLight = 'sun';
      } else if (coursePassRate !== null) {
        trafficLight = 'leaf';
      }

      return {
        id: course.id,
        title: course.title,
        studentsCount: course.enrollments.length,
        passRate: coursePassRate === null ? null : Math.round(coursePassRate),
        trafficLight,
      };
    });

    const averagePassRate =
      allAttemptsCount > 0 ? Math.round((passedAttemptsCount / allAttemptsCount) * 100) : null;

    return {
      kpis: {
        activeStudentsCount,
        averagePassRate,
        totalCompletions,
      },
      courses: courseCards,
      criticalLesson: criticalLessonCandidate,
    };
  }

  /**
   * RF-08.3: Registro del token de dispositivo móvil Expo
   */
  async registerDeviceToken(userId: string, pushToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { pushToken },
    });

    this.logger.log(`Push token registrado para el usuario ${userId}: ${pushToken.substring(0, 15)}...`);
    return { success: true, message: 'Dispositivo registrado para alertas push del dashboard.' };
  }

  async unregisterDeviceToken(userId: string, pushToken: string) {
    await this.prisma.user.updateMany({ where: { id: userId, pushToken }, data: { pushToken: null } });
    return { success: true };
  }

  /**
   * RF-08.3: Despacho de notificación push ante eventos relevantes (ej. nueva inscripción)
   */
  async sendPushNotification(teacherId: string, title: string, body: string, data?: any) {
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || !teacher.pushToken) {
      this.logger.warn(`Docente ${teacherId} no tiene pushToken registrado.`);
      return { sent: false, reason: 'NO_TOKEN' };
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ to: teacher.pushToken, title, body, data, sound: 'default', channelId: 'default' }),
    });
    const result = await response.json() as { data?: { status?: string; message?: string } };
    if (!response.ok || result.data?.status !== 'ok') {
      throw new Error(result.data?.message || `Expo push HTTP ${response.status}`);
    }
    return { sent: true };
  }
}

