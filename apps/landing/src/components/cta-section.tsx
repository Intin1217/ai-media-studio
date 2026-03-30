import { ScrollReveal } from './scroll-reveal';

export function CtaSection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="from-primary relative overflow-hidden bg-gradient-to-r via-[hsl(var(--ai-blue))] to-[hsl(var(--ai-purple))] py-20 md:py-28"
    >
      {/* 배경 패턴 오버레이 */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2
            id="cta-heading"
            className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl"
          >
            지금 내 컴퓨터에 설치해 보세요
          </h2>
          <p className="mt-4 text-base text-white/80 md:text-lg">
            Docker 한 줄이면 프라이빗 AI 분석 환경이 준비됩니다
          </p>
          <a
            href="https://github.com/Intin1217/ai-media-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary mt-8 inline-block rounded-lg bg-white px-8 py-3 text-base font-semibold shadow-lg shadow-black/10 transition-all duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:text-lg"
          >
            GitHub에서 설치하기
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
