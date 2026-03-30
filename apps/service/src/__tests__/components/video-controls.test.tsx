import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VideoControls } from '@/components/detection/video-controls';
import { useDetectionStore } from '@/stores/detection-store';

// canvas.requestFullscreen mock
const mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);
const mockExitFullscreen = vi.fn().mockResolvedValue(undefined);

describe('VideoControls', () => {
  const onStart = vi.fn();
  const onStop = vi.fn();
  const onToggleDetections = vi.fn();
  const canvasRef = {
    current: {
      requestFullscreen: mockRequestFullscreen,
    } as unknown as HTMLCanvasElement,
  };

  beforeEach(() => {
    useDetectionStore.getState().reset();
    vi.clearAllMocks();
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
      configurable: true,
    });
    document.exitFullscreen = mockExitFullscreen;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('비활성 상태에서 재생 버튼과 단축키 힌트 표시', () => {
    render(
      <VideoControls
        onStart={onStart}
        onStop={onStop}
        canvasRef={canvasRef}
        onToggleDetections={onToggleDetections}
      />,
    );
    expect(
      screen.getByRole('button', { name: /감지 시작/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Space.*시작/)).toBeInTheDocument();
  });

  it('카메라 시작 버튼 클릭 시 onStart 호출', async () => {
    render(
      <VideoControls
        onStart={onStart}
        onStop={onStop}
        canvasRef={canvasRef}
        onToggleDetections={onToggleDetections}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /감지 시작/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('active 상태에서 정지 버튼 표시', () => {
    useDetectionStore.getState().setWebcamStatus('active');
    render(
      <VideoControls
        onStart={onStart}
        onStop={onStop}
        canvasRef={canvasRef}
        onToggleDetections={onToggleDetections}
      />,
    );
    expect(
      screen.getByRole('button', { name: /감지 정지/i }),
    ).toBeInTheDocument();
  });

  it('active 상태에서 정지 버튼 클릭 시 onStop 호출', () => {
    useDetectionStore.getState().setWebcamStatus('active');
    render(
      <VideoControls
        onStart={onStart}
        onStop={onStop}
        canvasRef={canvasRef}
        onToggleDetections={onToggleDetections}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /감지 정지/i }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('active 상태에서 전체화면 버튼 표시', () => {
    useDetectionStore.getState().setWebcamStatus('active');
    render(
      <VideoControls
        onStart={onStart}
        onStop={onStop}
        canvasRef={canvasRef}
        onToggleDetections={onToggleDetections}
      />,
    );
    expect(
      screen.getByRole('button', { name: /전체화면/i }),
    ).toBeInTheDocument();
  });

  it('전체화면 버튼 클릭 시 requestFullscreen 호출', async () => {
    useDetectionStore.getState().setWebcamStatus('active');
    render(
      <VideoControls
        onStart={onStart}
        onStop={onStop}
        canvasRef={canvasRef}
        onToggleDetections={onToggleDetections}
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /전체화면/i }));
    });
    expect(mockRequestFullscreen).toHaveBeenCalledTimes(1);
  });

  it('active 상태에서 바운딩 박스 토글 버튼 표시', () => {
    useDetectionStore.getState().setWebcamStatus('active');
    render(
      <VideoControls
        onStart={onStart}
        onStop={onStop}
        canvasRef={canvasRef}
        onToggleDetections={onToggleDetections}
      />,
    );
    expect(
      screen.getByRole('button', { name: /바운딩 박스/i }),
    ).toBeInTheDocument();
  });

  it('바운딩 박스 버튼 클릭 시 aria-pressed 토글', () => {
    useDetectionStore.getState().setWebcamStatus('active');
    render(
      <VideoControls
        onStart={onStart}
        onStop={onStop}
        canvasRef={canvasRef}
        onToggleDetections={onToggleDetections}
      />,
    );
    const btn = screen.getByRole('button', { name: /바운딩 박스/i });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('Space 키 누르면 비활성 상태에서 onStart 호출', () => {
    render(
      <VideoControls
        onStart={onStart}
        onStop={onStop}
        canvasRef={canvasRef}
        onToggleDetections={onToggleDetections}
      />,
    );
    fireEvent.keyDown(window, { key: ' ' });
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('Space 키 누르면 active 상태에서 onStop 호출', () => {
    useDetectionStore.getState().setWebcamStatus('active');
    render(
      <VideoControls
        onStart={onStart}
        onStop={onStop}
        canvasRef={canvasRef}
        onToggleDetections={onToggleDetections}
      />,
    );
    fireEvent.keyDown(window, { key: ' ' });
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('D 키 누르면 바운딩 박스 토글', () => {
    useDetectionStore.getState().setWebcamStatus('active');
    render(
      <VideoControls
        onStart={onStart}
        onStop={onStop}
        canvasRef={canvasRef}
        onToggleDetections={onToggleDetections}
      />,
    );
    const btn = screen.getByRole('button', { name: /바운딩 박스/i });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(window, { key: 'd' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('감지 중 aria-live 영역에 감지 수 안내', () => {
    useDetectionStore.getState().setWebcamStatus('active');
    useDetectionStore.getState().setIsDetecting(true);
    useDetectionStore
      .getState()
      .setDetections([
        {
          class: 'person',
          score: 0.9,
          bbox: { x: 0, y: 0, width: 10, height: 10 },
        },
      ]);
    render(
      <VideoControls
        onStart={onStart}
        onStop={onStop}
        canvasRef={canvasRef}
        onToggleDetections={onToggleDetections}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('1개의 객체');
  });

  it('모델 로딩 중 시작 버튼 비활성화', () => {
    useDetectionStore.getState().setModelStatus('loading');
    render(
      <VideoControls
        onStart={onStart}
        onStop={onStop}
        canvasRef={canvasRef}
        onToggleDetections={onToggleDetections}
      />,
    );
    expect(screen.getByRole('button', { name: /감지 시작/i })).toBeDisabled();
  });

  it('입력 필드에서는 Space 키 단축키가 동작하지 않음', () => {
    render(
      <>
        <input data-testid="test-input" />
        <VideoControls
          onStart={onStart}
          onStop={onStop}
          canvasRef={canvasRef}
        />
      </>,
    );
    const input = screen.getByTestId('test-input');
    fireEvent.keyDown(input, { key: ' ', target: input });
    expect(onStart).not.toHaveBeenCalled();
  });
});
