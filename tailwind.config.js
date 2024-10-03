/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        adamina: ['Adamina', 'serif'],
        inter: ['Inter', 'sans-serif'],
      }
    },
    
  },
  plugins: [],
}