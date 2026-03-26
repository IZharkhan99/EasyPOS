/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        blue: { DEFAULT: '#3b82f6', dark: '#2563eb', dim: 'rgba(59,130,246,.12)' },
        green: { DEFAULT: '#22c55e', dark: '#16a34a', dim: 'rgba(34,197,94,.12)' },
        red: { DEFAULT: '#ef4444', dim: 'rgba(239,68,68,.12)' },
        orange: { DEFAULT: '#f97316', dim: 'rgba(249,115,22,.12)' },
        purple: { DEFAULT: '#8b5cf6', dim: 'rgba(139,92,246,.12)' },
        teal: { DEFAULT: '#14b8a6', dim: 'rgba(20,184,166,.12)' },
        yellow: { DEFAULT: '#eab308', dim: 'rgba(234,179,8,.12)' },
        pink: { DEFAULT: '#ec4899', dim: 'rgba(236,72,153,.12)' },
      },
    },
  },
  plugins: [],
}
