import { ScrollReveal } from './scroll-reveal';

const STEPS = [
  {
    number: 1,
    title: '웹캠 연결',
    description:
      '브라우저에서 카메라 접근을 허용하면 준비 완료. 별도 설치가 필요 없습니다.',
  },
  {
    number: 2,
    title: 'AI 분석 시작',
    description:
      '시작 버튼을 누르면 TensorFlow.js가 실시간으로 객체를 감지합니다.',
  },
  {
    number: 3,
    title: '결과 확인',
    description:
      '감지 결과가 영상 위에 오버레이되고, 실시간 통계 차트로 시각화됩니다.',
  },
] as const;

const STEP_DELAYS = ['0ms', '150ms', '300ms'];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="bg-background py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <ScrollReveal className="mb-12 text-center md:mb-16">
          <p className="text-ai-cyan mb-3 text-sm font-medium uppercase tracking-widest">
            사용 방법
          </p>
          <h2
            id="how-heading"
            className="text-foreground text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl"
          >
            3단계로 시작하는 AI 분석
          </h2>
        </ScrollReveal>

        {/* 스텝 - 데스크톱: 가로, 모바일: 세로 */}
        <ol className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          {STEPS.map((step, index) => {
            const isLast = index === STEPS.length - 1;
            return (
              <li key={step.number} className="relative flex-1">
                <ScrollReveal delay={STEP_DELAYS[index]}>
                  {/* 모바일: 가로 배치 (번호 + 텍스트) */}
                  <div className="flex items-start gap-4 lg:flex-col lg:items-center lg:text-center">
                    {/* 번호 + 세로 연결선 (모바일) */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="from-ai-cyan to-ai-blue shadow-ai-cyan/25 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white shadow-lg md:h-12 md:w-12 md:text-xl"
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
                </ScrollReveal>

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
