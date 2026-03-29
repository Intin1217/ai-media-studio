import type { Config } from 'tailwindcss';
import baseConfig from '@ai-media-studio/config/tailwind';

const baseExtend = (baseConfig.theme?.extend ?? {}) as Record<string, unknown>;
const baseColors = (baseExtend.colors ?? {}) as Record<string, unknown>;

const config: Config = {
  ...baseConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      ...baseExtend,
      colors: {
        ...baseColors,
        'ai-cyan': 'hsl(var(--ai-cyan))',
        'ai-blue': 'hsl(var(--ai-blue))',
        'ai-purple': 'hsl(var(--ai-purple))',
        'ai-amber': 'hsl(var(--ai-amber))',
      },
      fontFamily: {
        sans: [
          'var(--font-pretendard)',
          'Pretendard',
          '-apple-system',
          'system-ui',
          'sans-serif',
        ],
      },
      keyframes: {
        ...((baseExtend.keyframes ?? {}) as Record<string, unknown>),
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(20px, -30px) scale(1.05)' },
          '66%': { transform: 'translate(-15px, 15px) scale(0.95)' },
        },
      },
      animation: {
        ...((baseExtend.animation ?? {}) as Record<string, unknown>),
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        blob: 'blob 8s ease-in-out infinite',
      },
    },
  },
};

export default config;
