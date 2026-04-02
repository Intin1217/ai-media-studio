'use client';

import { motion } from 'motion/react';

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      delay,
    },
  }),
};

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[100dvh] items-center overflow-hidden"
      aria-label="히어로 섹션"
    >
      {/* Mesh gradient 배경 */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(14,165,233,0.07) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(14,165,233,0.05) 0%, transparent 50%)',
            'radial-gradient(ellipse 50% 70% at 50% 100%, rgba(14,165,233,0.04) 0%, transparent 60%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-32 pt-40 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
          {/* 좌측 60% */}
          <div className="min-w-0 flex-[3]">
            {/* Eyebrow pill */}
            <motion.div
              variants={FADE_UP_VARIANTS}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <span className="mb-6 inline-flex items-center rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-500">
                온프레미스 AI 분석
              </span>
            </motion.div>

            {/* h1 */}
            <motion.h1
              variants={FADE_UP_VARIANTS}
              initial="hidden"
              animate="visible"
              custom={0.08}
              className="break-keep-all text-foreground mb-6 text-4xl font-extrabold leading-snug tracking-tight md:text-5xl lg:text-6xl"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              브라우저 안에서
              <br />
              완결되는 AI
            </motion.h1>

            {/* subtitle */}
            <motion.p
              variants={FADE_UP_VARIANTS}
              initial="hidden"
              animate="visible"
              custom={0.16}
              className="text-muted-foreground break-keep-all mb-10 max-w-[55ch] text-base leading-relaxed md:text-lg"
            >
              웹캠 영상을 서버에 보내지 않습니다. 80종 객체 감지, 얼굴 분석, PDF
              번역까지 모두 당신의 브라우저에서 실행됩니다.
            </motion.p>

            {/* CTA 버튼 */}
            <motion.div
              variants={FADE_UP_VARIANTS}
              initial="hidden"
              animate="visible"
              custom={0.24}
              className="flex flex-col gap-4 sm:flex-row"
            >
              {/* Primary CTA */}
              <a
                href="https://github.com/Intin1217/ai-media-studio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-sky-500 px-8 py-4 font-semibold text-white hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 active:scale-[0.98]"
                style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                무료로 시작하기
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15"
                  aria-hidden="true"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </a>

              {/* Ghost CTA */}
              <a
                href="https://github.com/Intin1217/ai-media-studio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.04] px-8 py-4 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-white/10 hover:scale-[1.02] hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 active:scale-[0.98]"
                style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            </motion.div>
          </div>

          {/* 우측 40% — Double-Bezel 앱 프리뷰 */}
          <motion.div
            className="mt-16 min-w-0 flex-[2] lg:mt-0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            {/* 외부 쉘 */}
            <div className="animate-float rounded-2xl bg-white/[0.04] p-1.5 ring-1 ring-white/10">
              {/* 내부 코어 */}
              <div className="overflow-hidden rounded-[calc(1rem-0.375rem)] bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-3">
                  <span
                    className="h-3 w-3 rounded-full bg-red-500/70"
                    aria-hidden="true"
                  />
                  <span
                    className="h-3 w-3 rounded-full bg-yellow-500/70"
                    aria-hidden="true"
                  />
                  <span
                    className="h-3 w-3 rounded-full bg-green-500/70"
                    aria-hidden="true"
                  />
                  <span
                    className="text-muted-foreground ml-3 text-xs"
                    aria-hidden="true"
                  >
                    AI Media Studio — 로컬 AI 분석
                  </span>
                </div>

                {/* 앱 UI 와이어프레임 */}
                <div
                  className="relative flex aspect-video"
                  style={{
                    background:
                      'linear-gradient(135deg, hsl(0 0% 5%), hsl(0 0% 8%), hsl(0 0% 6%))',
                  }}
                  aria-label="서비스 미리보기"
                >
                  {/* 사이드바 */}
                  <div
                    className="flex w-12 flex-col items-center gap-3 border-r border-white/[0.06] pt-4"
                    aria-hidden="true"
                  >
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-6 w-6 rounded-md ${i === 0 ? 'bg-sky-500/20' : 'bg-white/[0.06]'}`}
                      />
                    ))}
                  </div>

                  {/* 메인 영역 */}
                  <div className="relative flex-1 p-4" aria-hidden="true">
                    {/* 감지 박스 */}
                    <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 md:h-36 md:w-36">
                      <div className="absolute inset-0 animate-pulse rounded-lg border-2 border-sky-500/60" />
                      <div className="absolute inset-3 animate-pulse rounded-lg border border-sky-500/30 [animation-delay:0.5s]" />
                      <div className="flex h-full items-center justify-center">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          className="text-sky-500/30"
                        >
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      </div>
                    </div>

                    {/* 감지 레이블 패널 */}
                    <div
                      className="absolute right-4 top-4 flex flex-col gap-1.5"
                      aria-hidden="true"
                    >
                      {['person 98%', 'car 87%', 'dog 72%'].map((label) => (
                        <div
                          key={label}
                          className="bg-card/80 rounded-md border border-sky-500/20 px-2.5 py-1 text-[10px] text-gray-300"
                        >
                          {label}
                        </div>
                      ))}
                    </div>

                    {/* FPS 배지 */}
                    <div
                      className="bg-card/80 absolute bottom-4 left-4 rounded-full border border-sky-500/30 px-3 py-1 text-[10px] font-medium"
                      aria-hidden="true"
                    >
                      <span className="text-sky-500">30fps</span>
                      <span className="text-muted-foreground ml-1">실시간</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 스크롤 인디케이터 */}
      <a
        href="#features"
        className="text-muted-foreground absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce transition-colors duration-200 hover:text-sky-500"
        aria-label="아래로 스크롤"
        style={{ transition: 'color 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </a>
    </section>
  );
}
