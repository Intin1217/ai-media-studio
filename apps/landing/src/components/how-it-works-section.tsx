import { ScrollAnimation } from './scroll-animation';

const STEPS = [
  {
    number: 1,
    title: '설치',
    description:
      'Docker 또는 Node.js로 프로젝트를 설치합니다. 3분이면 충분합니다.',
  },
  {
    number: 2,
    title: '실행',
    description: 'docker compose up 또는 pnpm dev로 로컬 서버를 시작합니다.',
  },
  {
    number: 3,
    title: '분석',
    description:
      'localhost:3000에서 웹캠 분석, 이미지 감지, PDF 번역을 시작합니다.',
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="bg-muted/30 py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <ScrollAnimation className="mb-16 text-center md:mb-20">
          <span className="mb-6 inline-flex items-center rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-500">
            사용 방법
          </span>
          <h2
            id="how-heading"
            className="text-foreground text-2xl font-bold leading-snug tracking-tight md:text-3xl lg:text-4xl"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            3단계로 시작하는 AI 분석
          </h2>
        </ScrollAnimation>

        {/* 스텝 */}
        <ol className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          {STEPS.map((step, index) => {
            const isLast = index === STEPS.length - 1;
            return (
              <li key={step.number} className="relative flex-1">
                <ScrollAnimation delay={index * 0.15}>
                  {/* 모바일: 가로 배치 (번호 + 텍스트) */}
                  <div className="flex items-start gap-4 lg:flex-col lg:items-center lg:text-center">
                    {/* 번호 + 세로 연결선 (모바일) */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-lg font-bold text-white shadow-lg shadow-sky-500/25 md:h-12 md:w-12 md:text-xl"
                        aria-label={`${step.number}단계`}
                      >
                        {step.number}
                      </div>
                      {/* 모바일 세로 연결선 */}
                      {!isLast && (
                        <div
                          className="border-border absolute bottom-0 left-5 top-12 w-px border-l-2 border-dashed lg:hidden"
                          style={{ height: '3rem' }}
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {/* 텍스트 */}
                    <div className="pt-1 lg:pt-4">
                      <h3 className="text-foreground mb-2 text-lg font-semibold">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </ScrollAnimation>

                {/* 데스크톱 수평 연결선 */}
                {!isLast && (
                  <div
                    className="border-border absolute left-[calc(50%+1.5rem)] right-[calc(50%-1.5rem)] top-5 hidden border-t-2 border-dashed md:top-6 lg:block"
                    style={{
                      width: 'calc(100% - 3rem)',
                      left: 'calc(50% + 1.5rem)',
                    }}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
