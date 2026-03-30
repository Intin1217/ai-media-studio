'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from '@ai-media-studio/ui';
import type { DetectionLog } from '@/lib/db';

interface Props {
  logs: DetectionLog[];
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAsJSON(logs: DetectionLog[]) {
  const content = JSON.stringify(logs, null, 2);
  downloadFile(
    content,
    `detection-history-${Date.now()}.json`,
    'application/json',
  );
}

function exportAsCSV(logs: DetectionLog[]) {
  const header = 'timestamp,sessionId,fps,inferenceTime,detections\n';
  const rows = logs
    .map(
      (d) =>
        `${d.timestamp},${d.sessionId},${d.fps},${d.inferenceTime},"${d.detections.map((det) => `${det.class}:${det.score.toFixed(2)}`).join(';')}"`,
    )
    .join('\n');
  downloadFile(
    header + rows,
    `detection-history-${Date.now()}.csv`,
    'text/csv',
  );
}

export function ExportPanel({ logs }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">데이터 내보내기</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAsJSON(logs)}
            disabled={logs.length === 0}
          >
            JSON 다운로드
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAsCSV(logs)}
            disabled={logs.length === 0}
          >
            CSV 다운로드
          </Button>
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          {logs.length > 0
            ? `${logs.length}개 레코드`
            : '내보낼 데이터가 없습니다'}
        </p>
      </CardContent>
    </Card>
  );
}
