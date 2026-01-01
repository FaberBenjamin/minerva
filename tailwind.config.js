/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Szürke árnyalatos palette a Minerva designhoz
        'minerva-dark': '#1a1a1a',
        'minerva-gray-900': '#2d2d2d',
        'minerva-gray-800': '#404040',
        'minerva-gray-700': '#545454',
        'minerva-gray-600': '#6b6b6b',
        'minerva-gray-500': '#828282',
        'minerva-gray-400': '#9e9e9e',
        'minerva-gray-300': '#bdbdbd',
        'minerva-gray-200': '#e0e0e0',
        'minerva-gray-100': '#f5f5f5',
        'minerva-white': '#ffffff',
      },
    },
  },
  plugins: [],
}
