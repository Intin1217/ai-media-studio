'use client';

import { useRef, useEffect, type ReactNode } from 'react';
import { animate } from 'animejs';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 600,
  className,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) {
      ref.current.style.opacity = '1';
      ref.current.style.transform = 'none';
      return;
    }

    animate(ref.current, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration,
      delay,
      ease: 'outCubic',
    });
  }, [delay, duration]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
