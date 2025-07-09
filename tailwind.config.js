/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'archer-green': '#41F990',
        'archer-neon': '#41F990',
        'archer-black': '#000000',
        'archer-grey': '#f5f5f5',
        'archer-dark-grey': '#888888',
      },
    },
  },
  plugins: [],
};
