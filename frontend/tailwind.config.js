module.exports = {
  darkMode: 'class', // Ustawienia domyślne dla trybu ciemnego
  content: ['./src/**/*.{js,jsx,ts,tsx}'], // Twój folder źródłowy
  theme: {
    extend: {
      colors: {
        male: "#a4ecff",
        female: "#fdaed8",
        indigo: {
          500: '#6366f1',
          600: '#4f46e5',
        },
        blue: {
          500: '#3b82f6',
          600: '#2563eb',
        },
        red: {
          500: '#ef4444',
          600: '#dc2626',
        },
        green: {
          500: '#10b981',
          600: '#059669',
        },
        purple: {
          500: '#a855f7',
          600: '#9333ea',
        },
        pink: {
          500: '#ec4899',
          600: '#db2777',
        },
      },
    },
  },
  plugins: [],
}
