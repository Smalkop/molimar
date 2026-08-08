/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#4f46e5',
          600: '#0000ba',
          700: '#00009a',
          800: '#00007a',
          900: '#00005a',
          950: '#00003a',
        },
        secondary: {
          50: '#f0f7f4',
          100: '#daede4',
          200: '#b6dac9',
          300: '#8bc0a9',
          400: '#5ea286',
          500: '#3d856b',
          600: '#2e6b55',
          700: '#275645',
          800: '#224539',
          900: '#1d3a30',
          950: '#0e201a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ],
};
