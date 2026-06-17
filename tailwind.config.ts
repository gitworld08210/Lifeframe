import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        secondary: '#00D4FF',
        accent: '#FF6B9D',
        gold: '#FFD700',
        'text-primary': '#FFFFFF',
        'text-secondary': 'rgba(255,255,255,0.7)',
        'text-tertiary': 'rgba(255,255,255,0.4)',
      },
      backgroundImage: {
        'gradient-feed': 'linear-gradient(to bottom, #0A0A0F, #12121A)',
        'gradient-profile': 'linear-gradient(to bottom, #0D0A1A, #1A0D2E)',
        'gradient-reels': 'linear-gradient(to bottom, #000000, #0A0A0A)',
        'gradient-creator-hub': 'linear-gradient(to bottom, #0A0F0A, #0F1A0A)',
        'gradient-messages': 'linear-gradient(to bottom, #0A0A14, #14140A)',
        'gradient-explore': 'linear-gradient(to bottom, #0A0F14, #0A1420)',
      },
      fontSize: {
        'display-lg': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        headline: ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        title: ['16px', { lineHeight: '1.4', fontWeight: '500' }],
        body: ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        label: ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        caption: ['11px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        full: '9999px',
      },
      backdropBlur: {
        glass: '20px',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
