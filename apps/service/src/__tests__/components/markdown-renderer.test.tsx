import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/markdown-renderer';

describe('MarkdownRenderer', () => {
  it('plain text를 정상 렌더링함', () => {
    render(<MarkdownRenderer content="안녕하세요 테스트 텍스트" />);
    expect(screen.getByText('안녕하세요 테스트 텍스트')).toBeInTheDocument();
  });

  it('h1 heading을 렌더링함', () => {
    render(<MarkdownRenderer content="# 제목 텍스트" />);
    expect(
      screen.getByRole('heading', { level: 1, name: '제목 텍스트' }),
    ).toBeInTheDocument();
  });

  it('h2 heading을 렌더링함', () => {
    render(<MarkdownRenderer content="## 소제목 텍스트" />);
    expect(
      screen.getByRole('heading', { level: 2, name: '소제목 텍스트' }),
    ).toBeInTheDocument();
  });

  it('bold 텍스트를 strong 요소로 렌더링함', () => {
    render(<MarkdownRenderer content="**굵은 텍스트**" />);
    const strong = document.querySelector('strong');
    expect(strong).toBeInTheDocument();
    expect(strong?.textContent).toBe('굵은 텍스트');
  });

  it('unordered list를 렌더링함', () => {
    render(<MarkdownRenderer content={'- 항목 1\n- 항목 2\n- 항목 3'} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('항목 1');
  });

  it('ordered list를 렌더링함', () => {
    render(<MarkdownRenderer content={'1. 첫 번째\n2. 두 번째'} />);
    const list = document.querySelector('ol');
    expect(list).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });

  it('inline code를 렌더링함', () => {
    render(<MarkdownRenderer content="텍스트 `코드` 텍스트" />);
    const code = document.querySelector('code');
    expect(code).toBeInTheDocument();
    expect(code?.textContent).toBe('코드');
  });

  it('code block을 pre > code 구조로 렌더링함', () => {
    render(
      <MarkdownRenderer content={'```\nconst x = 1;\nconsole.log(x);\n```'} />,
    );
    const pre = document.querySelector('pre');
    expect(pre).toBeInTheDocument();
    const code = pre?.querySelector('code');
    expect(code).toBeInTheDocument();
  });

  it('링크에 target="_blank"와 rel="noopener noreferrer"를 적용함', () => {
    render(<MarkdownRenderer content="[클릭](https://example.com)" />);
    const link = screen.getByRole('link', { name: '클릭' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('빈 문자열을 전달해도 에러 없이 렌더링함', () => {
    const { container } = render(<MarkdownRenderer content="" />);
    expect(container).toBeInTheDocument();
  });
});
