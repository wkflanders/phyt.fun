import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		fontFamily: {
			"inconsolata": ["Inconsolata", "sans-serif"],
			"inter": ["Inter", "sans-serif"],
		  },
  		colors: {
			background: "hsl(var(--background))",
			foreground: "hsl(var(--foreground))",
			card: {
			  DEFAULT: "hsl(var(--card))",
			  foreground: "hsl(var(--card-foreground))",
			},
			popover: {
			  DEFAULT: "hsl(var(--popover))",
			  foreground: "hsl(var(--popover-foreground))",
			},
			primary: {
			  DEFAULT: "hsl(var(--primary))",
			  foreground: "hsl(var(--primary-foreground))",
			},
			secondary: {
			  DEFAULT: "hsl(var(--secondary))",
			  foreground: "hsl(var(--secondary-foreground))",
			},
			muted: {
			  DEFAULT: "hsl(var(--muted))",
			  foreground: "hsl(var(--muted-foreground))",
			},
			accent: {
			  DEFAULT: "hsl(var(--accent))",
			  foreground: "hsl(var(--accent-foreground))",
			},
			destructive: {
			  DEFAULT: "hsl(var(--destructive))",
			  foreground: "hsl(var(--destructive-foreground))",
			},
			border: "hsl(var(--border))",
			input: "hsl(var(--input))",
			ring: "hsl(var(--ring))",
			chart: {
			  "1": "hsl(var(--chart-1))",
			  "2": "hsl(var(--chart-2))",
			  "3": "hsl(var(--chart-3))",
			  "4": "hsl(var(--chart-4))",
			  "5": "hsl(var(--chart-5))",
			},
			// primary: {
			//   DEFAULT: "#E7C9A5",
			//   admin: "#25388C",
			// },
			green: {
			  DEFAULT: "#027A48",
			  100: "#ECFDF3",
			  400: "#4C7B62",
			  500: "#2CC171",
			  800: "#027A48",
			},
			red: {
			  DEFAULT: "#FE205D",
			},
			blue: {
			  100: "#00F6FB",
			},
			gray: {
			  100: "#CBD5E1",
			},
			phyt_blue: "#00F6FB",
			phyt_red: "#FE205D",
			phyt_bg: "#101010",
			phyt_text_secondary: "#777798",
			phyt_form: "#13122A",
			phyt_form_placeholder: "#58587B",
			phyt_form_border: "#5454BF",
			phyt_form_text: "#ff00f7",
			phyt_code_box_bg: '#2E2E5D',
			phyt_code_box_highlight: '#b915c2',
			phyt_code_box_highlight_border: '#ef48f7'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		screens: {
			xs: "480px",
		},
		backgroundImage: {
			pattern: "url('/pattern.webp')",
		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
