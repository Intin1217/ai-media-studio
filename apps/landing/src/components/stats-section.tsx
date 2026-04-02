'use client';

import { useRef } from 'react';
import { useInView, useMotionValue, animate, motion } from 'motion/react';
import { useEffect } from 'react';

interface StatItem {
  id: string;
  value: number;
  prefix: string;
  suffix: string;
  label: string;
  description: string;
}

const STATS: StatItem[] = [
  {
    id: 'objects',
    value: 80,
    prefix: '',
    suffix: '+',
    label: '감지 가능 객체',
    description: 'COCO-SSD, MediaPipe',
  },
  {
    id: 'fps',
    value: 30,
    prefix: '',
    suffix: 'fps',
    label: '실시간 처리',
    description: '브라우저 AI 엔진',
  },
  {
    id: 'cost',
    value: 0,
    prefix: '',
    suffix: '원',
    label: 'API 비용',
    description: '로컬 실행, 완전 무료',
  },
  {
    id: 'privacy',
    value: 100,
    prefix: '',
    suffix: '%',
    label: '프라이버시',
    description: '서버 전송 없음',
  },
];

function CountingNumber({
  value,
  suffix,
  prefix,
}: {
  value: number;
  suffix: string;
  prefix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) {
      if (ref.current) ref.current.textContent = `${prefix}${value}${suffix}`;
      return;
    }

    const controls = animate(motionValue, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
    });

    const unsubscribe = motionValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.round(latest)}${suffix}`;
      }
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [isInView, value, suffix, prefix, motionValue]);

  return (
    <span
      ref={ref}
      aria-live="polite"
      className="font-extrabold tabular-nums text-sky-500"
    >
      {prefix}0{suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section
      id="stats"
      aria-labelledby="stats-heading"
      className="border-y border-white/[0.06] py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="stats-heading" className="sr-only">
          성능 지표
        </h2>
        <div className="grid grid-cols-2 gap-0 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
                delay: index * 0.1,
              }}
              className={`px-6 py-8 text-center ${
                index < STATS.length - 1
                  ? 'border-b border-r-0 border-white/[0.06] lg:border-b-0 lg:border-r'
                  : ''
              } ${index % 2 === 0 && index < STATS.length - 1 ? 'border-r border-r-white/[0.06] lg:border-r-0' : ''}`}
            >
              <div className="mb-2 text-4xl leading-none md:text-5xl">
                <CountingNumber
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                />
              </div>
              <p className="text-foreground mt-1 text-sm font-semibold md:text-base">
                {stat.label}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs md:text-sm">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
