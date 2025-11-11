/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			charcoal: '#1a1a20',
  			'charcoal-light': '#2d2d35',
  			gold: '#d4a960',
  			'gold-dark': '#c89645',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
			card: "hsl(var(--card))",
    "card-foreground": "hsl(var(--card-foreground))",
    "muted-foreground": "hsl(var(--muted-foreground))",
    border: "hsl(var(--border))",
  		}
  	}
  },
  plugins: [],
}