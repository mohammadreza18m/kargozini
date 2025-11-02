import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#edfdf7',
          100: '#cff9ea',
          200: '#a2f0d6',
          300: '#6ce2bc',
          400: '#30c899',
          500: '#0f9f7a',
          600: '#0b876a',
          700: '#0f766e',
          800: '#0f5a52',
          900: '#0b433d',
          DEFAULT: '#0f766e',
          foreground: '#f0fdfa'
        }
      },
      fontFamily: {
        sans: ['"Vazirmatn"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config;
