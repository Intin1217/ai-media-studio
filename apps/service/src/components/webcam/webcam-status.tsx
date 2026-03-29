'use client';

import { useDetectionStore } from '@/stores/detection-store';

export function WebcamStatus() {
  const webcamStatus = useDetectionStore((s) => s.webcamStatus);

  if (webcamStatus === 'requesting') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground border-t-transparent" />
        <p className="text-sm">카메라 접근을 허용해주세요</p>
      </div>
    );
  }

  if (webcamStatus === 'denied') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <svg
          className="h-12 w-12 text-destructive"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6M9 9l6 6" />
        </svg>
        <p className="text-sm font-medium text-destructive">카메라 접근이 거부되었습니다</p>
        <p className="text-xs text-muted-foreground">브라우저 설정에서 카메라 권한을 허용해주세요</p>
      </div>
    );
  }

  if (webcamStatus === 'error') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
        <svg
          className="h-12 w-12 text-destructive"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <p className="text-sm font-medium text-destructive">카메라를 사용할 수 없습니다</p>
        <p className="text-xs text-muted-foreground">
          다른 앱에서 카메라를 사용 중이거나 지원되지 않는 브라우저입니다
        </p>
      </div>
    );
  }

  // idle 상태
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <svg className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M15.6 11.6a1 1 0 010 .8l-6 4A1 1 0 018 15.6V8.4a1 1 0 011.6-.8l6 4z" />
        <rect x="2" y="4" width="20" height="16" rx="2" />
      </svg>
      <p className="text-sm">카메라를 시작하여 객체 감지를 시작하세요</p>
    </div>
  );
}
