// frontend-web/src/components/meetings/TeacherMeetingsManager.tsx
import React, { useState, useEffect } from 'react';
import {
  Video,
  PlusCircle,
  Calendar,
  Clock,
  ExternalLink,
  Pencil,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Filter,
} from 'lucide-react';
import { api } from '../../services/api';
import { LiveMeetingModal, type MeetingItem } from './LiveMeetingModal';

export const TeacherMeetingsManager: React.FC = () => {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    'ALL' | 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED'
  >('ALL');
  const [selectedMeetingToEdit, setSelectedMeetingToEdit] = useState<MeetingItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [cancellingMeetingId, setCancellingMeetingId] = useState<string | null>(null);

  const fetchMeetings = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await api.get('/meetings/teacher');
      setMeetings(res.data);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message:
          err.response?.data?.message || 'Error al cargar las reuniones programadas del docente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedMeetingToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (meeting: MeetingItem) => {
    setSelectedMeetingToEdit(meeting);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (savedMeeting: MeetingItem) => {
    setIsModalOpen(false);
    setSelectedMeetingToEdit(null);
    setFeedback({
      type: 'success',
      message: `¡Reunión "${savedMeeting.title}" guardada exitosamente!`,
    });
    fetchMeetings();
  };

  const handleCancelMeeting = async (meeting: MeetingItem) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas cancelar la reunión "${meeting.title}" programada para el ${meeting.date}? Los estudiantes verán que fue cancelada y no podrán ingresar.`,
      )
    ) {
      return;
    }

    try {
      setCancellingMeetingId(meeting.id);
      await api.patch(`/meetings/${meeting.id}/cancel`);
      setFeedback({
        type: 'success',
        message: `La reunión "${meeting.title}" ha sido cancelada correctamente.`,
      });
      fetchMeetings();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Error al cancelar la reunión.',
      });
    } finally {
      setCancellingMeetingId(null);
    }
  };

  const filteredMeetings = meetings.filter((m) => {
    if (filterStatus === 'ALL') return true;
    return m.status === filterStatus;
  });

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
            📅 Próxima Reunión
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

  return (
    <div style={styles.container}>
      {/* Barra Superior */}
      <div style={styles.topBar}>
        <div>
          <div style={styles.titleRow}>
            <div style={styles.iconBadge}>
              <Video size={22} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={styles.title}>Reuniones en Vivo Programadas</h1>
              <p style={styles.subtitle}>
                Programa videoconferencias para tus cursos asignados con enlaces externos y agenda temática.
              </p>
            </div>
          </div>
        </div>

        <div style={styles.topActions}>
          <button
            type="button"
            onClick={fetchMeetings}
            disabled={isLoading}
            className="btn-secondary"
            style={styles.refreshBtn}
            title="Refrescar lista"
          >
            <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="btn-big-friendly"
            style={styles.createBtn}
          >
            <PlusCircle size={16} />
            <span>Programar Reunión</span>
          </button>
        </div>
      </div>

      {/* Alertas de Feedback */}
      {feedback && (
        <div
          style={{
            ...styles.alert,
            backgroundColor: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
            borderColor: feedback.type === 'success' ? '#86efac' : '#fecaca',
            color: feedback.type === 'success' ? '#15803d' : '#991b1b',
          }}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} color="#15803d" />
          ) : (
            <AlertCircle size={18} color="#dc2626" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Barra de Filtros de Estado */}
      <div className="skylearn-card" style={styles.filtersBar}>
        <div style={styles.filterLabel}>
          <Filter size={16} color="var(--color-ink-muted)" />
          <span>Filtrar por estado:</span>
        </div>

        <div style={styles.filterPills}>
          {[
            { id: 'ALL', label: `Todas (${meetings.length})` },
            {
              id: 'SCHEDULED',
              label: `Próximas (${meetings.filter((m) => m.status === 'SCHEDULED').length})`,
            },
            {
              id: 'IN_PROGRESS',
              label: `En Curso (${meetings.filter((m) => m.status === 'IN_PROGRESS').length})`,
            },
            {
              id: 'FINISHED',
              label: `Finalizadas (${meetings.filter((m) => m.status === 'FINISHED').length})`,
            },
            {
              id: 'CANCELLED',
              label: `Canceladas (${meetings.filter((m) => m.status === 'CANCELLED').length})`,
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilterStatus(item.id as any)}
              style={{
                ...styles.filterPill,
                backgroundColor:
                  filterStatus === item.id ? 'var(--color-sky-deep)' : 'var(--color-surface)',
                color: filterStatus === item.id ? '#FFFFFF' : 'var(--color-ink)',
                fontWeight: filterStatus === item.id ? 700 : 500,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listado de Tarjetas */}
      {isLoading ? (
        <div style={styles.loadingBox}>
          <div className="spin" style={{ fontSize: '32px' }}>
            ⚙️
          </div>
          <p style={{ marginTop: '12px', color: 'var(--color-ink-muted)', fontSize: '14px' }}>
            Cargando tus reuniones programadas...
          </p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="skylearn-card" style={styles.emptyCard}>
          <Video size={48} color="var(--color-ink-muted)" style={{ opacity: 0.6 }} />
          <h3 style={{ marginTop: '12px', fontSize: '18px', fontWeight: 800 }}>
            No se encontraron reuniones
          </h3>
          <p style={{ color: 'var(--color-ink-muted)', fontSize: '13px', margin: '4px 0 16px 0' }}>
            {filterStatus === 'ALL'
              ? 'Aún no has programado reuniones en vivo para tus cursos. Comienza agregando tu primera sesión.'
              : 'No hay reuniones registradas con el estado seleccionado.'}
          </p>
          {filterStatus === 'ALL' && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="btn-big-friendly"
              style={{ padding: '8px 20px', fontSize: '13px' }}
            >
              <PlusCircle size={15} />
              <span>Programar Primera Reunión</span>
            </button>
          )}
        </div>
      ) : (
        <div style={styles.meetingGrid}>
          {filteredMeetings.map((meeting) => {
            const isCancelling = cancellingMeetingId === meeting.id;
            const isCancelled = meeting.status === 'CANCELLED';
            const isFinished = meeting.status === 'FINISHED';

            return (
              <div
                key={meeting.id}
                className="skylearn-card"
                style={{
                  ...styles.meetingCard,
                  opacity: isCancelled ? 0.75 : 1,
                }}
              >
                {/* Cabecera de la Tarjeta */}
                <div style={styles.cardHeader}>
                  <div style={styles.courseTag}>
                    <BookOpen size={13} color="var(--color-sky)" />
                    <span>{meeting.courseTitle || 'Curso'}</span>
                  </div>
                  {getStatusBadge(meeting.status)}
                </div>

                {/* Título */}
                <h3 style={styles.meetingTitle}>{meeting.title}</h3>

                {/* Horario y Fecha */}
                <div style={styles.metaRow}>
                  <div style={styles.metaItem}>
                    <Calendar size={14} color="var(--color-sky)" />
                    <span style={{ textTransform: 'capitalize' }}>
                      {formatDateSpanish(meeting.date)}
                    </span>
                  </div>
                  <div style={styles.metaItem}>
                    <Clock size={14} color="var(--color-sky)" />
                    <span>
                      {meeting.startTime} – {meeting.endTime} hrs
                    </span>
                  </div>
                </div>

                {/* Agenda de Temas */}
                <div style={styles.agendaBox}>
                  <span style={styles.agendaTitle}>Temas que se desarrollarán:</span>
                  <p style={styles.agendaContent}>{meeting.description}</p>
                </div>

                {/* Pie con Acciones */}
                <div style={styles.cardFooter}>
                  {/* Botón Ingresar */}
                  <a
                    href={isCancelled ? undefined : meeting.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (isCancelled) e.preventDefault();
                    }}
                    style={{
                      ...styles.joinBtn,
                      opacity: isCancelled ? 0.4 : 1,
                      pointerEvents: isCancelled ? 'none' : 'auto',
                      backgroundColor:
                        meeting.status === 'IN_PROGRESS'
                          ? '#16a34a'
                          : isFinished
                          ? '#64748b'
                          : 'var(--color-sky-deep)',
                    }}
                    title={
                      isCancelled
                        ? 'La reunión fue cancelada'
                        : 'Abrir enlace de la videoconferencia en nueva pestaña'
                    }
                  >
                    <ExternalLink size={14} />
                    <span>
                      {meeting.status === 'IN_PROGRESS'
                        ? 'Entrar Ahora'
                        : isFinished
                        ? 'Ver Enlace'
                        : 'Ingresar a Reunión'}
                    </span>
                  </a>

                  {/* Acciones de Edición y Cancelación */}
                  <div style={styles.actionBtnsGroup}>
                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(meeting)}
                        className="btn-secondary"
                        style={styles.actionIconBtn}
                        title="Modificar reunión"
                        aria-label="Modificar reunión"
                      >
                        <Pencil size={14} />
                      </button>
                    )}

                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => handleCancelMeeting(meeting)}
                        disabled={isCancelling}
                        className="btn-secondary"
                        style={{
                          ...styles.actionIconBtn,
                          color: '#dc2626',
                          borderColor: '#fca5a5',
                        }}
                        title="Cancelar reunión"
                        aria-label="Cancelar reunión"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Creación / Edición */}
      {isModalOpen && (
        <LiveMeetingModal
          meetingToEdit={selectedMeetingToEdit}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--color-border)',
  },
  titleRow: {
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
  title: {
    fontSize: '22px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    margin: '0 0 2px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--color-ink-muted)',
    margin: 0,
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  refreshBtn: {
    padding: '9px 12px',
  },
  createBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 18px',
    fontSize: '13px',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: 600,
  },
  filtersBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '12px 16px',
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--color-ink)',
  },
  filterPills: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  filterPill: {
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  loadingBox: {
    padding: '48px',
    textAlign: 'center',
  },
  emptyCard: {
    padding: '48px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '18px',
  },
  meetingCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid var(--color-border)',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  courseTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--color-sky-deep)',
    backgroundColor: 'var(--color-sky-soft)',
    padding: '4px 10px',
    borderRadius: '6px',
    maxWidth: '180px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
    fontSize: '16px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    margin: '0 0 10px 0',
    lineHeight: '1.3',
  },
  metaRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '12px',
    padding: '8px 12px',
    backgroundColor: 'var(--color-surface-elevated)',
    borderRadius: '8px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--color-ink)',
    fontWeight: 500,
  },
  agendaBox: {
    marginBottom: '16px',
  },
  agendaTitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--color-ink)',
    display: 'block',
    marginBottom: '4px',
  },
  agendaContent: {
    fontSize: '12px',
    color: 'var(--color-ink-muted)',
    whiteSpace: 'pre-line',
    margin: 0,
    lineHeight: '1.4',
    maxHeight: '80px',
    overflowY: 'auto',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    paddingTop: '14px',
    borderTop: '1px solid var(--color-border)',
  },
  joinBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 700,
    transition: 'all 0.18s ease',
  },
  actionBtnsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  actionIconBtn: {
    padding: '6px 10px',
    borderRadius: '8px',
  },
};
