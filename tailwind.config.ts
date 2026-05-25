import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          50: '#ecffff',
          100: '#d4ffff',
          200: '#afffff',
          300: '#7cffff',
          400: '#44eaff',
          500: '#1ad8e6',
          600: '#00bcc5',
          700: '#009aa3',
          800: '#0a7a82',
          900: '#0c636a',
          950: '#063c46',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss/plugin')],
}

export default config
