/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F7F7FB',
        surface: '#FFFFFF',
        sidebar: '#14142B',
        primary: '#6C4CF1',
        'primary-hover': '#5B3AD9',
        'primary-active': '#4A2CC0',
        text: '#14142B',
        'text-secondary': '#6B7280',
        border: '#E7E7F0',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        neutral: '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'card': '12px',
        'small': '8px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(20,20,43,.06), 0 2px 8px rgba(20,20,43,.04)',
      },
    },
  },
  plugins: [],
}