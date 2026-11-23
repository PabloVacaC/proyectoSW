// frontend-web/src/App.tsx
import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { LandingHomePage } from './pages/LandingHomePage';
import { CoursesCatalogPage } from './pages/CoursesCatalogPage';
import { LessonViewer } from './components/LessonViewer';
import { RecommendationQuiz } from './components/RecommendationQuiz';
import { PaywallModal } from './components/PaywallModal';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { TeacherCourseManager } from './pages/TeacherCourseManager';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { VirtualTutorSectionPage } from './pages/VirtualTutorSectionPage';
import { api } from './services/api';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  credits: number;
  subscriptionStatus: string;
}

export function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [currentHash, setCurrentHash] = useState<string>(window.location.hash || '#/courses');
  const [activeLesson, setActiveLesson] = useState<any | null>(null);
  const [courseContext, setCourseContext] = useState<{
    courseId?: string;
    courseTitle?: string;
    lessons: Array<{
      id: string;
      title: string;
      order?: number;
      isCompleted?: boolean;
      moduleId?: string;
      moduleTitle?: string;
    }>;
  } | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [accessError, setAccessError] = useState('');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({
    open: false,
    mode: 'login',
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sincronización con el historial del navegador (Hash Routing)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentHash(hash || '#/courses');
    };

    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
      window.location.hash = '#/courses';
    }

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') return;
    const refresh = () => {
      api.get<UserData>('/auth/me').then(({ data }) => {
        setUser(data);
        localStorage.setItem('user_data', JSON.stringify(data));
      }).catch(() => {});
    };
    refresh();
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [user?.id, user?.role]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parseando sesión', e);
      }
    }
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch {
      // Fallback con datos demo si el servidor aún no tiene cursos activos
      setCourses([
        {
          id: '00000000-0000-0000-0000-000000000001',
          title: 'Desarrollo Web Fullstack con React y NestJS',
          description: 'Aprende arquitectura modular, componentes reactivos y consumo seguro de APIs REST con TypeScript.',
          category: 'Desarrollo Web',
          teacherName: 'Profesor Docente',
          modulesCount: 1,
          isEnrolled: false,
        },
      ]);
    }
  };

  const handleAuthSuccess = (userData: UserData) => {
    setUser(userData);
    setAuthModal({ open: false, mode: 'login' });
    if (userData.role === 'ADMIN') {
      window.location.hash = '#/admin';
    } else if (userData.role === 'TEACHER') {
      window.location.hash = '#/courses';
    } else {
      window.location.hash = '#/courses';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setActiveLesson(null);
    window.location.hash = '#/courses';
  };

  // Apertura controlada de lección con deducción de créditos y paywall
  const handleOpenLesson = async (
    lesson: any,
    courseInfo?: { courseId?: string; courseTitle?: string; lessons?: any[] },
  ) => {
    if (!user) {
      setAuthModal({ open: true, mode: 'login' });
      return;
    }
    const lessonId = lesson.id;

    if (user && user.role === 'STUDENT') {
      setAccessError('');
      try {
        const { data } = await api.post<{ remainingCredits: number }>(`/lessons/${lessonId}/access`);
        const updatedUser = { ...user, credits: data.remainingCredits };
        setUser(updatedUser);
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      } catch (err: any) {
        if (err.response?.status === 402) setShowPaywall(true);
        else setAccessError('No se pudo abrir la lección. Revisa la conexión e inténtalo nuevamente.');
        return;
      }
    }

    // Consultar SIEMPRE los datos completos de la lección para garantizar videoUrl, exámenes y pertenencia al curso
    let fetchedLesson = lesson;
    try {
      const res = await api.get(`/lessons/${lessonId}`);
      if (res.data) {
        fetchedLesson = res.data;
      }
    } catch {
      // Fallback a los datos recibidos
    }

    const resolvedCourseId =
      fetchedLesson.module?.course?.id || courseInfo?.courseId || courseContext?.courseId;
    const resolvedCourseTitle =
      fetchedLesson.module?.course?.title || courseInfo?.courseTitle || courseContext?.courseTitle || 'Curso';

    let resolvedLessonsList = courseInfo?.lessons;
    // Si no tenemos la lista de lecciones o si el curso es distinto al actual, cargar el curso del backend
    if (
      resolvedCourseId &&
      (!resolvedLessonsList ||
        !resolvedLessonsList.length ||
        (courseContext && courseContext.courseId !== resolvedCourseId))
    ) {
      try {
        const courseRes = await api.get(`/courses/${resolvedCourseId}`);
        const mList = courseRes.data.modules || [];
        resolvedLessonsList = mList
          .slice()
          .sort((a: any, b: any) => a.order - b.order)
          .flatMap((m: any) =>
            (m.lessons || [])
              .slice()
              .sort((la: any, lb: any) => {
                if (la.order !== lb.order) return la.order - lb.order;
                return (
                  ((la.createdAt || '') as string).localeCompare((lb.createdAt || '') as string) ||
                  la.id.localeCompare(lb.id)
                );
              })
              .map((l: any) => ({
                id: l.id,
                title: l.title,
                order: l.order,
                videoUrl: l.videoUrl,
                contextText: l.contextText,
                downloadableUrl: l.downloadableUrl,
                isCompleted: l.isCompleted,
                moduleId: m.id,
                moduleTitle: m.title,
              })),
          );
      } catch {}
    }

    if (resolvedCourseId && resolvedLessonsList && resolvedLessonsList.length) {
      setCourseContext({
        courseId: resolvedCourseId,
        courseTitle: resolvedCourseTitle,
        lessons: resolvedLessonsList,
      });
    }

    // Asegurar estructura de exámenes
    const fullLesson = {
      ...fetchedLesson,
      videoUrl: fetchedLesson.videoUrl || lesson.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      contextText: fetchedLesson.contextText || lesson.contextText || 'Conceptos clave de la clase interactiva.',
      downloadableUrl: fetchedLesson.downloadableUrl || lesson.downloadableUrl,
      exams:
        fetchedLesson.exams && fetchedLesson.exams.length > 0
          ? fetchedLesson.exams
          : lesson.exams && lesson.exams.length > 0
          ? lesson.exams
          : [
              {
                id: 'exam-' + (fetchedLesson.id || lessonId),
                title: 'Evaluación Formativa de la Lección',
                questions: [
                  {
                    id: 'q1-' + (fetchedLesson.id || lessonId),
                    text: `¿Cuál es el objetivo principal explicado en la lección "${fetchedLesson.title || lesson.title}"?`,
                    options: [
                      {
                        id: 'opt1',
                        text: 'Comprender los fundamentos prácticos presentados en el video',
                        isCorrect: true,
                      },
                      {
                        id: 'opt2',
                        text: 'Ignorar las instrucciones del tutor interactivo',
                        isCorrect: false,
                      },
                    ],
                  },
                ],
              },
            ],
    };

    setActiveLesson(fullLesson);
    window.location.hash = `#/lessons/${lessonId}`;
  };

  const handleCompleteLesson = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
    }
  };

  // Parser de rutas hash
  const route = currentHash.replace(/^#\/?/, '').split('/');
  const mainSegment = route[0] || 'courses';
  const paramId = route[1] || null;
  const isTeacherRoute = mainSegment === 'teacher';
  const teacherSubSegment = route[1] || null;
  const teacherCourseId = route[2] || null;

  // Carga reactiva de lección y contexto de curso si se navega directamente por URL
  useEffect(() => {
    if (mainSegment === 'lessons' && paramId && (!activeLesson || activeLesson.id !== paramId)) {
      api
        .get(`/lessons/${paramId}`)
        .then(async (res) => {
          const lessonData = res.data;
          const cId = lessonData.module?.course?.id;
          const cTitle = lessonData.module?.course?.title || 'Curso';

          if (cId && (!courseContext || courseContext.courseId !== cId)) {
            try {
              const courseRes = await api.get(`/courses/${cId}`);
              const mList = courseRes.data.modules || [];
              const lessonsList = mList
                .slice()
                .sort((a: any, b: any) => a.order - b.order)
                .flatMap((m: any) =>
                  (m.lessons || [])
                    .slice()
                    .sort((la: any, lb: any) => {
                      if (la.order !== lb.order) return la.order - lb.order;
                      return (
                        ((la.createdAt || '') as string).localeCompare((lb.createdAt || '') as string) ||
                        la.id.localeCompare(lb.id)
                      );
                    })
                    .map((l: any) => ({
                      id: l.id,
                      title: l.title,
                      order: l.order,
                      videoUrl: l.videoUrl,
                      contextText: l.contextText,
                      downloadableUrl: l.downloadableUrl,
                      isCompleted: l.isCompleted,
                      moduleId: m.id,
                      moduleTitle: m.title,
                    })),
                );
              setCourseContext({
                courseId: cId,
                courseTitle: courseRes.data.title || cTitle,
                lessons: lessonsList,
              });
            } catch {}
          }

          setActiveLesson({
            ...lessonData,
            videoUrl: lessonData.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            contextText: lessonData.contextText || 'Conceptos clave de la clase interactiva.',
            downloadableUrl: lessonData.downloadableUrl,
            exams:
              lessonData.exams && lessonData.exams.length > 0
                ? lessonData.exams
                : [
                    {
                      id: 'exam-' + lessonData.id,
                      title: 'Evaluación Formativa de la Lección',
                      questions: [
                        {
                          id: 'q1-' + lessonData.id,
                          text: `¿Cuál es el objetivo principal explicado en la lección "${lessonData.title}"?`,
                          options: [
                            {
                              id: 'opt1',
                              text: 'Comprender los fundamentos prácticos presentados en el video',
                              isCorrect: true,
                            },
                            {
                              id: 'opt2',
                              text: 'Ignorar las instrucciones del tutor interactivo',
                              isCorrect: false,
                            },
                          ],
                        },
                      ],
                    },
                  ],
          });
        })
        .catch(() => {
          setAccessError('No se pudo cargar la lección solicitada.');
        });
    }
  }, [mainSegment, paramId, activeLesson?.id, courseContext?.courseId]);

  // Manejadores de navegación secuencial (Bottom Bar)
  const currentLessonIndex = courseContext?.lessons
    ? courseContext.lessons.findIndex((l) => l.id === activeLesson?.id)
    : 0;

  const totalCourseLessonsCount = courseContext?.lessons?.length || 1;

  const handleNextLesson = () => {
    if (!courseContext || currentLessonIndex < 0 || currentLessonIndex >= courseContext.lessons.length - 1) return;
    const nextLesson = courseContext.lessons[currentLessonIndex + 1];
    handleOpenLesson(nextLesson, courseContext);
  };

  const handlePrevLesson = () => {
    if (!courseContext || currentLessonIndex <= 0) return;
    const prevLesson = courseContext.lessons[currentLessonIndex - 1];
    handleOpenLesson(prevLesson, courseContext);
  };

  const handleSelectDirectLesson = (targetLessonId: string) => {
    if (!courseContext) return;
    const target = courseContext.lessons.find((l) => l.id === targetLessonId);
    if (target) {
      handleOpenLesson(target, courseContext);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenCatalog={() => {
          window.location.hash = '#/courses';
        }}
        currentPath={currentHash}
        onLoginClick={() => setAuthModal({ open: true, mode: 'login' })}
        onRegisterClick={() => setAuthModal({ open: true, mode: 'register' })}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      {accessError && <div role="alert" style={{ padding: 12, color: '#991b1b' }}>{accessError}</div>}

      {mainSegment === 'auth' ? (
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      ) : (user?.role === 'ADMIN' && (mainSegment === 'admin' || (mainSegment !== 'courses' && mainSegment !== 'lessons' && mainSegment !== 'tutor'))) ? (
        /* VISTA: PANEL DE ADMINISTRACIÓN Y CONTROL DE CRÉDITOS */
        <AdminDashboardPage
          onCreditsModified={() => {
            const savedUser = localStorage.getItem('user_data');
            if (savedUser) {
              try {
                const parsed = JSON.parse(savedUser);
                api.get('/admin/users').then((res) => {
                  const current = res.data.find((u: any) => u.id === parsed.id);
                  if (current) {
                    const updated = { ...parsed, credits: current.credits };
                    setUser(updated);
                    localStorage.setItem('user_data', JSON.stringify(updated));
                  }
                }).catch(() => {});
              } catch {}
            }
          }}
        />
      ) : mainSegment === 'tutor' ? (
        /* VISTA DEDICADA: DOCENTE VIRTUAL INTERACTIVO 3D */
        <VirtualTutorSectionPage
          user={user}
          onNavigateToCourse={(courseId) => {
            window.location.hash = `#/courses/${courseId}`;
          }}
        />
      ) : mainSegment === 'lessons' && activeLesson ? (
        /* VISTA: VISOR DE LECCIÓN */
        <LessonViewer
          lesson={activeLesson}
          onBack={() => {
            if (courseContext?.courseId) {
              window.location.hash = `#/courses/${courseContext.courseId}`;
            } else {
              window.history.back();
            }
          }}
          onCompleteLesson={handleCompleteLesson}
          courseTitle={courseContext?.courseTitle || 'Curso de Especialización'}
          courseLessons={
            courseContext?.lessons.map((l) => ({
              ...l,
              isCompleted: completedLessons.includes(l.id) || Boolean(l.isCompleted),
            })) || []
          }
          currentIndex={currentLessonIndex >= 0 ? currentLessonIndex : 0}
          totalLessons={totalCourseLessonsCount}
          onSelectLesson={handleSelectDirectLesson}
          onNextLesson={handleNextLesson}
          onPrevLesson={handlePrevLesson}
          currentUser={user}
        />
      ) : mainSegment === 'courses' && paramId ? (
        /* VISTA: DETALLE DE CURSO */
        <CourseDetailPage
          courseId={paramId}
          user={user}
          onSelectLesson={(lesson, courseInfo) => handleOpenLesson(lesson, courseInfo)}
          onBack={() => {
            window.location.hash = '#/courses';
          }}
        />
      ) : isTeacherRoute && user?.role === 'TEACHER' ? (
        /* VISTA: GESTOR DE CURSOS Y LECCIONES DEL DOCENTE */
        <TeacherCourseManager
          user={user}
          selectedCourseId={teacherCourseId || (teacherSubSegment !== 'courses' ? teacherSubSegment : null)}
          onNavigateToCourse={(courseId) => {
            window.location.hash = `#/teacher/courses/${courseId}`;
          }}
          onBackToCourseList={() => {
            window.location.hash = '#/teacher/courses';
          }}
          onSelectLessonForPreview={(lesson, courseInfo) => handleOpenLesson(lesson, courseInfo)}
        />
      ) : user ? (
        /* VISTA AUTENTICADA: CATÁLOGO DIRECTO DE CURSOS */
        <CoursesCatalogPage
          user={user}
          courses={courses}
          onOpenCourse={(courseId) => {
            window.location.hash = `#/courses/${courseId}`;
          }}
          onOpenQuiz={() => setShowQuiz(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      ) : (
        /* VISTA VISITANTE: PÁGINA DE INICIO Y LANDING FUTURISTA (SPEC-001) */
        <LandingHomePage
          courses={courses}
          user={user}
          onOpenCourse={(courseId) => {
            window.location.hash = `#/courses/${courseId}`;
          }}
          onRegisterClick={() => setAuthModal({ open: true, mode: 'register' })}
          onLoginClick={() => setAuthModal({ open: true, mode: 'login' })}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {/* Modal de Autenticación / Registro (SPEC-001) */}
      {authModal.open && (
        <AuthPage
          isModal={true}
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ open: false, mode: 'login' })}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Modal de Cuestionario de Recomendación */}
      {showQuiz && (
        <RecommendationQuiz
          onClose={() => setShowQuiz(false)}
          onNavigateToLesson={(lessonId: string) => {
            setShowQuiz(false);
            if (lessonId) {
              window.location.hash = `#/lessons/${lessonId}`;
            } else if (courses.length > 0) {
              window.location.hash = `#/courses/${courses[0].id}`;
            }
          }}
        />
      )}

      {/* Modal de Paywall Skylearn */}
      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onSuccess={() => {
            setShowPaywall(false);
            if (user) {
              setUser({ ...user, credits: 999, subscriptionStatus: 'ACTIVE' });
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
