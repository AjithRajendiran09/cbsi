/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        caias: {
          navy: '#0f2744',
          blue: '#1e3a5f',
          accent: '#2563eb',
          light: '#eff6ff',
          gold: '#c59b27',
          darkgold: '#9a7514',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
