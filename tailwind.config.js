/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Acento de marca del sitio público: blanco/negro (BCARS no usa
        // rojo). "rojo" se deja definido más abajo únicamente para estados
        // de error/eliminar dentro del panel de administración (/panel,
        // /login) — ahí el rojo es una convención de UX estándar para
        // "peligro", no parte de la identidad visual, y esas pantallas no
        // las ve ningún cliente.
        acento: {
          DEFAULT: '#f5f5f5',
          dark: '#c9c9c9',
        },
        rojo: {
          DEFAULT: '#e2001a',
          light: '#fde3e6',
          dark: '#a3000f',
        },
        plata: {
          DEFAULT: '#c7cad0',
          light: '#f4f5f7',
          dark: '#8f939c',
        },
        ink: '#0f0f10',
        graphite: {
          DEFAULT: '#2E2E2E',
          dark: '#242424',
          darker: '#1A1A1A',
          light: '#3D3D3D',
          lighter: '#4A4A4A',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'road-dash':
          'repeating-linear-gradient(90deg, currentColor 0 24px, transparent 24px 40px)',
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(26, 26, 46, 0.15)',
        soft: '0 4px 20px -4px rgba(255, 255, 255, 0.25)',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.15)' },
          '30%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.15)' },
          '60%': { transform: 'scale(1)' },
        },
        'float-down': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.5' },
          '50%': { transform: 'translateY(8px)', opacity: '1' },
        },
        'scroll-cue': {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)', opacity: '0.65' },
          '35%': { transform: 'translateY(9px)', opacity: '1' },
          '65%': { transform: 'translateY(5px)', opacity: '1' },
        },
      },
      animation: {
        heartbeat: 'heartbeat 1.8s ease-in-out infinite',
        'float-down': 'float-down 1.6s ease-in-out infinite',
        'scroll-cue': 'scroll-cue 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}