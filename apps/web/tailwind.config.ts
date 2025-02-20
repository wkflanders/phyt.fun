import type { Config } from "tailwindcss";

export default {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				inconsolata: [
					'Inconsolata',
					'sans-serif'
				],
				inter: [
					'Inter',
					'sans-serif'
				]
			},
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				form: "var(--form)",
				border: "var(--border)",
				card: {
					DEFAULT: "var(--card)",
					foreground: "var(--card-foreground)",
				},
				popover: {
					DEFAULT: "var(--popover)",
					foreground: "var(--popover-foreground)",
				},
				sidebar: "var(--sidebar)",
				navbar: "var(--navbar)",
				primary: {
					DEFAULT: "var(--primary)",
					shade: "var(--primary-shade)",
					gradientStart: "var(--primary-gradient-start)",
					gradientEnd: "var(--primary-gradient-end)",
				},
				secondary: {
					DEFAULT: "var(--secondary)",
					shade: "var(--secondary-shade)",
				},
				text: {
					DEFAULT: "var(--foreground)",
					dim: "var(--text-dim)",
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			screens: {
				xs: '480px'
			},
			backgroundImage: {
				pattern: "url('/pattern.webp')",
				blue_pattern: "url('/pattern.webp')",
				pixel_mozaic: "url('/bg.png')",
				radiant_waves: "url('/bg_1.png')",
				waves_card: "url('/card.png')"
			},
			keyframes: {
				'border-spin': {
					'100%': {
						transform: 'rotate(-360deg)',
					},
				},
			},
			animation: {
				'border-spin': 'border-spin 200s linear infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
