/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3498db',
          '50': '#eaf6fd',
          '100': '#d0eafa',
          '200': '#a7d9f5',
          '300': '#75c1ed',
          '400': '#3498db',  // Main primary color
          '500': '#2089cf',
          '600': '#1a6fa8',
          '700': '#165a87',
          '800': '#12476c',
          '900': '#0f3c59',
          '950': '#0a253a'
        },
        secondary: {
          DEFAULT: '#e74c3c',
          '50': '#fdf4f3',
          '100': '#fce9e7',
          '200': '#f7d8d4',
          '300': '#f0b8b2',
          '400': '#e74c3c',  // Main secondary color
          '500': '#d73928',
          '600': '#c12e1e',
          '700': '#9f251a',
          '800': '#831f16',
          '900': '#6c1c15',
          '950': '#3a0c09'
        },
        background: '#f8fafc'
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
};
