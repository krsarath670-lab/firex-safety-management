/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#080E1A',
          900: '#0F1E36',
          800: '#1A2F50',
          700: '#26426E',
          600: '#32558C',
        },
        safety: {
          red: '#DC2626',
          darkred: '#991B1B',
          orange: '#EA580C',
          amber: '#D97706',
          green: '#059669',
          blue: '#1D70B8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
