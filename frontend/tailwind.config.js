/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1e3a5f',
          secondary: '#c9a227',
        },
      },
      boxShadow: {
        soft: '0 8px 24px rgba(30, 58, 95, 0.18)',
      },
    },
  },
  plugins: [],
}
