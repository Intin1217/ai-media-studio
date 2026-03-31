import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarBrowserAiTab } from '@/components/dashboard/sidebar-browser-ai-tab';

const mockSetModelType = vi.fn();
const mockSetConfidenceThreshold = vi.fn();
const mockSetFaceAnalysisEnabled = vi.fn();

const mockState = {
  modelType: 'mediapipe-lite0' as const,
  confidenceThreshold: 0.5,
  faceAnalysisEnabled: false,
  ollamaEnabled: false,
  setModelType: mockSetModelType,
  setConfidenceThreshold: mockSetConfidenceThreshold,
  setFaceAnalysisEnabled: mockSetFaceAnalysisEnabled,
};

vi.mock('@/stores/settings-store', () => ({
  useSettingsStore: (selector: (s: typeof mockState) => unknown) =>
    selector(mockState),
}));

describe('SidebarBrowserAiTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.modelType = 'mediapipe-lite0';
    mockState.confidenceThreshold = 0.5;
    mockState.faceAnalysisEnabled = false;
    mockState.ollamaEnabled = false;
  });

  it('감지 모델 선택을 렌더링한다', () => {
    render(<SidebarBrowserAiTab />);
    expect(screen.getByText('감지 모델')).toBeInTheDocument();
  });

  it('인식률 필터를 렌더링한다', () => {
    render(<SidebarBrowserAiTab />);
    expect(screen.getByText(/인식률/)).toBeInTheDocument();
  });

  it('얼굴 분석 토글을 렌더링한다', () => {
    render(<SidebarBrowserAiTab />);
    expect(screen.getByText(/얼굴 분석/)).toBeInTheDocument();
  });

  it('모델 옵션 3가지가 존재한다', () => {
    render(<SidebarBrowserAiTab />);
    expect(screen.getByText('COCO-SSD (경량)')).toBeInTheDocument();
    expect(screen.getByText('MediaPipe Lite0 (균형)')).toBeInTheDocument();
    expect(screen.getByText('MediaPipe Lite2 (정확)')).toBeInTheDocument();
  });

  it('ollamaEnabled가 true이면 모델 선택이 비활성화된다', () => {
    mockState.ollamaEnabled = true;
    render(<SidebarBrowserAiTab />);
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('얼굴 분석 토글 클릭 시 setFaceAnalysisEnabled가 호출된다', async () => {
    const user = userEvent.setup();
    render(<SidebarBrowserAiTab />);
    const toggle = screen.getByRole('checkbox', { name: '얼굴 분석 활성화' });
    await user.click(toggle);
    expect(mockSetFaceAnalysisEnabled).toHaveBeenCalledWith(true);
  });
});
