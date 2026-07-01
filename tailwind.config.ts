import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
	content: [
		"./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}",
		"!./src/pages/og-image/[slug].png.ts",
	],
	corePlugins: {
		aspectRatio: false,
		borderOpacity: false,
		fontVariantNumeric: false,
		ringOffsetColor: false,
		ringOffsetWidth: false,
		scrollSnapType: false,
		textOpacity: false,
		touchAction: false,
	},
	darkMode: ["class", '[data-theme="dark"]'],
	plugins: [],
	theme: {
		extend: {
			colors: {
				accent: "hsl(var(--theme-accent) / <alpha-value>)",
				"accent-2": "hsl(var(--theme-accent-2) / <alpha-value>)",
				bgColor: "hsl(var(--theme-bg) / <alpha-value>)",
				link: "hsl(var(--theme-link) / <alpha-value>)",
				quote: "hsl(var(--theme-quote) / <alpha-value>)",
				textColor: "hsl(var(--theme-text) / <alpha-value>)",
				textMuted: "hsl(var(--theme-text-muted) / <alpha-value>)",
			},
			fontFamily: {
				sans: ["Hanken Grotesk", ...fontFamily.sans],
				serif: ["Fraunces", ...fontFamily.serif],
				mono: ["Fragment Mono", ...fontFamily.mono],
			},
			transitionProperty: {
				height: "height",
			},
		},
	},
} satisfies Config;
