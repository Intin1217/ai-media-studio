'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import type { ComponentPropsWithoutRef } from 'react';

interface MarkdownRendererProps {
  content: string;
}

type CodeProps = ComponentPropsWithoutRef<'code'> & {
  node?: unknown;
};

const components: Components = {
  h1: ({ children }) => (
    <h1 className="dark:text-foreground mb-1 mt-2 text-sm font-bold">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="dark:text-foreground mb-1 mt-2 text-xs font-bold">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="dark:text-foreground mb-1 mt-1.5 text-xs font-semibold">
      {children}
    </h3>
  ),
  strong: ({ children }) => (
    <strong className="dark:text-foreground font-semibold">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="my-1 list-inside list-disc space-y-0.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-1 list-inside list-decimal space-y-0.5">{children}</ol>
  ),
  li: ({ children }) => <li className="text-xs">{children}</li>,
  pre: ({ children }) => (
    <pre className="bg-muted my-1 overflow-x-auto rounded-md p-2">
      {children}
    </pre>
  ),
  code: ({ children, ...props }: CodeProps) => {
    // pre 내부의 code는 pre에서 이미 스타일링됨, inline code만 처리
    const isInsidePre =
      typeof props.className === 'string' &&
      props.className.startsWith('language-');
    if (isInsidePre) {
      return (
        <code className="font-mono text-xs" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="bg-muted rounded px-1 py-0.5 font-mono text-xs"
        {...props}
      >
        {children}
      </code>
    );
  },
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 underline hover:no-underline dark:text-blue-400"
    >
      {children}
    </a>
  ),
  p: ({ children }) => <p className="my-0.5">{children}</p>,
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="text-foreground text-xs leading-relaxed">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
