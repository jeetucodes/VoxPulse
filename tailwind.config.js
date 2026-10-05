/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F8FAFC',
        dark: '#0F172A',
        accent: {
          DEFAULT: '#7C3AED', // Sophisticated Violet
          hover: '#6D28D9',
          light: '#EDE9FE',
        },
        secondary: {
          DEFAULT: '#EC4899', // Elegant Rose/Pink
          hover: '#DB2777',
          light: '#FCE7F3',
        },
        tertiary: {
          DEFAULT: '#F59E0B', // Warm Amber
          hover: '#D97706',
          light: '#FEF3C7',
          dark: '#B45309',
        },
        quaternary: {
          DEFAULT: '#10B981', // Clean Emerald
          hover: '#059669',
          light: '#D1FAE5',
          dark: '#047857',
        },
        borderDark: '#E2E8F0',
      },
      fontFamily: {
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'pop-sm': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'pop': '0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'pop-hover': '0 10px 20px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
        'pop-active': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'pop-lg': '0 16px 32px -4px rgba(15, 23, 42, 0.08), 0 6px 12px -4px rgba(15, 23, 42, 0.04)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 12px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.03)',
        'glow-violet': '0 0 25px -4px rgba(124, 58, 237, 0.25)',
        'glow-pink': '0 0 25px -4px rgba(236, 72, 153, 0.25)',
        'glow-amber': '0 0 25px -4px rgba(245, 158, 11, 0.25)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.25)',

        // 3D Claymorphic Card & Element Shadows (Tactile Pillowy Depth)
        'clay-card': '8px 14px 30px -4px rgba(15, 23, 42, 0.07), 2px 4px 10px -2px rgba(15, 23, 42, 0.03), inset 2px 3px 6px 0px rgba(255, 255, 255, 0.95), inset -3px -3px 8px 0px rgba(15, 23, 42, 0.04)',
        'clay-card-hover': '12px 22px 42px -6px rgba(15, 23, 42, 0.11), 4px 8px 16px -2px rgba(15, 23, 42, 0.05), inset 2px 3px 6px 0px rgba(255, 255, 255, 1), inset -3px -3px 8px 0px rgba(15, 23, 42, 0.05)',
        'clay-inset': 'inset 3px 4px 8px 0px rgba(15, 23, 42, 0.06), inset -2px -2px 6px 0px rgba(255, 255, 255, 0.9)',
        'clay-pill': '4px 6px 14px -2px rgba(15, 23, 42, 0.06), inset 1.5px 2px 4px 0px rgba(255, 255, 255, 0.9), inset -2px -2px 4px 0px rgba(15, 23, 42, 0.04)',
        'clay-btn-primary': '0 8px 18px -2px rgba(124, 58, 237, 0.4), inset 0 2px 4px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 5px 0 rgba(0, 0, 0, 0.22)',
        'clay-btn-primary-hover': '0 12px 24px -2px rgba(124, 58, 237, 0.5), inset 0 2px 4px 0 rgba(255, 255, 255, 0.65), inset 0 -3px 5px 0 rgba(0, 0, 0, 0.22)',
        'clay-btn-primary-active': '0 2px 6px 0 rgba(124, 58, 237, 0.25), inset 0 3px 6px 0 rgba(0, 0, 0, 0.3)',
        'clay-btn-secondary': '0 4px 12px -2px rgba(15, 23, 42, 0.06), inset 0 2px 4px 0 rgba(255, 255, 255, 0.95), inset 0 -2px 4px 0 rgba(15, 23, 42, 0.06)',
        'clay-btn-secondary-hover': '0 8px 16px -2px rgba(15, 23, 42, 0.1), inset 0 2px 4px 0 rgba(255, 255, 255, 1), inset 0 -2px 4px 0 rgba(15, 23, 42, 0.06)',

        // 3D Sugary Icon Badges
        'sugary-violet': '0 8px 20px -3px rgba(124, 58, 237, 0.45), inset 0 3px 5px 0 rgba(255, 255, 255, 0.65), inset 0 -3px 5px 0 rgba(76, 29, 149, 0.45)',
        'sugary-pink': '0 8px 20px -3px rgba(236, 72, 153, 0.45), inset 0 3px 5px 0 rgba(255, 255, 255, 0.65), inset 0 -3px 5px 0 rgba(157, 23, 77, 0.45)',
        'sugary-amber': '0 8px 20px -3px rgba(245, 158, 11, 0.45), inset 0 3px 5px 0 rgba(255, 255, 255, 0.65), inset 0 -3px 5px 0 rgba(180, 83, 9, 0.45)',
        'sugary-emerald': '0 8px 20px -3px rgba(16, 185, 129, 0.45), inset 0 3px 5px 0 rgba(255, 255, 255, 0.65), inset 0 -3px 5px 0 rgba(4, 120, 87, 0.45)',
        'sugary-blue': '0 8px 20px -3px rgba(59, 130, 246, 0.45), inset 0 3px 5px 0 rgba(255, 255, 255, 0.65), inset 0 -3px 5px 0 rgba(29, 78, 216, 0.45)',
        'sugary-slate': '0 6px 14px -2px rgba(51, 65, 85, 0.35), inset 0 2px 4px 0 rgba(255, 255, 255, 0.45), inset 0 -2px 4px 0 rgba(15, 23, 42, 0.35)',
      },
      borderRadius: {
        'blob': '24px',
        'blob-alt': '24px',
        'arch': '20px',
        'clay': '24px',
        'clay-lg': '32px',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(2deg)' },
          '75%': { transform: 'rotate(-2deg)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.96) translateY(6px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        sugaryBounce: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-5px) rotate(2deg)' },
        },
        sugaryFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        sugaryPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
        },
        pingSlow: {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '50%': { transform: 'scale(1.25)', opacity: '1' },
          '100%': { transform: 'scale(0.85)', opacity: '0.7' },
        }
      },
      animation: {
        'wiggle': 'wiggle 0.3s ease-in-out',
        'pop-in': 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
        'sugary-bounce': 'sugaryBounce 3.5s ease-in-out infinite',
        'sugary-float': 'sugaryFloat 3s ease-in-out infinite',
        'sugary-pulse': 'sugaryPulse 2.5s ease-in-out infinite',
        'ping-slow': 'pingSlow 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
