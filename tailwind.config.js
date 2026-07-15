/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.js'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf6ef',
          100: '#f9e8d8',
          200: '#f2cfb0',
          300: '#e9ae7e',
          400: '#df8a4d',
          500: '#d4702a',
          600: '#c55c1f',
          700: '#a4471c',
          800: '#833a1d',
          900: '#6a311a',
          950: '#3a170c',
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
  plugins: [],
};
