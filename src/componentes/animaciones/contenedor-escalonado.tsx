'use client';

import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

interface ContenedorEscalonadoProps {
  children: React.ReactNode;
  className?: string;
  retrasoEscalonado?: number;
}

export const ContenedorEscalonado: React.FC<ContenedorEscalonadoProps> = ({
  children,
  className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  retrasoEscalonado = 0.07,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const contenedorVariantes: Variants = {
    oculto: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : retrasoEscalonado,
      },
    },
  };

  return (
    <motion.div
      variants={contenedorVariantes}
      initial="oculto"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface TarjetaEscalonadaProps {
  children: React.ReactNode;
  className?: string;
}

export const TarjetaEscalonada: React.FC<TarjetaEscalonadaProps> = ({
  children,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const tarjetaVariantes: Variants = {
    oculto: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.45,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      variants={tarjetaVariantes}
      whileHover={shouldReduceMotion ? {} : { y: -2, transition: { duration: 0.18 } }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.985, transition: { duration: 0.1 } }}
      className={`transition-shadow duration-200 hover:shadow-md cursor-default ${className}`}
    >
      {children}
    </motion.div>
  );
};
