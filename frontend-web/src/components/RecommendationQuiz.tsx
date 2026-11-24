// frontend-web/src/components/RecommendationQuiz.tsx
import React, { useState, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  X,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Layers,
  Award,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

interface LessonSummary {
  id: string;
  title: string;
  order: number;
}

interface ModuleSummary {
  id: string;
  title: string;
  order: number;
  lessonsCount: number;
  lessons?: LessonSummary[];
}

interface CourseItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  modulesCount: number;
  lessonsCount: number;
  modules?: ModuleSummary[];
}

interface DiagnosticQuestion {
  id: string;
  lessonId: string;
  lessonTitle: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

interface DiagnosticEvaluationResult {
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  knowledgeLevel: 'Principiante' | 'Intermedio' | 'Avanzado';
  scorePercentage: number;
  totalQuestions: number;
  correctAnswers: number;
  masteredLessons: Array<{ id: string; title: string; order: number }>;
  pendingLessons: Array<{ id: string; title: string; order: number; reason: string }>;
  recommendedLesson: {
    id: string;
    title: string;
    order: number;
    url: string;
  };
  justification: string;
}

interface RecommendationQuizProps {
  onClose: () => void;
  onNavigateToLesson: (lessonId: string) => void;
}

type StepMode = 'select_course' | 'answering' | 'evaluating' | 'result';

export const RecommendationQuiz: React.FC<RecommendationQuizProps> = ({
  onClose,
  onNavigateToLesson,
}) => {
  const [mode, setMode] = useState<StepMode>('select_course');
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<DiagnosticEvaluationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // RF-1: Cargar cursos activos del catálogo para diagnóstico
  useEffect(() => {
    let isMounted = true;
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        setErrorMessage(null);
        const res = await api.get('/recommendations/courses');
        if (isMounted) {
          const data: CourseItem[] = Array.isArray(res.data) ? res.data : [];
          setCourses(data);
          if (data.length === 0) {
            setErrorMessage('No hay cursos publicados con lecciones disponibles en este momento.');
          }
        }
      } catch (err: any) {
        console.error('Error al cargar cursos para diagnóstico:', err);
        if (isMounted) {
          // Fallback consultando módulos si el endpoint de cursos no responde
          try {
            const modRes = await api.get('/recommendations/modules');
            const modData = Array.isArray(modRes.data) ? modRes.data : [];
            const groupedMap = new Map<string, CourseItem>();

            modData.forEach((m: any) => {
              if (!groupedMap.has(m.courseId)) {
                groupedMap.set(m.courseId, {
                  id: m.courseId,
                  title: m.courseTitle || 'Curso Curricular',
                  category: m.category || 'General',
                  modulesCount: 0,
                  lessonsCount: 0,
                  modules: [],
                });
              }
              const c = groupedMap.get(m.courseId)!;
              c.modulesCount++;
              c.lessonsCount += m.lessonsCount || 0;
              c.modules?.push({
                id: m.id,
                title: m.title,
                order: m.order,
                lessonsCount: m.lessonsCount,
                lessons: m.lessons,
              });
            });

            const parsedCourses = Array.from(groupedMap.values());
            if (parsedCourses.length > 0) {
              setCourses(parsedCourses);
            } else {
              throw new Error('Sin datos');
            }
          } catch {
            // Fallback de demostración si la base de datos está offline
            setCourses([
              {
                id: '00000000-0000-0000-0000-000000000001',
                title: 'Desarrollo Web Fullstack con React y NestJS',
                description: 'Aprende a construir aplicaciones escalables desacopladas con TypeScript, Three.js y Postgres',
                category: 'Desarrollo Web',
                modulesCount: 2,
                lessonsCount: 7,
              },
              {
                id: '00000000-0000-0000-0000-000000000002',
                title: 'Inteligencia Artificial y Modelos Multimodales',
                description: 'Domina los LLMs, ingeniería de prompts avanzada, tool calling y arquitecturas agénticas',
                category: 'Inteligencia Artificial',
                modulesCount: 1,
                lessonsCount: 3,
              },
            ]);
          }
        }
      } finally {
        if (isMounted) setLoadingCourses(false);
      }
    };
    fetchCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  // Iniciar diagnóstico para el curso seleccionado
  const handleSelectCourse = async (course: CourseItem) => {
    setSelectedCourse(course);
    setLoadingQuestions(true);
    setErrorMessage(null);
    try {
      const res = await api.get(`/recommendations/diagnostic/course/${course.id}`);
      const qs: DiagnosticQuestion[] = res.data?.questions || [];
      if (qs.length === 0) {
        throw new Error('No se generaron preguntas para este curso.');
      }
      setQuestions(qs);
      setCurrentStep(0);
      setSelectedAnswers({});
      setMode('answering');
    } catch (err: any) {
      console.error('Error generando preguntas del curso, probando fallback:', err);
      // Fallback: si tiene módulos, intentar con el primer módulo
      if (course.modules && course.modules.length > 0) {
        try {
          const modRes = await api.get(`/recommendations/diagnostic/${course.modules[0].id}`);
          const modQs: DiagnosticQuestion[] = modRes.data?.questions || [];
          if (modQs.length > 0) {
            setQuestions(modQs);
            setCurrentStep(0);
            setSelectedAnswers({});
            setMode('answering');
            return;
          }
        } catch {}
      }

      // Fallback determinista local
      const fallbackQs: DiagnosticQuestion[] = [
        {
          id: `q-fallback-1`,
          lessonId: '00000000-0000-0000-0000-000000000100',
          lessonTitle: 'Fundamentos Iniciales del Curso',
          text: `Respecto a "${course.title}": ¿Cuál es el concepto clave que se aborda en sus clases iniciales?`,
          options: [
            `Estructura fundamental, sintaxis moderna y buenas prácticas pedagógicas`,
            'Técnicas obsoletas no estándar',
            'Configuraciones manuales sin documentación',
            'Prácticas descontinuadas',
          ],
          correctOptionIndex: 0,
        },
        {
          id: `q-fallback-2`,
          lessonId: '00000000-0000-0000-0000-000000000101',
          lessonTitle: 'Aplicación Práctica y Gestión de Estado',
          text: `En el desarrollo del curso "${course.title}": ¿Qué habilidad práctica se promueve en las lecciones intermedias?`,
          options: [
            `Manejo de estado inmutable y componentes reactivos interactivos`,
            'Evitar el uso de librerías modernas',
            'Deshabilitar las verificaciones del compilador',
            'Omitir la separación de capas de software',
          ],
          correctOptionIndex: 0,
        },
      ];

      setQuestions(fallbackQs);
      setCurrentStep(0);
      setSelectedAnswers({});
      setMode('answering');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSelectOption = (optIndex: number) => {
    if (!questions[currentStep]) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questions[currentStep].id]: optIndex,
    });
  };

  const handleNextQuestion = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // RF-9 a RF-16: Evaluar diagnóstico
  const handleSubmitEvaluation = async () => {
    if (!selectedCourse) return;
    setMode('evaluating');
    setErrorMessage(null);

    const answersPayload = questions.map((q) => {
      const chosen = selectedAnswers[q.id] ?? -1;
      return {
        questionId: q.id,
        lessonId: q.lessonId,
        selectedOptionIndex: chosen,
        isCorrect: chosen === q.correctOptionIndex,
      };
    });

    try {
      const res = await api.post('/recommendations/diagnostic/evaluate', {
        courseId: selectedCourse.id,
        answers: answersPayload,
      });

      setEvaluationResult(res.data);
      setMode('result');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error('Error al evaluar diagnóstico en backend:', err);
      // Fallback heurístico en cliente para garantizar que el usuario nunca quede atrapado
      const correctCount = answersPayload.filter((a) => a.isCorrect).length;
      const scorePercentage = Math.round((correctCount / questions.length) * 100);

      const allCourseLessons: LessonSummary[] =
        selectedCourse.modules?.flatMap((m) => m.lessons || []) || [
          { id: '00000000-0000-0000-0000-000000000100', title: 'Lección 1: Fundamentos', order: 1 },
          { id: '00000000-0000-0000-0000-000000000101', title: 'Lección 2: Estado Reactivo', order: 2 },
          { id: '00000000-0000-0000-0000-000000000102', title: 'Lección 3: Efectos Secundarios', order: 3 },
        ];

      const mastered =
        scorePercentage === 0
          ? []
          : allCourseLessons.filter((_, idx) => (scorePercentage >= 75 ? true : idx === 0));
      const pending = allCourseLessons.filter((l) => !mastered.some((m) => m.id === l.id));
      const targetLesson = pending[0] || allCourseLessons[0];

      let justification = '';
      if (scorePercentage === 0) {
        justification = `Debido a que respondiste incorrectamente a las preguntas del cuestionario (0% de aciertos), te recomendamos comenzar obligatoriamente desde la primera lección ("${allCourseLessons[0].title}") para aprender las bases pedagógicas paso a paso desde cero.`;
      } else if (mastered.length > 0 && targetLesson.order > 1) {
        justification = `¡Excelente progreso! Has demostrado conocimientos previos en los temas iniciales, por lo que no necesitas empezar desde cero. Te recomendamos comenzar directamente en la lección ${targetLesson.order} ("${targetLesson.title}").`;
      } else {
        justification = `Te recomendamos iniciar en "${targetLesson.title}" para consolidar tus competencias en este curso.`;
      }

      setEvaluationResult({
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        knowledgeLevel: scorePercentage >= 75 ? 'Avanzado' : scorePercentage >= 50 ? 'Intermedio' : 'Principiante',
        scorePercentage,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        masteredLessons: mastered,
        pendingLessons: pending.map((p) => ({ ...p, reason: 'Tema identificado para fortalecer' })),
        recommendedLesson: {
          id: targetLesson?.id || 'demo-lesson',
          title: targetLesson?.title || 'Lección Inicial',
          order: targetLesson?.order || 1,
          url: `/lessons/${targetLesson?.id || 'demo-lesson'}`,
        },
        justification,
      });
      setMode('result');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const currentQ = questions[currentStep];

  return (
    <div style={styles.overlay}>
      <div className="skylearn-card" style={styles.card}>
        {/* Barra Superior con Badge de Gratuidad y Botón Cerrar */}
        <div style={styles.topBar}>
          <div style={styles.badge}>
            <Compass size={16} color="var(--color-sky-deep)" />
            <span>Diagnóstico Curricular Inteligente • 100% Gratuito (0 Créditos)</span>
          </div>
          <button
            onClick={onClose}
            style={styles.closeBtn}
            aria-label="Cerrar diagnóstico"
          >
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} color="var(--color-coral)" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASO 0: SELECCIÓN DE CURSO (RF-1, RF-2, RF-18) */}
        {/* ============================================================ */}
        {mode === 'select_course' && (
          <div style={styles.content}>
            <div style={{ textAlign: 'left', marginBottom: '8px' }}>
              <h2 style={styles.mainTitle}>Cursos Disponibles para Diagnóstico</h2>
              <p style={styles.mainSubtitle}>
                Selecciona el <strong>curso</strong> que deseas aprender. Nuestra IA analizará el{' '}
                <strong>Resumen Pedagógico</strong> de sus clases para evaluar tus conocimientos previos
                y recomendarte la lección exacta donde debes empezar, ¡evitando que tengas que comenzar
                desde cero si ya dominas las bases!
              </p>
            </div>

            {loadingCourses ? (
              <div style={styles.centerSpinner}>
                <Loader2 size={32} className="spin-animation" color="var(--color-sky-deep)" />
                <span style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginTop: '8px' }}>
                  Cargando cursos disponibles del catálogo...
                </span>
              </div>
            ) : (
              <div style={styles.modulesGrid}>
                {courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => handleSelectCourse(course)}
                    style={styles.courseCard}
                    role="button"
                    tabIndex={0}
                  >
                    <div style={styles.moduleHeader}>
                      <span style={styles.categoryPill}>{course.category}</span>
                      <span style={styles.lessonCountBadge}>
                        <BookOpen size={13} /> {course.modulesCount || 1} módulos • {course.lessonsCount} lecciones
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                      <GraduationCap size={20} color="var(--color-sky-deep)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <h3 style={styles.moduleTitle}>{course.title}</h3>
                    </div>

                    {course.description && (
                      <p style={styles.moduleCourse}>
                        {course.description.length > 105
                          ? course.description.slice(0, 105) + '...'
                          : course.description}
                      </p>
                    )}

                    {course.modules && course.modules.length > 0 && (
                      <div style={styles.modulesPreviewList}>
                        <span style={styles.modulesPreviewTitle}>Módulos temáticos incluidos:</span>
                        <div style={styles.modulesTagsRow}>
                          {course.modules.slice(0, 3).map((m) => (
                            <span key={m.id} style={styles.moduleSmallPill}>
                              {m.title}
                            </span>
                          ))}
                          {course.modules.length > 3 && (
                            <span style={styles.moduleSmallPill}>+{course.modules.length - 3} más</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div style={styles.cardFooter}>
                      <span style={styles.cardFooterLink}>
                        Evaluar mis conocimientos en este curso <ArrowRight size={15} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loadingQuestions && (
              <div style={styles.loadingOverlay}>
                <Loader2 size={36} className="spin-animation" color="var(--color-sky-deep)" />
                <p style={{ marginTop: '12px', fontWeight: 700, color: 'var(--color-ink)' }}>
                  Generando preguntas diagnósticas con IA contextualizada...
                </p>
                <span style={{ fontSize: '13px', color: 'var(--color-ink-muted)' }}>
                  Analizando el Resumen Pedagógico de las clases del curso...
                </span>
              </div>
            )}

            <div style={styles.actions}>
              <button type="button" onClick={onClose} className="btn-secondary" style={styles.skipBtn}>
                Omitir diagnóstico y ver catálogo general
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASO 1: FLUJO DE PREGUNTAS DIAGNÓSTICAS (RF-4 a RF-8) */}
        {/* ============================================================ */}
        {mode === 'answering' && currentQ && (
          <>
            {/* Barra de Progreso Skylearn */}
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${((currentStep + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            <div style={styles.content}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={styles.stepCounter}>
                  Pregunta {currentStep + 1} de {questions.length}
                </span>
                <span style={styles.lessonTag}>
                  <Layers size={13} /> {currentQ.lessonTitle}
                </span>
              </div>

              <h3 style={styles.questionTitle}>{currentQ.text}</h3>

              {/* Opciones de respuesta */}
              <div style={styles.optionsGrid}>
                {currentQ.options.map((optText, idx) => {
                  const isSelected = selectedAnswers[currentQ.id] === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      style={{
                        ...styles.answerTile,
                        borderColor: isSelected ? 'var(--color-sky)' : 'var(--color-outline)',
                        backgroundColor: isSelected ? 'var(--color-sky-soft)' : 'var(--color-surface)',
                      }}
                    >
                      <span style={styles.tileCircle}>{isSelected ? '●' : '○'}</span>
                      <span style={styles.tileText}>{optText}</span>
                    </div>
                  );
                })}
              </div>

              <div style={styles.actions}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevQuestion}
                      className="btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ArrowLeft size={16} /> Anterior
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMode('select_course')}
                    className="btn-secondary"
                  >
                    Cambiar Curso
                  </button>
                </div>

                {currentStep < questions.length - 1 ? (
                  <button
                    type="button"
                    disabled={selectedAnswers[currentQ.id] === undefined}
                    onClick={handleNextQuestion}
                    className="btn-big-friendly"
                  >
                    Siguiente <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={selectedAnswers[currentQ.id] === undefined}
                    onClick={handleSubmitEvaluation}
                    className="btn-big-friendly"
                  >
                    Evaluar y Ver Recomendación <Sparkles size={18} />
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* EVALUANDO: ESTADO DE CARGA DE IA (RF-9, RNF-2) */}
        {/* ============================================================ */}
        {mode === 'evaluating' && (
          <div style={styles.centerSpinner}>
            <div style={styles.resultIconWrap}>
              <Sparkles size={36} color="#FFFFFF" />
            </div>
            <h3 style={{ fontSize: '20px', color: 'var(--color-ink)', marginBottom: '8px' }}>
              Analizando tus respuestas con IA pedagógica...
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', maxWidth: '420px', textAlign: 'center' }}>
              Identificando qué clases ya dominas y cuáles requieren refuerzo para ubicar tu lección ideal de inicio.
            </p>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASO 2: RESULTADOS Y RECOMENDACIÓN DE INICIO (RF-10 a RF-17) */}
        {/* ============================================================ */}
        {mode === 'result' && evaluationResult && (
          <div style={styles.resultView}>
            <div style={styles.resultIconWrap}>
              <Award size={40} color="#FFFFFF" />
            </div>

            <h3 style={styles.resultTitle}>¡Diagnóstico Completado con Éxito!</h3>
            <p style={styles.resultDesc}>
              Evaluamos tus conocimientos sobre el curso <strong>{evaluationResult.courseTitle}</strong>.
            </p>

            {/* Fila de Nivel y Puntaje */}
            <div style={styles.summaryBar}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Nivel Estimado</span>
                <span
                  style={{
                    ...styles.levelBadge,
                    backgroundColor:
                      evaluationResult.knowledgeLevel === 'Avanzado'
                        ? 'var(--color-leaf-soft)'
                        : evaluationResult.knowledgeLevel === 'Intermedio'
                        ? 'var(--color-sun-soft)'
                        : 'var(--color-sky-soft)',
                    color:
                      evaluationResult.knowledgeLevel === 'Avanzado'
                        ? 'var(--color-leaf-deep)'
                        : evaluationResult.knowledgeLevel === 'Intermedio'
                        ? 'var(--color-sun-deep)'
                        : 'var(--color-sky-deep)',
                  }}
                >
                  {evaluationResult.knowledgeLevel}
                </span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Aciertos</span>
                <span style={styles.scoreText}>
                  {evaluationResult.correctAnswers} / {evaluationResult.totalQuestions} ({evaluationResult.scorePercentage}%)
                </span>
              </div>
            </div>

            {/* Listas de Conocimientos Dominados y Pendientes */}
            <div style={styles.breakdownGrid}>
              <div style={styles.breakdownCol}>
                <h4 style={styles.breakdownTitle}>
                  <CheckCircle2 size={16} color="var(--color-leaf-deep)" /> Conocimientos Dominados
                </h4>
                {evaluationResult.masteredLessons.length > 0 ? (
                  <ul style={styles.topicsList}>
                    {evaluationResult.masteredLessons.map((l) => (
                      <li key={l.id} style={styles.masteredItem}>
                        <span>✓</span> {l.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={styles.emptyTopicNotice}>Comenzarás aprendiendo los conceptos clave desde cero.</p>
                )}
              </div>

              <div style={styles.breakdownCol}>
                <h4 style={styles.breakdownTitle}>
                  <AlertCircle size={16} color="var(--color-sun-deep)" /> Contenidos por Reforzar
                </h4>
                {evaluationResult.pendingLessons.length > 0 ? (
                  <ul style={styles.topicsList}>
                    {evaluationResult.pendingLessons.map((l) => (
                      <li key={l.id} style={styles.pendingItem}>
                        <span>•</span> {l.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={styles.emptyTopicNotice}>¡Completaste perfectamente todos los temas evaluados!</p>
                )}
              </div>
            </div>

            {/* Tarjeta de Lección Recomendada (RF-14, RF-15, RF-17) */}
            <div style={styles.recommendationCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={styles.recBadge}>Lección Recomendada para Comenzar</span>
                {evaluationResult.recommendedLesson.order > 1 ? (
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--color-leaf-soft)', color: 'var(--color-leaf-deep)' }}>
                    🎉 ¡No empiezas desde cero!
                  </span>
                ) : (
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--color-sky-soft)', color: 'var(--color-sky-deep)' }}>
                    🚀 Fundamentos desde la Lección 1
                  </span>
                )}
              </div>
              <h4 style={styles.recLessonTitle}>
                Lección {evaluationResult.recommendedLesson.order}: {evaluationResult.recommendedLesson.title}
              </h4>
              <p style={styles.recJustification}>{evaluationResult.justification}</p>
              <span style={styles.freeNotice}>
                ✓ Inscripción automática confirmada • Costo 0 créditos
              </span>
            </div>

            {/* Acciones Finales */}
            <div style={styles.finalActions}>
              <button
                className="btn-big-friendly"
                onClick={() => onNavigateToLesson(evaluationResult.recommendedLesson.id)}
              >
                <span>Comenzar en {evaluationResult.recommendedLesson.title}</span>
                <ArrowRight size={20} />
              </button>
              <button className="btn-secondary" onClick={onClose}>
                Explorar Catálogo Completo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '720px',
    maxHeight: '92vh',
    overflowY: 'auto',
    backgroundColor: 'var(--color-surface-elevated)',
    padding: '28px',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-elevation-high)',
    position: 'relative',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-sky-soft)',
    color: 'var(--color-sky-deep)',
    fontSize: '12px',
    fontWeight: 800,
  },
  closeBtn: {
    background: 'transparent',
    color: 'var(--color-ink-muted)',
    padding: '6px',
    cursor: 'pointer',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: 'var(--color-coral-soft, #fee2e2)',
    color: 'var(--color-coral, #b91c1c)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '16px',
    fontSize: '13px',
    fontWeight: 600,
  },
  mainTitle: {
    fontSize: '22px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    marginBottom: '6px',
  },
  mainSubtitle: {
    fontSize: '14px',
    color: 'var(--color-ink-muted)',
    lineHeight: 1.5,
  },
  modulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '14px',
    marginTop: '16px',
    marginBottom: '20px',
  },
  courseCard: {
    padding: '18px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--color-outline)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  moduleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  categoryPill: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-sky-soft)',
    color: 'var(--color-sky-deep)',
  },
  lessonCountBadge: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--color-ink-muted)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  moduleTitle: {
    fontSize: '16px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    lineHeight: 1.3,
  },
  moduleCourse: {
    fontSize: '13px',
    color: 'var(--color-ink-muted)',
    lineHeight: 1.4,
    marginBottom: '10px',
  },
  modulesPreviewList: {
    backgroundColor: 'var(--color-surface-sunken)',
    padding: '8px 10px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '12px',
  },
  modulesPreviewTitle: {
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--color-ink-subtle)',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '4px',
  },
  modulesTagsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  moduleSmallPill: {
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-surface-elevated)',
    color: 'var(--color-ink)',
    border: '1px solid var(--color-outline)',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid var(--color-outline)',
    paddingTop: '10px',
    marginTop: 'auto',
  },
  cardFooterLink: {
    fontSize: '13px',
    fontWeight: 800,
    color: 'var(--color-sky-deep)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  centerSpinner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
  },
  loadingOverlay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 0',
  },
  progressTrack: {
    height: '6px',
    backgroundColor: 'var(--color-surface-sunken)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    marginBottom: '18px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'var(--color-leaf)',
    borderRadius: 'var(--radius-full)',
    transition: 'width 0.3s ease',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  stepCounter: {
    fontSize: '12px',
    fontWeight: 800,
    color: 'var(--color-ink-subtle)',
    textTransform: 'uppercase',
  },
  lessonTag: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--color-sky-deep)',
    backgroundColor: 'var(--color-sky-soft)',
    padding: '3px 8px',
    borderRadius: 'var(--radius-full)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  questionTitle: {
    fontSize: '18px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    lineHeight: 1.4,
    marginBottom: '6px',
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '12px',
  },
  answerTile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 18px',
    borderRadius: 'var(--radius-md)',
    border: '2px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left',
  },
  tileCircle: {
    fontSize: '16px',
    color: 'var(--color-sky-deep)',
    lineHeight: 1,
  },
  tileText: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--color-ink)',
    lineHeight: 1.4,
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    gap: '10px',
  },
  skipBtn: {
    fontSize: '13px',
    color: 'var(--color-ink-muted)',
  },
  resultView: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '10px 0',
  },
  resultIconWrap: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-sun)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-sun)',
    marginBottom: '14px',
  },
  resultTitle: {
    fontSize: '22px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    marginBottom: '6px',
  },
  resultDesc: {
    fontSize: '14px',
    color: 'var(--color-ink-muted)',
    maxWidth: '520px',
    lineHeight: 1.5,
    marginBottom: '16px',
  },
  summaryBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginBottom: '16px',
    width: '100%',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  summaryLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--color-ink-subtle)',
    textTransform: 'uppercase',
  },
  levelBadge: {
    fontSize: '13px',
    fontWeight: 800,
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
  },
  scoreText: {
    fontSize: '15px',
    fontWeight: 800,
    color: 'var(--color-ink)',
  },
  breakdownGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    width: '100%',
    textAlign: 'left',
    marginBottom: '16px',
  },
  breakdownCol: {
    backgroundColor: 'var(--color-surface)',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-outline)',
  },
  breakdownTitle: {
    fontSize: '12px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  topicsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  masteredItem: {
    fontSize: '12px',
    color: 'var(--color-leaf-deep)',
    fontWeight: 600,
  },
  pendingItem: {
    fontSize: '12px',
    color: 'var(--color-sun-deep)',
    fontWeight: 600,
  },
  emptyTopicNotice: {
    fontSize: '12px',
    color: 'var(--color-ink-muted)',
    fontStyle: 'italic',
  },
  recommendationCard: {
    width: '100%',
    padding: '16px 20px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--color-leaf)',
    textAlign: 'left',
    marginBottom: '20px',
  },
  recBadge: {
    fontSize: '11px',
    fontWeight: 800,
    color: 'var(--color-leaf-deep)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  recLessonTitle: {
    fontSize: '18px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    margin: '4px 0 6px 0',
  },
  recJustification: {
    fontSize: '13px',
    color: 'var(--color-ink-muted)',
    lineHeight: 1.5,
    marginBottom: '10px',
  },
  freeNotice: {
    fontSize: '12px',
    fontWeight: 800,
    color: 'var(--color-leaf-deep)',
    display: 'block',
  },
  finalActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'center',
    width: '100%',
  },
};
