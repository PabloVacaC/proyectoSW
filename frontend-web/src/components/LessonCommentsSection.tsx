// frontend-web/src/components/LessonCommentsSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  Reply,
  Trash2,
  Heart,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Shield,
  GraduationCap,
  User as UserIcon,
} from 'lucide-react';
import { api } from '../services/api';

export interface CommentAuthor {
  id: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  email?: string;
}

export interface LessonCommentItem {
  id: string;
  lessonId: string;
  userId: string;
  content: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt?: string;
  user: CommentAuthor;
  replies?: LessonCommentItem[];
}

interface LessonCommentsSectionProps {
  lessonId: string;
  currentUser?: {
    id: string;
    name: string;
    role: string;
    email?: string;
  } | null;
}

export const LessonCommentsSection: React.FC<LessonCommentsSectionProps> = ({
  lessonId,
  currentUser,
}) => {
  const [comments, setComments] = useState<LessonCommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [likes, setLikes] = useState<Record<string, { count: number; userLiked: boolean }>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Carga inicial y refresco de comentarios
  const loadComments = useCallback(async () => {
    if (!lessonId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.get<LessonCommentItem[]>(`/lessons/${lessonId}/comments`);
      setComments(res.data || []);
    } catch {
      setErrorMessage('No se pudieron cargar los comentarios. Revisa tu conexión.');
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    loadComments();
    setReplyingToId(null);
    setNewCommentText('');
  }, [loadComments]);

  // Publicar comentario raíz
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmitting) return;

    if (!currentUser) {
      setErrorMessage('Debes iniciar sesión para publicar un comentario.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await api.post<LessonCommentItem>(`/lessons/${lessonId}/comments`, {
        content: newCommentText.trim(),
      });
      // Añadir de forma optimista al inicio
      setComments((prev) => [res.data, ...prev]);
      setNewCommentText('');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Error al publicar el comentario. Inténtalo de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Publicar respuesta a un comentario
  const handlePostReply = async (parentId: string) => {
    if (!replyText.trim() || isSubmittingReply) return;

    if (!currentUser) {
      setErrorMessage('Debes iniciar sesión para responder.');
      return;
    }

    setIsSubmittingReply(true);
    setErrorMessage(null);
    try {
      const res = await api.post<LessonCommentItem>(`/lessons/${lessonId}/comments`, {
        content: replyText.trim(),
        parentId,
      });

      // Insertar la respuesta dentro del comentario correspondiente
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), res.data],
            };
          }
          return c;
        }),
      );

      setReplyingToId(null);
      setReplyText('');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Error al enviar tu respuesta.',
      );
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Eliminar comentario
  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/comments/${deleteConfirmId}`);
      // Remover de la lista raíz o de respuestas
      setComments((prev) =>
        prev
          .filter((c) => c.id !== deleteConfirmId)
          .map((c) => ({
            ...c,
            replies: c.replies?.filter((r) => r.id !== deleteConfirmId) || [],
          })),
      );
      setDeleteConfirmId(null);
    } catch {
      setErrorMessage('No fue posible eliminar el comentario.');
    }
  };

  // Toggle de Like amigable (DU-02)
  const handleToggleLike = (commentId: string) => {
    setLikes((prev) => {
      const current = prev[commentId] || { count: 0, userLiked: false };
      const nextLiked = !current.userLiked;
      return {
        ...prev,
        [commentId]: {
          count: nextLiked ? current.count + 1 : Math.max(0, current.count - 1),
          userLiked: nextLiked,
        },
      };
    });
  };

  // Formato de tiempo relativo
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Hace un momento';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Hace ${diffHours} h`;
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch {
      return 'Reciente';
    }
  };

  // Renderizar insignia de rol
  const renderRoleBadge = (role: string) => {
    if (role === 'TEACHER') {
      return (
        <span style={styles.badgeTeacher}>
          <GraduationCap size={12} /> Docente
        </span>
      );
    }
    if (role === 'ADMIN') {
      return (
        <span style={styles.badgeAdmin}>
          <Shield size={12} /> Admin
        </span>
      );
    }
    return (
      <span style={styles.badgeStudent}>
        <UserIcon size={12} /> Estudiante
      </span>
    );
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

  const totalCount = comments.reduce(
    (acc, curr) => acc + 1 + (curr.replies?.length || 0),
    0,
  );

  return (
    <div style={styles.container}>
      {/* Cabecera de la sección de aportes */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <MessageSquare size={18} color="var(--color-sky)" />
          <h3 style={styles.title}>Comunidad y Preguntas</h3>
          <span style={styles.countBadge}>{totalCount}</span>
        </div>
        <button
          onClick={loadComments}
          disabled={isLoading}
          style={styles.refreshBtn}
          title="Actualizar comentarios"
        >
          <RefreshCw size={14} className={isLoading ? 'spin-anim' : ''} />
        </button>
      </div>

      {errorMessage && (
        <div style={styles.errorBanner}>
          <AlertTriangle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Formulario de nuevo comentario */}
      <form onSubmit={handlePostComment} style={styles.newCommentBox}>
        <div style={styles.inputHeader}>
          <div style={styles.avatar}>
            {getInitials(currentUser?.name)}
          </div>
          <div style={styles.inputHeaderInfo}>
            <span style={styles.userName}>{currentUser?.name || 'Invitado'}</span>
            <span style={styles.userRole}>
              {currentUser?.role ? renderRoleBadge(currentUser.role) : 'Inicia sesión'}
            </span>
          </div>
        </div>

        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder={
            currentUser
              ? '¿Tienes alguna duda sobre este código o concepto? Compártela aquí...'
              : 'Inicia sesión para participar en las preguntas de la clase'
          }
          disabled={!currentUser || isSubmitting}
          maxLength={2000}
          rows={3}
          style={styles.textarea}
        />

        <div style={styles.formFooter}>
          <span style={styles.charCount}>
            {newCommentText.length} / 2000
          </span>
          <button
            type="submit"
            disabled={!currentUser || !newCommentText.trim() || isSubmitting}
            style={{
              ...styles.submitBtn,
              opacity: !currentUser || !newCommentText.trim() || isSubmitting ? 0.6 : 1,
              cursor: !currentUser || !newCommentText.trim() || isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            <Send size={14} />
            <span>{isSubmitting ? 'Publicando...' : 'Publicar aporte'}</span>
          </button>
        </div>
      </form>

      {/* Listado de comentarios */}
      <div style={styles.commentsList}>
        {isLoading && comments.length === 0 ? (
          <div style={styles.emptyState}>
            <RefreshCw size={24} className="spin-anim" color="var(--color-sky)" />
            <p style={styles.emptyText}>Cargando preguntas de la clase...</p>
          </div>
        ) : comments.length === 0 ? (
          <div style={styles.emptyState}>
            <Sparkles size={28} color="var(--color-sky)" />
            <p style={styles.emptyTitle}>¡Sé el primero en participar!</p>
            <p style={styles.emptyText}>
              Añade una pregunta, nota técnica o aporte para enriquecer el aprendizaje con tus compañeros.
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const commentLikes = likes[comment.id] || { count: 0, userLiked: false };
            const canDelete =
              currentUser &&
              (currentUser.id === comment.userId || currentUser.role === 'ADMIN');

            return (
              <div key={comment.id} style={styles.commentCard}>
                {/* Cabecera del comentario */}
                <div style={styles.commentHeader}>
                  <div style={styles.commentUser}>
                    <div style={styles.avatarSmall}>
                      {getInitials(comment.user?.name)}
                    </div>
                    <div>
                      <div style={styles.authorRow}>
                        <span style={styles.authorName}>{comment.user?.name || 'Usuario'}</span>
                        {renderRoleBadge(comment.user?.role || 'STUDENT')}
                      </div>
                      <span style={styles.commentDate}>{formatTime(comment.createdAt)}</span>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => setDeleteConfirmId(comment.id)}
                      style={styles.deleteBtn}
                      title="Eliminar comentario"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Contenido del comentario */}
                <div style={styles.commentBody}>
                  <p style={styles.commentText}>{comment.content}</p>
                </div>

                {/* Acciones: Me gusta y Responder */}
                <div style={styles.commentActions}>
                  <button
                    onClick={() => handleToggleLike(comment.id)}
                    style={{
                      ...styles.actionBtn,
                      color: commentLikes.userLiked ? 'var(--color-coral)' : 'var(--color-ink-muted)',
                    }}
                    title="Me gusta"
                  >
                    <Heart
                      size={14}
                      fill={commentLikes.userLiked ? 'var(--color-coral)' : 'transparent'}
                    />
                    <span>{commentLikes.count > 0 ? commentLikes.count : 'Útil'}</span>
                  </button>

                  {currentUser && (
                    <button
                      onClick={() => {
                        setReplyingToId(replyingToId === comment.id ? null : comment.id);
                        setReplyText('');
                      }}
                      style={styles.actionBtn}
                    >
                      <Reply size={14} />
                      <span>{replyingToId === comment.id ? 'Cancelar' : 'Responder'}</span>
                    </button>
                  )}
                </div>

                {/* Formulario de respuesta desplegable */}
                {replyingToId === comment.id && (
                  <div style={styles.replyForm}>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Responde a ${comment.user?.name || 'este aporte'}...`}
                      maxLength={1000}
                      rows={2}
                      style={styles.replyTextarea}
                    />
                    <div style={styles.replyFormFooter}>
                      <button
                        onClick={() => setReplyingToId(null)}
                        style={styles.cancelReplyBtn}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handlePostReply(comment.id)}
                        disabled={!replyText.trim() || isSubmittingReply}
                        style={{
                          ...styles.submitReplyBtn,
                          opacity: !replyText.trim() || isSubmittingReply ? 0.6 : 1,
                        }}
                      >
                        <Send size={12} />
                        <span>{isSubmittingReply ? 'Enviando...' : 'Responder'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de Respuestas Anidadas (1 Nivel) */}
                {comment.replies && comment.replies.length > 0 && (
                  <div style={styles.repliesList}>
                    {comment.replies.map((reply) => {
                      const replyLikes = likes[reply.id] || { count: 0, userLiked: false };
                      const canDeleteReply =
                        currentUser &&
                        (currentUser.id === reply.userId || currentUser.role === 'ADMIN');

                      return (
                        <div key={reply.id} style={styles.replyCard}>
                          <div style={styles.commentHeader}>
                            <div style={styles.commentUser}>
                              <div style={styles.avatarTiny}>
                                {getInitials(reply.user?.name)}
                              </div>
                              <div>
                                <div style={styles.authorRow}>
                                  <span style={styles.authorNameSmall}>
                                    {reply.user?.name || 'Usuario'}
                                  </span>
                                  {renderRoleBadge(reply.user?.role || 'STUDENT')}
                                </div>
                                <span style={styles.commentDate}>{formatTime(reply.createdAt)}</span>
                              </div>
                            </div>

                            {canDeleteReply && (
                              <button
                                onClick={() => setDeleteConfirmId(reply.id)}
                                style={styles.deleteBtn}
                                title="Eliminar respuesta"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>

                          <div style={styles.replyBody}>
                            <p style={styles.replyTextContent}>{reply.content}</p>
                          </div>

                          <div style={styles.commentActions}>
                            <button
                              onClick={() => handleToggleLike(reply.id)}
                              style={{
                                ...styles.actionBtn,
                                fontSize: '11px',
                                color: replyLikes.userLiked
                                  ? 'var(--color-coral)'
                                  : 'var(--color-ink-muted)',
                              }}
                            >
                              <Heart
                                size={12}
                                fill={replyLikes.userLiked ? 'var(--color-coral)' : 'transparent'}
                              />
                              <span>{replyLikes.count > 0 ? replyLikes.count : ''}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal de confirmación para eliminar comentario */}
      {deleteConfirmId && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalIconBox}>
              <Trash2 size={24} color="var(--color-coral)" />
            </div>
            <h4 style={styles.modalTitle}>¿Eliminar este comentario?</h4>
            <p style={styles.modalDesc}>
              Esta acción no se puede deshacer. Se eliminarán también las respuestas asociadas.
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={styles.modalCancelBtn}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                style={styles.modalDeleteBtn}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-surface-elevated)',
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid var(--color-outline)',
    padding: '16px',
    height: '100%',
    maxHeight: 'calc(100vh - 180px)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.06))',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--color-outline)',
    marginBottom: '14px',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '15px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    margin: 0,
  },
  countBadge: {
    fontSize: '11px',
    fontWeight: 800,
    backgroundColor: 'var(--color-sky-soft)',
    color: 'var(--color-sky-deep)',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  refreshBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-ink-muted)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'color 0.15s ease',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-coral-soft, rgba(239, 68, 68, 0.1))',
    color: 'var(--color-coral, #ef4444)',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    marginBottom: '12px',
  },
  newCommentBox: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid var(--color-outline)',
    marginBottom: '16px',
  },
  inputHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-sky-deep)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 800,
  },
  inputHeaderInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  userName: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--color-ink)',
  },
  userRole: {
    fontSize: '11px',
    color: 'var(--color-ink-muted)',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    fontSize: '13px',
    fontFamily: 'inherit',
    color: 'var(--color-ink)',
    backgroundColor: 'var(--color-surface-elevated)',
    border: '1px solid var(--color-outline)',
    borderRadius: '6px',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  },
  formFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  charCount: {
    fontSize: '11px',
    color: 'var(--color-ink-muted)',
  },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--color-sky-deep, #0284c7)',
    color: '#ffffff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: 'var(--radius-full, 9999px)',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  commentsList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingRight: '4px',
  },
  commentCard: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid var(--color-outline)',
  },
  commentHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  commentUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  avatarSmall: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-sky)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
  },
  avatarTiny: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-sky-soft)',
    color: 'var(--color-sky-deep)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 700,
  },
  authorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--color-ink)',
  },
  authorNameSmall: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--color-ink)',
  },
  commentDate: {
    fontSize: '11px',
    color: 'var(--color-ink-muted)',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-ink-muted)',
    cursor: 'pointer',
    padding: '2px 4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.15s ease',
  },
  commentBody: {
    marginBottom: '8px',
  },
  commentText: {
    fontSize: '13px',
    color: 'var(--color-ink)',
    lineHeight: 1.5,
    margin: 0,
    wordBreak: 'break-word',
  },
  commentActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-ink-muted)',
    cursor: 'pointer',
    padding: '2px 0',
  },
  replyForm: {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px dashed var(--color-outline)',
  },
  replyTextarea: {
    width: '100%',
    padding: '8px',
    fontSize: '12px',
    fontFamily: 'inherit',
    color: 'var(--color-ink)',
    backgroundColor: 'var(--color-surface-elevated)',
    border: '1px solid var(--color-outline)',
    borderRadius: '6px',
    resize: 'none',
    outline: 'none',
    boxSizing: 'border-box',
  },
  replyFormFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '6px',
  },
  cancelReplyBtn: {
    background: 'none',
    border: 'none',
    fontSize: '11px',
    color: 'var(--color-ink-muted)',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  submitReplyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'var(--color-sky-deep)',
    color: '#ffffff',
    border: 'none',
    padding: '4px 10px',
    borderRadius: 'var(--radius-full, 9999px)',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  repliesList: {
    marginTop: '10px',
    paddingLeft: '14px',
    borderLeft: '2px solid var(--color-outline)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  replyCard: {
    backgroundColor: 'var(--color-surface-elevated)',
    borderRadius: '6px',
    padding: '8px 10px',
    border: '1px solid var(--color-outline)',
  },
  replyBody: {
    marginBottom: '6px',
  },
  replyTextContent: {
    fontSize: '12px',
    color: 'var(--color-ink)',
    lineHeight: 1.4,
    margin: 0,
    wordBreak: 'break-word',
  },
  badgeTeacher: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '10px',
    fontWeight: 800,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#059669',
    padding: '1px 6px',
    borderRadius: '10px',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  badgeAdmin: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '10px',
    fontWeight: 800,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    color: '#7c3aed',
    padding: '1px 6px',
    borderRadius: '10px',
    border: '1px solid rgba(139, 92, 246, 0.3)',
  },
  badgeStudent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '10px',
    fontWeight: 700,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    color: '#0284c7',
    padding: '1px 6px',
    borderRadius: '10px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 16px',
    textAlign: 'center',
    gap: '8px',
  },
  emptyTitle: {
    fontSize: '14px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    margin: 0,
  },
  emptyText: {
    fontSize: '12px',
    color: 'var(--color-ink-muted)',
    lineHeight: 1.4,
    margin: 0,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modalContent: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: '12px',
    padding: '20px',
    maxWidth: '380px',
    width: '100%',
    border: '1px solid var(--color-outline)',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
  },
  modalIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-coral-soft, rgba(239, 68, 68, 0.1))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px auto',
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: 800,
    color: 'var(--color-ink)',
    margin: '0 0 6px 0',
  },
  modalDesc: {
    fontSize: '13px',
    color: 'var(--color-ink-muted)',
    margin: '0 0 20px 0',
    lineHeight: 1.4,
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    flex: 1,
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid var(--color-outline)',
    backgroundColor: 'transparent',
    color: 'var(--color-ink)',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
  },
  modalDeleteBtn: {
    flex: 1,
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--color-coral, #ef4444)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
  },
};
