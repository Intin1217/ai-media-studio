'use client';

import { useRef, useEffect } from 'react';
import { animate, stagger } from 'animejs';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function SplitText({ text, className, delay = 0 }: SplitTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const chars =
      containerRef.current.querySelectorAll<HTMLElement>('.split-char');

    if (prefersReducedMotion) {
      chars.forEach((c) => {
        c.style.opacity = '1';
        c.style.transform = 'none';
      });
      return;
    }

    animate(chars, {
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 800,
      delay: stagger(30, { start: delay }),
      ease: 'outExpo',
    });
  }, [text, delay]);

  return (
    <span ref={containerRef} className={className} aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="split-char inline-block"
          style={{ opacity: 0 }}
          aria-hidden="true"
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
