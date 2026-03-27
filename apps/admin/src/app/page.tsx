'use client';

import { useState } from 'react';
import { Button } from '@ai-media-studio/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@ai-media-studio/ui';

export default function AdminPage() {
  const [count, setCount] = useState(0);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Admin Panel</h1>
      <p className="text-muted-foreground">
        관리자 어드민 (SSG + CSR)
      </p>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>클라이언트 상태 확인</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            이 페이지는 &apos;use client&apos; 디렉티브를 사용합니다.
          </p>
          <p className="text-lg font-semibold">Count: {count}</p>
          <div className="flex gap-2">
            <Button onClick={() => setCount(count + 1)}>+1</Button>
            <Button variant="outline" onClick={() => setCount(0)}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
