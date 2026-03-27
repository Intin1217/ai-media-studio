/**
 * Smoke test — 테스트 인프라가 올바르게 동작하는지 확인하는 기본 테스트.
 * landing 페이지가 재구현되면 이 파일을 교체하거나 확장하세요.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

function Greeting({ name }: { name: string }) {
  return <p>Hello, {name}!</p>;
}

describe('Testing infrastructure', () => {
  it('renders a React component without crashing', () => {
    render(<Greeting name="AI Media Studio" />);
    expect(screen.getByText('Hello, AI Media Studio!')).toBeInTheDocument();
  });

  it('jest-dom custom matchers are registered', () => {
    render(<button disabled>Submit</button>);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });
});
