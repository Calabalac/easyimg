/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./views/**/*.{hbs,html}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          "primary": "#3b82f6",
          "secondary": "#8b5cf6", 
          "accent": "#06b6d4",
          "neutral": "#1f2937",
          "base-100": "#0f172a",
          "base-200": "#1e293b", 
          "base-300": "#334155",
          "base-content": "#f1f5f9",
          "info": "#0ea5e9",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
      "cyberpunk",
      "synthwave", 
      "night",
      "dracula",
      "black",
      "luxury"
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
  },
} 