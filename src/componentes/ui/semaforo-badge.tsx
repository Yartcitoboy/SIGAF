import React from 'react';
import { EstadoSemaforo } from '@/tipos/database';
import { AlertCircle, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface SemaforoBadgeProps {
  estado: EstadoSemaforo | string | null | undefined;
  diasRestantes?: number;
  mostrarIcono?: boolean;
  tamano?: 'sm' | 'md' | 'lg';
}

export const SemaforoBadge: React.FC<SemaforoBadgeProps> = ({
  estado,
  diasRestantes,
  mostrarIcono = true,
  tamano = 'md',
}) => {
  const getStyles = () => {
    switch (estado?.toUpperCase()) {
      case 'VENCIDO':
        return {
          bg: 'bg-red-950/20 text-red-700 border-red-600/40 dark:bg-red-950/40 dark:text-red-400',
          dot: 'bg-red-600 animate-pulse',
          icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
          texto: 'CADUCADO',
        };
      case 'ROJO':
        return {
          bg: 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800',
          dot: 'bg-red-500',
          icon: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
          texto: 'CRÍTICO (<30d)',
        };
      case 'AMARILLO':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
          dot: 'bg-amber-500',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
          texto: 'PREVENTIVO (30-90d)',
        };
      case 'VERDE':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          texto: 'VIGENTE (>90d)',
        };
    }
  };

  const style = getStyles();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[tamano];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs ${sizeClasses} ${style.bg}`}
    >
      {mostrarIcono && style.icon}
      <span>{style.texto}</span>
      {diasRestantes !== undefined && (
        <span className="font-mono text-[11px] opacity-80">
          ({diasRestantes <= 0 ? `${Math.abs(diasRestantes)}d vencido` : `${diasRestantes}d`})
        </span>
      )}
    </span>
  );
};
