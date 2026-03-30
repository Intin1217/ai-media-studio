import { ScrollReveal } from './scroll-reveal';

const FEATURES = [
  {
    id: 'privacy',
    title: '완전한 프라이버시',
    description:
      '모든 데이터가 내 컴퓨터에서만 처리됩니다. 영상, 이미지, 문서가 외부 서버로 전송되지 않습니다.',
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
    id: 'local-ai',
    title: '로컬 AI 엔진',
    description:
      'Ollama 기반 Vision 모델로 이미지 분석, PDF 번역, OCR을 로컬에서 실행합니다. API 비용 없이 무제한.',
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
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="14" x2="23" y2="14" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="14" x2="4" y2="14" />
      </svg>
    ),
  },
  {
    id: 'offline',
    title: '오프라인 동작',
    description:
      '인터넷 연결 없이도 핵심 기능이 동작합니다. 브라우저 AI 모델로 실시간 객체 감지가 가능합니다.',
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
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <circle cx="12" cy="20" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'easy-setup',
    title: '간편한 설치',
    description:
      'Docker 한 줄 또는 Node.js로 즉시 실행. 복잡한 서버 설정 없이 3분이면 시작합니다.',
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
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
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
            내 컴퓨터에 설치하고, 내 데이터를 안전하게 지키세요
          </p>
        </ScrollReveal>

        {/* 기능 카드 그리드 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <ScrollReveal key={feature.id} delay={DELAYS[index]}>
              <div className="border-border bg-card hover:border-ai-cyan/50 group relative h-full rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(0,245,255,0.1)] md:p-8">
                {/* 아이콘 */}
                <div className="from-ai-cyan/20 to-ai-purple/20 text-ai-cyan mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br">
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
