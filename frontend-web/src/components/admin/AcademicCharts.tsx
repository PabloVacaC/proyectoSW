// frontend-web/src/components/admin/AcademicCharts.tsx
import React, { useState } from 'react';

// ==========================================
// 1. GRÁFICO DE BARRAS RESPONSIVO (SVG/CSS)
// ==========================================

export interface BarChartItem {
  id: string;
  label: string;
  value: number;
  secondaryLabel?: string;
  color?: string;
}

interface ResponsiveBarChartProps {
  data: BarChartItem[];
  height?: number;
  valueUnit?: string;
}

export const ResponsiveBarChart: React.FC<ResponsiveBarChartProps> = ({
  data,
  height = 240,
  valueUnit = 'alumnos',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={chartStyles.emptyContainer}>
        <span style={chartStyles.emptyText}>No hay datos suficientes para graficar</span>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={{ ...chartStyles.container, height: `${height}px` }}>
      <div style={chartStyles.barGrid}>
        {data.map((item, idx) => {
          const heightPercent = Math.max(8, Math.round((item.value / maxValue) * 100));
          const isHovered = hoveredIdx === idx;
          const barColor = item.color || 'var(--color-sky-deep, #1d4ed8)';

          return (
            <div
              key={item.id || idx}
              style={chartStyles.barColumn}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip flotante al pasar el cursor */}
              {isHovered && (
                <div style={chartStyles.tooltip}>
                  <strong style={chartStyles.tooltipTitle}>{item.label}</strong>
                  <span style={chartStyles.tooltipVal}>
                    {item.value} {valueUnit} {item.secondaryLabel ? `(${item.secondaryLabel})` : ''}
                  </span>
                </div>
              )}

              {/* Valor encima de la barra */}
              <span style={chartStyles.valueTop}>{item.value}</span>

              {/* Contenedor de la barra vertical */}
              <div style={chartStyles.barTrack}>
                <div
                  style={{
                    ...chartStyles.barFill,
                    height: `${heightPercent}%`,
                    backgroundColor: barColor,
                    filter: isHovered ? 'brightness(1.15)' : 'none',
                  }}
                />
              </div>

              {/* Etiqueta inferior con truncado inteligente */}
              <span style={chartStyles.barLabel} title={item.label}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 2. GRÁFICO CIRCULAR / DONUT RESPONSIVO
// ==========================================

export interface DonutSlice {
  name: string;
  count: number;
  percentage: number;
  color?: string;
}

interface ResponsiveDonutChartProps {
  data: DonutSlice[];
  title?: string;
}

const DEFAULT_DONUT_COLORS = [
  '#0284c7', // Sky Deep
  '#10b981', // Emerald Leaf
  '#8b5cf6', // Purple Berry
  '#f59e0b', // Amber Sun
  '#ec4899', // Pink Coral
  '#06b6d4', // Cyan
];

export const ResponsiveDonutChart: React.FC<ResponsiveDonutChartProps> = ({
  data,
  title = 'Distribución',
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<DonutSlice | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={chartStyles.emptyContainer}>
        <span style={chartStyles.emptyText}>Sin distribución disponible</span>
      </div>
    );
  }

  // Cálculo de segmentos para SVG donut (circunferencia = 2 * PI * r = 2 * PI * 40 ≈ 251.32)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const totalCount = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div style={chartStyles.donutContainer}>
      <div style={chartStyles.donutSvgWrapper}>
        <svg viewBox="0 0 120 120" style={chartStyles.donutSvg}>
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="var(--color-outline, #e2e8f0)"
            strokeWidth="16"
          />
          {data.map((slice, idx) => {
            const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += slice.percentage;
            const sliceColor = slice.color || DEFAULT_DONUT_COLORS[idx % DEFAULT_DONUT_COLORS.length];

            return (
              <circle
                key={slice.name || idx}
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={sliceColor}
                strokeWidth={hoveredSlice?.name === slice.name ? '20' : '16'}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{
                  transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                  cursor: 'pointer',
                  opacity: hoveredSlice && hoveredSlice.name !== slice.name ? 0.5 : 1,
                }}
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            );
          })}
        </svg>

        {/* Resumen central del Donut */}
        <div style={chartStyles.donutCenterText}>
          <span style={chartStyles.donutCenterVal}>
            {hoveredSlice ? `${hoveredSlice.percentage}%` : totalCount}
          </span>
          <span style={chartStyles.donutCenterLabel}>
            {hoveredSlice ? hoveredSlice.name : title}
          </span>
        </div>
      </div>

      {/* Leyenda interactiva responsiva */}
      <div style={chartStyles.legendList}>
        {data.map((slice, idx) => {
          const sliceColor = slice.color || DEFAULT_DONUT_COLORS[idx % DEFAULT_DONUT_COLORS.length];
          const isSelected = hoveredSlice?.name === slice.name;

          return (
            <div
              key={slice.name || idx}
              style={{
                ...chartStyles.legendItem,
                backgroundColor: isSelected ? 'var(--color-sky-soft)' : 'transparent',
              }}
              onMouseEnter={() => setHoveredSlice(slice)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div style={chartStyles.legendLeft}>
                <span style={{ ...chartStyles.legendDot, backgroundColor: sliceColor }} />
                <span style={chartStyles.legendName}>{slice.name}</span>
              </div>
              <div style={chartStyles.legendRight}>
                <span style={chartStyles.legendCount}>{slice.count}</span>
                <span style={chartStyles.legendPercent}>{slice.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 3. INSIGNIAS DE DIFICULTAD Y ESTADO
// ==========================================

export const DifficultyBadge: React.FC<{ difficulty: string; label?: string }> = ({
  difficulty,
  label,
}) => {
  let bg = 'rgba(148, 163, 184, 0.15)';
  let color = '#64748b';
  let text = label || 'Sin Datos';

  switch (difficulty) {
    case 'LOW':
      bg = 'rgba(16, 185, 129, 0.15)';
      color = '#059669';
      text = label || 'Baja Dificultad';
      break;
    case 'MEDIUM':
      bg = 'rgba(245, 158, 11, 0.15)';
      color = '#d97706';
      text = label || 'Media';
      break;
    case 'HIGH':
      bg = 'rgba(239, 68, 68, 0.15)';
      color = '#dc2626';
      text = label || 'Alta';
      break;
    case 'CRITICAL':
      bg = 'rgba(220, 38, 38, 0.25)';
      color = '#991b1b';
      text = label || 'Muy Alta / Crítica';
      break;
    case 'INSUFFICIENT_DATA':
    default:
      bg = 'rgba(148, 163, 184, 0.15)';
      color = '#64748b';
      text = label || 'Muestra Insuficiente';
      break;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 700,
        backgroundColor: bg,
        color,
        border: `1px solid ${color}33`,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
};

export const TopicStatusBadge: React.FC<{ status: string; label?: string }> = ({
  status,
  label,
}) => {
  let bg = 'rgba(148, 163, 184, 0.15)';
  let color = '#64748b';
  let text = label || 'Insuficiente';

  switch (status) {
    case 'STRENGTH':
      bg = 'rgba(16, 185, 129, 0.15)';
      color = '#059669';
      text = label || 'Fortaleza Colectiva';
      break;
    case 'NEUTRAL':
      bg = 'rgba(2, 132, 199, 0.15)';
      color = '#0284c7';
      text = label || 'Rendimiento Aceptable';
      break;
    case 'NEEDS_HELP':
      bg = 'rgba(239, 68, 68, 0.15)';
      color = '#dc2626';
      text = label || 'Requiere Refuerzo';
      break;
    default:
      bg = 'rgba(148, 163, 184, 0.15)';
      color = '#64748b';
      text = label || 'Muestra Insuficiente';
      break;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 700,
        backgroundColor: bg,
        color,
        border: `1px solid ${color}33`,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
};

// ==========================================
// ESTILOS DE LOS GRÁFICOS
// ==========================================

const chartStyles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    padding: '10px 0',
  },
  barGrid: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '12px',
    height: '100%',
    width: '100%',
    paddingBottom: '24px',
    borderBottom: '1px solid var(--color-outline, #e2e8f0)',
  },
  barColumn: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    cursor: 'pointer',
    minWidth: '40px',
  },
  barTrack: {
    width: '100%',
    maxWidth: '36px',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    backgroundColor: 'var(--color-surface, #f8fafc)',
    borderRadius: '6px 6px 0 0',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: '6px 6px 0 0',
    transition: 'height 0.4s ease, filter 0.2s ease',
  },
  valueTop: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--color-ink, #0f172a)',
    marginBottom: '4px',
  },
  barLabel: {
    position: 'absolute',
    bottom: '-22px',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--color-ink-muted, #64748b)',
    maxWidth: '85px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
  },
  tooltip: {
    position: 'absolute',
    top: '-38px',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    zIndex: 10,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  tooltipTitle: {
    fontWeight: 700,
  },
  tooltipVal: {
    fontSize: '10px',
    color: '#93c5fd',
  },
  emptyContainer: {
    height: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-surface, #f8fafc)',
    borderRadius: '8px',
    border: '1px dashed var(--color-outline, #e2e8f0)',
  },
  emptyText: {
    fontSize: '12px',
    color: 'var(--color-ink-muted, #64748b)',
  },
  donutContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    flexWrap: 'wrap',
    padding: '12px 0',
  },
  donutSvgWrapper: {
    position: 'relative',
    width: '160px',
    height: '160px',
    flexShrink: 0,
  },
  donutSvg: {
    width: '100%',
    height: '100%',
  },
  donutCenterText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    textAlign: 'center',
    padding: '0 10px',
  },
  donutCenterVal: {
    fontSize: '20px',
    fontWeight: 800,
    color: 'var(--color-ink, #0f172a)',
  },
  donutCenterLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--color-ink-muted, #64748b)',
    maxWidth: '90px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  legendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    minWidth: '180px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  legendLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendName: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-ink, #0f172a)',
  },
  legendRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendCount: {
    fontSize: '12px',
    color: 'var(--color-ink-muted, #64748b)',
  },
  legendPercent: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--color-sky-deep, #1d4ed8)',
  },
};
