'use client';

import { useRef, useEffect } from 'react';
import { animate } from 'animejs';
import { useScrollReveal } from '../hooks/use-scroll-reveal';
import { ScrollReveal } from './scroll-reveal';

interface StatItem {
  id: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
  color: 'cyan' | 'purple' | 'amber';
}

const STATS: StatItem[] = [
  {
    id: 'fps',
    value: 60,
    suffix: 'fps',
    label: '실시간 감지 속도',
    description: '부드러운 실시간 영상 분석',
    color: 'cyan',
  },
  {
    id: 'classes',
    value: 80,
    suffix: '+',
    label: '객체 클래스',
    description: '다양한 객체를 정확하게 인식',
    color: 'purple',
  },
  {
    id: 'cost',
    value: 0,
    suffix: '원',
    label: '서버 비용',
    description: '브라우저에서 완전히 무료로 실행',
    color: 'amber',
  },
];

const COLOR_MAP = {
  cyan: {
    text: 'text-ai-cyan',
    border: 'border-ai-cyan/20',
    glow: 'hover:shadow-[0_0_20px_rgba(0,245,255,0.08)]',
    bg: 'from-ai-cyan/5',
  },
  purple: {
    text: 'text-ai-purple',
    border: 'border-ai-purple/20',
    glow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.08)]',
    bg: 'from-ai-purple/5',
  },
  amber: {
    text: 'text-ai-amber',
    border: 'border-ai-amber/20',
    glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.08)]',
    bg: 'from-ai-amber/5',
  },
} as const;

interface StatCardProps {
  stat: StatItem;
}

function StatCard({ stat }: StatCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const revealRef = useScrollReveal<HTMLDivElement>();
  const colors = COLOR_MAP[stat.color];

  useEffect(() => {
    if (!containerRef.current || !numberRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      if (numberRef.current) {
        numberRef.current.textContent = String(stat.value);
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = { value: 0 };
            animate(target, {
              value: stat.value,
              duration: 1800,
              ease: 'outExpo',
              onUpdate: () => {
                if (numberRef.current) {
                  numberRef.current.textContent = String(
                    Math.round(target.value),
                  );
                }
              },
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [stat.value]);

  return (
    <div ref={revealRef} className="scroll-reveal">
      <div
        ref={containerRef}
        className={`border-border bg-card bg-gradient-to-b ${colors.bg} rounded-2xl border to-transparent p-8 text-center transition-all duration-300 ${colors.border} ${colors.glow} hover:border-opacity-50`}
      >
        <div
          className={`text-5xl font-bold tabular-nums md:text-6xl ${colors.text}`}
        >
          <span ref={numberRef} aria-live="polite">
            {stat.value === 0 ? '0' : '0'}
          </span>
          <span>{stat.suffix}</span>
        </div>
        <p className="text-foreground mt-3 text-lg font-semibold">
          {stat.label}
        </p>
        <p className="text-muted-foreground mt-1 text-sm">{stat.description}</p>
      </div>
    </div>
  );
}

export function StatsSection() {
  return (
    <section
      id="stats"
      aria-labelledby="stats-heading"
      className="bg-background py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <ScrollReveal className="mb-12 text-center md:mb-16">
          <p className="text-ai-cyan mb-3 text-sm font-medium uppercase tracking-widest">
            성능 지표
          </p>
          <h2
            id="stats-heading"
            className="text-foreground text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl"
          >
            숫자로 증명하는 성능
          </h2>
          <p className="mt-4 text-sm text-gray-400 md:text-base lg:text-lg dark:text-gray-300">
            브라우저 하나로 이 모든 것이 가능합니다
          </p>
        </ScrollReveal>

        {/* 통계 카드 그리드 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STATS.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
