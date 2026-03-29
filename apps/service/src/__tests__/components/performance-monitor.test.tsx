import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PerformanceMonitor } from '@/components/dashboard/performance-monitor';
import { useDetectionStore } from '@/stores/detection-store';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    useDetectionStore.getState().reset();
  });

  it('비활성 시 대시 표시', () => {
    render(<PerformanceMonitor />);
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it('활성 시 FPS와 추론 시간 표시', () => {
    useDetectionStore.getState().setIsDetecting(true);
    useDetectionStore
      .getState()
      .updatePerformance({ fps: 24, inferenceTime: 42 });
    render(<PerformanceMonitor />);
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('42ms')).toBeInTheDocument();
  });
});
