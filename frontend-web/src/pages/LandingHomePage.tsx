// frontend-web/src/pages/LandingHomePage.tsx
import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Bot,
  ChevronRight,
  Star,
} from 'lucide-react';
import { PricingSection } from '../components/PricingSection';
import { EnterpriseSection } from '../components/EnterpriseSection';

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

interface LandingHomePageProps {
  courses: Course[];
  user: any;
  onOpenCourse: (courseId: string) => void;
  onRegisterClick: () => void;
  onLoginClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const LandingHomePage: React.FC<LandingHomePageProps> = ({
  courses,
  user,
  onOpenCourse,
  onRegisterClick,
  onLoginClick,
  searchQuery,
  setSearchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Categorías reales extraídas de los cursos existentes
  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [courses]);

  // Cursos filtrados por búsqueda y categoría
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Filtrar sólo publicados si no está matriculado
      const isPublic = course.status === 'PUBLISHED' || course.isEnrolled;
      if (!isPublic) return false;

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

  // Cursos destacados (los primeros 3 cursos reales disponibles)
  const featuredCourses = useMemo(() => {
    return courses.filter((c) => c.status === 'PUBLISHED').slice(0, 3);
  }, [courses]);

  const scrollToSection = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-ink)', minHeight: '100vh' }}>
      {/* ===================== HERO SECTION ===================== */}
      <section
        className="futuristic-hero"
        style={{
          padding: '90px 24px 80px',
          borderBottom: '1px solid rgba(0, 210, 255, 0.15)',
        }}
      >
        {/* Glow ambient background */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(0, 210, 255, 0.14) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '48px',
              alignItems: 'center',
            }}
          >
            {/* Texto Hero */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  background: 'rgba(0, 210, 255, 0.12)',
                  border: '1px solid rgba(0, 210, 255, 0.35)',
                  color: 'var(--color-electric-blue)',
                  fontSize: '13px',
                  fontWeight: 800,
                  marginBottom: '22px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <Sparkles size={14} /> Plataforma Educativa de Nueva Generación
              </div>

              <h1
                style={{
                  fontSize: 'clamp(34px, 4.5vw, 54px)',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  marginBottom: '20px',
                  color: '#FFFFFF',
                  letterSpacing: '-0.025em',
                }}
              >
                Aprende Tecnología con{' '}
                <span className="text-gradient-electric">Tutoría de IA en Tiempo Real</span>
              </h1>

              <p
                style={{
                  fontSize: '18px',
                  color: '#CBD5E1',
                  lineHeight: 1.6,
                  marginBottom: '32px',
                  maxWidth: '560px',
                }}
              >
                Cursos prácticos, evaluaciones interactivas y un <strong>Tutor Virtual 3D</strong> que te guía paso a
                paso con voz y respuestas instantáneas potenciadas por Gemini.
              </p>

              {/* Botones de Acción Hero */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '40px' }}>
                {user ? (
                  <button
                    onClick={() => scrollToSection('catalogo')}
                    className="btn-electric"
                    style={{ fontSize: '16px', padding: '13px 28px' }}
                  >
                    Ir a mis Cursos <ArrowRight size={18} />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onRegisterClick}
                      className="btn-electric"
                      style={{ fontSize: '16px', padding: '13px 28px' }}
                    >
                      Comienza gratis <ArrowRight size={18} />
                    </button>
                    <button
                      onClick={() => scrollToSection('precios')}
                      className="btn-ghost-futuristic"
                      style={{ fontSize: '16px', padding: '13px 24px' }}
                    >
                      Ver planes y precios
                    </button>
                  </>
                )}
                <a
                  href="#/tutor"
                  className="btn-ghost-futuristic"
                  style={{
                    fontSize: '15px',
                    borderColor: 'rgba(0, 210, 255, 0.4)',
                    color: 'var(--color-electric-blue)',
                  }}
                >
                  <Bot size={18} /> Probar Tutor IA 3D
                </a>
              </div>

              {/* Estadísticas Reales de la Plataforma */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '24px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#00D2FF' }}>
                    {courses.length > 0 ? `${courses.length}` : '1+'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Cursos Disponibles</div>
                </div>
                <div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#A855F7' }}>3</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Créditos de Bienvenida</div>
                </div>
                <div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#22C55E' }}>100%</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Tutoría con IA Activa</div>
                </div>
              </div>
            </div>

            {/* Showcase Visual del Tutor 3D */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                className="futuristic-glass"
                style={{
                  width: '100%',
                  maxWidth: '460px',
                  padding: '28px',
                  borderRadius: '28px',
                  border: '1px solid rgba(0, 210, 255, 0.3)',
                  boxShadow: '0 20px 50px rgba(0, 210, 255, 0.15)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#22C55E',
                        boxShadow: '0 0 10px #22C55E',
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
                      Tutor Skylearn • Conectado
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(0, 210, 255, 0.15)',
                      color: 'var(--color-electric-blue)',
                      fontWeight: 700,
                    }}
                  >
                    Gemini 2.5 Flash
                  </span>
                </div>

                <div
                  style={{
                    height: '220px',
                    borderRadius: '16px',
                    background: 'radial-gradient(circle at center, #112040 0%, #060B19 80%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Bot size={72} color="#00D2FF" style={{ filter: 'drop-shadow(0 0 16px rgba(0, 210, 255, 0.6))' }} />
                  <span
                    style={{
                      marginTop: '12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#E2E8F0',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Avatar 3D Interactivo con Sincronización Labial
                  </span>
                </div>

                <div
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '13px',
                    color: '#CBD5E1',
                    lineHeight: 1.5,
                  }}
                >
                  💬 <em>«¡Hola! Soy tu tutor interactivo. Puedes hacerme preguntas sobre tus lecciones, resolver dudas de código y practicar para tus exámenes formativos.»</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== BUSCADOR Y CATÁLOGO DE CURSOS ===================== */}
      <section id="catalogo" style={{ padding: '70px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Explora Nuestro <span className="text-gradient-electric">Catálogo Curricular</span>
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--color-ink-muted)', maxWidth: '580px', margin: '0 auto' }}>
            Cursos estructurados por docentes expertos con módulos prácticos y soporte del tutor de inteligencia artificial.
          </p>
        </div>

        {/* Barra de Búsqueda Principal (RF-03) */}
        <div style={{ maxWidth: '640px', margin: '0 auto 36px', position: 'relative' }}>
          <Search
            size={20}
            color="var(--color-ink-subtle)"
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="¿Qué quieres aprender? (Ej. React, NestJS, TypeScript...)"
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              fontSize: '15px',
              borderRadius: '9999px',
              border: '2px solid var(--color-outline)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-ink)',
              outline: 'none',
              boxShadow: 'var(--shadow-card)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-sky)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-outline)';
              e.target.style.boxShadow = 'var(--shadow-card)';
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                color: 'var(--color-ink-muted)',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Sección Cursos Destacados (RF-05) */}
        {!searchQuery && featuredCourses.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--color-sun-deep)',
                backgroundColor: 'rgba(251, 191, 36, 0.12)',
                padding: '4px 14px',
                borderRadius: '9999px',
                border: '1px solid rgba(251, 191, 36, 0.3)',
              }}
            >
              <Star size={14} color="var(--color-sun)" /> {featuredCourses.length} curso(s) destacados de la plataforma
            </span>
          </div>
        )}

        {/* Filtros por Categoría (RF-06) */}
        {categories.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              marginBottom: '40px',
            }}
          >
            <button
              onClick={() => setSelectedCategory('ALL')}
              style={{
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: selectedCategory === 'ALL' ? 'var(--color-sky)' : 'var(--color-surface)',
                color: selectedCategory === 'ALL' ? '#FFFFFF' : 'var(--color-ink-muted)',
                border: `1px solid ${selectedCategory === 'ALL' ? 'var(--color-sky)' : 'var(--color-outline)'}`,
                transition: 'all 0.15s ease',
              }}
            >
              Todos los Cursos ({courses.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: selectedCategory === cat ? 'var(--color-sky)' : 'var(--color-surface)',
                  color: selectedCategory === cat ? '#FFFFFF' : 'var(--color-ink-muted)',
                  border: `1px solid ${selectedCategory === cat ? 'var(--color-sky)' : 'var(--color-outline)'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid de Cursos (RF-04) */}
        {filteredCourses.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '20px',
              border: '1px dashed var(--color-outline)',
            }}
          >
            <BookOpen size={48} color="var(--color-ink-subtle)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              No se encontraron cursos que coincidan con tu búsqueda
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '18px' }}>
              Intenta con otra palabra clave o selecciona otra categoría.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="btn-ghost-futuristic"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Ver todos los cursos disponibles
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '28px',
            }}
          >
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="skylearn-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface-elevated)',
                  opacity: course.isDimmed ? 0.6 : 1,
                }}
              >
                {/* Portada Tecnológica (CE-06) */}
                <div
                  style={{
                    height: '140px',
                    background: 'linear-gradient(135deg, #0A192F 0%, #1E293B 100%)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                  }}
                >
                  <GraduationCap size={48} color="#00D2FF" style={{ opacity: 0.8 }} />
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '3px 10px',
                      borderRadius: '9999px',
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
                        top: '12px',
                        right: '12px',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        backgroundColor: 'var(--color-leaf-soft)',
                        color: 'var(--color-leaf-deep)',
                      }}
                    >
                      ✓ Inscrito
                    </span>
                  )}
                </div>

                {/* Contenido de la Tarjeta */}
                <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: 800,
                        marginBottom: '8px',
                        lineHeight: 1.35,
                      }}
                    >
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
                        paddingTop: '12px',
                        borderTop: '1px solid var(--color-outline)',
                        marginBottom: '16px',
                      }}
                    >
                      <span>👨‍🏫 {course.teacherName || 'Docente Skylearn'}</span>
                      <span>📚 {course.modulesCount || 1} módulos</span>
                    </div>

                    <button
                      onClick={() => {
                        if (user) {
                          onOpenCourse(course.id);
                        } else {
                          onLoginClick();
                        }
                      }}
                      className="btn-big-friendly"
                      style={{ width: '100%', fontSize: '14px', padding: '10px' }}
                    >
                      {user ? (course.isEnrolled ? 'Continuar Curso' : 'Ver Detalles del Curso') : 'Acceder para Ver Curso'}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===================== SECCIÓN DE PRECIOS ===================== */}
      <PricingSection onRegisterClick={onRegisterClick} user={user} />

      {/* ===================== SECCIÓN DE EMPRESAS ===================== */}
      <EnterpriseSection />

      {/* ===================== FOOTER MODERNO ===================== */}
      <footer
        style={{
          borderTop: '1px solid var(--color-outline)',
          backgroundColor: 'var(--color-surface)',
          padding: '48px 24px',
          fontSize: '14px',
          color: 'var(--color-ink-muted)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #00D2FF 0%, #3B82F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#060B19',
                fontWeight: 900,
              }}
            >
              S
            </div>
            <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--color-ink)' }}>Skylearn</span>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <a href="#/courses" style={{ color: 'inherit', textDecoration: 'none' }}>
              Cursos
            </a>
            <a href="#precios" style={{ color: 'inherit', textDecoration: 'none' }}>
              Precios
            </a>
            <a href="#empresas" style={{ color: 'inherit', textDecoration: 'none' }}>
              Empresas
            </a>
            <a href="#/tutor" style={{ color: 'inherit', textDecoration: 'none' }}>
              Tutor Virtual 3D
            </a>
          </div>

          <div>© {new Date().getFullYear()} Skylearn Inc. Todos los derechos reservados.</div>
        </div>
      </footer>
    </div>
  );
};
