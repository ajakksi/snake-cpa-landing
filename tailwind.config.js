/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        text: 'rgb(var(--color-white) / <alpha-value>)',
        dark: 'rgb(var(--color-dark) / <alpha-value>)',
        circle: 'rgb(var(--color-circle) / <alpha-value>)',
        orange: 'rgb(var(--color-orange) / <alpha-value>)',
        purple: 'rgb(var(--color-purple) / <alpha-value>)',
        yellow: 'rgb(var(--color-yellow) / <alpha-value>)',
        white: 'rgb(var(--color-white) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
      },
      fontFamily: {
        sans: 'var(--font-main)',
      },
      boxShadow: {
        base: 'var(--shadow)',
      },
      backgroundImage: {
        'gradient-main':
          'linear-gradient(111.06deg, #DC8400 -3.49%, #560080 49.69%, #220032 91.86%)',
        'gradient-tasks':
          'linear-gradient(111.06deg, #14091ABF -3.49%, #14091ABF 49.69%, #220032BF 91.86%), linear-gradient(111.06deg, #9500DC -3.49%, #560080 49.69%, #220032 91.86%)',
        'gradient-card':
          'linear-gradient(-115.4deg, #9500DC 17.61%, #560080 57.18%, #220032 88.56%)',
      },
    },
  },
  plugins: [],
}
