import { ScrollAnimation } from './scroll-animation';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  visual: React.ReactNode;
}

const FEATURES: Feature[] = [
  {
    id: 'object-detection',
    title: '실시간 객체 감지',
    description:
      '80종 이상의 객체를 30fps로 실시간 감지합니다. TensorFlow.js COCO-SSD 모델이 브라우저에서 직접 실행되어 서버 전송 없이 즉각적인 분석이 가능합니다.',
    icon: 'solar:eye-bold',
    visual: (
      <div
        className="relative aspect-video overflow-hidden rounded-xl"
        style={{
          background: 'linear-gradient(135deg, hsl(0 0% 5%), hsl(0 0% 8%))',
        }}
      >
        <div className="absolute inset-4 flex items-center justify-center">
          <div className="relative h-32 w-32">
            <div
              className="absolute inset-0 animate-pulse rounded-lg border-2 border-sky-500/60"
              aria-hidden="true"
            />
            <div
              className="absolute inset-3 animate-pulse rounded-lg border border-sky-500/30 [animation-delay:0.5s]"
              aria-hidden="true"
            />
          </div>
        </div>
        <div
          className="absolute right-3 top-3 flex flex-col gap-1.5"
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
        <div
          className="bg-card/80 absolute bottom-3 left-3 rounded-full border border-sky-500/30 px-2.5 py-1 text-[10px] font-medium"
          aria-hidden="true"
        >
          <span className="text-sky-500">30fps</span>
          <span className="text-muted-foreground ml-1">실시간</span>
        </div>
      </div>
    ),
  },
  {
    id: 'face-analysis',
    title: '얼굴 분석',
    description:
      '성별·나이 추정, 시선 추적, 감정 분석까지. MediaPipe Face Mesh 기반으로 468개 랜드마크를 실시간으로 분석합니다.',
    icon: 'solar:user-check-bold',
    visual: (
      <div
        className="relative aspect-video overflow-hidden rounded-xl"
        style={{
          background: 'linear-gradient(135deg, hsl(0 0% 5%), hsl(0 0% 8%))',
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-sky-500/50">
              <div className="h-12 w-12 rounded-full border border-sky-500/30 bg-sky-500/10" />
            </div>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-sky-500/60"
                style={{
                  top: `${50 + 45 * Math.sin((i / 6) * Math.PI * 2)}%`,
                  left: `${50 + 45 * Math.cos((i / 6) * Math.PI * 2)}%`,
                }}
              />
            ))}
          </div>
        </div>
        <div
          className="absolute bottom-3 left-3 right-3 flex gap-2"
          aria-hidden="true"
        >
          {['성별: 남성', '나이: 28±5', '시선: 전방'].map((label) => (
            <div
              key={label}
              className="bg-card/80 flex-1 rounded-md border border-white/10 px-2 py-1 text-center text-[9px] text-gray-300"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'pdf-translation',
    title: 'PDF 번역',
    description:
      '레이아웃을 보존하면서 AI가 PDF를 번역합니다. Ollama Vision 모델로 표·도형·이미지가 포함된 복잡한 문서도 정확하게 번역합니다.',
    icon: 'solar:document-text-bold',
    visual: (
      <div
        className="relative aspect-video overflow-hidden rounded-xl"
        style={{
          background: 'linear-gradient(135deg, hsl(0 0% 5%), hsl(0 0% 8%))',
        }}
      >
        <div className="absolute inset-3 flex gap-2" aria-hidden="true">
          {/* 원본 */}
          <div className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.04] p-2.5">
            <div className="text-muted-foreground mb-2 text-[8px]">원본</div>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="mb-1.5 h-1.5 rounded bg-white/10"
                style={{ width: `${60 + (i % 3) * 15}%` }}
              />
            ))}
          </div>
          {/* 화살표 */}
          <div className="flex items-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-sky-500"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          {/* 번역본 */}
          <div className="flex-1 rounded-lg border border-sky-500/20 bg-sky-500/[0.06] p-2.5">
            <div className="mb-2 text-[8px] text-sky-400">번역</div>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="mb-1.5 h-1.5 rounded bg-sky-500/20"
                style={{ width: `${60 + (i % 3) * 15}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'ocr-analysis',
    title: '이미지 분석 OCR',
    description:
      '이미지에서 텍스트를 추출하고 Ollama로 심층 분석합니다. 스크린샷, 문서 사진, 명함 등 다양한 이미지에서 정확하게 텍스트를 인식합니다.',
    icon: 'solar:gallery-bold',
    visual: (
      <div
        className="relative aspect-video overflow-hidden rounded-xl"
        style={{
          background: 'linear-gradient(135deg, hsl(0 0% 5%), hsl(0 0% 8%))',
        }}
      >
        <div className="absolute inset-3" aria-hidden="true">
          <div className="relative h-full w-full rounded-lg border border-white/[0.06] bg-white/[0.04] p-2.5">
            {/* 이미지 썸네일 영역 */}
            <div className="mb-2 flex h-14 w-full items-center justify-center rounded bg-white/[0.06]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-white/20"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            {/* OCR 결과 줄들 */}
            <div className="mb-1 flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              <div className="h-1.5 flex-1 rounded bg-sky-500/30" />
            </div>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="mb-1 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <div className="h-1.5 flex-1 rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <ScrollAnimation className="mb-16 text-center md:mb-20">
          <span className="mb-6 inline-flex items-center rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-500">
            핵심 기능
          </span>
          <h2
            id="features-heading"
            className="text-foreground break-keep-all text-2xl font-bold leading-snug tracking-tight md:text-3xl lg:text-4xl"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            브라우저에서 완결되는 AI 분석
          </h2>
          <p className="text-muted-foreground break-keep-all mx-auto mt-4 max-w-[55ch] text-sm md:text-base">
            서버 없이, API 비용 없이. 모든 처리가 당신의 브라우저에서
            이루어집니다.
          </p>
        </ScrollAnimation>

        {/* Zig-Zag 기능 배치 */}
        <div className="flex flex-col gap-20 md:gap-28">
          {FEATURES.map((feature, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={feature.id}
                className={`flex flex-col gap-10 md:flex-row md:items-center md:gap-16 ${
                  !isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* 텍스트 영역 */}
                <ScrollAnimation
                  direction={isEven ? 'left' : 'right'}
                  className="min-w-0 flex-1"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                      <iconify-icon
                        icon={feature.icon}
                        width="20"
                        height="20"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-foreground text-xl font-bold md:text-2xl">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground break-keep-all max-w-[48ch] text-sm leading-relaxed md:text-base">
                    {feature.description}
                  </p>
                </ScrollAnimation>

                {/* 비주얼 영역 — Double-Bezel */}
                <ScrollAnimation
                  direction={isEven ? 'right' : 'left'}
                  className="min-w-0 flex-1"
                >
                  <div className="rounded-2xl bg-white/[0.04] p-1.5 ring-1 ring-white/10">
                    <div className="overflow-hidden rounded-[calc(1rem-0.375rem)] bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                      {feature.visual}
                    </div>
                  </div>
                </ScrollAnimation>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
