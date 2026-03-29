import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WebcamControls } from '@/components/webcam/webcam-controls';
import { useDetectionStore } from '@/stores/detection-store';

describe('WebcamControls', () => {
  const onStart = vi.fn();
  const onStop = vi.fn();

  beforeEach(() => {
    useDetectionStore.getState().reset();
    onStart.mockClear();
    onStop.mockClear();
  });

  it('idle 상태에서 "카메라 시작" 버튼 표시', () => {
    render(<WebcamControls onStart={onStart} onStop={onStop} />);
    expect(screen.getByText('카메라 시작')).toBeInTheDocument();
  });

  it('카메라 시작 클릭 시 onStart 호출', async () => {
    render(<WebcamControls onStart={onStart} onStop={onStop} />);
    await userEvent.click(screen.getByText('카메라 시작'));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('active 상태에서 "정지" 버튼 표시', () => {
    useDetectionStore.getState().setWebcamStatus('active');
    render(<WebcamControls onStart={onStart} onStop={onStop} />);
    expect(screen.getByText('정지')).toBeInTheDocument();
  });

  it('requesting 상태에서 버튼 비활성화', () => {
    useDetectionStore.getState().setWebcamStatus('requesting');
    render(<WebcamControls onStart={onStart} onStop={onStop} />);
    expect(screen.getByText('권한 요청 중...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
