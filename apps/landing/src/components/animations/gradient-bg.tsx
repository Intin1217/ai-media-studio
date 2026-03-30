'use client';

import { useRef, useEffect } from 'react';
import { animate } from 'animejs';

interface GradientBgProps {
  className?: string;
}

export function GradientBg({ className }: GradientBgProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) return;

    const anim = animate(ref.current, {
      backgroundPositionX: ['0%', '100%', '0%'],
      duration: 8000,
      ease: 'inOutSine',
      loop: true,
    });
    return () => {
      anim?.cancel();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        background:
          'linear-gradient(135deg, hsl(180 100% 50% / 0.15), hsl(240 100% 60% / 0.15), hsl(280 100% 60% / 0.15), hsl(180 100% 50% / 0.15))',
        backgroundSize: '300% 300%',
      }}
    />
  );
}
