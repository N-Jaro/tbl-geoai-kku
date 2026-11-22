/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kku: {
          terracotta: '#A73B24',
          dark: '#7A2817',
          light: '#FDF4F2',
          gold: '#D97706',
          sand: '#F5EBE6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
