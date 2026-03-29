import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs';
import { useDetectionStore } from '@/stores/detection-store';

describe('DashboardTabs', () => {
  beforeEach(() => {
    useDetectionStore.getState().reset();
  });

  it('두 개 탭이 렌더됨', () => {
    render(<DashboardTabs />);

    expect(
      screen.getByRole('tab', { name: '실시간 감지' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: '이미지 분석' }),
    ).toBeInTheDocument();
  });

  it('탭 클릭 시 dashboardTab 변경', async () => {
    const user = userEvent.setup();
    render(<DashboardTabs />);

    await user.click(screen.getByRole('tab', { name: '이미지 분석' }));

    expect(useDetectionStore.getState().dashboardTab).toBe('image-analysis');
  });
});
