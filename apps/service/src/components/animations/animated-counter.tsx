'use client';

import { useRef, useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  className?: string;
  suffix?: string;
}

// easeOutExpo: 1 - 2^(-10t)
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function AnimatedCounter({
  value,
  className,
  suffix = '',
}: AnimatedCounterProps) {
  const [displayed, setDisplayed] = useState(value);
  const prevValueRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const from = prevValueRef.current;
    const to = value;
    prevValueRef.current = value;

    if (prefersReducedMotion || from === to) {
      setDisplayed(to);
      return;
    }

    const duration = 400;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = Math.round(from + (to - from) * eased);
      setDisplayed(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value]);

  return (
    <span className={className}>
      {displayed}
      {suffix}
    </span>
  );
}
