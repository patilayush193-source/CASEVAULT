import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#030712',
        void: '#080D1A',
        surface: '#0D1424',
        surfaceHi: '#131D33',
        border: '#1E2D4A',
        borderHi: '#2A3F68',
        accent: '#00F5D4',
        accentDim: '#00C4AA',
        indigo: '#6366F1',
        indigoDim: '#4F46E5',
        textPrimary: '#F0F4FF',
        textSecondary: '#8899BB',
        textMuted: '#4A5A7A',
      },
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'marquee-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'marquee-scroll': 'marquee-scroll 30s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
