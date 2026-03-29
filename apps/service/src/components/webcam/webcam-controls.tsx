'use client';

import { Button } from '@ai-media-studio/ui';
import { useDetectionStore } from '@/stores/detection-store';

interface WebcamControlsProps {
  onStart: () => void;
  onStop: () => void;
}

export function WebcamControls({ onStart, onStop }: WebcamControlsProps) {
  const webcamStatus = useDetectionStore((s) => s.webcamStatus);
  const modelStatus = useDetectionStore((s) => s.modelStatus);
  const isActive = webcamStatus === 'active';

  return (
    <div className="flex gap-2">
      {isActive ? (
        <Button onClick={onStop} variant="outline" className="flex-1">
          정지
        </Button>
      ) : (
        <Button
          onClick={onStart}
          className="flex-1"
          disabled={webcamStatus === 'requesting' || modelStatus === 'loading'}
        >
          {webcamStatus === 'requesting' ? '권한 요청 중...' : '카메라 시작'}
        </Button>
      )}
    </div>
  );
}
