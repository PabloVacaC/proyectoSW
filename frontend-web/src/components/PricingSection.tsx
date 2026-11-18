// frontend-web/src/components/PricingSection.tsx
import React, { useState } from 'react';
import { Check, Sparkles, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { PaywallModal } from './PaywallModal';

interface PricingSectionProps {
  onRegisterClick?: () => void;
  user?: any;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onRegisterClick, user }) => {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <section id="precios" style={{ padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(0, 210, 255, 0.05) 50%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(0, 210, 255, 0.1)',
              border: '1px solid rgba(0, 210, 255, 0.3)',
              color: 'var(--color-electric-blue)',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <Zap size={14} /> Planes y Precios Transparentes
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '14px', letterSpacing: '-0.02em' }}>
            Invierte en tu <span className="text-gradient-electric">Futuro Profesional</span>
          </h2>
          <p style={{ fontSize: '18px', color: 'var(--color-ink-muted)', maxWidth: '640px', margin: '0 auto' }}>
            Empieza hoy sin costo con 3 créditos incluidos o desbloquea el potencial ilimitado de nuestro Tutor Virtual 3D.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            alignItems: 'stretch',
          }}
        >
          {/* Plan 1: Gratuito */}
          <div
            className="futuristic-glass"
            style={{
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: '24px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Plan Explorador</h3>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--color-ink-muted)',
                  }}
                >
                  Gratis
                </span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '24px' }}>
                Ideal para conocer la plataforma y explorar los fundamentos con asistencia de IA.
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '28px' }}>
                <span style={{ fontSize: '48px', fontWeight: 900 }}>$0</span>
                <span style={{ fontSize: '14px', color: 'var(--color-ink-muted)' }}>/ para siempre</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <Check size={18} color="var(--color-leaf)" />
                  <span><strong>3 Créditos de Bienvenida</strong> incluidos</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <Check size={18} color="var(--color-leaf)" />
                  <span>Acceso al catálogo de cursos publicados</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <Check size={18} color="var(--color-leaf)" />
                  <span>Interacción formativa con el Tutor IA 3D</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <Check size={18} color="var(--color-leaf)" />
                  <span>Evaluaciones y exámenes interactivos</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--color-ink-muted)' }}>
                  <Check size={18} color="var(--color-ink-faint)" />
                  <span>Soporte por correo electrónico</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (user) {
                  window.location.hash = '#/courses';
                } else if (onRegisterClick) {
                  onRegisterClick();
                } else {
                  window.location.hash = '#/auth';
                }
              }}
              className="btn-ghost-futuristic"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            >
              {user ? 'Explorar Cursos' : 'Comienza gratis'} <ArrowRight size={16} />
            </button>
          </div>

          {/* Plan 2: Pro Ilimitado (Destacado) */}
          <div
            className="futuristic-glass"
            style={{
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: '24px',
              border: '2px solid rgba(0, 210, 255, 0.45)',
              boxShadow: '0 12px 36px rgba(0, 210, 255, 0.18)',
              position: 'relative',
              background: 'linear-gradient(145deg, rgba(13, 23, 48, 0.9) 0%, rgba(20, 10, 48, 0.85) 100%)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-13px',
                right: '28px',
                background: 'linear-gradient(90deg, #00D2FF 0%, #A855F7 100%)',
                color: '#060B19',
                fontSize: '11px',
                fontWeight: 900,
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: '9999px',
                letterSpacing: '0.05em',
                boxShadow: '0 2px 10px rgba(0, 210, 255, 0.4)',
              }}
            >
              ★ Más Popular
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Plan Skylearn Pro</h3>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    background: 'rgba(0, 210, 255, 0.15)',
                    color: 'var(--color-electric-blue)',
                    border: '1px solid rgba(0, 210, 255, 0.3)',
                  }}
                >
                  Ilimitado
                </span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '24px' }}>
                Acceso irrestricto a todas las lecciones, exámenes certificados y tutoría de voz sin límite.
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '28px' }}>
                <span style={{ fontSize: '48px', fontWeight: 900, color: '#00D2FF' }}>$9.99</span>
                <span style={{ fontSize: '14px', color: 'var(--color-ink-muted)' }}>/ mes</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <Sparkles size={18} color="#00D2FF" />
                  <span><strong>Créditos ilimitados</strong> en todas las lecciones</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <Sparkles size={18} color="#00D2FF" />
                  <span><strong>Tutor Virtual 3D sin restricciones</strong> con voz en tiempo real</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <Check size={18} color="var(--color-leaf)" />
                  <span>Acceso prioritario a nuevos cursos publicados</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <Check size={18} color="var(--color-leaf)" />
                  <span>Certificaciones de finalización verificadas</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <ShieldCheck size={18} color="var(--color-leaf)" />
                  <span>Garantía de satisfacción y soporte 24/7</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  if (onRegisterClick) onRegisterClick();
                  else window.location.hash = '#/auth';
                } else {
                  setShowPaywall(true);
                }
              }}
              className="btn-electric"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            >
              {user?.subscriptionStatus === 'ACTIVE' ? 'Suscripción Activa' : 'Suscribirme a Skylearn Pro'} <Zap size={16} />
            </button>
          </div>
        </div>
      </div>

      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onSuccess={() => {
            setShowPaywall(false);
          }}
        />
      )}
    </section>
  );
};
