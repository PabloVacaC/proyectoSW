// frontend-web/src/components/TutorVirtual3D.tsx
//
// Tutor conversacional "Sky". El docente se renderiza con TutorAvatar3D (WebGL):
// la postura y los visemas provienen de la pista que genera el backend con IA.
import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Send, Volume2, VolumeX, Sparkles, ArrowRight, MessageSquare, Mic, MicOff, AlertCircle } from 'lucide-react';
import { useLiveTutor } from '../hooks/useLiveTutor';
import { useTutorSpeech } from '../hooks/useTutorSpeech';
import { TutorSpeechControls } from './TutorSpeechControls';
import { api } from '../services/api';
import type { AvatarPoseType, VisemeFrame, VisemeShape } from '../types/tutor.types';

interface RecognitionResultEvent {
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}
interface RecognitionEngine {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionWindow = Window & {
  SpeechRecognition?: new () => RecognitionEngine;
  webkitSpeechRecognition?: new () => RecognitionEngine;
};

const TutorAvatar3D = lazy(() => import('./TutorAvatar'));

interface TutorVirtual3DProps {
  lessonId: string;
  lessonTitle: string;
  onNavigate?: (url: string) => void;
}

interface ChatMessage {
  sender: 'user' | 'tutor';
  text: string;
}

const AvatarPlaceholder: React.FC = () => (
  <div style={styles.avatarPlaceholder} aria-hidden="true">
    <span>Cargando docente 3D…</span>
  </div>
);

export const TutorVirtual3D: React.FC<TutorVirtual3DProps> = ({
  lessonId,
  lessonTitle,
  onNavigate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'tutor',
      text: `¡Hola! Soy Sky, tu docente virtual. Estoy listo para ayudarte con "${lessonTitle}". ¿Tienes alguna duda sobre el video o los conceptos de la lección?`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentViseme, setCurrentViseme] = useState<VisemeShape>('sil');
  const [pose, setPose] = useState<AvatarPoseType>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [redirectAction, setRedirectAction] = useState<{ label: string; url: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const timersRef = useRef<number[]>([]);
  const recognitionRef = useRef<RecognitionEngine | null>(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [clearTimers]);

  const speech = useTutorSpeech();
  const live = useLiveTutor(lessonId, speech.gender);
  useEffect(() => {
    setIsSpeaking(speech.speaking);
    setCurrentViseme(speech.viseme);
    if (!isListening) {
      setPose(speech.speaking ? 'explaining' : 'idle');
    }
  }, [speech.speaking, speech.viseme, isListening]);

  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as RecognitionWindow).SpeechRecognition ||
      (window as RecognitionWindow).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Tu navegador no soporta reconocimiento de voz. Puedes escribir tu duda.');
      setTimeout(() => setVoiceError(null), 4000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      setPose('idle');
      return;
    }

    try {
      speech.stop();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setVoiceError(null);
      let finalTranscript = '';
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setPose('listening');
      };

      recognition.onresult = (event: RecognitionResultEvent) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (event.results[event.results.length - 1].isFinal) {
          finalTranscript = transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = () => {
        setVoiceError('No pudimos escuchar tu micrófono. Revisa los permisos de audio.');
        setTimeout(() => setVoiceError(null), 4000);
        setIsListening(false);
        setPose('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
        setPose('idle');
        if (finalTranscript.trim()) {
          void handleSendMessage(finalTranscript.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error al iniciar reconocimiento de voz:', err);
      setIsListening(false);
      setPose('idle');
    }
  };
  const speak = (text: string, _visemes: VisemeFrame[]) => { if (soundEnabled) void speech.speak(text); };
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText ?? inputText;
    if (!textToSend.trim() || loading || live.active) return;

    const userMsg = textToSend.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');
    setLoading(true);

    try {
      const payload: { message: string; lessonId?: string } = { message: userMsg };
      if (lessonId && lessonId !== 'general-tutoring') {
        payload.lessonId = lessonId;
      }
      const res = await api.post('/tutor/chat', payload);
      const tutorReply: string = res.data.replyText;
      const visemes: VisemeFrame[] = res.data.visemes ?? [];

      setMessages((prev) => [...prev, { sender: 'tutor', text: tutorReply }]);
      if (res.data.redirectRecommendation) {
        setRedirectAction(res.data.redirectRecommendation);
      }
      speak(tutorReply, visemes);
    } catch (err) {
      console.error('Error al conectar con el tutor virtual:', err);
      const fallbackReply =
        'No pude conectar con la tutoría en este momento. Mientras tanto, revisa el video y prueba el formulario evaluativo de la lección.';
      setMessages((prev) => [...prev, { sender: 'tutor', text: fallbackReply }]);
      setCurrentViseme('aa');
      const timer = window.setTimeout(() => setCurrentViseme('sil'), 800);
      timersRef.current.push(timer);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (!next) {
        speech.stop();
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        clearTimers();
        setIsSpeaking(false);
        setCurrentViseme('sil');
        setPose('idle');
      }
      return next;
    });
  };

  const statusLabel = isSpeaking
    ? 'Sky está explicando'
    : isListening
      ? 'Sky te está escuchando…'
      : loading
        ? 'Sky está pensando'
        : 'Sky está disponible';

  return (
    <div className="skylearn-card" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.tutorBadge}>
          <Bot size={20} color="var(--color-sky-deep)" aria-hidden="true" />
          <span style={styles.tutorName}>Sky · Docente virtual 3D</span>
        </div>
        <div style={styles.headerActions}>
          <span style={styles.statusPill}>
            <span
              style={{
                ...styles.statusDot,
                backgroundColor: isSpeaking
                  ? 'var(--color-sky)'
                  : isListening
                    ? '#EF4444'
                    : 'var(--color-leaf)',
              }}
            />
            <span style={styles.statusText}>{statusLabel}</span>
          </span>
          <button
            type="button"
            style={styles.iconButton}
            onClick={handleToggleSound}
            aria-label={soundEnabled ? 'Silenciar la voz del docente' : 'Activar la voz del docente'}
          >
            {soundEnabled ? (
              <Volume2 size={20} color="var(--color-ink)" aria-hidden="true" />
            ) : (
              <VolumeX size={20} color="var(--color-ink-muted)" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div style={styles.avatarStage}>
        <Suspense fallback={<AvatarPlaceholder />}>
          <TutorAvatar3D
                  speechText={speech.text}
                  spokenEnd={speech.range.start + speech.range.length}
            gender={speech.gender}
            pose={live.active ? (live.state === 'speaking' ? 'explaining' : 'listening') : pose}
            viseme={live.active ? (live.state === 'speaking' ? 'aa' : 'sil') : currentViseme}
            isSpeaking={live.active ? live.state === 'speaking' : isSpeaking}
            isListening={live.active && live.state === 'listening'}
            width={320}
            height={300}
          />
        </Suspense>
      </div>

      {!live.active && <TutorSpeechControls speech={speech} />}
      <div className="tutor-speech-controls">
        <button type="button" className="btn-primary" onClick={() => { if (live.active) live.disconnect(); else { speech.stop(); void live.connect(); } }}>
          {live.active ? 'Terminar conversación en directo' : 'Conversar por voz en directo'}
        </button>
        <span role="status">{live.state === 'connecting' ? 'Conectando…' : live.state === 'speaking' ? 'Sky está hablando · puedes interrumpir' : live.state === 'listening' ? 'Te escucho' : 'Micrófono apagado'}</span>
        {live.error && <p role="alert">{live.error}</p>}
        {live.transcript.map((turn, index) => <p className="tutor-live-caption" key={index}><span>{turn.sender === 'user' ? 'Tú: ' : 'Sky: '}</span>{index === live.transcript.length - 1 && turn.sender === 'tutor' && live.state === 'speaking' ? <strong>{turn.text}</strong> : turn.text}</p>)}
      </div>
      <div style={styles.messagesBox} aria-live="polite">
        {messages.map((message, index) => (
          <div
            key={`${message.sender}-${index}`}
            style={{
              ...styles.messageBubble,
              ...(message.sender === 'user' ? styles.userBubble : styles.tutorBubble),
            }}
          >
            {message.sender === 'tutor' && (
              <Bot size={18} color="var(--color-sky-deep)" style={styles.bubbleIcon} aria-hidden="true" />
            )}
            <span style={styles.messageText}>{message.text}</span>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.messageBubble, ...styles.tutorBubble }}>
            <Bot size={18} color="var(--color-sky-deep)" style={styles.bubbleIcon} aria-hidden="true" />
            <span style={styles.messageText}>Sky está preparando su respuesta…</span>
          </div>
        )}
      </div>

      {redirectAction && (
        <div style={styles.recommendationAlert}>
          <span style={styles.recText}>
            Ruta recomendada: <strong>{redirectAction.label}</strong>
          </span>
          {onNavigate && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onNavigate(redirectAction.url)}
              style={styles.recBtn}
            >
              <span>Continuar ruta</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      <div style={styles.quickQuestions}>
        <button
          type="button"
          style={styles.chipBtn}
          onClick={() => handleSendMessage('¿Me puedes explicar esto de forma sencilla?')}
          disabled={loading || live.active}
        >
          <MessageSquare size={16} aria-hidden="true" />
          <span>Explicación sencilla</span>
        </button>
        <button
          type="button"
          style={styles.chipBtn}
          onClick={() => handleSendMessage('Dame un ejemplo cotidiano')}
          disabled={loading || live.active}
        >
          <MessageSquare size={16} aria-hidden="true" />
          <span>Ejemplo cotidiano</span>
        </button>
      </div>

      {voiceError && (
        <div style={styles.voiceErrorAlert} role="alert">
          <AlertCircle size={16} color="#DC2626" aria-hidden="true" />
          <span>{voiceError}</span>
        </div>
      )}

      <div style={styles.inputRow} aria-disabled={live.active}>
        <input
          type="text"
          className="skylearn-input"
          placeholder={
            isListening
              ? 'Escuchando tu voz… habla ahora'
              : 'Escribe tu duda o presiona el micrófono para hablar con Sky…'
          }
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void handleSendMessage();
          }}
          disabled={loading || live.active}
          aria-label="Escribe tu pregunta al docente virtual"
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          disabled={loading || live.active}
          style={{
            ...styles.micButton,
            ...(isListening ? styles.micButtonActive : {}),
          }}
          aria-label={isListening ? 'Detener micrófono' : 'Hablar por micrófono con Sky'}
          title={isListening ? 'Detener escucha' : 'Hablar por micrófono con Sky'}
        >
          {isListening ? (
            <MicOff size={22} color="#FFFFFF" aria-hidden="true" />
          ) : (
            <Mic size={22} color="var(--color-sky-deep)" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className="btn-big-friendly"
          onClick={() => void handleSendMessage()}
          disabled={loading || live.active || !inputText.trim()}
          style={styles.sendButton}
          aria-label="Enviar pregunta"
        >
          <Send size={20} aria-hidden="true" />
        </button>
      </div>

      <p style={styles.hint}>
        <Sparkles size={14} color="var(--color-sun-deep)" aria-hidden="true" />
        <span>Sky responde con IA usando el contexto de esta lección.</span>
      </p>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--color-surface-elevated)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: '100%',
    border: '1px solid var(--color-outline)',
    borderRadius: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    paddingBottom: '14px',
    borderBottom: '1px solid var(--color-outline)',
  },
  tutorBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  tutorName: {
    fontSize: '19px',
    fontWeight: 800,
    color: 'var(--color-ink)',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '999px',
    backgroundColor: 'var(--color-sky-soft)',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  statusText: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--color-sky-deep)',
  },
  iconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    border: '1px solid var(--color-outline)',
    backgroundColor: 'var(--color-surface)',
    cursor: 'pointer',
  },
  avatarStage: {
    display: 'flex',
    justifyContent: 'center',
    padding: '12px',
    borderRadius: '20px',
    backgroundColor: 'var(--color-surface-sunken)',
    border: '1px solid var(--color-outline)',
  },
  avatarPlaceholder: {
    width: '320px',
    height: '300px',
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '16px',
    background: 'linear-gradient(160deg, #EFF6FF 0%, #DBEAFE 100%)',
    color: 'var(--color-ink-muted)',
    fontSize: '16px',
    fontWeight: 600,
  },
  messagesBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '300px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  messageBubble: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '14px 16px',
    borderRadius: '20px',
    maxWidth: '92%',
  },
  tutorBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'var(--color-sky-soft)',
    color: 'var(--color-ink)',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'var(--color-surface-sunken)',
    color: 'var(--color-ink)',
    border: '1px solid var(--color-outline)',
  },
  bubbleIcon: {
    flexShrink: 0,
    marginTop: '2px',
  },
  messageText: {
    fontSize: '17px',
    lineHeight: 1.55,
  },
  recommendationAlert: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    padding: '14px 16px',
    borderRadius: '16px',
    backgroundColor: 'var(--color-leaf-soft)',
    border: '1px solid var(--color-leaf)',
  },
  recText: {
    fontSize: '16px',
    color: 'var(--color-ink)',
  },
  recBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    minHeight: '44px',
  },
  quickQuestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  chipBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    minHeight: '44px',
    padding: '10px 16px',
    borderRadius: '999px',
    border: '1px solid var(--color-outline)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-ink-muted)',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  voiceErrorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: 'var(--color-ink)',
    fontSize: '14px',
  },
  micButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    padding: 0,
    flexShrink: 0,
    borderRadius: '16px',
    border: '1px solid var(--color-outline)',
    backgroundColor: 'var(--color-surface)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  micButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
    color: '#FFFFFF',
    boxShadow: '0 0 16px rgba(239, 68, 68, 0.45)',
  },
  sendButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    padding: 0,
    flexShrink: 0,
  },
  hint: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: 0,
    fontSize: '14px',
    color: 'var(--color-ink-subtle)',
  },
};

export default TutorVirtual3D;
