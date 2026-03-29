import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatsModeSelector } from '@/components/detection/stats-mode-selector';
import { useDetectionStore } from '@/stores/detection-store';

describe('StatsModeSelector', () => {
  beforeEach(() => {
    useDetectionStore.getState().reset();
  });

  it('기본 모드가 "고유 감지"로 선택됨', () => {
    render(<StatsModeSelector />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('unique');
    expect(
      screen.getByRole('option', { name: '고유 감지' }),
    ).toBeInTheDocument();
  });

  it('모드 변경 시 store 업데이트', async () => {
    const user = userEvent.setup();
    render(<StatsModeSelector />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'per-second');

    expect(useDetectionStore.getState().statsMode).toBe('per-second');
  });
});
