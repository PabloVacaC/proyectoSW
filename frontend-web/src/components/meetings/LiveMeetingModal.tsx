// frontend-web/src/components/meetings/LiveMeetingModal.tsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  BookOpen,
  FileText,
  AlertCircle,
  Save,
} from 'lucide-react';
import { api } from '../../services/api';

export interface MeetingItem {
  id: string;
  courseId: string;
  courseTitle?: string;
  teacherId: string;
  teacherName?: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingUrl: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
}

interface CourseOption {
  id: string;
  title: string;
}

interface LiveMeetingModalProps {
  meetingToEdit?: MeetingItem | null;
  preselectedCourseId?: string | null;
  onClose: () => void;
  onSuccess: (savedMeeting: MeetingItem) => void;
}

export const LiveMeetingModal: React.FC<LiveMeetingModalProps> = ({
  meetingToEdit,
  preselectedCourseId,
  onClose,
  onSuccess,
}) => {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    meetingToEdit?.courseId || preselectedCourseId || '',
  );
  const [title, setTitle] = useState(meetingToEdit?.title || '');
  const [date, setDate] = useState(meetingToEdit?.date || '');
  const [startTime, setStartTime] = useState(meetingToEdit?.startTime || '19:00');
  const [endTime, setEndTime] = useState(meetingToEdit?.endTime || '20:30');
  const [meetingUrl, setMeetingUrl] = useState(
    meetingToEdit?.meetingUrl || 'https://meet.google.com/',
  );
  const [description, setDescription] = useState(
    meetingToEdit?.description ||
      'Durante esta reunión estudiaremos los siguientes temas:\n- Introducción y conceptos clave\n- Ejemplos prácticos en vivo\n- Resolución de dudas y preguntas',
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Obtener cursos del docente para el selector
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const savedUser = localStorage.getItem('user_data');
        const userObj = savedUser ? JSON.parse(savedUser) : null;
        const teacherId = userObj?.id;
        const url = teacherId ? `/courses?teacherId=${teacherId}` : '/courses';
        const res = await api.get(url);
        const myCourses = teacherId
          ? res.data.filter((c: any) => !c.teacherId || c.teacherId === teacherId)
          : res.data;
        setCourses(myCourses.map((c: any) => ({ id: c.id, title: c.title })));
        if (!selectedCourseId && myCourses.length > 0) {
          setSelectedCourseId(myCourses[0].id);
        }
      } catch (err) {
        console.error('Error cargando cursos para la reunión', err);
      }
    };
    fetchCourses();
  }, [selectedCourseId]);

  // Fecha mínima: Hoy
  const todayStr = new Date().toISOString().split('T')[0];

  const validateForm = (): string | null => {
    if (!selectedCourseId) {
      return 'Debes seleccionar el curso al que estará asociada la reunión.';
    }
    if (!title.trim() || title.trim().length < 3) {
      return 'El título de la reunión es obligatorio (mínimo 3 caracteres).';
    }
    if (!date) {
      return 'La fecha de la reunión es obligatoria.';
    }
    if (!startTime || !endTime) {
      return 'Debes ingresar las horas de inicio y de finalización.';
    }

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    if (endH * 60 + endM <= startH * 60 + startM) {
      return 'La hora de finalización debe ser posterior a la hora de inicio.';
    }

    // Validación de fecha y hora pasada
    const [y, m, d] = date.split('-').map(Number);
    const meetingDate = new Date(y, m - 1, d, startH, startM);
    if (meetingDate.getTime() < Date.now() - 60000) {
      return 'La fecha y hora de la reunión no pueden ser del pasado.';
    }

    if (!meetingUrl.trim() || !meetingUrl.startsWith('https://')) {
      return 'El enlace de la videoconferencia debe ser una URL segura que comience con https://';
    }
    if (!description.trim() || description.trim().length < 5) {
      return 'La agenda o descripción de los temas es obligatoria.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErr = validateForm();
    if (validationErr) {
      setErrorMessage(validationErr);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const payload = {
      courseId: selectedCourseId,
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
      meetingUrl: meetingUrl.trim(),
    };

    try {
      let res;
      if (meetingToEdit) {
        res = await api.put(`/meetings/${meetingToEdit.id}`, payload);
      } else {
        res = await api.post('/meetings', payload);
      }
      onSuccess(res.data);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Ocurrió un error al guardar la reunión. Por favor revisa los datos e inténtalo nuevamente.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div className="skylearn-card" style={styles.modalCard}>
        {/* Cabecera */}
        <div style={styles.header}>
          <div style={styles.headerTitleWrap}>
            <div style={styles.headerIconBox}>
              <Video size={22} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={styles.title}>
                {meetingToEdit ? 'Editar Reunión en Vivo' : 'Programar Nueva Reunión en Vivo'}
              </h2>
              <p style={styles.subtitle}>
                Configura la sesión en vivo con fecha, hora, enlace seguro y agenda temática.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={styles.closeBtn}
            title="Cerrar modal"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} color="#dc2626" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* 1. Selección de Curso */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <BookOpen size={15} color="var(--color-sky)" />
              <span>Curso Asociado *</span>
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              disabled={Boolean(preselectedCourseId && !meetingToEdit)}
              style={styles.select}
              required
            >
              <option value="" disabled>
                Selecciona uno de tus cursos asignados...
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <span style={styles.helperText}>
              La reunión se publicará únicamente para los estudiantes inscritos en este curso.
            </span>
          </div>

          {/* 2. Título de la Reunión */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <Video size={15} color="var(--color-sky)" />
              <span>Título de la Reunión *</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Clase en vivo: Introducción a las bases de datos"
              style={styles.input}
              required
            />
          </div>

          {/* 3, 4 y 5. Fecha, Hora Inicio y Hora Fin (Grid responsivo) */}
          <div style={styles.dateGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Calendar size={15} color="var(--color-sky)" />
                <span>Fecha *</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Clock size={15} color="var(--color-sky)" />
                <span>Hora de Inicio *</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Clock size={15} color="var(--color-sky)" />
                <span>Hora de Finalización *</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          {/* 6. Enlace de Videoconferencia */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <Video size={15} color="var(--color-sky)" />
              <span>Enlace de Videoconferencia (Google Meet, Teams, etc.) *</span>
            </label>
            <input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              style={styles.input}
              required
            />
            <span style={styles.helperText}>
              Debe comenzar obligatoriamente con el protocolo seguro <strong>https://</strong>.
            </span>
          </div>

          {/* 7. Agenda temática / Descripción */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FileText size={15} color="var(--color-sky)" />
              <span>Agenda y Temas que se desarrollarán *</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escribe la lista de temas, ejercicios o dudas que se tratarán durante la sesión..."
              style={styles.textarea}
              required
            />
          </div>

          {/* Botones de Acción */}
          <div style={styles.footerBtns}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary"
              style={styles.cancelBtn}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-big-friendly"
              style={styles.submitBtn}
            >
              {isLoading ? (
                <span>Guardando sesión...</span>
              ) : (
                <>
                  <Save size={16} />
                  <span>{meetingToEdit ? 'Guardar Cambios' : 'Publicar Reunión'}</span>
                </>
              )}
            </button>
          </div>
        </form>
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
    overflowY: 'auto',
  },
  modalCard: {
    width: '100%',
    maxWidth: '640px',
    maxHeight: '90vh',
    overflowY: 'auto',
    backgroundColor: 'var(--color-surface)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    border: '1px solid var(--color-border)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--color-border)',
    marginBottom: '16px',
  },
  headerTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerIconBox: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    backgroundColor: 'var(--color-sky-deep)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: '20px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--color-ink-muted)',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-ink-muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    color: '#991b1b',
    fontSize: '13px',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--color-ink)',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-ink)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-ink)',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
  },
  textarea: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-ink)',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
  },
  helperText: {
    fontSize: '12px',
    color: 'var(--color-ink-muted)',
    marginTop: '2px',
  },
  dateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
  },
  footerBtns: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
    paddingTop: '16px',
    borderTop: '1px solid var(--color-border)',
  },
  cancelBtn: {
    padding: '10px 20px',
    fontSize: '14px',
  },
  submitBtn: {
    padding: '10px 24px',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
};
