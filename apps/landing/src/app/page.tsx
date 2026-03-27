import { Button } from '@ai-media-studio/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@ai-media-studio/ui';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <section className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          AI Media Studio
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          웹캠으로 실시간 영상을 분석하고, AI가 객체를 감지합니다.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>실시간 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              TensorFlow.js로 브라우저에서 직접 AI 분석을 실행합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>프라이버시 보호</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              모든 분석이 브라우저 내에서 처리되어 영상이 외부로 전송되지 않습니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>실시간 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              감지 결과를 실시간 차트와 통계로 시각화합니다.
            </p>
          </CardContent>
        </Card>
      </section>

      <Button size="lg">시작하기</Button>
    </main>
  );
}
