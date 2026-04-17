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
          DEFAULT: '#8B4513', // Saddle Brown - furniture accent color
          50: '#f5ede5',
          100: '#e8d4c0',
          200: '#d4b092',
          300: '#c0845f',
          400: '#b1683f',
          500: '#8B4513', // Main accent
          600: '#7a3d11',
          700: '#64310e',
          800: '#4f260b',
          900: '#3d1e08',
        },
        accent: {
          DEFAULT: '#D2691E', // Chocolate - secondary accent
          light: '#F4A460', // Sandy Brown
          dark: '#A0522D', // Sienna
        }
      },
    },
  },
  plugins: [],
}