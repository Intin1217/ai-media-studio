import { ScrollReveal } from './scroll-reveal';

const FEATURES = [
  {
    id: 'realtime-ai',
    title: '실시간 AI 분석',
    description:
      '웹캠 영상을 TensorFlow.js가 실시간으로 분석합니다. 서버 없이 브라우저에서 직접 처리합니다.',
    icon: (
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
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
        <path d="M18 5l1-2" strokeWidth="1.5" />
        <circle cx="19.5" cy="2.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'privacy',
    title: '완전한 프라이버시',
    description:
      '모든 데이터가 브라우저 내에서 처리됩니다. 영상이 외부 서버로 전송되지 않아 안심할 수 있습니다.',
    icon: (
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    id: 'dashboard',
    title: '실시간 통계 대시보드',
    description:
      '감지된 객체를 실시간 차트와 통계로 시각화합니다. 분석 결과를 한눈에 파악하세요.',
    icon: (
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
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
        <polyline points="2 10 7 5 12 8 17 3" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'performance',
    title: '빠른 성능',
    description:
      'WebGL 가속을 활용한 최적화된 추론 엔진으로 부드러운 실시간 분석을 제공합니다.',
    icon: (
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
        <circle cx="12" cy="12" r="10" />
        <polyline points="13 2 13 9 17 9 11 22 11 15 7 15" />
      </svg>
    ),
  },
];

const DELAYS = ['0ms', '100ms', '200ms', '300ms'];

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="bg-muted/50 py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <ScrollReveal className="mb-12 text-center md:mb-16">
          <p className="text-ai-cyan mb-3 text-sm font-medium uppercase tracking-widest">
            주요 기능
          </p>
          <h2
            id="features-heading"
            className="text-foreground text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl"
          >
            강력하고 직관적인 AI 분석
          </h2>
          <p className="text-muted-foreground mt-4 text-sm md:text-base lg:text-lg">
            복잡한 설정 없이, 브라우저만으로 시작하세요
          </p>
        </ScrollReveal>

        {/* 기능 카드 그리드 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <ScrollReveal key={feature.id} delay={DELAYS[index]}>
              <div className="border-border bg-card hover:shadow-ai-cyan/5 hover:border-ai-cyan/30 group relative h-full rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-8">
                {/* 아이콘 */}
                <div className="bg-ai-cyan/10 text-ai-cyan mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  {feature.icon}
                </div>
                {/* 텍스트 */}
                <h3 className="text-foreground mb-2 text-lg font-semibold md:text-xl">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
