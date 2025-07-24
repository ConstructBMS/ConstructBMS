/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ConstructBMS Brand Colors
        constructbms: {
          // Primary colors
          primary: '#1A1A1A',
          secondary: '#4D5A6C',
          accent: '#3B82F6',
          
          // Light theme
          'light-bg': '#FFFFFF',
          'light-surface': '#F6F8FA',
          'light-text': '#1A1A1A',
          'light-text-secondary': '#4D5A6C',
          'light-border': '#E5E7EB',
          
          // Dark theme
          'dark-bg': '#0C1C2E',
          'dark-surface': '#1A2B44',
          'dark-text': '#FFFFFF',
          'dark-text-secondary': '#D1D5DB',
          'dark-border': '#374151',
          
          // Status colors
          success: '#3CB371',
          warning: '#FFB84D',
          error: '#E6504D',
          info: '#3B82F6',
          
          // Button colors
                  'button-primary': '#3B82F6',
        'button-primary-hover': '#2563EB',
          'button-secondary': '#F6F8FA',
          'button-secondary-hover': '#E5E7EB',
          'button-secondary-dark': '#1A2B44',
          'button-secondary-dark-hover': '#2D3B52',
        },
        
        // ConstructBMS brand colors
        brand: {
          blue: '#3B82F6', // Light blue accent (replacing neon green)
          'blue-hover': '#2563EB', // Darker blue for hover
          black: '#000000', // Black
          dark: '#1A1A1A', // Dark gray
          primary: '#3B82F6', // Blue
        },
        
        // Legacy support - map old colors to new
        primary: {
          50: '#F6F8FA',
          100: '#E5E7EB',
          200: '#D1D5DB',
          300: '#9CA3AF',
          400: '#6B7280',
          500: '#4D5A6C',
          600: '#374151',
          700: '#1A1A1A',
          800: '#111827',
          900: '#0C1C2E',
        },
        
        accent: {
          50: '#FEF7E0',
          100: '#FDE68A',
          200: '#FCD34D',
          300: '#FBBF24',
          400: '#F59E0B',
                  500: '#3B82F6',
        600: '#2563EB',
          700: '#A16207',
          800: '#854D0E',
          900: '#713F12',
        },
        
        // Theme-aware colors that use CSS variables
        'accent-var': 'var(--color-accent)',
        'accent-hover': 'var(--color-button-primary-hover)',
        'accent-light': 'var(--color-accent)',
        'accent-dark': 'var(--color-accent)',
      },
      
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      
      boxShadow: {
        'constructbms': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'constructbms-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'constructbms-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      
      borderRadius: {
        'constructbms': '0.5rem',
        'constructbms-lg': '0.75rem',
      },
    },
  },
  plugins: [],
}
