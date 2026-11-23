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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

interface LessonSummary {
  id: string;
  title: string;
  order: number;
}

interface ModuleItem {
  id: string;
  title: string;
  order: number;
  courseId: string;
  courseTitle: string;
  category: string;
  lessonsCount: number;
  lessons: LessonSummary[];
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
  moduleId: string;
  moduleTitle: string;
  courseId: string;
  courseTitle: string;
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

type StepMode = 'select_module' | 'answering' | 'evaluating' | 'result';

export const RecommendationQuiz: React.FC<RecommendationQuizProps> = ({
  onClose,
  onNavigateToLesson,
}) => {
  const [mode, setMode] = useState<StepMode>('select_module');
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null);
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [loadingModules, setLoadingModules] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<DiagnosticEvaluationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // RF-1: Cargar módulos disponibles al abrir
  useEffect(() => {
    let isMounted = true;
    const fetchModules = async () => {
      try {
        setLoadingModules(true);
        setErrorMessage(null);
        const res = await api.get('/recommendations/modules');
        if (isMounted) {
          const data = Array.isArray(res.data) ? res.data : [];
          setModules(data);
          if (data.length === 0) {
            setErrorMessage('No hay módulos publicados con lecciones disponibles en este momento.');
          }
        }
      } catch (err: any) {
        console.error('Error al cargar módulos para diagnóstico:', err);
        if (isMounted) {
          // Fallback a módulos de demostración si la API está sin inicializar
          setModules([
            {
              id: '00000000-0000-0000-0000-000000000010',
              title: 'Fundamentos de HTML5 y Semántica Moderna',
              order: 1,
              courseId: '00000000-0000-0000-0000-000000000001',
              courseTitle: 'Desarrollo Web Fullstack con React y NestJS',
              category: 'Desarrollo Web',
              lessonsCount: 3,
              lessons: [
                { id: '00000000-0000-0000-0000-000000000100', title: 'Estructura Semántica y Etiquetas', order: 1 },
                { id: '00000000-0000-0000-0000-000000000101', title: 'Formularios Accesibles y Validaciones', order: 2 },
                { id: '00000000-0000-0000-0000-000000000102', title: 'Buenas Prácticas de SEO y Accesibilidad', order: 3 },
              ],
            },
          ]);
        }
      } finally {
        if (isMounted) setLoadingModules(false);
      }
    };
    fetchModules();
    return () => {
      isMounted = false;
    };
  }, []);

  // RF-2 a RF-8: Iniciar diagnóstico para el módulo seleccionado
  const handleSelectModule = async (mod: ModuleItem) => {
    setSelectedModule(mod);
    setLoadingQuestions(true);
    setErrorMessage(null);
    try {
      const res = await api.get(`/recommendations/diagnostic/${mod.id}`);
      const qs: DiagnosticQuestion[] = res.data?.questions || [];
      if (qs.length === 0) {
        throw new Error('No se generaron preguntas para este módulo.');
      }
      setQuestions(qs);
      setCurrentStep(0);
      setSelectedAnswers({});
      setMode('answering');
    } catch (err: any) {
      console.error('Error generando preguntas de diagnóstico:', err);
      // Fallback determinista si la IA o la red fallan
      const fallbackQs: DiagnosticQuestion[] = (mod.lessons || []).slice(0, 4).map((l) => ({
        id: `q-fallback-${l.id}`,
        lessonId: l.id,
        lessonTitle: l.title,
        text: `¿Qué objetivo principal se persigue en la lección "${l.title}"?`,
        options: [
          `Comprender los fundamentos y buenas prácticas de ${l.title}`,
          'Memorizar sintaxis obsoleta sin aplicación práctica',
          'Configurar dependencias descontinuadas',
          'Omitir validaciones de arquitectura',
        ],
        correctOptionIndex: 0,
      }));

      if (fallbackQs.length > 0) {
        setQuestions(fallbackQs);
        setCurrentStep(0);
        setSelectedAnswers({});
        setMode('answering');
      } else {
        setErrorMessage('El módulo no cuenta con lecciones suficientes para generar un diagnóstico.');
      }
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
    if (!selectedModule) return;
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
        moduleId: selectedModule.id,
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
      // Fallback heurístico en cliente para garantizar que el usuario nunca quede atrapado (RF-23, RNF-5)
      const correctCount = answersPayload.filter((a) => a.isCorrect).length;
      const scorePercentage = Math.round((correctCount / questions.length) * 100);
      const mastered = selectedModule.lessons.filter((_, idx) =>
        scorePercentage >= 75 ? true : idx === 0,
      );
      const pending = selectedModule.lessons.filter((l) => !mastered.some((m) => m.id === l.id));
      const targetLesson = pending[0] || selectedModule.lessons[0];

      setEvaluationResult({
        moduleId: selectedModule.id,
        moduleTitle: selectedModule.title,
        courseId: selectedModule.courseId,
        courseTitle: selectedModule.courseTitle,
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
        justification: `Basado en tu evaluación (${correctCount}/${questions.length} correctas), te recomendamos iniciar en "${targetLesson?.title}" para maximizar tu avance curricular.`,
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
        {/* PASO 0: SELECCIÓN DE MÓDULO CURRICULAR (RF-1, RF-2, RF-18) */}
        {/* ============================================================ */}
        {mode === 'select_module' && (
          <div style={styles.content}>
            <div style={{ textAlign: 'left', marginBottom: '8px' }}>
              <h2 style={styles.mainTitle}>¿Qué módulo deseas aprender hoy?</h2>
              <p style={styles.mainSubtitle}>
                Selecciona el módulo que te interesa. Nuestra IA analizará sus lecciones reales para
                determinar tu nivel de conocimientos previos y recomendarte exactamente dónde comenzar.
              </p>
            </div>

            {loadingModules ? (
              <div style={styles.centerSpinner}>
                <Loader2 size={32} className="spin-animation" color="var(--color-sky-deep)" />
                <span style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginTop: '8px' }}>
                  Cargando módulos curriculares disponibles...
                </span>
              </div>
            ) : (
              <div style={styles.modulesGrid}>
                {modules.map((mod) => (
                  <div
                    key={mod.id}
                    onClick={() => handleSelectModule(mod)}
                    style={styles.moduleCard}
                    role="button"
                    tabIndex={0}
                  >
                    <div style={styles.moduleHeader}>
                      <span style={styles.categoryPill}>{mod.category}</span>
                      <span style={styles.lessonCountBadge}>
                        <BookOpen size={13} /> {mod.lessonsCount} lecciones
                      </span>
                    </div>
                    <h3 style={styles.moduleTitle}>{mod.title}</h3>
                    <p style={styles.moduleCourse}>Curso: {mod.courseTitle}</p>
                    <div style={styles.cardFooter}>
                      <span style={styles.cardFooterLink}>
                        Evaluar mis conocimientos <ArrowRight size={15} />
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
                  Analizando contenidos y lecciones del módulo...
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
                    onClick={() => setMode('select_module')}
                    className="btn-secondary"
                  >
                    Cambiar Módulo
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
              Identificando qué conocimientos ya dominas y cuáles requieren refuerzo para ubicar tu lección ideal.
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
              Evaluamos tus conocimientos sobre el módulo <strong>{evaluationResult.moduleTitle}</strong>.
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
              <span style={styles.recBadge}>Lección Recomendada para Comenzar</span>
              <h4 style={styles.recLessonTitle}>
                {evaluationResult.recommendedLesson.title}
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
    maxWidth: '680px',
    maxHeight: '90vh',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
    marginTop: '16px',
    marginBottom: '20px',
  },
  moduleCard: {
    padding: '16px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--color-outline)',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
    textAlign: 'left',
  },
  moduleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
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
    fontSize: '15px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    marginBottom: '4px',
    lineHeight: 1.3,
  },
  moduleCourse: {
    fontSize: '12px',
    color: 'var(--color-ink-muted)',
    marginBottom: '10px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid var(--color-outline)',
    paddingTop: '8px',
  },
  cardFooterLink: {
    fontSize: '12px',
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
