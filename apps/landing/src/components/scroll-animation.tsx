'use client';

import { motion, useReducedMotion } from 'motion/react';

interface ScrollAnimationProps {
  children: React.ReactNode;
  direction?: 'up' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function ScrollAnimation({
  children,
  direction = 'up',
  delay = 0,
  className,
}: ScrollAnimationProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  const initial = {
    opacity: 0,
    ...(direction === 'up' && { y: 32 }),
    ...(direction === 'left' && { x: -40 }),
    ...(direction === 'right' && { x: 40 }),
  };

  const animate = {
    opacity: 1,
    y: 0,
    x: 0,
  };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
