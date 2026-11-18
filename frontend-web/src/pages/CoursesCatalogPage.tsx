// frontend-web/src/pages/CoursesCatalogPage.tsx
import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  FolderPlus,
  Compass,
  Bot,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  teacherName: string;
  modulesCount: number;
  isEnrolled?: boolean;
  isDimmed?: boolean;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  credits: number;
  subscriptionStatus: string;
}

interface CoursesCatalogPageProps {
  user: UserData;
  courses: Course[];
  onOpenCourse: (courseId: string) => void;
  onOpenQuiz?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const CoursesCatalogPage: React.FC<CoursesCatalogPageProps> = ({
  user,
  courses,
  onOpenCourse,
  onOpenQuiz,
  searchQuery,
  setSearchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Categorías reales de la base de datos
  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [courses]);

  // Cursos filtrados
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCategory = selectedCategory === 'ALL' || course.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        (course.description && course.description.toLowerCase().includes(q)) ||
        (course.teacherName && course.teacherName.toLowerCase().includes(q)) ||
        (course.category && course.category.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [courses, selectedCategory, searchQuery]);

  // Cursos en los que el estudiante ya está inscrito
  const enrolledCourses = useMemo(() => {
    return courses.filter((c) => c.isEnrolled);
  }, [courses]);

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px', width: '100%', flex: 1 }}>
      {/* Banner de Bienvenida y Estado del Usuario Autenticado */}
      <div
        className="skylearn-card"
        style={{
          padding: '24px 28px',
          marginBottom: '32px',
          borderRadius: '20px',
          border: '1px solid var(--color-outline)',
          backgroundColor: 'var(--color-surface-elevated)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              {user.role === 'STUDENT' ? (
                <span className="star-badge">⭐ {user.credits} Créditos</span>
              ) : user.role === 'TEACHER' ? (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    color: 'var(--color-sky-deep)',
                    border: '1px solid var(--color-sky)',
                  }}
                >
                  👨‍🏫 Rol Docente
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(234, 88, 12, 0.12)',
                    color: '#C2410C',
                    border: '1px solid rgba(234, 88, 12, 0.3)',
                  }}
                >
                  🛡️ Rol Administrador
                </span>
              )}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-ink-muted)',
                  border: '1px solid var(--color-outline)',
                }}
              >
                {user.subscriptionStatus === 'ACTIVE' ? 'Suscripción Pro Activa' : 'Plan Estándar'}
              </span>
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '6px' }}>
              ¡Hola, {user.name}!
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', maxWidth: '680px' }}>
              {user.role === 'STUDENT'
                ? 'Aquí tienes tu catálogo curricular completo. Accede a tus cursos inscritos o explora nuevos temas para continuar aprendiendo.'
                : 'Aquí tienes todos los cursos disponibles en el sistema. Puedes consultar cualquier temario o ir a Gestión Docente para crear y editar contenido.'}
            </p>
          </div>

          {/* Acciones Rápidas */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {user.role === 'STUDENT' ? (
              <>
                {onOpenQuiz && (
                  <button onClick={onOpenQuiz} className="btn-big-friendly" style={{ fontSize: '13px', padding: '9px 16px' }}>
                    <Compass size={15} />
                    <span>Test de Recomendación</span>
                  </button>
                )}
                <a
                  href="#/tutor"
                  className="btn-secondary"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                >
                  <Bot size={15} color="var(--color-sky)" />
                  <span>Consultar Tutor 3D</span>
                </a>
              </>
            ) : user.role === 'TEACHER' ? (
              <button
                onClick={() => {
                  window.location.hash = '#/teacher/courses';
                }}
                className="btn-big-friendly"
                style={{ fontSize: '13px', padding: '9px 16px' }}
              >
                <FolderPlus size={15} />
                <span>Ir a Gestión Docente</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Cursos en los que ya está inscrito el estudiante */}
      {user.role === 'STUDENT' && enrolledCourses.length > 0 && !searchQuery && selectedCategory === 'ALL' && (
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={18} color="var(--color-sky)" />
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Mis Cursos en Progreso</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {enrolledCourses.map((course) => (
              <div
                key={`enrolled-${course.id}`}
                className="skylearn-card"
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  border: '2px solid var(--color-sky-bright)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--color-surface-elevated)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-sky-soft)',
                        color: 'var(--color-sky-deep)',
                      }}
                    >
                      {course.category}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-leaf-soft)',
                        color: 'var(--color-leaf-deep)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={12} /> Inscrito
                    </span>
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>{course.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginBottom: '16px' }}>
                    {course.description}
                  </p>
                </div>
                <button
                  onClick={() => onOpenCourse(course.id)}
                  className="btn-big-friendly"
                  style={{ width: '100%', fontSize: '13px', padding: '9px' }}
                >
                  <span>Continuar Aprendizaje</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cabecera del Catálogo General */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>
            {user.role === 'STUDENT' ? 'Todos los Cursos Disponibles' : 'Catálogo General de Cursos'}
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--color-ink-muted)' }}>
            Mostrando {filteredCourses.length} curso(s) en la plataforma
          </span>
        </div>

        {/* Buscador Integrado */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search size={16} color="var(--color-ink-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tema, nombre o docente..."
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              borderRadius: '9999px',
              border: '1px solid var(--color-outline)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-ink)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Filtros por Categoría */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
          <button
            onClick={() => setSelectedCategory('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: selectedCategory === 'ALL' ? 'var(--color-sky)' : 'var(--color-surface)',
              color: selectedCategory === 'ALL' ? '#FFFFFF' : 'var(--color-ink-muted)',
              border: `1px solid ${selectedCategory === 'ALL' ? 'var(--color-sky)' : 'var(--color-outline)'}`,
              cursor: 'pointer',
            }}
          >
            Todos ({courses.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: selectedCategory === cat ? 'var(--color-sky)' : 'var(--color-surface)',
                color: selectedCategory === cat ? '#FFFFFF' : 'var(--color-ink-muted)',
                border: `1px solid ${selectedCategory === cat ? 'var(--color-sky)' : 'var(--color-outline)'}`,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid de Cursos */}
      {filteredCourses.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '16px',
            border: '1px dashed var(--color-outline)',
          }}
        >
          <BookOpen size={40} color="var(--color-ink-subtle)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>No se encontraron cursos</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginBottom: '14px' }}>
            Prueba buscando con otra palabra o selecciona otra categoría.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="skylearn-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1px solid var(--color-outline)',
                backgroundColor: 'var(--color-surface-elevated)',
                opacity: course.isDimmed ? 0.6 : 1,
              }}
            >
              {/* Encabezado de la Tarjeta */}
              <div
                style={{
                  height: '110px',
                  background: 'linear-gradient(135deg, #0A192F 0%, #1E293B 100%)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                }}
              >
                <GraduationCap size={40} color="#00D2FF" style={{ opacity: 0.8 }} />
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(0, 210, 255, 0.15)',
                    color: 'var(--color-electric-blue)',
                    border: '1px solid rgba(0, 210, 255, 0.3)',
                  }}
                >
                  {course.category || 'General'}
                </span>
                {course.isEnrolled && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-leaf-soft)',
                      color: 'var(--color-leaf-deep)',
                    }}
                  >
                    ✓ Inscrito
                  </span>
                )}
              </div>

              {/* Contenido */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px', lineHeight: 1.35 }}>
                    {course.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-ink-muted)',
                      lineHeight: 1.5,
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.description || 'Desarrolla habilidades fundamentales con temarios guiados paso a paso.'}
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: 'var(--color-ink-subtle)',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--color-outline)',
                      marginBottom: '14px',
                    }}
                  >
                    <span>👨‍🏫 {course.teacherName || 'Docente Skylearn'}</span>
                    <span>📚 {course.modulesCount || 1} módulo(s)</span>
                  </div>

                  <button
                    onClick={() => onOpenCourse(course.id)}
                    className="btn-big-friendly"
                    style={{ width: '100%', fontSize: '13px', padding: '9px' }}
                  >
                    <span>{course.isEnrolled ? 'Continuar Curso' : 'Ver Temario'}</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
