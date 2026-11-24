// frontend-mobile/App.tsx
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  AppState,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import { SkylearnColors, SkylearnRadii, SkylearnShadows } from './src/theme/skylearn';
import {
  BACKEND_URL,
  registerForPushNotificationsAsync,
  sendWelcomePushNotification,
  sendCustomPushNotification,
} from './src/services/notifications';

// --- Tipos de Datos (SPEC-006) ---
interface DashboardData {
  kpis: { activeStudentsCount: number; averagePassRate: number | null; totalCompletions: number };
  courses: {
    id: string;
    title: string;
    studentsCount: number;
    passRate: number | null;
    trafficLight: 'leaf' | 'sun' | 'coral' | null;
  }[];
  criticalLesson: { lessonTitle: string; courseTitle: string; passRate: number } | null;
}

interface LessonMetric {
  id: string;
  title: string;
  order: number;
  hasExam: boolean;
  examTitle: string | null;
  totalAttempts: number;
  passedCount: number;
  failedCount: number;
  passRate: number | null;
  difficulty: 'high' | 'medium' | 'low' | 'no-data';
}

interface DifficultQuestion {
  text: string;
  lessonTitle: string;
  totalAnswers: number;
  incorrectAnswers: number;
  errorRate: number;
}

interface CourseAcademicDetail {
  course: {
    id: string;
    title: string;
    description: string;
    category: string;
    studentsCount: number;
  };
  summary: {
    totalEnrolled: number;
    evaluatedStudents: number;
    pendingStudents: number;
    totalAttempts: number;
    passRate: number | null;
    averageScore: number | null;
    priority: 'high' | 'medium' | 'low';
  };
  lessons: LessonMetric[];
  difficultQuestions: DifficultQuestion[];
}

interface StudentAcademicItem {
  id: string;
  name: string;
  email: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  examsPassed: number;
  examsFailed: number;
  examsPending: number;
  passRate: number | null;
  priority: 'high' | 'medium' | 'low';
}

interface LiveMeetingItem {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingUrl: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
}

export default function App() {
  // Estado de Autenticación
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [authError, setAuthError] = useState('');

  // Estado del Dashboard Principal
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [pushStatus, setPushStatus] = useState('');
  const [pushToken, setPushToken] = useState<string | null>(null);

  // Navegación Modular (SPEC-006)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'performance' | 'students' | 'meetings'>('performance');

  // Estado del Detalle Académico
  const [courseDetail, setCourseDetail] = useState<CourseAcademicDetail | null>(null);
  const [studentsList, setStudentsList] = useState<StudentAcademicItem[]>([]);
  const [meetingsList, setMeetingsList] = useState<LiveMeetingItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  // Filtros de Estudiantes
  const [searchStudent, setSearchStudent] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Modal para Programar Reunión en Vivo (SPEC-004 / RF-14)
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMeetingStartTime, setNewMeetingStartTime] = useState('18:00');
  const [newMeetingEndTime, setNewMeetingEndTime] = useState('19:30');
  const [newMeetingUrl, setNewMeetingUrl] = useState('https://meet.google.com/abc-defg-hij');
  const [newMeetingDescription, setNewMeetingDescription] = useState('Sesión de refuerzo y apoyo académico');
  const [savingMeeting, setSavingMeeting] = useState(false);

  // Recargar Dashboard
  const refreshDashboard = async (sessionToken: string) => {
    setLoadingDashboard(true);
    try {
      const result = await axios.get<DashboardData>(`${BACKEND_URL}/teacher/dashboard`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      setDashboard(result.data);
      setAuthError('');
    } catch {
      setAuthError('No se pudo actualizar el panel. Comprueba la conexión con el servidor.');
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Cargar Detalle Académico del Curso Seleccionado (SPEC-006)
  const loadCourseDetail = async (courseId: string) => {
    if (!token) return;
    setLoadingDetail(true);
    setDetailError('');
    try {
      const [detailRes, studentsRes, meetingsRes] = await Promise.all([
        axios.get<CourseAcademicDetail>(`${BACKEND_URL}/teacher/courses/${courseId}/academic-detail`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get<{ students: StudentAcademicItem[] }>(`${BACKEND_URL}/teacher/courses/${courseId}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get<LiveMeetingItem[]>(`${BACKEND_URL}/meetings/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setCourseDetail(detailRes.data);
      setStudentsList(studentsRes.data.students || []);
      setMeetingsList(meetingsRes.data || []);
    } catch (err: any) {
      setDetailError('No se pudo cargar la información académica del curso.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Iniciar Sesión Docente
  const handleLogin = async () => {
    try {
      const result = await axios.post<{ accessToken: string; user: { role: string; name?: string } }>(
        `${BACKEND_URL}/auth/login`,
        { email, password }
      );
      if (result.data.user.role !== 'TEACHER') {
        setAuthError('Esta aplicación es de uso exclusivo para docentes.');
        return;
      }
      setPassword('');
      setToken(result.data.accessToken);
      setAuthError('');

      // Emitir notificación push emergente estilo WhatsApp de bienvenida al ingresar
      void sendWelcomePushNotification(result.data.user?.name);
    } catch {
      setAuthError('Credenciales incorrectas o servidor no disponible.');
    }
  };

  // Prueba interactiva de notificación push tipo WhatsApp
  const handleTestPush = async () => {
    const sent = await sendWelcomePushNotification('Docente');
    if (!sent) {
      Alert.alert(
        'Permiso Requerido',
        'Por favor concede permiso de notificaciones a Expo Go en los ajustes de tu dispositivo para desplegar el aviso emergente tipo WhatsApp.'
      );
    }
  };

  // Cerrar Sesión
  const handleLogout = async () => {
    if (pushToken && token) {
      try {
        await axios.delete(`${BACKEND_URL}/teacher/device-token`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { pushToken },
        });
      } catch {}
    }
    setToken('');
    setPushToken(null);
    setDashboard(null);
    setSelectedCourseId(null);
  };

  // Programar Reunión en Vivo (RF-14)
  const handleCreateMeeting = async () => {
    if (!selectedCourseId || !token) return;
    if (!newMeetingTitle.trim() || !newMeetingUrl.trim()) {
      Alert.alert('Campos incompletos', 'Por favor ingresa título y enlace de la reunión.');
      return;
    }
    setSavingMeeting(true);
    try {
      await axios.post(
        `${BACKEND_URL}/meetings`,
        {
          courseId: selectedCourseId,
          title: newMeetingTitle.trim(),
          description: newMeetingDescription.trim(),
          date: newMeetingDate,
          startTime: newMeetingStartTime,
          endTime: newMeetingEndTime,
          meetingUrl: newMeetingUrl.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Éxito', 'Reunión en vivo programada correctamente.');
      setShowMeetingModal(false);
      setNewMeetingTitle('');
      void loadCourseDetail(selectedCourseId);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo programar la reunión.');
    } finally {
      setSavingMeeting(false);
    }
  };

  // Cancelar Reunión en Vivo (RF-16)
  const handleCancelMeeting = (meetingId: string) => {
    Alert.alert('Confirmar Cancelación', '¿Estás seguro de cancelar esta reunión programada?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.patch(
              `${BACKEND_URL}/meetings/${meetingId}/cancel`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (selectedCourseId) void loadCourseDetail(selectedCourseId);
          } catch {
            Alert.alert('Error', 'No se pudo cancelar la reunión.');
          }
        },
      },
    ]);
  };

  const welcomeSentRef = useRef(false);

  // Efecto de inicialización y listeners
  useEffect(() => {
    if (!token) return;
    void refreshDashboard(token);

    if (!welcomeSentRef.current) {
      welcomeSentRef.current = true;
      void sendWelcomePushNotification();
    }

    void registerForPushNotificationsAsync(token)
      .then((registered) => {
        setPushToken(registered);
        setPushStatus(registered ? 'Notificaciones activadas' : 'Alertas push no disponibles.');
      })
      .catch(() => setPushStatus('Sin soporte push.'));

    const received = Notifications.addNotificationReceivedListener(() => {
      void refreshDashboard(token);
    });
    const response = Notifications.addNotificationResponseReceivedListener(() => {
      void refreshDashboard(token);
    });
    const state = AppState.addEventListener('change', (next) => {
      if (next === 'active') void refreshDashboard(token);
    });

    return () => {
      received.remove();
      response.remove();
      state.remove();
    };
  }, [token]);

  // Si se selecciona un curso, cargar su analítica
  useEffect(() => {
    if (selectedCourseId) {
      void loadCourseDetail(selectedCourseId);
    }
  }, [selectedCourseId]);

  // Filtrado de estudiantes por nombre y prioridad
  const filteredStudents = useMemo(() => {
    return studentsList.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchStudent.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || s.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [studentsList, searchStudent, priorityFilter]);

  // ==========================================
  // VISTA 1: INICIO DE SESIÓN
  // ==========================================
  if (!token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loginContainer}>
          <Text style={styles.brandTitle}>Skylearn Docente</Text>
          <Text style={styles.brandSubtitle}>Supervisión Académica Móvil & Reuniones en Vivo</Text>

          <View style={styles.loginCard}>
            <Text style={styles.inputLabel}>Correo Institucional</Text>
            <TextInput
              placeholder="ejemplo@docente.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              placeholder="Tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.textInput}
            />

            {authError ? <Text style={styles.errorBanner}>{authError}</Text> : null}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
              <Text style={styles.primaryBtnText}>Ingresar al Panel Docente</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // VISTA 2: DETALLE ACADÉMICO DEL CURSO (SPEC-006)
  // ==========================================
  if (selectedCourseId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.container}>
          {/* Botón Volver y Cabecera del Curso */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setSelectedCourseId(null)}
          >
            <Text style={styles.backBtnText}>← Volver a Mis Cursos</Text>
          </TouchableOpacity>

          <View style={styles.courseHeaderCard}>
            <Text style={styles.courseHeaderCategory}>
              {courseDetail?.course.category.toUpperCase() || 'CURSO'}
            </Text>
            <Text style={styles.courseHeaderTitle}>
              {courseDetail?.course.title || 'Cargando curso...'}
            </Text>
            <Text style={styles.courseHeaderSub}>
              {courseDetail?.summary.totalEnrolled ?? 0} estudiantes inscritos • Prioridad:{' '}
              {courseDetail?.summary.priority === 'high'
                ? '🔴 Alta'
                : courseDetail?.summary.priority === 'medium'
                ? '🟡 Media'
                : '🟢 Normal'}
            </Text>
          </View>

          {/* Navegación por Pestañas */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'performance' && styles.tabItemActive]}
              onPress={() => setActiveTab('performance')}
            >
              <Text style={[styles.tabText, activeTab === 'performance' && styles.tabTextActive]}>
                📊 Rendimiento
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'students' && styles.tabItemActive]}
              onPress={() => setActiveTab('students')}
            >
              <Text style={[styles.tabText, activeTab === 'students' && styles.tabTextActive]}>
                👥 Alumnos ({studentsList.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'meetings' && styles.tabItemActive]}
              onPress={() => setActiveTab('meetings')}
            >
              <Text style={[styles.tabText, activeTab === 'meetings' && styles.tabTextActive]}>
                📅 Reuniones
              </Text>
            </TouchableOpacity>
          </View>

          {loadingDetail ? (
            <ActivityIndicator size="large" color={SkylearnColors.skyDeep} style={{ marginTop: 40 }} />
          ) : detailError ? (
            <Text style={styles.errorBanner}>{detailError}</Text>
          ) : (
            <>
              {/* PESTAÑA 1: RENDIMIENTO & LECCIONES (RF-05, RF-06, RF-07) */}
              {activeTab === 'performance' && (
                <View>
                  {/* Tarjetas de Métricas Generales */}
                  <View style={styles.metricGrid}>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricVal}>{courseDetail?.summary.evaluatedStudents ?? 0}</Text>
                      <Text style={styles.metricLab}>Evaluados</Text>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricVal}>{courseDetail?.summary.pendingStudents ?? 0}</Text>
                      <Text style={styles.metricLab}>Sin Intento</Text>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={[styles.metricVal, { color: SkylearnColors.leafDeep }]}>
                        {courseDetail?.summary.passRate !== null
                          ? `${courseDetail?.summary.passRate}%`
                          : '—'}
                      </Text>
                      <Text style={styles.metricLab}>Aprobación</Text>
                    </View>
                  </View>

                  {/* Lecciones y Rendimiento en Exámenes */}
                  <View style={styles.sectionCard}>
                    <Text style={styles.cardTitle}>Rendimiento por Lección</Text>
                    {courseDetail?.lessons.map((lesson) => (
                      <View key={lesson.id} style={styles.lessonRow}>
                        <View style={styles.lessonOrderBox}>
                          <Text style={styles.lessonOrderText}>{lesson.order + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.lessonTitle}>{lesson.title}</Text>
                          {lesson.hasExam ? (
                            <Text style={styles.lessonSub}>
                              {lesson.totalAttempts} intentos • {lesson.passedCount} aprobados •{' '}
                              {lesson.failedCount} reprobados
                            </Text>
                          ) : (
                            <Text style={styles.lessonSubMuted}>Sin cuestionario asignado</Text>
                          )}
                        </View>
                        {lesson.hasExam && (
                          <View
                            style={[
                              styles.badgePill,
                              lesson.difficulty === 'high'
                                ? styles.badgeHigh
                                : lesson.difficulty === 'medium'
                                ? styles.badgeMedium
                                : styles.badgeLow,
                            ]}
                          >
                            <Text style={styles.badgeText}>
                              {lesson.passRate !== null ? `${lesson.passRate}%` : 'S/D'}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>

                  {/* Temas / Preguntas con Mayor Dificultad (RF-08) */}
                  {courseDetail?.difficultQuestions && courseDetail.difficultQuestions.length > 0 && (
                    <View style={[styles.sectionCard, { marginTop: 16 }]}>
                      <Text style={styles.cardTitle}>Temas con Mayor Dificultad</Text>
                      <Text style={styles.cardSubtitle}>
                        Preguntas que presentaron la mayor tasa de error en los exámenes:
                      </Text>
                      {courseDetail.difficultQuestions.map((q, idx) => (
                        <View key={idx} style={styles.difficultItem}>
                          <Text style={styles.difficultErrorBadge}>{q.errorRate}% error</Text>
                          <Text style={styles.difficultText}>{q.text}</Text>
                          <Text style={styles.difficultLesson}>En lección: {q.lessonTitle}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* PESTAÑA 2: ESTUDIANTES & SEGUIMIENTO (RF-09, RF-10, RF-11) */}
              {activeTab === 'students' && (
                <View>
                  {/* Buscador */}
                  <TextInput
                    placeholder="🔍 Buscar estudiante por nombre..."
                    value={searchStudent}
                    onChangeText={setSearchStudent}
                    style={styles.searchBar}
                  />

                  {/* Filtro por Prioridad */}
                  <View style={styles.filterRow}>
                    {(['all', 'high', 'medium', 'low'] as const).map((filter) => (
                      <TouchableOpacity
                        key={filter}
                        style={[
                          styles.filterChip,
                          priorityFilter === filter && styles.filterChipActive,
                        ]}
                        onPress={() => setPriorityFilter(filter)}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            priorityFilter === filter && styles.filterChipTextActive,
                          ]}
                        >
                          {filter === 'all'
                            ? 'Todos'
                            : filter === 'high'
                            ? '🔴 Alta'
                            : filter === 'medium'
                            ? '🟡 Media'
                            : '🟢 Normal'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Lista de Alumnos */}
                  {filteredStudents.length === 0 ? (
                    <Text style={styles.emptyText}>No se encontraron estudiantes en este filtro.</Text>
                  ) : (
                    filteredStudents.map((st) => (
                      <View key={st.id} style={styles.studentCard}>
                        <View style={styles.studentHeader}>
                          <View>
                            <Text style={styles.studentName}>{st.name}</Text>
                            <Text style={styles.studentEmail}>{st.email}</Text>
                          </View>
                          <View
                            style={[
                              styles.priorityBadge,
                              st.priority === 'high'
                                ? styles.priorityHigh
                                : st.priority === 'medium'
                                ? styles.priorityMedium
                                : styles.priorityLow,
                            ]}
                          >
                            <Text style={styles.priorityText}>
                              {st.priority === 'high'
                                ? 'Prioridad Alta'
                                : st.priority === 'medium'
                                ? 'En Seguimiento'
                                : 'Adecuado'}
                            </Text>
                          </View>
                        </View>

                        {/* Barra de Progreso */}
                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${Math.min(100, st.progressPercentage)}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.studentStats}>
                          Avance: {st.progressPercentage}% ({st.completedLessons}/{st.totalLessons} lecciones) •{' '}
                          {st.examsPassed} aprobados / {st.examsFailed} reprobados
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              )}

              {/* PESTAÑA 3: REUNIONES EN VIVO (RF-14, RF-15, RF-16) */}
              {activeTab === 'meetings' && (
                <View>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => setShowMeetingModal(true)}
                  >
                    <Text style={styles.primaryBtnText}>+ Programar Nueva Reunión en Vivo</Text>
                  </TouchableOpacity>

                  <View style={[styles.sectionCard, { marginTop: 16 }]}>
                    <Text style={styles.cardTitle}>Reuniones Programadas</Text>
                    {meetingsList.length === 0 ? (
                      <Text style={styles.emptyText}>No hay reuniones programadas para este curso.</Text>
                    ) : (
                      meetingsList.map((m) => (
                        <View key={m.id} style={styles.meetingItem}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Text style={styles.meetingTitle}>{m.title}</Text>
                              <Text
                                style={[
                                  styles.statusTag,
                                  m.status === 'SCHEDULED'
                                    ? styles.statusScheduled
                                    : styles.statusCancelled,
                                ]}
                              >
                                {m.status === 'SCHEDULED' ? 'PROGRAMADA' : m.status}
                              </Text>
                            </View>
                            <Text style={styles.meetingTime}>
                              📅 {m.date.split('T')[0]} • ⏰ {m.startTime} - {m.endTime}
                            </Text>
                            <Text style={styles.meetingDesc}>{m.description}</Text>
                            <Text style={styles.meetingLink} numberOfLines={1}>
                              🔗 {m.meetingUrl}
                            </Text>
                          </View>

                          {m.status === 'SCHEDULED' && (
                            <TouchableOpacity
                              style={styles.cancelBtn}
                              onPress={() => handleCancelMeeting(m.id)}
                            >
                              <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))
                    )}
                  </View>
                </View>
              )}
            </>
          )}

          {/* Modal para Crear Reunión */}
          <Modal visible={showMeetingModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Programar Reunión en Vivo</Text>
                <Text style={styles.modalSub}>Los estudiantes inscritos podrán ver el enlace directo.</Text>

                <Text style={styles.inputLabel}>Título de la Reunión</Text>
                <TextInput
                  placeholder="Ej: Clase de repaso y dudas"
                  value={newMeetingTitle}
                  onChangeText={setNewMeetingTitle}
                  style={styles.textInput}
                />

                <Text style={styles.inputLabel}>Fecha (AAAA-MM-DD)</Text>
                <TextInput
                  placeholder="2026-11-20"
                  value={newMeetingDate}
                  onChangeText={setNewMeetingDate}
                  style={styles.textInput}
                />

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Hora Inicio</Text>
                    <TextInput
                      placeholder="18:00"
                      value={newMeetingStartTime}
                      onChangeText={setNewMeetingStartTime}
                      style={styles.textInput}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Hora Fin</Text>
                    <TextInput
                      placeholder="19:30"
                      value={newMeetingEndTime}
                      onChangeText={setNewMeetingEndTime}
                      style={styles.textInput}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Enlace Google Meet o Zoom</Text>
                <TextInput
                  placeholder="https://meet.google.com/..."
                  value={newMeetingUrl}
                  onChangeText={setNewMeetingUrl}
                  style={styles.textInput}
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Agenda / Temas a tratar</Text>
                <TextInput
                  placeholder="Breve temario de la sesión"
                  value={newMeetingDescription}
                  onChangeText={setNewMeetingDescription}
                  style={[styles.textInput, { height: 70 }]}
                  multiline
                />

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: SkylearnColors.outline }]}
                    onPress={() => setShowMeetingModal(false)}
                    disabled={savingMeeting}
                  >
                    <Text style={styles.modalBtnTextDark}>Cerrar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: SkylearnColors.skyDeep }]}
                    onPress={handleCreateMeeting}
                    disabled={savingMeeting}
                  >
                    <Text style={styles.modalBtnTextLight}>
                      {savingMeeting ? 'Guardando...' : 'Programar Reunión'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // VISTA 3: DASHBOARD PRINCIPAL DEL DOCENTE
  // ==========================================
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Cabecera Skylearn Docente */}
        <View style={styles.header}>
          <Text style={styles.headerBadge}>PANEL ACADÉMICO DOCENTE</Text>
          <Text style={styles.headerTitle}>Skylearn Docente</Text>
          <Text style={styles.headerSubtitle}>Supervisión académica, lecciones críticas y reuniones</Text>
          <Text style={styles.pushStatusText}>{pushStatus}</Text>
          {authError ? <Text style={styles.errorBanner}>{authError}</Text> : null}

          <View style={styles.actionBtnRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => void refreshDashboard(token)}
            >
              <Text style={styles.actionBtnText}>🔄 Actualizar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: '#25D366' }]}
              onPress={handleTestPush}
            >
              <Text style={[styles.actionBtnText, { color: '#128C7E' }]}>💬 Probar Push</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: SkylearnColors.coral }]}
              onPress={handleLogout}
            >
              <Text style={[styles.actionBtnText, { color: SkylearnColors.coral }]}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3 KPIs Principales */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{dashboard?.kpis.activeStudentsCount ?? '—'}</Text>
            <Text style={styles.kpiLabel}>Estudiantes</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{dashboard?.kpis.totalCompletions ?? '—'}</Text>
            <Text style={styles.kpiLabel}>Completadas</Text>
          </View>
          <View style={[styles.kpiCard, { borderColor: SkylearnColors.leaf }]}>
            <Text style={[styles.kpiValue, { color: SkylearnColors.leafDeep }]}>
              {dashboard?.kpis.averagePassRate == null ? '—' : `${dashboard.kpis.averagePassRate}%`}
            </Text>
            <Text style={styles.kpiLabel}>Aprobación</Text>
          </View>
        </View>

        {/* Semáforo de salud pedagógica y selector de curso */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Mis Cursos Asignados (Toca para ver detalle)</Text>
          {loadingDashboard ? (
            <ActivityIndicator size="small" color={SkylearnColors.skyDeep} />
          ) : (
            dashboard?.courses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseItem}
                onPress={() => setSelectedCourseId(course.id)}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: course.trafficLight
                        ? SkylearnColors[course.trafficLight]
                        : SkylearnColors.inkSubtle,
                    },
                  ]}
                />
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseStats}>
                    {course.studentsCount} estudiantes •{' '}
                    {course.passRate === null ? 'Sin evaluaciones' : `${course.passRate}% aprobación`}
                  </Text>
                </View>
                <Text style={styles.arrowIcon}>➔</Text>
              </TouchableOpacity>
            ))
          )}

          {dashboard && dashboard.courses.length === 0 ? (
            <Text style={styles.emptyText}>Aún no tienes cursos asignados.</Text>
          ) : null}

          {dashboard?.criticalLesson && (
            <View style={styles.criticalCard}>
              <Text style={styles.criticalTitle}>⚠️ Lección con mayor dificultad detectada:</Text>
              <Text style={styles.criticalText}>
                "{dashboard.criticalLesson.lessonTitle}" en {dashboard.criticalLesson.courseTitle} (
                {Math.round(dashboard.criticalLesson.passRate)}% de aprobación)
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Estilos Skylearn Accesibles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: SkylearnColors.surface },
  container: { padding: 18, paddingTop: 30, paddingBottom: 50 },
  loginContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  brandTitle: { fontSize: 32, fontWeight: '800', color: SkylearnColors.skyDeep, textAlign: 'center' },
  brandSubtitle: { fontSize: 15, color: SkylearnColors.inkMuted, textAlign: 'center', marginTop: 6, marginBottom: 24 },
  loginCard: {
    backgroundColor: SkylearnColors.surfaceElevated,
    padding: 24,
    borderRadius: SkylearnRadii.lg,
    borderWidth: 1,
    borderColor: SkylearnColors.outline,
    ...SkylearnShadows.card,
  },
  inputLabel: { fontSize: 13, fontWeight: '700', color: SkylearnColors.ink, marginTop: 12, marginBottom: 6 },
  textInput: {
    borderWidth: 1,
    borderColor: SkylearnColors.outline,
    padding: 12,
    borderRadius: 8,
    backgroundColor: SkylearnColors.surface,
    fontSize: 15,
  },
  primaryBtn: {
    backgroundColor: SkylearnColors.skyDeep,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  errorBanner: { color: SkylearnColors.coral, fontSize: 13, marginTop: 10, textAlign: 'center', fontWeight: '600' },
  header: { marginBottom: 20 },
  headerBadge: { fontSize: 12, fontWeight: '800', color: SkylearnColors.skyDeep, letterSpacing: 1 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: SkylearnColors.ink, marginTop: 2 },
  headerSubtitle: { fontSize: 14, color: SkylearnColors.inkMuted, marginTop: 4 },
  pushStatusText: { fontSize: 12, color: SkylearnColors.leafDeep, marginTop: 4, fontWeight: '600' },
  actionBtnRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SkylearnColors.outline,
    backgroundColor: SkylearnColors.surfaceElevated,
  },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: SkylearnColors.ink },
  kpiContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  kpiCard: {
    flex: 1,
    backgroundColor: SkylearnColors.surfaceElevated,
    borderRadius: SkylearnRadii.lg,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SkylearnColors.outline,
  },
  kpiValue: { fontSize: 22, fontWeight: '800', color: SkylearnColors.skyDeep },
  kpiLabel: { fontSize: 12, fontWeight: '600', color: SkylearnColors.inkMuted, marginTop: 4 },
  statusSection: {
    backgroundColor: SkylearnColors.surfaceElevated,
    borderRadius: SkylearnRadii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: SkylearnColors.outline,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: SkylearnColors.ink, marginBottom: 14 },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: SkylearnColors.outline,
    gap: 12,
  },
  statusDot: { width: 14, height: 14, borderRadius: 7 },
  courseInfo: { flex: 1 },
  courseTitle: { fontSize: 15, fontWeight: '700', color: SkylearnColors.ink },
  courseStats: { fontSize: 13, color: SkylearnColors.inkMuted, marginTop: 2 },
  arrowIcon: { fontSize: 16, color: SkylearnColors.skyDeep, fontWeight: 'bold' },
  criticalCard: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  criticalTitle: { fontSize: 13, fontWeight: '700', color: SkylearnColors.coral },
  criticalText: { fontSize: 13, color: SkylearnColors.ink, marginTop: 2 },
  emptyText: { textAlign: 'center', color: SkylearnColors.inkMuted, marginVertical: 20, fontSize: 14 },
  backBtn: { marginBottom: 12 },
  backBtnText: { fontSize: 14, fontWeight: '700', color: SkylearnColors.skyDeep },
  courseHeaderCard: {
    backgroundColor: SkylearnColors.surfaceElevated,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SkylearnColors.outline,
    marginBottom: 14,
  },
  courseHeaderCategory: { fontSize: 11, fontWeight: '800', color: SkylearnColors.skyDeep, letterSpacing: 0.5 },
  courseHeaderTitle: { fontSize: 20, fontWeight: '800', color: SkylearnColors.ink, marginTop: 2 },
  courseHeaderSub: { fontSize: 13, color: SkylearnColors.inkMuted, marginTop: 4 },
  tabBar: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: SkylearnColors.surfaceElevated,
    borderWidth: 1,
    borderColor: SkylearnColors.outline,
  },
  tabItemActive: { backgroundColor: SkylearnColors.skyDeep, borderColor: SkylearnColors.skyDeep },
  tabText: { fontSize: 12, fontWeight: '700', color: SkylearnColors.inkMuted },
  tabTextActive: { color: '#FFFFFF' },
  metricGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metricBox: {
    flex: 1,
    backgroundColor: SkylearnColors.surfaceElevated,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SkylearnColors.outline,
  },
  metricVal: { fontSize: 20, fontWeight: '800', color: SkylearnColors.skyDeep },
  metricLab: { fontSize: 11, color: SkylearnColors.inkMuted, marginTop: 2, fontWeight: '600' },
  sectionCard: {
    backgroundColor: SkylearnColors.surfaceElevated,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SkylearnColors.outline,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: SkylearnColors.ink, marginBottom: 8 },
  cardSubtitle: { fontSize: 12, color: SkylearnColors.inkMuted, marginBottom: 12 },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: SkylearnColors.outline,
  },
  lessonOrderBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SkylearnColors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonOrderText: { fontSize: 12, fontWeight: '700', color: SkylearnColors.ink },
  lessonTitle: { fontSize: 14, fontWeight: '600', color: SkylearnColors.ink },
  lessonSub: { fontSize: 12, color: SkylearnColors.inkMuted, marginTop: 2 },
  lessonSubMuted: { fontSize: 12, color: SkylearnColors.inkSubtle, fontStyle: 'italic', marginTop: 2 },
  badgePill: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  badgeHigh: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  badgeMedium: { backgroundColor: 'rgba(234, 179, 8, 0.15)' },
  badgeLow: { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  badgeText: { fontSize: 12, fontWeight: '700', color: SkylearnColors.ink },
  difficultItem: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: SkylearnColors.surface,
    borderWidth: 1,
    borderColor: SkylearnColors.outline,
    marginTop: 8,
  },
  difficultErrorBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: SkylearnColors.coral,
    marginBottom: 2,
  },
  difficultText: { fontSize: 13, fontWeight: '600', color: SkylearnColors.ink },
  difficultLesson: { fontSize: 11, color: SkylearnColors.inkMuted, marginTop: 4 },
  searchBar: {
    borderWidth: 1,
    borderColor: SkylearnColors.outline,
    padding: 12,
    borderRadius: 10,
    backgroundColor: SkylearnColors.surfaceElevated,
    fontSize: 14,
    marginBottom: 10,
  },
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: SkylearnColors.surfaceElevated,
    borderWidth: 1,
    borderColor: SkylearnColors.outline,
  },
  filterChipActive: { backgroundColor: SkylearnColors.ink, borderColor: SkylearnColors.ink },
  filterChipText: { fontSize: 12, fontWeight: '600', color: SkylearnColors.inkMuted },
  filterChipTextActive: { color: '#FFFFFF' },
  studentCard: {
    backgroundColor: SkylearnColors.surfaceElevated,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SkylearnColors.outline,
    marginBottom: 10,
  },
  studentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  studentName: { fontSize: 15, fontWeight: '700', color: SkylearnColors.ink },
  studentEmail: { fontSize: 12, color: SkylearnColors.inkMuted, marginTop: 1 },
  priorityBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  priorityHigh: { backgroundColor: 'rgba(239, 68, 68, 0.12)' },
  priorityMedium: { backgroundColor: 'rgba(234, 179, 8, 0.12)' },
  priorityLow: { backgroundColor: 'rgba(34, 197, 94, 0.12)' },
  priorityText: { fontSize: 11, fontWeight: '700', color: SkylearnColors.ink },
  progressTrack: { height: 6, backgroundColor: SkylearnColors.outline, borderRadius: 3, marginTop: 10 },
  progressFill: { height: 6, backgroundColor: SkylearnColors.leaf, borderRadius: 3 },
  studentStats: { fontSize: 12, color: SkylearnColors.inkMuted, marginTop: 6 },
  meetingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: SkylearnColors.outline,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  meetingTitle: { fontSize: 15, fontWeight: '700', color: SkylearnColors.ink },
  statusTag: { fontSize: 10, fontWeight: '800', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 },
  statusScheduled: { backgroundColor: 'rgba(34, 197, 94, 0.15)', color: SkylearnColors.leafDeep },
  statusCancelled: { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: SkylearnColors.coral },
  meetingTime: { fontSize: 12, color: SkylearnColors.skyDeep, fontWeight: '600', marginTop: 2 },
  meetingDesc: { fontSize: 13, color: SkylearnColors.ink, marginTop: 4 },
  meetingLink: { fontSize: 12, color: SkylearnColors.inkMuted, marginTop: 2 },
  cancelBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  cancelBtnText: { fontSize: 12, fontWeight: '700', color: SkylearnColors.coral },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: SkylearnColors.surfaceElevated, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: SkylearnColors.ink },
  modalSub: { fontSize: 13, color: SkylearnColors.inkMuted, marginTop: 2, marginBottom: 10 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  modalBtnTextDark: { fontSize: 14, fontWeight: '700', color: SkylearnColors.ink },
  modalBtnTextLight: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
