/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    'components/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/react-daisyui/dist/**/*.js',
  ],
  theme: {
    extend: {
      boxShadow: {
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 1)',
        clicked: 'inset 0 2px 18px 0 rgba(0, 0, 0, 1)',
      },
      animation: {
        fadeIn: 'fadeIn 400ms ease-in',
        fadeOut: 'fadeOut 400ms ease-out',
        fadeSlideUp: 'fadeSlideUp 400ms ease-in',
        fadeSlideDown: 'fadeSlideDown 400ms ease-out forwards',
        slideFadeInLeft: 'slideFadeInLeft 400ms ease-in',
        slideFadeOutRight: 'slideFadeOutRight 400ms ease-out',
        slideThumb: 'slideThumb 300ms ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeSlideUp: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '50%': { transform: 'translateY(0%)', opacity: 0.1 },
          '75%': { transform: 'translateY(0%)', opacity: 0.5 },
          '100%': { transform: 'translateY(0%)', opacity: 1 },
        },
        slideThumb: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(100% + 0.5rem))' },
        },
        fadeSlideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideFadeInLeft: {
          '0%': { opacity: 0, transform: 'translateX(50%)' },
          '100%': { opacity: 1, transform: 'translateX(0%)' },
        },
        slideFadeOutRight: {
          '0%': { opacity: 0, transform: 'translateX(50%)' },
          '100%': { opacity: 1, transform: 'translateX(0%)' },
        },
      },

      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
    },
  },
  variants: {
    extend: {
      backgroundImage: ['hover', 'focus'],
    },
  },
  daisyui: {
    themes: false,
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils: true,
    prefix: '',
    logs: true,
    themeRoot: ':root',
    themes: [
      {
        light: {
          'wallet-background': '#1c1c1c1a',
          primary: '#A287FF',
          'primary-content': '#161616',
          secondary: '#F0F0FF',
          'secondary-content': '#161616',
          accent: '#30DB5B',
          'accent-content': '#161616',
          neutral: '#FFFFFF',
          'button-gradient': 'linear-gradient(to right, #A087FF, #380CC5)',
          'neutral-content': '#161616',
          'base-100': '#FFFFFF',
          'base-200': '#F0F0FF',
          'base-300': '#E1E1F9',
          'base-content': '#161616',
          'background-color': '#F0F0FF',
          info: '#3B82F6',
          success: '#00D515',
          warning: '#FBBD23',
          error: '#F54562',
        },
      },
      {
        dark: {
          'wallet-background': '#dcdcdc15',
          primary: '#A287FF',
          'primary-content': '#FFFFFF',
          secondary: '#1D192D',
          'secondary-content': '#FFFFFF',
          accent: '#30DB5B',
          'accent-content': '#FFFFFF',
          'button-gradient': 'linear-gradient(to right, #A087FF, #380CC5)',
          neutral: '#1D192D',
          'neutral-content': '#FFFFFF',
          'background-color': '#0E0A1F',
          'base-100': '#161616',
          'base-200': '#1D192D',
          'base-300': '#2A2640',
          'base-content': '#FFFFFF',
          info: '#3B82F6',
          success: '#00D515',
          warning: '#FBBD23',
          error: '#F54562',
        },
      },
    ],
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('tailwind-scrollbar-hide'),
    require('daisyui'),
    function ({ addUtilities }) {
      const newUtilities = {
        '.btn-gradient': {
          backgroundImage: 'linear-gradient(to right, #A087FF, #380CC5)',
          '&:hover': {
            backgroundImage: 'linear-gradient(to right, #8B6EFF, #2F0AA3)',
          },
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};
