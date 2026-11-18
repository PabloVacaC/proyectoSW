// frontend-web/src/components/admin/StudentProfileModal.tsx
import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  BookOpen,
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';

interface StudentProfileModalProps {
  studentId: string | null;
  onClose: () => void;
}

interface StudentProfileData {
  student: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  stats: {
    totalEnrolledCourses: number;
    totalCompletedLessons: number;
    totalAttempts: number;
    passedAttempts: number;
    averageScore: number | null;
    passRate: number | null;
  };
  courses: Array<{
    courseId: string;
    courseTitle: string;
    enrolledAt: string;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    isCompleted: boolean;
  }>;
  examsHistory: Array<{
    attemptId: string;
    examTitle: string;
    lessonTitle: string;
    score: number;
    isPassed: boolean;
    date: string;
  }>;
  strengths: Array<{
    examTitle: string;
    lessonTitle: string;
    score: number;
  }>;
  weaknesses: Array<{
    examTitle: string;
    lessonTitle: string;
    score: number;
  }>;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  studentId,
  onClose,
}) => {
  const [data, setData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    setError(null);

    api
      .get<StudentProfileData>(`/admin/analytics/students/${studentId}`)
      .then((res) => setData(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || 'Error al cargar el perfil del estudiante');
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  if (!studentId) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.container} onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del Modal */}
        <div style={modalStyles.header}>
          <div style={modalStyles.headerLeft}>
            <div style={modalStyles.avatar}>
              {getInitials(data?.student.name)}
            </div>
            <div>
              <h3 style={modalStyles.title}>
                {loading ? 'Cargando perfil...' : data?.student.name}
              </h3>
              <p style={modalStyles.subtitle}>
                {data?.student.email} • Registrado el {formatDate(data?.student.createdAt)}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={modalStyles.closeBtn} title="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div style={modalStyles.body}>
          {loading ? (
            <div style={modalStyles.loadingBox}>
              <RefreshCw size={24} className="spin-anim" color="var(--color-sky)" />
              <p style={modalStyles.loadingText}>Obteniendo métricas académicas del estudiante...</p>
            </div>
          ) : error ? (
            <div style={modalStyles.errorBox}>
              <AlertTriangle size={20} color="var(--color-coral)" />
              <span>{error}</span>
            </div>
          ) : data ? (
            <div style={modalStyles.contentWrapper}>
              {/* Tarjetas rápidas de KPIs del estudiante */}
              <div style={modalStyles.statsGrid}>
                <div style={modalStyles.statCard}>
                  <div style={{ ...modalStyles.statIconWrap, backgroundColor: 'rgba(2, 132, 199, 0.1)' }}>
                    <BookOpen size={16} color="var(--color-sky-deep)" />
                  </div>
                  <div>
                    <span style={modalStyles.statLabel}>Cursos</span>
                    <strong style={modalStyles.statVal}>{data.stats.totalEnrolledCourses}</strong>
                  </div>
                </div>

                <div style={modalStyles.statCard}>
                  <div style={{ ...modalStyles.statIconWrap, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                    <CheckCircle2 size={16} color="var(--color-leaf-deep)" />
                  </div>
                  <div>
                    <span style={modalStyles.statLabel}>Clases Vistas</span>
                    <strong style={modalStyles.statVal}>{data.stats.totalCompletedLessons}</strong>
                  </div>
                </div>

                <div style={modalStyles.statCard}>
                  <div style={{ ...modalStyles.statIconWrap, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                    <Award size={16} color="#d97706" />
                  </div>
                  <div>
                    <span style={modalStyles.statLabel}>Evaluaciones</span>
                    <strong style={modalStyles.statVal}>{data.stats.totalAttempts}</strong>
                  </div>
                </div>

                <div style={modalStyles.statCard}>
                  <div
                    style={{
                      ...modalStyles.statIconWrap,
                      backgroundColor:
                        (data.stats.averageScore || 0) >= 70
                          ? 'rgba(16, 185, 129, 0.1)'
                          : 'rgba(239, 68, 68, 0.1)',
                    }}
                  >
                    <User
                      size={16}
                      color={(data.stats.averageScore || 0) >= 70 ? '#059669' : '#dc2626'}
                    />
                  </div>
                  <div>
                    <span style={modalStyles.statLabel}>Promedio</span>
                    <strong style={modalStyles.statVal}>
                      {data.stats.averageScore !== null ? `${data.stats.averageScore}%` : 'N/A'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Fortalezas y Temas a Reforzar */}
              <div style={modalStyles.section}>
                <h4 style={modalStyles.sectionHeading}>Diagnóstico de Rendimiento</h4>
                <div style={modalStyles.diagGrid}>
                  <div style={modalStyles.diagCard}>
                    <div style={modalStyles.diagTitleRow}>
                      <Sparkles size={15} color="#059669" />
                      <span style={{ ...modalStyles.diagTitle, color: '#059669' }}>
                        Fortalezas Demostradas ({data.strengths.length})
                      </span>
                    </div>
                    {data.strengths.length > 0 ? (
                      <div style={modalStyles.pillsWrap}>
                        {data.strengths.map((s, idx) => (
                          <span key={idx} style={modalStyles.pillStrength}>
                            {s.lessonTitle} ({s.score}%)
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={modalStyles.emptyMuted}>Aún no registra evaluaciones con $\ge 80\%$</span>
                    )}
                  </div>

                  <div style={modalStyles.diagCard}>
                    <div style={modalStyles.diagTitleRow}>
                      <AlertTriangle size={15} color="#dc2626" />
                      <span style={{ ...modalStyles.diagTitle, color: '#dc2626' }}>
                        Temas a Reforzar ({data.weaknesses.length})
                      </span>
                    </div>
                    {data.weaknesses.length > 0 ? (
                      <div style={modalStyles.pillsWrap}>
                        {data.weaknesses.map((w, idx) => (
                          <span key={idx} style={modalStyles.pillWeakness}>
                            {w.lessonTitle} ({w.score}%)
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={modalStyles.emptyMuted}>No presenta evaluaciones reprobadas</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Cursos inscritos y avance */}
              <div style={modalStyles.section}>
                <h4 style={modalStyles.sectionHeading}>Cursos y Progreso Curricular</h4>
                {data.courses.length > 0 ? (
                  <div style={modalStyles.coursesList}>
                    {data.courses.map((c) => (
                      <div key={c.courseId} style={modalStyles.courseItem}>
                        <div style={modalStyles.courseItemHeader}>
                          <span style={modalStyles.courseTitle}>{c.courseTitle}</span>
                          <span style={modalStyles.coursePercent}>{c.progressPercentage}%</span>
                        </div>
                        <div style={modalStyles.progressBarTrack}>
                          <div
                            style={{
                              ...modalStyles.progressBarFill,
                              width: `${c.progressPercentage}%`,
                              backgroundColor: c.isCompleted ? 'var(--color-leaf)' : 'var(--color-sky)',
                            }}
                          />
                        </div>
                        <div style={modalStyles.courseMetaRow}>
                          <span style={modalStyles.courseMeta}>
                            {c.completedLessons} de {c.totalLessons} clases vistas
                          </span>
                          <span style={modalStyles.courseMeta}>
                            Inscrito el {formatDate(c.enrolledAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={modalStyles.emptyText}>El estudiante no está inscrito en ningún curso.</p>
                )}
              </div>

              {/* Historial de Evaluaciones */}
              <div style={modalStyles.section}>
                <h4 style={modalStyles.sectionHeading}>Historial de Evaluaciones</h4>
                {data.examsHistory.length > 0 ? (
                  <div style={modalStyles.tableWrap}>
                    <table style={modalStyles.table}>
                      <thead>
                        <tr>
                          <th style={modalStyles.th}>Evaluación / Clase</th>
                          <th style={modalStyles.th}>Fecha</th>
                          <th style={modalStyles.th}>Puntaje</th>
                          <th style={modalStyles.th}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.examsHistory.map((ex) => (
                          <tr key={ex.attemptId} style={modalStyles.tr}>
                            <td style={modalStyles.td}>
                              <span style={modalStyles.examName}>{ex.examTitle}</span>
                              <span style={modalStyles.examLesson}>{ex.lessonTitle}</span>
                            </td>
                            <td style={modalStyles.td}>{formatDate(ex.date)}</td>
                            <td style={modalStyles.td}>
                              <strong
                                style={{
                                  color: ex.isPassed ? 'var(--color-leaf-deep)' : 'var(--color-coral)',
                                }}
                              >
                                {ex.score}%
                              </strong>
                            </td>
                            <td style={modalStyles.td}>
                              <span
                                style={{
                                  ...modalStyles.statusBadge,
                                  backgroundColor: ex.isPassed
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : 'rgba(239, 68, 68, 0.15)',
                                  color: ex.isPassed ? '#059669' : '#dc2626',
                                }}
                              >
                                {ex.isPassed ? 'Aprobado' : 'Requiere Repaso'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={modalStyles.emptyText}>Aún no ha realizado exámenes formativos.</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const modalStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  container: {
    backgroundColor: 'var(--color-surface-elevated, #ffffff)',
    borderRadius: '16px',
    maxWidth: '680px',
    width: '100%',
    maxHeight: '88vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--color-outline, #e2e8f0)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--color-outline, #e2e8f0)',
    backgroundColor: 'var(--color-surface, #f8fafc)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-sky-deep, #1d4ed8)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 800,
  },
  title: {
    fontSize: '16px',
    fontWeight: 800,
    color: 'var(--color-ink, #0f172a)',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--color-ink-muted, #64748b)',
    margin: '2px 0 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-ink-muted, #64748b)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
  },
  body: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1,
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 16px',
    gap: '10px',
  },
  loadingText: {
    fontSize: '13px',
    color: 'var(--color-ink-muted, #64748b)',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '12px',
  },
  statCard: {
    backgroundColor: 'var(--color-surface, #f8fafc)',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid var(--color-outline, #e2e8f0)',
  },
  statIconWrap: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--color-ink-muted, #64748b)',
    display: 'block',
  },
  statVal: {
    fontSize: '15px',
    fontWeight: 800,
    color: 'var(--color-ink, #0f172a)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sectionHeading: {
    fontSize: '14px',
    fontWeight: 800,
    color: 'var(--color-ink, #0f172a)',
    margin: 0,
    borderBottom: '1px solid var(--color-outline, #e2e8f0)',
    paddingBottom: '6px',
  },
  diagGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '12px',
  },
  diagCard: {
    backgroundColor: 'var(--color-surface, #f8fafc)',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--color-outline, #e2e8f0)',
  },
  diagTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  diagTitle: {
    fontSize: '12px',
    fontWeight: 800,
  },
  pillsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  pillStrength: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#059669',
    fontWeight: 600,
  },
  pillWeakness: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#dc2626',
    fontWeight: 600,
  },
  emptyMuted: {
    fontSize: '11px',
    color: 'var(--color-ink-muted, #64748b)',
    fontStyle: 'italic',
  },
  coursesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  courseItem: {
    backgroundColor: 'var(--color-surface, #f8fafc)',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid var(--color-outline, #e2e8f0)',
  },
  courseItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  courseTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--color-ink, #0f172a)',
  },
  coursePercent: {
    fontSize: '12px',
    fontWeight: 800,
    color: 'var(--color-sky-deep, #1d4ed8)',
  },
  progressBarTrack: {
    width: '100%',
    height: '6px',
    backgroundColor: 'var(--color-outline, #e2e8f0)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '6px',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  courseMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: 'var(--color-ink-muted, #64748b)',
  },
  courseMeta: {
    fontSize: '11px',
  },
  tableWrap: {
    overflowX: 'auto',
    border: '1px solid var(--color-outline, #e2e8f0)',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '12px',
  },
  th: {
    padding: '8px 12px',
    backgroundColor: 'var(--color-surface, #f8fafc)',
    fontWeight: 700,
    color: 'var(--color-ink, #0f172a)',
    borderBottom: '1px solid var(--color-outline, #e2e8f0)',
  },
  tr: {
    borderBottom: '1px solid var(--color-outline, #e2e8f0)',
  },
  td: {
    padding: '8px 12px',
    verticalAlign: 'middle',
  },
  examName: {
    fontWeight: 700,
    color: 'var(--color-ink, #0f172a)',
    display: 'block',
  },
  examLesson: {
    fontSize: '11px',
    color: 'var(--color-ink-muted, #64748b)',
    display: 'block',
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: '10px',
  },
  emptyText: {
    fontSize: '12px',
    color: 'var(--color-ink-muted, #64748b)',
    margin: 0,
  },
};
