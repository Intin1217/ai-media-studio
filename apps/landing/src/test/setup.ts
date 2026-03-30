import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom은 window.matchMedia를 구현하지 않으므로 mock으로 대체
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// animejs는 jsdom 환경에서 DOM 애니메이션을 수행할 수 없으므로 noop으로 mock
vi.mock('animejs', () => ({
  animate: vi.fn(),
  stagger: vi.fn(() => 0),
}));
