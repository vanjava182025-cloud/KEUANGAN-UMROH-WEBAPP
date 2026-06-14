/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#b40000',
          hover: '#900000',
          light: '#ffebeb',
          dark: '#780000'
        },
        secondary: {
          DEFAULT: '#5a5a5a',
          hover: '#404040',
          light: '#f2f2f2',
          dark: '#303030'
        },
        accent: {
          gold: '#cda851',
          goldhover: '#b59341',
          emerald: '#10b981',
          rose: '#f43f5e'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(180, 0, 0, 0.05), 0 2px 10px -1px rgba(0, 0, 0, 0.03)',
        'premium-lg': '0 10px 30px -5px rgba(180, 0, 0, 0.08), 0 5px 15px -3px rgba(0, 0, 0, 0.04)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
}
