'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface TransicionPaginaProps {
  children: React.ReactNode;
  className?: string;
}

export const TransicionPagina: React.FC<TransicionPaginaProps> = ({
  children,
  className = 'space-y-6',
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
      transition={{
        duration: 0.4,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
