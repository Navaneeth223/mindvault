import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Premium dark theme
        dark: {
          bg: '#0f0f1a',
          surface: '#1a1a2e',
          elevated: '#22223a',
          border: 'rgba(255, 255, 255, 0.06)',
          hover: 'rgba(255, 255, 255, 0.03)',
          text: {
            primary: '#ffffff',
            secondary: '#a1a1aa',
            muted: '#71717a',
          },
        },
        // Light theme
        light: {
          bg: '#ffffff',
          surface: '#f9fafb',
          elevated: '#f3f4f6',
          border: 'rgba(0, 0, 0, 0.06)',
          hover: 'rgba(0, 0, 0, 0.02)',
          text: {
            primary: '#18181b',
            secondary: '#52525b',
            muted: '#a1a1aa',
          },
        },
        // Accent colors
        accent: {
          cyan: '#00f5d4',
          'cyan-dark': '#00c9ad',
          indigo: '#6366f1',
          amber: '#f5a623',
          emerald: '#10b981',
          red: '#ef4444',
          violet: '#8b5cf6',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(0, 245, 212, 0.15)',
        'glow-lg': '0 0 40px rgba(0, 245, 212, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in',
        'fade-up': 'fadeUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0, 245, 212, 0.3)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(0, 245, 212, 0.5)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [
    function ({ addUtilities }: any) {
      addUtilities({
        '.scrollbar-hide': {
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    },
  ],
} satisfies Config
