/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dv: {
          bg: '#050505',
          card: '#0e0e0e',
          cardBorder: '#1c1c1c',
          charcoal: '#111111',
          surface: '#151515',
          red: '#F20D25',
          redHover: '#ff2037',
          redMuted: 'rgba(242, 13, 37, 0.15)',
          redGlow: 'rgba(242, 13, 37, 0.45)',
          text: '#FFFFFF',
          muted: '#A3A3A3',
          darkMuted: '#666666',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'red-sm': '0 0 15px rgba(242, 13, 37, 0.25)',
        'red-md': '0 0 25px rgba(242, 13, 37, 0.35)',
        'red-lg': '0 0 45px rgba(242, 13, 37, 0.45)',
        'red-glow': '0 0 60px rgba(242, 13, 37, 0.25), 0 0 100px rgba(242, 13, 37, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
