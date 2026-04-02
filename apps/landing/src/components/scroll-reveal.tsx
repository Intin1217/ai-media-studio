'use client';

// scroll-reveal.tsx — ScrollAnimation을 re-export하는 호환 래퍼
import { ScrollAnimation } from './scroll-animation';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: string;
  className?: string;
}

export function ScrollReveal({
  children,
  delay,
  className,
}: ScrollRevealProps) {
  // delay는 기존 코드에서 CSS delay string ('0ms', '150ms' 등)으로 전달됨
  const delaySeconds = delay ? parseInt(delay, 10) / 1000 : 0;

  return (
    <ScrollAnimation delay={delaySeconds} className={className}>
      {children}
    </ScrollAnimation>
  );
}
