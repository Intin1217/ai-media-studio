import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportPanel } from '@/components/statistics/export-panel';
import type { DetectionLog } from '@/lib/db';

const sampleLogs: DetectionLog[] = [
  {
    id: 1,
    sessionId: 'session-1',
    timestamp: Date.now(),
    detections: [{ class: 'person', score: 0.95 }],
    fps: 30,
    inferenceTime: 20,
  },
  {
    id: 2,
    sessionId: 'session-1',
    timestamp: Date.now() - 1000,
    detections: [
      { class: 'car', score: 0.87 },
      { class: 'person', score: 0.78 },
    ],
    fps: 28,
    inferenceTime: 25,
  },
];

describe('ExportPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('에러 없이 렌더링된다', () => {
      expect(() => render(<ExportPanel logs={[]} />)).not.toThrow();
    });

    it('"데이터 내보내기" 타이틀이 렌더링된다', () => {
      render(<ExportPanel logs={[]} />);
      expect(screen.getByText('데이터 내보내기')).toBeInTheDocument();
    });
  });

  describe('내보내기 버튼', () => {
    it('JSON 다운로드 버튼이 렌더링된다', () => {
      render(<ExportPanel logs={sampleLogs} />);
      expect(
        screen.getByRole('button', { name: 'JSON 다운로드' }),
      ).toBeInTheDocument();
    });

    it('CSV 다운로드 버튼이 렌더링된다', () => {
      render(<ExportPanel logs={sampleLogs} />);
      expect(
        screen.getByRole('button', { name: 'CSV 다운로드' }),
      ).toBeInTheDocument();
    });
  });

  describe('데이터 없을 때', () => {
    it('JSON 버튼이 비활성화된다', () => {
      render(<ExportPanel logs={[]} />);
      expect(
        screen.getByRole('button', { name: 'JSON 다운로드' }),
      ).toBeDisabled();
    });

    it('CSV 버튼이 비활성화된다', () => {
      render(<ExportPanel logs={[]} />);
      expect(
        screen.getByRole('button', { name: 'CSV 다운로드' }),
      ).toBeDisabled();
    });

    it('"내보낼 데이터가 없습니다" 안내 메시지가 표시된다', () => {
      render(<ExportPanel logs={[]} />);
      expect(screen.getByText('내보낼 데이터가 없습니다')).toBeInTheDocument();
    });
  });

  describe('데이터 있을 때', () => {
    it('버튼들이 활성화된다', () => {
      render(<ExportPanel logs={sampleLogs} />);
      expect(
        screen.getByRole('button', { name: 'JSON 다운로드' }),
      ).not.toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'CSV 다운로드' }),
      ).not.toBeDisabled();
    });

    it('레코드 수가 표시된다', () => {
      render(<ExportPanel logs={sampleLogs} />);
      expect(screen.getByText('2개 레코드')).toBeInTheDocument();
    });

    it('JSON 다운로드 버튼 클릭 시 파일 다운로드가 트리거된다', async () => {
      const user = userEvent.setup();

      // URL.createObjectURL, URL.revokeObjectURL mock
      const createObjectURL = vi
        .spyOn(URL, 'createObjectURL')
        .mockReturnValue('blob:mock');
      const revokeObjectURL = vi
        .spyOn(URL, 'revokeObjectURL')
        .mockImplementation(() => {});

      // spy 이전에 원본 함수를 저장하여 재귀 호출 방지
      const originalCreateElement = document.createElement.bind(document);
      const clickSpy = vi.fn();
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const el = originalCreateElement(tag);
        if (tag === 'a') {
          el.click = clickSpy;
        }
        return el;
      });

      render(<ExportPanel logs={sampleLogs} />);
      await user.click(screen.getByRole('button', { name: 'JSON 다운로드' }));

      expect(createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalled();

      createObjectURL.mockRestore();
      revokeObjectURL.mockRestore();
    });
  });
});
