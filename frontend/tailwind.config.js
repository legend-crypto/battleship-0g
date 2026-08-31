/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        og: {
          blue: '#00F0FF',
          darkBlue: '#002B49',
          accent: '#7000FF',
          grid: '#0F172A'
        }
      }
    },
  },
  plugins: [],
}
