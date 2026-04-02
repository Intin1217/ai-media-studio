import { ScrollAnimation } from './scroll-animation';

export function CtaSection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="bg-card relative overflow-hidden py-24 md:py-32"
    >
      {/* Mesh gradient 배경 */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: [
            'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(14,165,233,0.08) 0%, transparent 60%)',
            'radial-gradient(ellipse 40% 40% at 20% 50%, rgba(14,165,233,0.05) 0%, transparent 50%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <ScrollAnimation>
          <h2
            id="cta-heading"
            className="text-foreground break-keep-all mb-4 text-2xl font-bold leading-snug tracking-tight md:text-3xl lg:text-4xl"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            지금 무료로 시작해 보세요
          </h2>
          <p className="text-muted-foreground break-keep-all mx-auto mb-10 max-w-[50ch] text-base md:text-lg">
            GitHub에서 소스코드를 받고, 3분 만에 나만의 AI 분석 환경을 만드세요
          </p>
          <a
            href="https://github.com/Intin1217/ai-media-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-sky-500 px-8 py-4 font-semibold text-white shadow-[0_0_60px_rgba(14,165,233,0.15)] hover:scale-[1.02] hover:shadow-[0_0_80px_rgba(14,165,233,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 active:scale-[0.98]"
            style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            GitHub에서 시작하기
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
        </ScrollAnimation>
      </div>
    </section>
  );
}
