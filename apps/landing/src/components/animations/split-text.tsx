'use client';

import { motion } from 'motion/react';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  charClassName?: string;
}

const containerVariants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: {
      staggerChildren: 0.03,
      delayChildren: delay / 1000,
    },
  }),
};

const charVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export function SplitText({
  text,
  className,
  delay = 0,
  charClassName,
}: SplitTextProps) {
  return (
    <motion.span
      className={className}
      aria-label={text}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className={`inline-block${charClassName ? ` ${charClassName}` : ''}`}
          variants={charVariants}
          aria-hidden="true"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
