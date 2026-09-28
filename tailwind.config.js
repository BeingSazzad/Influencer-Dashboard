/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          50: '#FAFAF9',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#71717A', // High-contrast legible secondary gray
          500: '#52525B', // Dark charcoal (WCAG AAA 7.5:1 contrast)
          600: '#3F3F46', // Deep charcoal
          700: '#27272A', // Obsidian text
          800: '#18181B',
          900: '#0F0F11',
          950: '#09090B',
        },
        brand: {
          black: '#0A0A0A',
          pink: '#FF2D78',
          canvas: '#FAFAF8',
          card: '#FFFFFF',
          border: '#E7E7E2',
          muted: '#F4F4F0',
          gray: '#52525B',
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
