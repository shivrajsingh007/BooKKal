/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4e7',
          100: '#fbe3c0',
          200: '#f8c987',
          300: '#f5b04e',
          400: '#f39c25',
          500: '#e8850a',
          600: '#c96e07',
          700: '#a3560a',
          800: '#7e4210',
          900: '#663710',
        },
        accent: {
          50: '#edf6f0',
          100: '#c8e8d2',
          500: '#27ae60',
          600: '#1e8c4c',
          700: '#166638',
        },
        dark: '#1a1a2e',
        surface: '#f8f5f0',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
        warm: '0 4px 16px rgba(232,133,10,0.2)',
      },
    },
  },
  plugins: [],
};
