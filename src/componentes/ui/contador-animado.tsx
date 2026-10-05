'use client';

import React, { useEffect, useState } from 'react';

interface ContadorAnimadoProps {
  valor: number;
  duracionMs?: number;
  decimales?: number;
  sufijo?: string;
  prefijo?: string;
  className?: string;
}

export const ContadorAnimado: React.FC<ContadorAnimadoProps> = ({
  valor,
  duracionMs = 850,
  decimales = 0,
  sufijo = '',
  prefijo = '',
  className = '',
}) => {
  const [conteo, setConteo] = useState(0);

  useEffect(() => {
    // Respetar prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setConteo(valor);
      return;
    }

    let inicioTimestamp: number | null = null;
    let animacionFrameId: number;

    const animar = (timestamp: number) => {
      if (!inicioTimestamp) inicioTimestamp = timestamp;
      const progreso = Math.min((timestamp - inicioTimestamp) / duracionMs, 1);
      
      // Easing cúbico suave: easeOutCubic (1 - (1 - t)^3)
      const factorSuave = 1 - Math.pow(1 - progreso, 3);
      const valorActual = factorSuave * valor;

      setConteo(valorActual);

      if (progreso < 1) {
        animacionFrameId = requestAnimationFrame(animar);
      } else {
        setConteo(valor);
      }
    };

    animacionFrameId = requestAnimationFrame(animar);

    return () => {
      cancelAnimationFrame(animacionFrameId);
    };
  }, [valor, duracionMs]);

  const valorFormateado = conteo.toLocaleString('es-CL', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });

  return (
    <span className={`tabular-nums ${className}`}>
      {prefijo}{valorFormateado}{sufijo}
    </span>
  );
};
