/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // DataSentry-AI Brand Colors
        brand: {
          'deep': '#190019',      // Deep Background
          'secondary': '#2B124C', // Secondary Background
          'primary': '#522B5B',   // Primary Purple
          'muted': '#854F6C',     // Muted Purple
          'pink': '#DFB6B2',      // Soft Pink
          'cream': '#FBE4D8',     // Cream
        },
        // Semantic colors
        background: {
          DEFAULT: '#190019',
          secondary: '#2B124C',
          card: 'rgba(82, 43, 91, 0.2)',
        },
        border: {
          DEFAULT: 'rgba(223, 182, 178, 0.1)',
          muted: 'rgba(133, 79, 108, 0.2)',
        },
        text: {
          primary: '#FBE4D8',
          secondary: '#DFB6B2',
          muted: '#854F6C',
        },
        // Status colors
        status: {
          healthy: '#10b981',
          warning: '#f59e0b',
          critical: '#ef4444',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'button': '12px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(25, 0, 25, 0.4)',
        'card-hover': '0 8px 32px rgba(82, 43, 91, 0.6)',
        'glow': '0 0 20px rgba(223, 182, 178, 0.3)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
