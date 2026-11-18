// frontend-web/src/components/meetings/CourseLiveMeetingsSection.tsx
import React, { useState, useEffect } from 'react';
import {
  Video,
  Calendar,
  Clock,
  ExternalLink,
  PlusCircle,
  AlertCircle,
  RefreshCw,
  Lock,
  User,
  CheckCircle2,
  ListFilter,
  History,
} from 'lucide-react';
import { api } from '../../services/api';
import { LiveMeetingModal, type MeetingItem } from './LiveMeetingModal';

interface CourseLiveMeetingsSectionProps {
  courseId: string;
  courseTitle: string;
  isEnrolled: boolean;
  isTeacherAuthor?: boolean;
  onEnrollRequested?: () => void;
}

export const CourseLiveMeetingsSection: React.FC<CourseLiveMeetingsSectionProps> = ({
  courseId,
  courseTitle,
  isEnrolled,
  isTeacherAuthor = false,
  onEnrollRequested,
}) => {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState<MeetingItem | null>(null);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'HISTORY'>('UPCOMING');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const fetchMeetings = async () => {
    // Si no está inscrito y tampoco es docente autor, no consultar para evitar 403
    if (!isEnrolled && !isTeacherAuthor) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.get(`/meetings/course/${courseId}`);
      setMeetings(res.data);
    } catch (err: any) {
      console.error('Error cargando reuniones del curso:', err);
      // No mostrar error alarmante si simplemente no está inscrito
      if (err.response?.status !== 403) {
        setFeedback({
          type: 'error',
          message: 'No se pudieron cargar las reuniones en vivo de este curso.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [courseId, isEnrolled, isTeacherAuthor]);

  const upcomingMeetings = meetings.filter(
    (m) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS',
  );
  const historyMeetings = meetings.filter(
    (m) => m.status === 'FINISHED' || m.status === 'CANCELLED',
  );

  const displayedMeetings = activeTab === 'UPCOMING' ? upcomingMeetings : historyMeetings;

  const formatDateSpanish = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: '#dcfce7',
              color: '#15803d',
              border: '1px solid #86efac',
            }}
          >
            <span style={styles.pulseDot} /> En Curso Ahora
          </span>
        );
      case 'SCHEDULED':
        return (
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              border: '1px solid #7dd3fc',
            }}
          >
            📅 Próxima Sesión
          </span>
        );
      case 'FINISHED':
        return (
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
            }}
          >
            ✓ Finalizada
          </span>
        );
      case 'CANCELLED':
        return (
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
            }}
          >
            ✕ Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section style={styles.sectionContainer} aria-label="Reuniones en vivo del curso">
      {/* Cabecera de la Sección */}
      <div style={styles.sectionHeader}>
        <div style={styles.titleGroup}>
          <div style={styles.iconBadge}>
            <Video size={22} color="#FFFFFF" />
          </div>
          <div>
            <h2 style={styles.sectionTitle}>Reuniones en vivo</h2>
            <p style={styles.sectionSubtitle}>
              Sesiones de aprendizaje y consultas en tiempo real por videoconferencia con el docente.
            </p>
          </div>
        </div>

        {/* Botón de acción para el docente autor */}
        {isTeacherAuthor && (
          <button
            type="button"
            onClick={() => {
              setMeetingToEdit(null);
              setIsModalOpen(true);
            }}
            className="btn-big-friendly"
            style={styles.scheduleBtn}
          >
            <PlusCircle size={16} />
            <span>Programar Reunión en Vivo</span>
          </button>
        )}
      </div>

      {feedback && (
        <div style={styles.errorAlert}>
          <AlertCircle size={16} />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* CASO: Estudiante no inscrito (RF-16) */}
      {!isEnrolled && !isTeacherAuthor ? (
        <div className="skylearn-card" style={styles.lockedCard}>
          <div style={styles.lockedIconBox}>
            <Lock size={32} color="var(--color-sky)" />
          </div>
          <h3 style={styles.lockedTitle}>Reuniones exclusivas para estudiantes inscritos</h3>
          <p style={styles.lockedDesc}>
            Para acceder a las próximas reuniones en vivo de <strong>{courseTitle}</strong>, sus
            fechas, agendas y enlaces de ingreso a Google Meet, debes estar inscrito en el curso.
          </p>
          {onEnrollRequested && (
            <button
              type="button"
              onClick={onEnrollRequested}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '14px', marginTop: '12px' }}
            >
              Inscribirme en este Curso para Ver Reuniones
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Navegación por Pestañas: Próximas vs Historial */}
          <div style={styles.tabBar}>
            <button
              type="button"
              onClick={() => setActiveTab('UPCOMING')}
              style={{
                ...styles.tabBtn,
                backgroundColor:
                  activeTab === 'UPCOMING' ? 'var(--color-sky-deep)' : 'var(--color-surface)',
                color: activeTab === 'UPCOMING' ? '#FFFFFF' : 'var(--color-ink)',
                borderColor:
                  activeTab === 'UPCOMING' ? 'var(--color-sky-deep)' : 'var(--color-border)',
              }}
            >
              <ListFilter size={15} />
              <span>Próximas Sesiones ({upcomingMeetings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('HISTORY')}
              style={{
                ...styles.tabBtn,
                backgroundColor:
                  activeTab === 'HISTORY' ? 'var(--color-sky-deep)' : 'var(--color-surface)',
                color: activeTab === 'HISTORY' ? '#FFFFFF' : 'var(--color-ink)',
                borderColor:
                  activeTab === 'HISTORY' ? 'var(--color-sky-deep)' : 'var(--color-border)',
              }}
            >
              <History size={15} />
              <span>Historial de Sesiones Anteriores ({historyMeetings.length})</span>
            </button>
          </div>

          {/* Listado de Tarjetas */}
          {isLoading ? (
            <div style={styles.loadingBox}>
              <RefreshCw size={24} className="spin" color="var(--color-sky)" />
              <p style={{ marginTop: '8px', color: 'var(--color-ink-muted)', fontSize: '13px' }}>
                Cargando reuniones programadas...
              </p>
            </div>
          ) : displayedMeetings.length === 0 ? (
            /* Zero-state (RF-06: «Todavía no hay reuniones programadas para este curso») */
            <div className="skylearn-card" style={styles.emptyCard}>
              <Calendar size={40} color="var(--color-ink-muted)" style={{ opacity: 0.6 }} />
              <h3 style={styles.emptyTitle}>
                {activeTab === 'UPCOMING'
                  ? 'Todavía no hay reuniones programadas para este curso'
                  : 'Aún no hay reuniones anteriores en el historial'}
              </h3>
              <p style={styles.emptyDesc}>
                {activeTab === 'UPCOMING'
                  ? 'El docente publicará aquí las sesiones en vivo con fecha, hora y enlace para que puedas participar voluntariamente.'
                  : 'Las sesiones finalizadas o canceladas aparecerán en esta sección para tu consulta pedagógica.'}
              </p>
              {isTeacherAuthor && activeTab === 'UPCOMING' && (
                <button
                  type="button"
                  onClick={() => {
                    setMeetingToEdit(null);
                    setIsModalOpen(true);
                  }}
                  className="btn-big-friendly"
                  style={{ padding: '8px 20px', fontSize: '13px', marginTop: '12px' }}
                >
                  <PlusCircle size={15} />
                  <span>Programar Primera Reunión</span>
                </button>
              )}
            </div>
          ) : (
            <div style={styles.meetingGrid}>
              {displayedMeetings.map((meeting) => {
                const isCancelled = meeting.status === 'CANCELLED';
                const isFinished = meeting.status === 'FINISHED';
                const isInProgress = meeting.status === 'IN_PROGRESS';

                return (
                  <div
                    key={meeting.id}
                    className="skylearn-card"
                    style={{
                      ...styles.card,
                      borderColor: isInProgress ? '#86efac' : 'var(--color-border)',
                      backgroundColor: isInProgress
                        ? 'var(--color-surface-elevated)'
                        : 'var(--color-surface)',
                      opacity: isCancelled ? 0.75 : 1,
                    }}
                  >
                    {/* Encabezado de la Tarjeta */}
                    <div style={styles.cardHeader}>
                      <div style={styles.teacherBadge}>
                        <User size={13} color="var(--color-ink-muted)" />
                        <span>Docente: {meeting.teacherName || 'Docente Responsable'}</span>
                      </div>
                      {getStatusBadge(meeting.status)}
                    </div>

                    {/* Título de la Reunión */}
                    <h3 style={styles.meetingTitle}>{meeting.title}</h3>

                    {/* Meta: Fecha y Horario */}
                    <div style={styles.metaBox}>
                      <div style={styles.metaRow}>
                        <Calendar size={14} color="var(--color-sky)" />
                        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                          {formatDateSpanish(meeting.date)}
                        </span>
                      </div>
                      <div style={styles.metaRow}>
                        <Clock size={14} color="var(--color-sky)" />
                        <span>
                          Horario: {meeting.startTime} – {meeting.endTime} hrs
                        </span>
                      </div>
                    </div>

                    {/* Agenda Temática */}
                    <div style={styles.agendaWrap}>
                      <span style={styles.agendaHeader}>Temas que se desarrollarán:</span>
                      <p style={styles.agendaText}>{meeting.description}</p>
                    </div>

                    {/* Botón de Ingreso a Videoconferencia */}
                    <div style={styles.cardActionArea}>
                      {isCancelled ? (
                        <div style={styles.cancelledNotice}>
                          <span>Esta reunión fue cancelada por el docente.</span>
                        </div>
                      ) : isFinished ? (
                        <div style={styles.finishedNotice}>
                          <CheckCircle2 size={15} color="#64748b" />
                          <span>Sesión finalizada</span>
                        </div>
                      ) : (
                        <a
                          href={meeting.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            ...styles.joinMeetingBtn,
                            backgroundColor: isInProgress ? '#16a34a' : 'var(--color-sky-deep)',
                            boxShadow: isInProgress
                              ? '0 4px 14px rgba(22, 163, 74, 0.35)'
                              : '0 4px 12px rgba(14, 165, 233, 0.25)',
                          }}
                          title="Abrir sala de videoconferencia en una nueva pestaña"
                        >
                          <ExternalLink size={15} />
                          <span>
                            {isInProgress ? '🟢 Ingresar a Reunión (En Curso)' : 'Ingresar a Reunión'}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal para Docente Autor */}
      {isModalOpen && (
        <LiveMeetingModal
          meetingToEdit={meetingToEdit}
          preselectedCourseId={courseId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            setFeedback({
              type: 'success',
              message: '¡Reunión en vivo programada y publicada exitosamente para tus estudiantes!',
            });
            fetchMeetings();
          }}
        />
      )}
    </section>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sectionContainer: {
    marginTop: '36px',
    paddingTop: '32px',
    borderTop: '2px dashed var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconBadge: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    backgroundColor: 'var(--color-sky-deep)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    margin: '0 0 4px 0',
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: 'var(--color-ink-muted)',
    margin: 0,
  },
  scheduleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 18px',
    fontSize: '13px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    borderRadius: '8px',
    fontSize: '13px',
  },
  lockedCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: '16px',
    border: '1px solid var(--color-border)',
  },
  lockedIconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: 'var(--color-sky-soft)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  lockedTitle: {
    fontSize: '18px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    margin: '0 0 8px 0',
  },
  lockedDesc: {
    fontSize: '14px',
    color: 'var(--color-ink-muted)',
    maxWidth: '520px',
    margin: '0 auto',
    lineHeight: '1.5',
  },
  tabBar: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '10px',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  loadingBox: {
    padding: '36px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyCard: {
    padding: '40px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--color-ink)',
    margin: '12px 0 6px 0',
  },
  emptyDesc: {
    fontSize: '13px',
    color: 'var(--color-ink-muted)',
    maxWidth: '460px',
    margin: 0,
    lineHeight: '1.4',
  },
  meetingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '22px',
    borderRadius: '16px',
    border: '1px solid',
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  teacherBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--color-ink-muted)',
    fontWeight: 500,
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 9px',
    borderRadius: '12px',
  },
  pulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#16a34a',
  },
  meetingTitle: {
    fontSize: '17px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    margin: '0 0 12px 0',
    lineHeight: '1.3',
  },
  metaBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '10px 12px',
    backgroundColor: 'var(--color-surface-elevated)',
    borderRadius: '10px',
    marginBottom: '14px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--color-ink)',
  },
  agendaWrap: {
    marginBottom: '18px',
  },
  agendaHeader: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--color-ink)',
    display: 'block',
    marginBottom: '4px',
  },
  agendaText: {
    fontSize: '13px',
    color: 'var(--color-ink-muted)',
    whiteSpace: 'pre-line',
    lineHeight: '1.45',
    margin: 0,
    maxHeight: '85px',
    overflowY: 'auto',
  },
  cardActionArea: {
    paddingTop: '12px',
    borderTop: '1px solid var(--color-border)',
  },
  joinMeetingBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '10px',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 700,
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.18s ease',
  },
  cancelledNotice: {
    padding: '8px 12px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    borderRadius: '8px',
    fontSize: '12px',
    textAlign: 'center',
    fontWeight: 600,
  },
  finishedNotice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
  },
};
