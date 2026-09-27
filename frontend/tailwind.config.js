/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        social: {
          pink: '#e1306c',
          purple: '#833ab4',
          orange: '#fd1d1d',
          yellow: '#fcaf45',
          blue: '#0095f6',
        },
        dark: {
          bg: '#000000',
          card: '#121212',
          surface: '#1c1c1e',
          border: '#262626',
          hover: '#27272a',
          text: '#f4f4f5',
          muted: '#a1a1aa',
        }
      },
      keyframes: {
        heartPop: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.25)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        heartPop: 'heartPop 0.85s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        slideUp: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fadeIn: 'fadeIn 0.2s ease-out forwards',
      }
    },
  },
  plugins: [],
}
