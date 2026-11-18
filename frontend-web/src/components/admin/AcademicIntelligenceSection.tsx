// frontend-web/src/components/admin/AcademicIntelligenceSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  BarChart2,
  Users,
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Filter,
  RefreshCw,
  Search,
  Eye,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import {
  ResponsiveBarChart,
  ResponsiveDonutChart,
  DifficultyBadge,
  TopicStatusBadge,
} from './AcademicCharts';
import { StudentProfileModal } from './StudentProfileModal';

export const AcademicIntelligenceSection: React.FC = () => {
  // Filtros globales
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Sub-sección activa
  const [activeSubTab, setActiveSubTab] = useState<
    'summary' | 'courses' | 'questions' | 'topics' | 'students'
  >('summary');

  // Estados de datos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [coursesData, setCoursesData] = useState<any | null>(null);
  const [questionsData, setQuestionsData] = useState<any[]>([]);
  const [topicsData, setTopicsData] = useState<any | null>(null);
  const [studentsData, setStudentsData] = useState<any | null>(null);

  // Lista de cursos y categorías para los selectores de filtro
  const [availableCourses, setAvailableCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [availableCategories, setAvailableCategories] = useState<Array<{ id: string; name: string }>>([]);

  // Estudiante seleccionado para el modal de perfil individual
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Filtros locales para tablas
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState<string>('ALL');
  const [studentCategoryFilter, setStudentCategoryFilter] = useState<'ALL' | 'TOP' | 'SUPPORT'>('ALL');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Carga de filtros maestros iniciales
  useEffect(() => {
    api.get('/courses').then((res) => {
      setAvailableCourses(res.data || []);
      const cats = Array.from(new Set((res.data || []).map((c: any) => c.category))).filter(Boolean);
      setAvailableCategories(cats.map((c: any) => ({ id: c, name: c })));
    }).catch(() => {});
  }, []);

  // Carga reactiva de los datos analíticos
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', new Date(startDate).toISOString());
      if (endDate) params.append('endDate', new Date(endDate).toISOString());
      if (selectedCourseId) params.append('courseId', selectedCourseId);
      if (selectedCategoryId) params.append('categoryId', selectedCategoryId);

      const qs = params.toString() ? `?${params.toString()}` : '';

      const [summaryRes, coursesRes, questionsRes, topicsRes, studentsRes] = await Promise.all([
        api.get(`/admin/analytics/summary${qs}`),
        api.get(`/admin/analytics/courses${qs}`),
        api.get(`/admin/analytics/questions${qs}`),
        api.get(`/admin/analytics/topics${qs}`),
        api.get(`/admin/analytics/students${qs}`),
      ]);

      setSummaryData(summaryRes.data);
      setCoursesData(coursesRes.data);
      setQuestionsData(questionsRes.data || []);
      setTopicsData(topicsRes.data);
      setStudentsData(studentsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener indicadores académicos.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedCourseId, selectedCategoryId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCourseId('');
    setSelectedCategoryId('');
  };

  // Filtrado de preguntas en la pestaña correspondiente
  const filteredQuestions = questionsData.filter((q) => {
    if (questionDifficultyFilter === 'ALL') return true;
    return q.difficulty === questionDifficultyFilter;
  });

  // Filtrado de estudiantes
  const filteredStudents = (studentsData?.allStudents || []).filter((s: any) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (studentCategoryFilter === 'TOP') return s.classification === 'TOP_PERFORMER';
    if (studentCategoryFilter === 'SUPPORT') return s.classification === 'NEEDS_SUPPORT';
    return true;
  });

  return (
    <div style={styles.container}>
      {/* Barra de Filtros Responsiva (RF-14) */}
      <div className="skylearn-card" style={styles.filterCard}>
        <div style={styles.filterHeader}>
          <div style={styles.filterHeaderTitle}>
            <Filter size={16} color="var(--color-sky)" />
            <span style={styles.filterTitle}>Filtros de Análisis Académico</span>
          </div>
          <div style={styles.filterActions}>
            {(startDate || endDate || selectedCourseId || selectedCategoryId) && (
              <button onClick={handleResetFilters} style={styles.clearFiltersBtn}>
                Limpiar filtros
              </button>
            )}
            <button onClick={fetchAnalytics} disabled={loading} style={styles.refreshBtn}>
              <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
              <span>Actualizar datos</span>
            </button>
          </div>
        </div>

        <div style={styles.filtersGrid}>
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Desde:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.filterInput}
            />
          </div>

          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Hasta:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.filterInput}
            />
          </div>

          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Curso:</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">Todos los cursos</option>
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Categoría:</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">Todas las categorías</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Sub-navegación por áreas analíticas */}
      <div style={styles.subTabsRow}>
        <button
          onClick={() => setActiveSubTab('summary')}
          style={{
            ...styles.subTabBtn,
            ...(activeSubTab === 'summary' ? styles.subTabBtnActive : {}),
          }}
        >
          <TrendingUp size={15} />
          <span>Resumen General</span>
        </button>

        <button
          onClick={() => setActiveSubTab('courses')}
          style={{
            ...styles.subTabBtn,
            ...(activeSubTab === 'courses' ? styles.subTabBtnActive : {}),
          }}
        >
          <BookOpen size={15} />
          <span>Demanda de Cursos</span>
        </button>

        <button
          onClick={() => setActiveSubTab('questions')}
          style={{
            ...styles.subTabBtn,
            ...(activeSubTab === 'questions' ? styles.subTabBtnActive : {}),
          }}
        >
          <AlertTriangle size={15} />
          <span>Preguntas Difíciles</span>
        </button>

        <button
          onClick={() => setActiveSubTab('topics')}
          style={{
            ...styles.subTabBtn,
            ...(activeSubTab === 'topics' ? styles.subTabBtnActive : {}),
          }}
        >
          <Sparkles size={15} />
          <span>Temas & Fortalezas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('students')}
          style={{
            ...styles.subTabBtn,
            ...(activeSubTab === 'students' ? styles.subTabBtnActive : {}),
          }}
        >
          <Users size={15} />
          <span>Estudiantes (KPIs)</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-VISTA 1: RESUMEN GENERAL (LOS 7 KPIS PRINCIPALES RF-02) */}
      {/* ========================================================= */}
      {activeSubTab === 'summary' && (
        <div style={styles.sectionWrapper}>
          <div style={styles.kpiGrid}>
            <div className="skylearn-card" style={styles.kpiCard}>
              <div style={{ ...styles.kpiIconWrap, backgroundColor: 'rgba(2, 132, 199, 0.1)' }}>
                <Users size={22} color="var(--color-sky-deep)" />
              </div>
              <div>
                <span style={styles.kpiLabel}>Estudiantes Registrados</span>
                <h3 style={styles.kpiValue}>{summaryData?.totalStudents ?? 0}</h3>
                <span style={styles.kpiSubtext}>Estudiantes en plataforma</span>
              </div>
            </div>

            <div className="skylearn-card" style={styles.kpiCard}>
              <div style={{ ...styles.kpiIconWrap, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <CheckCircle2 size={22} color="var(--color-leaf-deep)" />
              </div>
              <div>
                <span style={styles.kpiLabel}>Estudiantes Activos</span>
                <h3 style={styles.kpiValue}>{summaryData?.activeStudentsCount ?? 0}</h3>
                <span style={styles.kpiSubtext}>Con actividad en el período</span>
              </div>
            </div>

            <div className="skylearn-card" style={styles.kpiCard}>
              <div style={{ ...styles.kpiIconWrap, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                <BookOpen size={22} color="#7c3aed" />
              </div>
              <div>
                <span style={styles.kpiLabel}>Cursos Disponibles</span>
                <h3 style={styles.kpiValue}>{summaryData?.totalCourses ?? 0}</h3>
                <span style={styles.kpiSubtext}>Publicados en catálogo</span>
              </div>
            </div>

            <div className="skylearn-card" style={styles.kpiCard}>
              <div style={{ ...styles.kpiIconWrap, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                <Layers size={22} color="#d97706" />
              </div>
              <div>
                <span style={styles.kpiLabel}>Total Inscripciones</span>
                <h3 style={styles.kpiValue}>{summaryData?.totalEnrollments ?? 0}</h3>
                <span style={styles.kpiSubtext}>
                  {summaryData?.uniqueEnrolledStudents ?? 0} estudiantes únicos
                </span>
              </div>
            </div>

            <div className="skylearn-card" style={styles.kpiCard}>
              <div style={{ ...styles.kpiIconWrap, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <Award size={22} color="var(--color-sky)" />
              </div>
              <div>
                <span style={styles.kpiLabel}>Promedio de Rendimiento</span>
                <h3 style={styles.kpiValue}>
                  {summaryData?.averageScore ? `${summaryData.averageScore}%` : 'N/A'}
                </h3>
                <span style={styles.kpiSubtext}>En {summaryData?.totalAttempts ?? 0} evaluaciones</span>
              </div>
            </div>

            <div className="skylearn-card" style={styles.kpiCard}>
              <div
                style={{
                  ...styles.kpiIconWrap,
                  backgroundColor:
                    (summaryData?.passRate ?? 0) >= 70
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                }}
              >
                <TrendingUp
                  size={22}
                  color={(summaryData?.passRate ?? 0) >= 70 ? '#059669' : '#dc2626'}
                />
              </div>
              <div>
                <span style={styles.kpiLabel}>Tasa de Aprobación</span>
                <h3 style={styles.kpiValue}>
                  {summaryData?.passRate !== undefined ? `${summaryData.passRate}%` : '0%'}
                </h3>
                <span style={styles.kpiSubtext}>
                  {summaryData?.passedAttempts ?? 0} de {summaryData?.totalAttempts ?? 0} aprobadas
                </span>
              </div>
            </div>

            <div className="skylearn-card" style={styles.kpiCard}>
              <div style={{ ...styles.kpiIconWrap, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <CheckCircle2 size={22} color="var(--color-leaf-deep)" />
              </div>
              <div>
                <span style={styles.kpiLabel}>Lecciones Completadas</span>
                <h3 style={styles.kpiValue}>{summaryData?.totalCompletions ?? 0}</h3>
                <span style={styles.kpiSubtext}>Participación formativa total</span>
              </div>
            </div>
          </div>

          {/* Gráficos destacados de resumen */}
          <div style={styles.chartsGrid}>
            <div className="skylearn-card" style={styles.chartBox}>
              <div style={styles.chartHeader}>
                <BarChart2 size={18} color="var(--color-sky)" />
                <h4 style={styles.chartTitle}>Estudiantes Inscritos por Curso (Demanda)</h4>
              </div>
              <ResponsiveBarChart
                data={(coursesData?.courses || []).map((c: any) => ({
                  id: c.id,
                  label: c.title,
                  value: c.enrolledCount,
                  secondaryLabel: `${c.sharePercentage}% del total`,
                }))}
                valueUnit="alumnos"
              />
            </div>

            <div className="skylearn-card" style={styles.chartBox}>
              <div style={styles.chartHeader}>
                <Layers size={18} color="var(--color-sky)" />
                <h4 style={styles.chartTitle}>Distribución de Estudiantes por Categoría</h4>
              </div>
              <ResponsiveDonutChart
                data={coursesData?.categoryDistribution || []}
                title="Categorías"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-VISTA 2: DEMANDA Y COMPARATIVA DE CURSOS (RF-03, 04, 05) */}
      {/* ========================================================= */}
      {activeSubTab === 'courses' && (
        <div style={styles.sectionWrapper}>
          <div style={styles.tableCard}>
            <div style={styles.tableCardHeader}>
              <h4 style={styles.tableTitle}>Ranking de Popularidad y Comparativa Curricular</h4>
              <span style={styles.tableSubtitle}>
                Total de inscripciones analizadas: {coursesData?.totalPlatformEnrollments || 0}
              </span>
            </div>

            <div style={styles.tableResponsiveWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Posición & Curso</th>
                    <th style={styles.th}>Categoría</th>
                    <th style={styles.th}>Inscritos</th>
                    <th style={styles.th}>Cuota (%)</th>
                    <th style={styles.th}>Lecciones</th>
                    <th style={styles.th}>Promedio</th>
                    <th style={styles.th}>Aprobación</th>
                  </tr>
                </thead>
                <tbody>
                  {(coursesData?.courses || []).map((c: any, idx: number) => (
                    <tr key={c.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.courseRankCell}>
                          <span style={styles.rankBadge}>#{idx + 1}</span>
                          <div>
                            <strong style={styles.tableCourseName}>{c.title}</strong>
                            <span style={styles.tableTeacherName}>{c.teacherName}</span>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.categoryBadge}>{c.category}</span>
                      </td>
                      <td style={styles.td}>
                        <strong>{c.enrolledCount}</strong>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.shareProgressWrap}>
                          <div
                            style={{
                              ...styles.shareProgressBar,
                              width: `${c.sharePercentage}%`,
                            }}
                          />
                          <span style={styles.shareText}>{c.sharePercentage}%</span>
                        </div>
                      </td>
                      <td style={styles.td}>{c.totalLessons}</td>
                      <td style={styles.td}>
                        {c.averageScore !== null ? `${c.averageScore}%` : 'Sin datos'}
                      </td>
                      <td style={styles.td}>
                        {c.passRate !== null ? (
                          <span
                            style={{
                              fontWeight: 700,
                              color: c.passRate >= 70 ? 'var(--color-leaf-deep)' : 'var(--color-coral)',
                            }}
                          >
                            {c.passRate}%
                          </span>
                        ) : (
                          'Sin datos'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-VISTA 3: PREGUNTAS DIFÍCILES Y TASAS DE ERROR (RF-07) */}
      {/* ========================================================= */}
      {activeSubTab === 'questions' && (
        <div style={styles.sectionWrapper}>
          <div style={styles.filterInlineRow}>
            <span style={styles.inlineFilterLabel}>Filtrar por nivel de dificultad:</span>
            {(
              [
                { id: 'ALL', label: 'Todas' },
                { id: 'CRITICAL', label: 'Muy Alta (> 70%)' },
                { id: 'HIGH', label: 'Alta (45-70%)' },
                { id: 'MEDIUM', label: 'Media (20-45%)' },
                { id: 'LOW', label: 'Baja (< 20%)' },
                { id: 'INSUFFICIENT_DATA', label: 'Muestra Insuficiente' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setQuestionDifficultyFilter(f.id)}
                style={{
                  ...styles.filterPillBtn,
                  backgroundColor:
                    questionDifficultyFilter === f.id
                      ? 'var(--color-sky-deep)'
                      : 'var(--color-surface)',
                  color: questionDifficultyFilter === f.id ? '#ffffff' : 'var(--color-ink)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={styles.tableCard}>
            <div style={styles.tableResponsiveWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Enunciado de la Pregunta</th>
                    <th style={styles.th}>Curso & Tema</th>
                    <th style={styles.th}>Respuestas</th>
                    <th style={styles.th}>% Error</th>
                    <th style={styles.th}>% Acierto</th>
                    <th style={styles.th}>Dificultad Estimada</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((q) => (
                      <tr key={q.id} style={styles.tr}>
                        <td style={{ ...styles.td, maxWidth: '300px' }}>
                          <span style={styles.questionText}>{q.text}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.qCourse}>{q.courseTitle}</span>
                          <span style={styles.qTopic}>{q.topic}</span>
                        </td>
                        <td style={styles.td}>
                          <strong>{q.totalAnswers}</strong>
                        </td>
                        <td style={styles.td}>
                          <strong style={{ color: q.incorrectRate > 50 ? '#dc2626' : '#64748b' }}>
                            {q.incorrectRate}%
                          </strong>
                        </td>
                        <td style={styles.td}>
                          <strong style={{ color: q.correctRate >= 70 ? '#059669' : '#d97706' }}>
                            {q.correctRate}%
                          </strong>
                        </td>
                        <td style={styles.td}>
                          <DifficultyBadge difficulty={q.difficulty} label={q.difficultyLabel} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={styles.emptyTableTd}>
                        No se encontraron preguntas en esta categoría de dificultad.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-VISTA 4: TEMAS Y FORTALEZAS PEDAGÓGICAS (RF-08, RF-11) */}
      {/* ========================================================= */}
      {activeSubTab === 'topics' && (
        <div style={styles.sectionWrapper}>
          <div style={styles.diagSummaryGrid}>
            <div className="skylearn-card" style={styles.diagBox}>
              <div style={styles.diagHeader}>
                <Sparkles size={18} color="#059669" />
                <h4 style={{ ...styles.diagTitle, color: '#059669' }}>
                  Fortalezas Colectivas ({topicsData?.strengths?.length || 0})
                </h4>
              </div>
              <p style={styles.diagDesc}>
                Temas donde los estudiantes demuestran alto dominio (≥ 75% de acierto promedio).
              </p>
              <div style={styles.topicPillsWrap}>
                {(topicsData?.strengths || []).map((t: any, idx: number) => (
                  <span key={idx} style={styles.topicPillGreen}>
                    {t.topic} ({t.correctRate}% acierto)
                  </span>
                ))}
                {(!topicsData?.strengths || topicsData.strengths.length === 0) && (
                  <span style={styles.emptyNotice}>Aún no se registran temas con ≥ 75%</span>
                )}
              </div>
            </div>

            <div className="skylearn-card" style={styles.diagBox}>
              <div style={styles.diagHeader}>
                <AlertTriangle size={18} color="#dc2626" />
                <h4 style={{ ...styles.diagTitle, color: '#dc2626' }}>
                  Temas que Requieren Refuerzo ({topicsData?.difficulties?.length || 0})
                </h4>
              </div>
              <p style={styles.diagDesc}>
                Temas pedagógicos con alta tasa de fallos (&lt; 60% de acierto promedio).
              </p>
              <div style={styles.topicPillsWrap}>
                {(topicsData?.difficulties || []).map((t: any, idx: number) => (
                  <span key={idx} style={styles.topicPillRed}>
                    {t.topic} ({t.incorrectRate}% error)
                  </span>
                ))}
                {(!topicsData?.difficulties || topicsData.difficulties.length === 0) && (
                  <span style={styles.emptyNotice}>No hay temas críticos registrados</span>
                )}
              </div>
            </div>
          </div>

          <div style={styles.tableCard}>
            <div style={styles.tableCardHeader}>
              <h4 style={styles.tableTitle}>Todos los Temas Analizados</h4>
            </div>
            <div style={styles.tableResponsiveWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Tema Pedagógico</th>
                    <th style={styles.th}>Curso</th>
                    <th style={styles.th}>Preguntas</th>
                    <th style={styles.th}>Respuestas</th>
                    <th style={styles.th}>% Acierto</th>
                    <th style={styles.th}>Diagnóstico</th>
                  </tr>
                </thead>
                <tbody>
                  {(topicsData?.allTopics || []).map((t: any, idx: number) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={styles.td}>
                        <strong>{t.topic}</strong>
                      </td>
                      <td style={styles.td}>{t.courseTitle}</td>
                      <td style={styles.td}>{t.questionsCount}</td>
                      <td style={styles.td}>{t.totalAnswers}</td>
                      <td style={styles.td}>
                        <strong
                          style={{
                            color:
                              t.correctRate >= 75
                                ? '#059669'
                                : t.correctRate >= 60
                                ? '#0284c7'
                                : '#dc2626',
                          }}
                        >
                          {t.correctRate}%
                        </strong>
                      </td>
                      <td style={styles.td}>
                        <TopicStatusBadge status={t.status} label={t.statusLabel} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-VISTA 5: ESTUDIANTES (DESTACADOS VS DIFICULTADES RF-09,10,12) */}
      {/* ========================================================= */}
      {activeSubTab === 'students' && (
        <div style={styles.sectionWrapper}>
          <div style={styles.studentsControlBar}>
            <div style={styles.searchBox}>
              <Search size={16} color="var(--color-ink-muted)" />
              <input
                type="text"
                placeholder="Buscar estudiante por nombre o correo..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.studentCategoryFilters}>
              <button
                onClick={() => setStudentCategoryFilter('ALL')}
                style={{
                  ...styles.filterPillBtn,
                  backgroundColor:
                    studentCategoryFilter === 'ALL'
                      ? 'var(--color-sky-deep)'
                      : 'var(--color-surface)',
                  color: studentCategoryFilter === 'ALL' ? '#ffffff' : 'var(--color-ink)',
                }}
              >
                Todos ({studentsData?.allStudents?.length || 0})
              </button>
              <button
                onClick={() => setStudentCategoryFilter('TOP')}
                style={{
                  ...styles.filterPillBtn,
                  backgroundColor:
                    studentCategoryFilter === 'TOP'
                      ? 'var(--color-leaf-deep)'
                      : 'var(--color-surface)',
                  color: studentCategoryFilter === 'TOP' ? '#ffffff' : 'var(--color-ink)',
                }}
              >
                ⭐ Destacados ({studentsData?.topPerformers?.length || 0})
              </button>
              <button
                onClick={() => setStudentCategoryFilter('SUPPORT')}
                style={{
                  ...styles.filterPillBtn,
                  backgroundColor:
                    studentCategoryFilter === 'SUPPORT' ? '#dc2626' : 'var(--color-surface)',
                  color: studentCategoryFilter === 'SUPPORT' ? '#ffffff' : 'var(--color-ink)',
                }}
              >
                ⚠️ Requieren Apoyo ({studentsData?.needsSupport?.length || 0})
              </button>
            </div>
          </div>

          <div style={styles.tableCard}>
            <div style={styles.tableResponsiveWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Estudiante</th>
                    <th style={styles.th}>Cursos</th>
                    <th style={styles.th}>Clases Vistas</th>
                    <th style={styles.th}>Evaluaciones</th>
                    <th style={styles.th}>Promedio</th>
                    <th style={styles.th}>Clasificación</th>
                    <th style={styles.th}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s: any) => (
                      <tr key={s.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div>
                            <strong style={styles.studentName}>{s.name}</strong>
                            <span style={styles.studentEmail}>{s.email}</span>
                          </div>
                        </td>
                        <td style={styles.td}>{s.enrolledCoursesCount}</td>
                        <td style={styles.td}>{s.completedLessonsCount}</td>
                        <td style={styles.td}>
                          {s.totalAttempts} ({s.passedAttempts} aprobadas)
                        </td>
                        <td style={styles.td}>
                          <strong>
                            {s.averageScore !== null ? `${s.averageScore}%` : 'N/A'}
                          </strong>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.studentBadge,
                              backgroundColor:
                                s.classification === 'TOP_PERFORMER'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : s.classification === 'NEEDS_SUPPORT'
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(148, 163, 184, 0.15)',
                              color:
                                s.classification === 'TOP_PERFORMER'
                                  ? '#059669'
                                  : s.classification === 'NEEDS_SUPPORT'
                                  ? '#dc2626'
                                  : '#64748b',
                            }}
                          >
                            {s.classificationLabel}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => setSelectedStudentId(s.id)}
                            style={styles.inspectBtn}
                            title="Ver perfil académico detallado"
                          >
                            <Eye size={14} />
                            <span>Ver Perfil</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={styles.emptyTableTd}>
                        No se encontraron estudiantes según los criterios seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal con Perfil Académico Individual (RF-12) */}
      {selectedStudentId && (
        <StudentProfileModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}
    </div>
  );
};

// ==========================================
// ESTILOS RESPONSIVOS DE INTELIGENCIA ACADÉMICA
// ==========================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
  },
  filterCard: {
    padding: '16px 20px',
    backgroundColor: 'var(--color-surface-elevated, #ffffff)',
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  filterHeaderTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterTitle: {
    fontSize: '14px',
    fontWeight: 800,
    color: 'var(--color-ink, #0f172a)',
  },
  filterActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  clearFiltersBtn: {
    background: 'none',
    border: 'none',
    fontSize: '12px',
    color: 'var(--color-coral, #ef4444)',
    cursor: 'pointer',
    fontWeight: 700,
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--color-surface, #f8fafc)',
    border: '1px solid var(--color-outline, #e2e8f0)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--color-ink, #0f172a)',
    cursor: 'pointer',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  filterItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  filterLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--color-ink-muted, #64748b)',
  },
  filterInput: {
    padding: '6px 10px',
    fontSize: '12px',
    borderRadius: '6px',
    border: '1px solid var(--color-outline, #e2e8f0)',
    backgroundColor: 'var(--color-surface, #f8fafc)',
    color: 'var(--color-ink, #0f172a)',
    outline: 'none',
  },
  filterSelect: {
    padding: '6px 10px',
    fontSize: '12px',
    borderRadius: '6px',
    border: '1px solid var(--color-outline, #e2e8f0)',
    backgroundColor: 'var(--color-surface, #f8fafc)',
    color: 'var(--color-ink, #0f172a)',
    outline: 'none',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  subTabsRow: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
    borderBottom: '1px solid var(--color-outline, #e2e8f0)',
  },
  subTabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-ink-muted, #64748b)',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  subTabBtnActive: {
    backgroundColor: 'var(--color-surface-elevated, #ffffff)',
    color: 'var(--color-sky-deep, #1d4ed8)',
    boxShadow: 'var(--shadow-sm, 0 1px 4px rgba(0,0,0,0.06))',
    border: '1px solid var(--color-outline, #e2e8f0)',
  },
  sectionWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '14px',
  },
  kpiCard: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: 'var(--color-surface-elevated, #ffffff)',
  },
  kpiIconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kpiLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--color-ink-muted, #64748b)',
    display: 'block',
  },
  kpiValue: {
    fontSize: '20px',
    fontWeight: 800,
    color: 'var(--color-ink, #0f172a)',
    margin: '2px 0',
  },
  kpiSubtext: {
    fontSize: '10px',
    color: 'var(--color-ink-subtle, #94a3b8)',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '16px',
  },
  chartBox: {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-surface-elevated, #ffffff)',
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  chartTitle: {
    fontSize: '14px',
    fontWeight: 800,
    color: 'var(--color-ink, #0f172a)',
    margin: 0,
  },
  tableCard: {
    backgroundColor: 'var(--color-surface-elevated, #ffffff)',
    borderRadius: '12px',
    border: '1px solid var(--color-outline, #e2e8f0)',
    overflow: 'hidden',
  },
  tableCardHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--color-outline, #e2e8f0)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tableTitle: {
    fontSize: '14px',
    fontWeight: 800,
    color: 'var(--color-ink, #0f172a)',
    margin: 0,
  },
  tableSubtitle: {
    fontSize: '12px',
    color: 'var(--color-ink-muted, #64748b)',
  },
  tableResponsiveWrap: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '12px',
  },
  th: {
    padding: '12px 16px',
    backgroundColor: 'var(--color-surface, #f8fafc)',
    fontWeight: 700,
    color: 'var(--color-ink, #0f172a)',
    borderBottom: '1px solid var(--color-outline, #e2e8f0)',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid var(--color-outline, #e2e8f0)',
  },
  td: {
    padding: '12px 16px',
    verticalAlign: 'middle',
  },
  courseRankCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  rankBadge: {
    fontSize: '11px',
    fontWeight: 800,
    backgroundColor: 'var(--color-sky-soft, #dbeafe)',
    color: 'var(--color-sky-deep, #1d4ed8)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  tableCourseName: {
    fontSize: '13px',
    color: 'var(--color-ink, #0f172a)',
    display: 'block',
  },
  tableTeacherName: {
    fontSize: '11px',
    color: 'var(--color-ink-muted, #64748b)',
    display: 'block',
  },
  categoryBadge: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '6px',
    backgroundColor: 'var(--color-surface, #f8fafc)',
    border: '1px solid var(--color-outline, #e2e8f0)',
    color: 'var(--color-ink-muted, #64748b)',
  },
  shareProgressWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100px',
  },
  shareProgressBar: {
    height: '6px',
    backgroundColor: 'var(--color-sky, #3b82f6)',
    borderRadius: '3px',
  },
  shareText: {
    fontSize: '11px',
    fontWeight: 700,
  },
  filterInlineRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    padding: '4px 0',
  },
  inlineFilterLabel: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--color-ink, #0f172a)',
  },
  filterPillBtn: {
    border: '1px solid var(--color-outline, #e2e8f0)',
    padding: '5px 12px',
    borderRadius: '16px',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  questionText: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--color-ink, #0f172a)',
    display: 'block',
  },
  qCourse: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--color-sky-deep, #1d4ed8)',
    display: 'block',
  },
  qTopic: {
    fontSize: '11px',
    color: 'var(--color-ink-muted, #64748b)',
    display: 'block',
  },
  emptyTableTd: {
    padding: '30px',
    textAlign: 'center',
    color: 'var(--color-ink-muted, #64748b)',
  },
  diagSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '16px',
  },
  diagBox: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  diagHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  diagTitle: {
    fontSize: '14px',
    fontWeight: 800,
    margin: 0,
  },
  diagDesc: {
    fontSize: '12px',
    color: 'var(--color-ink-muted, #64748b)',
    margin: 0,
  },
  topicPillsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '6px',
  },
  topicPillGreen: {
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#059669',
    padding: '4px 10px',
    borderRadius: '12px',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  topicPillRed: {
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#dc2626',
    padding: '4px 10px',
    borderRadius: '12px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  emptyNotice: {
    fontSize: '12px',
    color: 'var(--color-ink-muted, #64748b)',
    fontStyle: 'italic',
  },
  studentsControlBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-surface, #f8fafc)',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--color-outline, #e2e8f0)',
    flex: 1,
    minWidth: '260px',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '13px',
    color: 'var(--color-ink, #0f172a)',
    width: '100%',
  },
  studentCategoryFilters: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  studentName: {
    fontSize: '13px',
    color: 'var(--color-ink, #0f172a)',
    display: 'block',
  },
  studentEmail: {
    fontSize: '11px',
    color: 'var(--color-ink-muted, #64748b)',
    display: 'block',
  },
  studentBadge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '10px',
    whiteSpace: 'nowrap',
  },
  inspectBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid var(--color-sky, #3b82f6)',
    backgroundColor: 'var(--color-sky-soft, #dbeafe)',
    color: 'var(--color-sky-deep, #1d4ed8)',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};
