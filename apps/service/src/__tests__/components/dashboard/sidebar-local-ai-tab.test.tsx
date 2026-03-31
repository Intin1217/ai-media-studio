import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarLocalAiTab } from '@/components/dashboard/sidebar-local-ai-tab';

vi.mock('@/lib/ollama-client', () => ({
  checkOllamaConnection: vi.fn().mockResolvedValue(false),
  getOllamaModels: vi.fn().mockResolvedValue([]),
  validateOllamaUrl: vi.fn().mockReturnValue(true),
}));

const mockSetOllamaEnabled = vi.fn();
const mockSetOllamaEndpoint = vi.fn();
const mockSetOllamaModel = vi.fn();
const mockSetOllamaCustomPrompt = vi.fn();
const mockSetOllamaPromptMode = vi.fn();

const mockState = {
  ollamaEnabled: false,
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'qwen3-vl:8b',
  ollamaCustomPrompt: '이미지를 설명해주세요.',
  ollamaPromptMode: 'all' as const,
  setOllamaEnabled: mockSetOllamaEnabled,
  setOllamaEndpoint: mockSetOllamaEndpoint,
  setOllamaModel: mockSetOllamaModel,
  setOllamaCustomPrompt: mockSetOllamaCustomPrompt,
  setOllamaPromptMode: mockSetOllamaPromptMode,
};

vi.mock('@/stores/settings-store', () => ({
  useSettingsStore: (selector: (s: typeof mockState) => unknown) =>
    selector(mockState),
}));

describe('SidebarLocalAiTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.ollamaEnabled = false;
    mockState.ollamaEndpoint = 'http://localhost:11434';
    mockState.ollamaModel = 'qwen3-vl:8b';
    mockState.ollamaPromptMode = 'all';
  });

  it('Ollama 활성화 토글을 렌더링한다', () => {
    render(<SidebarLocalAiTab />);
    expect(screen.getByText(/Ollama/)).toBeInTheDocument();
  });

  it('서버 주소 입력 필드를 렌더링한다', () => {
    render(<SidebarLocalAiTab />);
    expect(screen.getByLabelText('서버 주소')).toBeInTheDocument();
  });

  it('연결 확인 버튼을 렌더링한다', () => {
    render(<SidebarLocalAiTab />);
    expect(
      screen.getByRole('button', { name: '연결 확인' }),
    ).toBeInTheDocument();
  });

  it('연결 전에는 모델 드롭다운이 비활성화된다', () => {
    render(<SidebarLocalAiTab />);
    const modelSelect = screen.getByRole('combobox');
    expect(modelSelect).toBeDisabled();
    expect(screen.getByText('먼저 서버 연결을 확인하세요')).toBeInTheDocument();
  });

  it('ollamaEnabled 토글 클릭 시 setOllamaEnabled가 호출된다', async () => {
    const user = userEvent.setup();
    render(<SidebarLocalAiTab />);
    const toggle = screen.getByRole('checkbox', { name: 'Ollama 활성화' });
    await user.click(toggle);
    expect(mockSetOllamaEnabled).toHaveBeenCalledWith(true);
  });

  it('ollamaEnabled가 true일 때 프롬프트 입력이 표시된다', () => {
    mockState.ollamaEnabled = true;
    render(<SidebarLocalAiTab />);
    expect(screen.getByLabelText('분석 프롬프트')).toBeInTheDocument();
  });
});
