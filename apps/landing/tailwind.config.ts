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
        'ai-cyan-muted': 'hsl(var(--ai-cyan-muted))',
        'ai-amber': 'hsl(var(--ai-amber))',
      },
      fontFamily: {
        sans: [
          'Geist',
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
      },
      animation: {
        ...((baseExtend.animation ?? {}) as Record<string, unknown>),
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
      },
    },
  },
};

export default config;
