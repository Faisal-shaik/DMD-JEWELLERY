/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FAF6E9',
          100: '#F5ECB6',
          200: '#EBD779',
          300: '#E1C23C',
          400: '#D4AF37', // Standard Metallic Gold
          500: '#B89327',
          600: '#91711A',
          700: '#6B5110',
          800: '#453208',
          900: '#211702',
        },
        dark: {
          900: '#0A0A0C', // Deep luxury black
          800: '#121215', // Card background
          700: '#1C1C22', // Subtle surface
          600: '#282832', // Border dark
          500: '#3F3F4E',
        },
        cream: {
          50: '#FDFBF7',
          100: '#F7F3E9',
          200: '#EFE6D5',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F5ECB6 0%, #D4AF37 50%, #91711A 100%)',
        'gold-text-gradient': 'linear-gradient(135deg, #FFF0C2 0%, #D4AF37 50%, #AA7C11 100%)',
        'dark-gradient': 'linear-gradient(180deg, #121215 0%, #0A0A0C 100%)',
      },
    },
  },
  plugins: [],
}
