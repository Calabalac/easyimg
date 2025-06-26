/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e0e7ff',
          100: '#c7d2fe',
          200: '#a5b4fc',
          300: '#818cf8',
          400: '#6366f1',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#181a20',
        },
        accent: {
          500: '#7dd3fc',
          600: '#38bdf8',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.13)',
          border: 'rgba(125,211,252,0.13)',
        },
        base: {
          100: '#181a20',
          200: '#23263a',
          300: '#26293c',
        },
        neutral: {
          100: '#fff',
          200: '#cbd5e1',
          300: '#64748b',
        },
      },
      borderRadius: {
        '3xl': '2rem',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
    },
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
  ],
  daisyui: {
    themes: [
      {
        easyimg: {
          "primary": "#2563eb",
          "secondary": "#38bdf8",
          "accent": "#7dd3fc",
          "neutral": "#fff",
          "base-100": "#181a20",
          "info": "#38bdf8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f43f5e",
        },
      },
      "night",
    ],
    darkTheme: "night",
    base: true,
    styled: true,
    utils: true,
    logs: false,
    rtl: false,
    prefix: "",
    safelist: [
      'floating-circles'
    ],
  },
} 