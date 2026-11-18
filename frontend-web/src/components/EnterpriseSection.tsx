// frontend-web/src/components/EnterpriseSection.tsx
import React, { useState } from 'react';
import { Building2, BarChart3, Bot, CheckCircle2, Send, Shield } from 'lucide-react';

export const EnterpriseSection: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    workEmail: '',
    teamSize: '10-50',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.workEmail) return;
    setSubmitted(true);
  };

  return (
    <section id="empresas" style={{ padding: '80px 24px', position: 'relative' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818CF8',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <Building2 size={14} /> Skylearn para Empresas y Organizaciones
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '14px', letterSpacing: '-0.02em' }}>
            Potencia el Talento de tu Equipo con <span className="text-gradient-electric">Tutoría Inteligente</span>
          </h2>
          <p style={{ fontSize: '18px', color: 'var(--color-ink-muted)', maxWidth: '680px', margin: '0 auto' }}>
            Capacitación técnica acelerada con métricas en tiempo real y tutores virtuales 3D entrenados con el contexto de tu organización.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center',
          }}
        >
          {/* Columna Izquierda: Beneficios B2B */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="futuristic-glass" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(0, 210, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-electric-blue)',
                  flexShrink: 0,
                }}
              >
                <Bot size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>Tutores IA Adaptativos para Equipos</h4>
                <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)' }}>
                  Cada colaborador cuenta con retroalimentación personalizada 24/7 y resolución interactiva de dudas mediante voz y 3D.
                </p>
              </div>
            </div>

            <div className="futuristic-glass" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#C084FC',
                  flexShrink: 0,
                }}
              >
                <BarChart3 size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>Dashboard Pedagógico y Semáforo de Habilidades</h4>
                <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)' }}>
                  Líderes técnicos y de RRHH monitorean el avance, competencias dominadas y áreas de refuerzo de su equipo.
                </p>
              </div>
            </div>

            <div className="futuristic-glass" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-leaf)',
                  flexShrink: 0,
                }}
              >
                <Shield size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>Rutas Formativas a Medida</h4>
                <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)' }}>
                  Diseña temarios curriculares y evaluaciones a la medida de tu stack tecnológico y estándares de la empresa.
                </p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Formulario de Contacto / Demo */}
          <div
            className="futuristic-glass"
            style={{
              padding: '36px',
              borderRadius: '24px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <CheckCircle2 size={56} color="var(--color-leaf)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>¡Solicitud Recibida con Éxito!</h3>
                <p style={{ fontSize: '15px', color: 'var(--color-ink-muted)', marginBottom: '20px' }}>
                  Un asesor de Skylearn Empresas se pondrá en contacto con <strong>{formData.workEmail}</strong> en las próximas 24 horas para coordinar tu demo personalizada.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-ghost-futuristic"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  Enviar otra consulta
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
                  Solicita una Demostración para tu Organización
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginBottom: '10px' }}>
                  Planes flexibles para equipos a partir de 5 colaboradores.
                </p>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Nombre de la Empresa u Organización *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Ej. Tech Innovators Corp"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--color-outline)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--color-ink)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Correo Electrónico Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.workEmail}
                    onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                    placeholder="nombre@empresa.com"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--color-outline)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--color-ink)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Tamaño del Equipo a Capacitar
                  </label>
                  <select
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--color-outline)',
                      background: 'var(--color-surface)',
                      color: 'var(--color-ink)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  >
                    <option value="5-15">5 a 15 personas</option>
                    <option value="16-50">16 a 50 personas</option>
                    <option value="51-200">51 a 200 personas</option>
                    <option value="200+">Más de 200 personas</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Mensaje o requerimiento técnico (opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="¿Qué temas o habilidades buscan potenciar en su equipo?"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--color-outline)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--color-ink)',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-electric"
                  style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '15px', marginTop: '6px' }}
                >
                  Solicitar Demo Empresarial <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
