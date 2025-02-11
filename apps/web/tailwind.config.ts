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
				green: {
					'100': '#ECFDF3',
					'400': '#4C7B62',
					'500': '#2CC171',
					'800': '#027A48',
					DEFAULT: '#027A48'
				},
				red: {
					'100': '#7d0f2d',
					DEFAULT: '#FE205D'
				},
				blue: {
					'100': '#00F6FB'
				},
				gray: {
					'100': '#CBD5E1'
				},
				card_blue: {
					'100': '#06080E',
					'200': '#121622'
				},
				phyt_blue: '#00F6FB',
				phyt_red: '#FE205D',
				phyt_bg: '#101010',
				phyt_text: '#E3E4E6',
				phyt_text_dark: '#d1d1d1',
				phyt_text_secondary: '#777798',
				phyt_text_third: '#454559',
				phyt_form: '#13122A',
				phyt_form_placeholder: '#58587B',
				phyt_form_border: '#5454BF',
				phyt_form_text: '#ff00f7',
				phyt_code_box_bg: '#2E2E5D',
				phyt_code_box_highlight: '#b915c2',
				phyt_code_box_highlight_border: '#ef48f7',
				phyt_gray: '#020303',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
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
