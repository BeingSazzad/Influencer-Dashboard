/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0A0A0A',
          pink: '#FF2D78',
          canvas: '#FAFAF8',
          card: '#FFFFFF',
          border: '#E7E7E2',
          muted: '#F4F4F0',
          gray: '#73736A',
        },
      },
      fontFamily: {
        sans: ['"Red Hat Display"', 'sans-serif'],
        editorial: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
