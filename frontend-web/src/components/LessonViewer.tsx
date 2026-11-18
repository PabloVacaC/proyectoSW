// frontend-web/src/components/LessonViewer.tsx
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Award,
  Bot,
  FileDown,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  PlayCircle,
  FileText,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LessonCommentsSection } from './LessonCommentsSection';

export interface CourseLessonItem {
  id: string;
  title: string;
  order?: number;
  isCompleted?: boolean;
  moduleId?: string;
  moduleTitle?: string;
}

interface LessonViewerProps {
  lesson: {
    id: string;
    title: string;
    videoUrl: string;
    contextText: string;
    downloadableUrl?: string;
    exams?: Array<{
      id: string;
      title: string;
      questions: Array<{
        id: string;
        text: string;
        options: Array<{
          id: string;
          text: string;
          isCorrect?: boolean;
        }>;
      }>;
    }>;
  };
  onBack: () => void;
  onCompleteLesson: (lessonId: string) => void;
  courseTitle?: string;
  courseLessons?: CourseLessonItem[];
  currentIndex?: number;
  totalLessons?: number;
  onSelectLesson?: (lessonId: string) => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  currentUser?: any;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  onBack,
  onCompleteLesson,
  courseTitle = 'Curso de Especialización',
  courseLessons = [],
  currentIndex = 0,
  totalLessons = 1,
  onSelectLesson,
  onNextLesson,
  onPrevLesson,
  currentUser,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'context' | 'exam' | 'tutor'>('context');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Reiniciar estado de respuestas si cambia la lección
  useEffect(() => {
    setSelectedAnswers({});
    setExamSubmitted(false);
    setExamScore(null);
    setActiveTab('context');
  }, [lesson.id]);

  // Helper para convertir URL estándar de YouTube a embed URL
  const getEmbedUrl = (url: string) => {
    try {
      if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      if (url.includes('embed/')) return url;
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`;
      }
      const v = urlObj.searchParams.get('v');
      return v ? `https://www.youtube.com/embed/${v}` : url;
    } catch {
      return url;
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (examSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId,
    });
  };

  const handleCheckExam = () => {
    const exam = lesson.exams?.[0];
    if (!exam || !exam.questions.length) return;

    let correctCount = 0;
    exam.questions.forEach((q) => {
      const selectedId = selectedAnswers[q.id];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (correctOpt && selectedId === correctOpt.id) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / exam.questions.length) * 100);
    setExamScore(percentage);
    setExamSubmitted(true);

    if (percentage >= 70) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      onCompleteLesson(lesson.id);
    }
  };

  const exam = lesson.exams?.[0];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < (totalLessons > 0 ? totalLessons - 1 : 0);
  const currentLessonNum = currentIndex + 1;

  return (
    <div style={styles.pageContainer}>
      {/* Barra superior de contexto */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <button onClick={onBack} style={styles.backBtn} title="Volver al temario">
            <ArrowLeft size={16} />
            <span>Volver al curso</span>
          </button>
          <span style={styles.courseName}>{courseTitle}</span>
        </div>

        <div style={styles.topBarRight}>
          <a
            href="#/tutor"
            style={styles.tutorHeaderBtn}
            title="Abrir sala de tutoría interactiva 3D con Gemini"
          >
            <Bot size={16} color="var(--color-sky)" />
            <span>Docente Virtual 3D</span>
          </a>
        </div>
      </div>

      {/* Área principal de 2 columnas estilo Platzi */}
      <div style={styles.mainLayout}>
        {/* Columna Izquierda: Video, pestañas y herramientas pedagógicas */}
        <div style={styles.leftColumn}>
          {/* Reproductor de Video 16:9 */}
          <div style={styles.videoPlayerCard}>
            <div style={styles.iframeWrapper}>
              <iframe
                src={getEmbedUrl(lesson.videoUrl)}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={styles.iframe}
              />
            </div>
            <div style={styles.videoMetaBar}>
              <div style={styles.titleArea}>
                <span style={styles.lessonOrderTag}>Clase {currentLessonNum} de {totalLessons}</span>
                <h1 style={styles.lessonHeading}>{lesson.title}</h1>
              </div>
              {lesson.downloadableUrl && (
                <a
                  href={lesson.downloadableUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.resourceDownloadBtn}
                  title="Descargar recursos complementarios de la clase"
                >
                  <FileDown size={14} />
                  <span>Recursos</span>
                </a>
              )}
            </div>
          </div>

          {/* Selector de pestañas didácticas */}
          <div style={styles.tabsNav}>
            <button
              onClick={() => setActiveTab('context')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'context' ? styles.tabButtonActive : {}),
              }}
            >
              <FileText size={15} />
              <span>Contexto y Recursos</span>
            </button>
            <button
              onClick={() => setActiveTab('exam')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'exam' ? styles.tabButtonActive : {}),
              }}
            >
              <HelpCircle size={15} />
              <span>Evaluación Formativa</span>
              {exam && exam.questions?.length > 0 && (
                <span style={styles.tabBadge}>{exam.questions.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('tutor')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'tutor' ? styles.tabButtonActive : {}),
              }}
            >
              <Bot size={15} />
              <span>Tutor Virtual 3D</span>
            </button>
          </div>

          {/* Contenido de la pestaña activa */}
          <div style={styles.tabContentPanel}>
            {activeTab === 'context' && (
              <div style={styles.contextTabBox}>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.tabHeading}>Resumen Pedagógico de la Clase</h3>
                </div>
                <div style={styles.contextBody}>
                  <p style={styles.contextParagraph}>{lesson.contextText}</p>
                </div>

                {lesson.downloadableUrl && (
                  <div style={styles.downloadCallout}>
                    <div style={styles.downloadCalloutInfo}>
                      <FileDown size={20} color="var(--color-sky)" />
                      <div>
                        <h4 style={styles.downloadCalloutTitle}>Material Descargable de la Lección</h4>
                        <p style={styles.downloadCalloutDesc}>
                          Guía didáctica, diapositivas y código fuente complementario.
                        </p>
                      </div>
                    </div>
                    <a
                      href={lesson.downloadableUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.downloadActionBtn}
                    >
                      <ExternalLink size={14} />
                      <span>Descargar material</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'exam' && (
              <div style={styles.examTabBox}>
                {exam && exam.questions && exam.questions.length > 0 ? (
                  <div>
                    <div style={styles.examTopHeader}>
                      <div>
                        <h3 style={styles.tabHeading}>{exam.title || 'Evaluación Formativa'}</h3>
                        <p style={styles.tabSubheading}>
                          Responde las preguntas para afianzar los conceptos clave de esta clase. (Mínimo 70% para aprobar).
                        </p>
                      </div>
                    </div>

                    {examScore !== null && (
                      <div
                        style={{
                          ...styles.scoreBadge,
                          backgroundColor:
                            examScore >= 70 ? 'var(--color-leaf-soft)' : 'var(--color-coral-soft)',
                          color: examScore >= 70 ? 'var(--color-leaf-deep)' : 'var(--color-coral)',
                          borderColor: examScore >= 70 ? 'var(--color-leaf)' : 'var(--color-coral)',
                        }}
                      >
                        <Award size={18} />
                        <span>
                          Calificación: {examScore}% —{' '}
                          {examScore >= 70
                            ? '¡Felicitaciones! Has completado y aprobado esta clase.'
                            : 'Aún no alcanzas el 70%. Repasa el video y vuelve a intentarlo.'}
                        </span>
                      </div>
                    )}

                    <div style={styles.questionsList}>
                      {exam.questions.map((q, qIndex) => (
                        <div key={q.id || qIndex} style={styles.questionCard}>
                          <p style={styles.questionText}>
                            <span style={styles.questionNumber}>{qIndex + 1}.</span> {q.text}
                          </p>

                          <div style={styles.optionsList}>
                            {q.options.map((opt) => {
                              const isSelected = selectedAnswers[q.id] === opt.id;
                              let optionBg = 'var(--color-surface)';
                              let optionBorder = 'var(--color-outline)';

                              if (examSubmitted) {
                                if (opt.isCorrect) {
                                  optionBg = 'var(--color-leaf-soft)';
                                  optionBorder = 'var(--color-leaf)';
                                } else if (isSelected && !opt.isCorrect) {
                                  optionBg = 'var(--color-coral-soft)';
                                  optionBorder = 'var(--color-coral)';
                                }
                              } else if (isSelected) {
                                optionBg = 'var(--color-sky-soft)';
                                optionBorder = 'var(--color-sky)';
                              }

                              return (
                                <div
                                  key={opt.id}
                                  onClick={() => handleSelectOption(q.id, opt.id)}
                                  style={{
                                    ...styles.optionTile,
                                    backgroundColor: optionBg,
                                    borderColor: optionBorder,
                                    cursor: examSubmitted ? 'default' : 'pointer',
                                  }}
                                >
                                  <span style={styles.radioDot}>
                                    {isSelected ? '●' : '○'}
                                  </span>
                                  <span style={styles.optionText}>{opt.text}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={styles.examActionRow}>
                      <button
                        onClick={handleCheckExam}
                        disabled={examSubmitted && examScore! >= 70}
                        style={styles.submitExamBtn}
                      >
                        <Sparkles size={16} />
                        <span>{examSubmitted ? 'Volver a intentar evaluación' : 'Comprobar respuestas'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.emptyExamState}>
                    <CheckCircle2 size={36} color="var(--color-leaf)" />
                    <h4 style={styles.emptyExamTitle}>¡Clase sin examen obligatorio!</h4>
                    <p style={styles.emptyExamDesc}>
                      Esta clase se enfoca en práctica conceptual y observación guiada. Puedes marcarla como completada cuando finalices el video.
                    </p>
                    <button
                      onClick={() => {
                        confetti({ particleCount: 50 });
                        onCompleteLesson(lesson.id);
                      }}
                      style={styles.markCompleteBtn}
                    >
                      <CheckCircle2 size={16} />
                      <span>Marcar clase como completada</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tutor' && (
              <div style={styles.tutorTabBox}>
                <div style={styles.tutorBanner}>
                  <div style={styles.tutorIconBox}>
                    <Bot size={32} color="var(--color-sky)" />
                  </div>
                  <div>
                    <h3 style={styles.tutorBannerTitle}>Tutor Virtual Interactivo 3D con Gemini</h3>
                    <p style={styles.tutorBannerDesc}>
                      ¿Tienes dudas sobre el contenido de <strong>{lesson.title}</strong>? Puedes dialogar en tiempo real con el avatar inteligente, realizar consultas por voz y recibir respuestas contextualizadas a este video.
                    </p>
                    <a
                      href="#/tutor"
                      style={styles.tutorLaunchBtn}
                    >
                      <Bot size={16} />
                      <span>Abrir Sesión con el Docente Virtual 3D</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Sistema persistente de comentarios e hilos de respuesta */}
        <div style={styles.rightColumn}>
          <LessonCommentsSection lessonId={lesson.id} currentUser={currentUser} />
        </div>
      </div>

      {/* Barra Inferior Secuencial Estilo Platzi */}
      <footer style={styles.bottomBar}>
        <div style={styles.bottomLeft}>
          <span style={styles.bottomCourseTitle}>{courseTitle}</span>
          <span style={styles.bottomDivider}>•</span>
          <span style={styles.bottomProgress}>
            Clase {currentLessonNum} de {totalLessons}
          </span>
        </div>

        <div style={styles.bottomCenter}>
          <button
            onClick={() => setIsDrawerOpen(true)}
            style={styles.drawerTriggerBtn}
            title="Abrir temario del curso"
          >
            <BookOpen size={16} />
            <span>Clases</span>
          </button>
        </div>

        <div style={styles.bottomRight}>
          <button
            onClick={onPrevLesson}
            disabled={!hasPrev}
            style={{
              ...styles.navBtn,
              opacity: hasPrev ? 1 : 0.4,
              cursor: hasPrev ? 'pointer' : 'not-allowed',
            }}
            title={hasPrev ? 'Ir a la clase anterior' : 'Primera clase del curso'}
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>

          <button
            onClick={onNextLesson}
            disabled={!hasNext}
            style={{
              ...styles.nextClassBtn,
              opacity: hasNext ? 1 : 0.4,
              cursor: hasNext ? 'pointer' : 'not-allowed',
            }}
            title={hasNext ? 'Ir a la siguiente clase' : '¡Has llegado a la última clase del curso!'}
          >
            <span>{hasNext ? 'Siguiente clase' : 'Última clase'}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </footer>

      {/* Cajón Lateral / Drawer de Clases (Temario) */}
      {isDrawerOpen && (
        <div style={styles.drawerOverlay} onClick={() => setIsDrawerOpen(false)}>
          <div style={styles.drawerContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div style={styles.drawerHeaderTitle}>
                <BookOpen size={18} color="var(--color-sky)" />
                <h3 style={styles.drawerTitle}>Temario del Curso</h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={styles.drawerCloseBtn}
                title="Cerrar temario"
              >
                <X size={18} />
              </button>
            </div>

            <div style={styles.drawerCourseMeta}>
              <span style={styles.drawerCourseName}>{courseTitle}</span>
              <span style={styles.drawerCount}>{totalLessons} clases en total</span>
            </div>

            <div style={styles.drawerLessonsList}>
              {courseLessons.length > 0 ? (
                courseLessons.map((l, idx) => {
                  const isCurrent = l.id === lesson.id;
                  return (
                    <div
                      key={l.id}
                      onClick={() => {
                        if (onSelectLesson && !isCurrent) {
                          onSelectLesson(l.id);
                        }
                        setIsDrawerOpen(false);
                      }}
                      style={{
                        ...styles.drawerLessonItem,
                        backgroundColor: isCurrent
                          ? 'var(--color-sky-soft)'
                          : 'var(--color-surface)',
                        borderColor: isCurrent ? 'var(--color-sky)' : 'var(--color-outline)',
                      }}
                    >
                      <div style={styles.drawerItemLeft}>
                        {l.isCompleted ? (
                          <CheckCircle2 size={16} color="var(--color-leaf)" />
                        ) : (
                          <PlayCircle
                            size={16}
                            color={isCurrent ? 'var(--color-sky-deep)' : 'var(--color-ink-muted)'}
                          />
                        )}
                        <span
                          style={{
                            ...styles.drawerLessonTitle,
                            fontWeight: isCurrent ? 800 : 600,
                            color: isCurrent ? 'var(--color-sky-deep)' : 'var(--color-ink)',
                          }}
                        >
                          {idx + 1}. {l.title}
                        </span>
                      </div>
                      {isCurrent && <span style={styles.currentIndicator}>En curso</span>}
                    </div>
                  );
                })
              ) : (
                <div style={styles.drawerEmpty}>
                  <p style={styles.drawerEmptyText}>
                    Clase actual: {lesson.title} ({currentLessonNum} de {totalLessons})
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 70px)',
    backgroundColor: 'var(--color-bg)',
    width: '100%',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    backgroundColor: 'var(--color-surface-elevated)',
    borderBottom: '1px solid var(--color-outline)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: 'var(--color-ink-muted)',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'color 0.15s ease',
  },
  courseName: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--color-sky-deep)',
    backgroundColor: 'var(--color-sky-soft)',
    padding: '3px 10px',
    borderRadius: 'var(--radius-full)',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  tutorHeaderBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-sky)',
    color: 'var(--color-sky-deep)',
    fontSize: '12px',
    fontWeight: 700,
    textDecoration: 'none',
  },
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.8fr) minmax(360px, 1.2fr)',
    gap: '24px',
    padding: '20px 24px 80px 24px',
    maxWidth: '1600px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
    alignItems: 'start',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  videoPlayerCard: {
    backgroundColor: 'var(--color-surface-elevated)',
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid var(--color-outline)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-card)',
  },
  iframeWrapper: {
    position: 'relative',
    paddingBottom: '56.25%',
    height: 0,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
  videoMetaBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderTop: '1px solid var(--color-outline)',
    gap: '16px',
    flexWrap: 'wrap',
  },
  titleArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  lessonOrderTag: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--color-ink-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  lessonHeading: {
    fontSize: '18px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    margin: 0,
  },
  resourceDownloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-outline)',
    color: 'var(--color-ink)',
    fontSize: '12px',
    fontWeight: 700,
    textDecoration: 'none',
  },
  tabsNav: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid var(--color-outline)',
    paddingBottom: '8px',
  },
  tabButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-ink-muted)',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabButtonActive: {
    backgroundColor: 'var(--color-surface-elevated)',
    color: 'var(--color-sky-deep)',
    boxShadow: 'var(--shadow-sm, 0 1px 4px rgba(0,0,0,0.06))',
    border: '1px solid var(--color-outline)',
  },
  tabBadge: {
    fontSize: '10px',
    fontWeight: 800,
    backgroundColor: 'var(--color-sky-soft)',
    color: 'var(--color-sky-deep)',
    padding: '1px 6px',
    borderRadius: '10px',
  },
  tabContentPanel: {
    backgroundColor: 'var(--color-surface-elevated)',
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid var(--color-outline)',
    padding: '20px',
  },
  contextTabBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabHeading: {
    fontSize: '16px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    margin: 0,
  },
  tabSubheading: {
    fontSize: '13px',
    color: 'var(--color-ink-muted)',
    margin: '4px 0 0 0',
  },
  contextBody: {
    backgroundColor: 'var(--color-surface)',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid var(--color-outline)',
  },
  contextParagraph: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: 'var(--color-ink)',
    margin: 0,
  },
  downloadCallout: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderRadius: '8px',
    backgroundColor: 'var(--color-sky-soft)',
    border: '1px solid var(--color-sky)',
    gap: '12px',
    flexWrap: 'wrap',
  },
  downloadCalloutInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  downloadCalloutTitle: {
    fontSize: '13px',
    fontWeight: 800,
    color: 'var(--color-sky-deep)',
    margin: 0,
  },
  downloadCalloutDesc: {
    fontSize: '12px',
    color: 'var(--color-ink-muted)',
    margin: '2px 0 0 0',
  },
  downloadActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '6px',
    backgroundColor: 'var(--color-sky-deep)',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 700,
    textDecoration: 'none',
  },
  examTabBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  examTopHeader: {
    marginBottom: '14px',
  },
  scoreBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '8px',
    fontWeight: 800,
    fontSize: '13px',
    border: '1px solid',
    marginBottom: '16px',
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  questionCard: {
    backgroundColor: 'var(--color-surface)',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid var(--color-outline)',
  },
  questionText: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--color-ink)',
    margin: '0 0 10px 0',
  },
  questionNumber: {
    color: 'var(--color-sky-deep)',
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  optionTile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1.5px solid',
    transition: 'all 0.15s ease',
  },
  radioDot: {
    fontSize: '13px',
    color: 'var(--color-sky-deep)',
  },
  optionText: {
    fontSize: '13px',
    color: 'var(--color-ink)',
    fontWeight: 600,
  },
  examActionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '16px',
  },
  submitExamBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--color-sky-deep)',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 'var(--radius-full)',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  emptyExamState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '30px 16px',
    gap: '8px',
  },
  emptyExamTitle: {
    fontSize: '16px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    margin: 0,
  },
  emptyExamDesc: {
    fontSize: '13px',
    color: 'var(--color-ink-muted)',
    maxWidth: '440px',
    margin: 0,
  },
  markCompleteBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--color-leaf-deep)',
    color: '#ffffff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: 'var(--radius-full)',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '10px',
  },
  tutorTabBox: {
    padding: '10px 0',
  },
  tutorBanner: {
    display: 'flex',
    gap: '16px',
    backgroundColor: 'var(--color-surface)',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid var(--color-outline)',
    alignItems: 'flex-start',
  },
  tutorIconBox: {
    width: '54px',
    height: '54px',
    borderRadius: '12px',
    backgroundColor: 'var(--color-sky-soft)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tutorBannerTitle: {
    fontSize: '15px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    margin: '0 0 6px 0',
  },
  tutorBannerDesc: {
    fontSize: '13px',
    color: 'var(--color-ink-muted)',
    lineHeight: 1.5,
    margin: '0 0 16px 0',
  },
  tutorLaunchBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-sky-deep)',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 700,
    textDecoration: 'none',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  bottomBar: {
    position: 'sticky',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'var(--color-surface-elevated)',
    borderTop: '1px solid var(--color-outline)',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
    boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)',
  },
  bottomLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  bottomCourseTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--color-ink)',
    maxWidth: '260px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bottomDivider: {
    color: 'var(--color-ink-muted)',
    fontSize: '12px',
  },
  bottomProgress: {
    fontSize: '12px',
    color: 'var(--color-ink-muted)',
    fontWeight: 600,
  },
  bottomCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  drawerTriggerBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-outline)',
    color: 'var(--color-ink)',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  bottomRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid var(--color-outline)',
    backgroundColor: 'transparent',
    color: 'var(--color-ink)',
    fontSize: '13px',
    fontWeight: 700,
    transition: 'all 0.15s ease',
  },
  nextClassBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 18px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--color-sky-deep)',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 700,
    transition: 'all 0.15s ease',
  },
  drawerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 200,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  drawerContainer: {
    width: '360px',
    maxWidth: '90vw',
    height: '100%',
    backgroundColor: 'var(--color-surface-elevated)',
    borderRight: '1px solid var(--color-outline)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-modal)',
    animation: 'slideInLeft 0.2s ease-out',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--color-outline)',
  },
  drawerHeaderTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  drawerTitle: {
    fontSize: '15px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    margin: 0,
  },
  drawerCloseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-ink-muted)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  drawerCourseMeta: {
    padding: '12px 20px',
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-outline)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  drawerCourseName: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--color-ink)',
  },
  drawerCount: {
    fontSize: '11px',
    color: 'var(--color-ink-muted)',
  },
  drawerLessonsList: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  drawerLessonItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  drawerItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },
  drawerLessonTitle: {
    fontSize: '13px',
    lineHeight: 1.3,
  },
  currentIndicator: {
    fontSize: '10px',
    fontWeight: 800,
    backgroundColor: 'var(--color-sky-deep)',
    color: '#ffffff',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  drawerEmpty: {
    padding: '20px',
    textAlign: 'center',
  },
  drawerEmptyText: {
    fontSize: '12px',
    color: 'var(--color-ink-muted)',
  },
};
