/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ✅ Activation du mode sombre basé sur <html class="dark">
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif']
      },
      colors: {
        // ===== COULEURS SYSTÈME UNIFIÉES =====
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },

        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },

        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },

        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },

        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },

        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },

        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },

        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },

        // ===== COULEURS LEGACY BRIGADE (COMPATIBILITÉ) =====
        // ⚠️ À supprimer progressivement, remplacer par les variables CSS
        brigade: {
          dark: '#0c1021',     // Equivalent à background dark
          darker: '#1e2a47',   // Nuance plus foncée
          blue: '#1e40af',     // Bleu foncé
          accent: '#2563eb'    // Equivalent à primary
        },

        // ===== AJOUT PANEL DARK POUR SIDEBAR =====
        panel: {
          dark: '#0c0e15'
        }
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },

      // ===== ANIMATIONS AMÉLIORÉES =====
      animation: {
        'theme-transition': 'fade-in 0.3s ease-in-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'slide-down': 'slide-down 0.2s ease-out',
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },

  // ===== SAFELIST RÉDUITE ET CIBLÉE =====
  // ⚠️ Only keep what's absolutely necessary for dynamic classes
  safelist: [
    'bg-primary', 'text-primary-foreground',
    'bg-muted', 'text-muted-foreground', 
    'bg-accent', 'text-accent-foreground',
    'rounded-lg', 'rounded-full', 'p-2', 'p-3', 'p-4',
    'flex', 'items-center', 'justify-center', 'gap-2', 'gap-4',
    'bg-brigade-dark', 'bg-brigade-blue', 'text-brigade-accent',
    'bg-panel-dark' // ✅ pour panel sombre
  ],

  plugins: [
    require("tailwindcss-animate")
  ],
};