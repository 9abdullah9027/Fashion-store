import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Keeping this just in case!
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1A1A24',
          lavender: '#A892D1',
          magenta: '#E71D73',
          emerald: '#00A859',
          gold: '#F6B721',
          cream: '#FAFAFA',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        urdu: ['var(--font-noto-urdu)', 'serif'],
      }
    },
  },
  plugins: [],
}
export default config