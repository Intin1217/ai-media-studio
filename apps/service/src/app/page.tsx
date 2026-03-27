import { Button } from '@ai-media-studio/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@ai-media-studio/ui';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">AI Media Studio</h1>
      <p className="text-muted-foreground">
        실시간 AI 미디어 분석 서비스 (SSR)
      </p>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>모노레포 연결 확인</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            이 카드는 packages/ui에서 가져온 공유 컴포넌트입니다.
          </p>
          <div className="flex gap-2">
            <Button>Primary Button</Button>
            <Button variant="outline">Outline Button</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
