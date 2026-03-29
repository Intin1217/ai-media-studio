'use client';

import { useRef, useEffect } from 'react';
import { animate } from 'animejs';

interface AnimatedCounterProps {
  value: number;
  className?: string;
  suffix?: string;
}

export function AnimatedCounter({
  value,
  className,
  suffix = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    const obj = { val: prevValue.current };
    const anim = animate(obj, {
      val: value,
      duration: 400,
      ease: 'outExpo',
      round: 1,
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = `${Math.round(obj.val)}${suffix}`;
        }
      },
    });
    prevValue.current = value;
    return () => {
      anim?.cancel();
    };
  }, [value, suffix]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
