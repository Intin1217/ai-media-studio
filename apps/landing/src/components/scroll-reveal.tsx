'use client';

import { useScrollReveal } from '../hooks/use-scroll-reveal';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: string;
  className?: string;
}

export function ScrollReveal({
  children,
  delay,
  className = '',
}: ScrollRevealProps) {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${className}`}
      style={delay ? { transitionDelay: delay } : undefined}
    >
      {children}
    </div>
  );
}
