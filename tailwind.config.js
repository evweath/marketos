/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7ff',
          300: '#a4bbff',
          400: '#7b93ff',
          500: '#5060ff',
          600: '#3d42f5',
          700: '#3130e0',
          800: '#2827b5',
          900: '#26268f',
          950: '#17164f',
        },
        ink: {
          50:  '#f4f6fa',
          100: '#e8eaf3',
          200: '#cdd1e6',
          300: '#a6adcf',
          400: '#7880b4',
          500: '#59629b',
          600: '#474e82',
          700: '#3b4069',
          800: '#333758',
          900: '#1a1d35',
          950: '#0d0f1f',
        },
        cyan: {
          400: '#00d9ff',
          500: '#00b8d9',
        },
        amber: {
          400: '#ffb347',
          500: '#f59e0b',
        },
        emerald: {
          400: '#10d98a',
          500: '#059669',
        },
        rose: {
          400: '#ff4444',
          500: '#e11d48',
        },
      },
      fontFamily: {
        display: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1.5s step-end infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
