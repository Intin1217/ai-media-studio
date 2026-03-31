'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from '@ai-media-studio/ui';
import { useSettingsStore } from '@/stores/settings-store';

export function SettingsPanel() {
  const bboxColors = useSettingsStore((s) => s.bboxColors);
  const setBboxColor = useSettingsStore((s) => s.setBboxColor);
  const resetBboxColors = useSettingsStore((s) => s.resetBboxColors);

  const defaultColors: Record<string, string> = {
    person: '#00FF88',
    car: '#FF6B6B',
    dog: '#4ECDC4',
    cat: '#FFE66D',
    laptop: '#A78BFA',
    'cell phone': '#F472B6',
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">설정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 바운딩 박스 색상 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-muted-foreground text-xs">
              바운딩 박스 색상
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetBboxColors}
              className="h-6 text-xs"
            >
              초기화
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(defaultColors).map(([cls, defaultColor]) => (
              <div key={cls} className="flex items-center gap-2">
                <input
                  type="color"
                  value={bboxColors[cls] ?? defaultColor}
                  onChange={(e) => setBboxColor(cls, e.target.value)}
                  className="border-border h-6 w-6 cursor-pointer rounded border"
                />
                <span className="text-foreground text-xs">{cls}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
