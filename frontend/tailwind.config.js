// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: 'rgb(var(--color-accent))',
        },
        backgroundImage: {
          'gradient-to-r': 'linear-gradient(to right)',
        },
        indigo: {
          600: '#4f46e5',
        },
        blue: {
          600: '#2563eb',
        },
        emerald: {
          600: '#059669',
        },
        rose: {
          600: '#e11d48',
        },
        amber: {
          600: '#d97706',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}