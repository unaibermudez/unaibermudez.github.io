import type { SiteConfig } from "@/types";
import type { AstroExpressiveCodeOptions } from "astro-expressive-code";

export const siteConfig: SiteConfig = {
	author: "Unai Bermúdez",
	date: {
		locale: "es-ES",
		options: {
			day: "numeric",
			month: "short",
			year: "numeric",
		},
	},
	description:
		"Desarrollador Full Stack con 1.5 años de experiencia, apasionado por construir productos que funcionan de verdad. Graduado en Ingeniería Informática por la UPV/EHU.",
	lang: "es-ES",
	ogLocale: "es_ES",
	sortPostsByUpdatedDate: false,
	title: "Unai Bermúdez | Full Stack Developer",
	hideThemeCredit: false,
	profile: {
		name: "Unai Bermúdez",
		github: "https://github.com/unaibermudez",
		linkedin: "https://www.linkedin.com/in/unai-bermudez/",
		jobTitle: "Full Stack Developer",
		alumni: "UPV/EHU - Ingeniería Informática de Gestión y Sistemas de Información",
		// Sin email de contacto ni foto de perfil por decisión del usuario.
		// email: undefined,
		// avatar: undefined,
	},
	// Comentarios (Giscus) desactivados: el portfolio no lleva formulario ni
	// discusión por post, solo enlaces a GitHub/LinkedIn (ver sección Contacto).
	// comments: { ... },
	// Analítica desactivada por defecto. Descomenta y añade tu id para activarla.
	// analytics: {
	// 	googleAnalyticsId: "G-XXXXXXX",
	// 	goatcounterUrl: "https://your-handle.goatcounter.com/count",
	// },
};

// El sitio es una landing de una sola página: los enlaces del menú apuntan a
// anclas de la home. `withBase("/")` en Header.astro añade el base path y,
// desde páginas internas (posts, about), el navegador primero carga "/" y
// luego salta al ancla. `titleKey` referencia src/i18n/{es,en}.json — ver
// componente T.astro.
export const menuLinks: { path: string; titleKey: string }[] = [
	{
		path: "/#sobre",
		titleKey: "nav.about",
	},
	{
		path: "/#proyectos",
		titleKey: "nav.projects",
	},
	{
		path: "/#blog",
		titleKey: "nav.blog",
	},
	{
		path: "/#contacto",
		titleKey: "nav.contact",
	},
];

export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
	styleOverrides: {
		borderRadius: "4px",
		codeBackground: ({ theme }) => (theme.type === "light" ? "#ECE8DC" : "#211D17"),
		codeFontFamily:
			'"Fragment Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;',
		codeFontSize: "0.875rem",
		codeLineHeight: "1.7142857rem",
		codePaddingInline: "1rem",
		frames: {
			editorActiveTabBackground: ({ theme }) => (theme.type === "light" ? "#ECE8DC" : "#211D17"),
			editorTabBarBackground: ({ theme }) => (theme.type === "light" ? "#E3DDCB" : "#1A1712"),
			frameBoxShadowCssValue: "none",
			terminalBackground: ({ theme }) => (theme.type === "light" ? "#ECE8DC" : "#211D17"),
			terminalTitlebarBackground: ({ theme }) => (theme.type === "light" ? "#E3DDCB" : "#1A1712"),
		},
		uiLineHeight: "inherit",
	},
	themeCssSelector(theme, { styleVariants }) {
		if (styleVariants.length >= 2) {
			const baseTheme = styleVariants[0]?.theme;
			const altTheme = styleVariants.find((v) => v.theme.type !== baseTheme?.type)?.theme;
			if (theme === baseTheme || theme === altTheme) return `[data-theme='${theme.type}']`;
		}
		return `[data-theme="${theme.name}"]`;
	},
	themes: ["min-dark", "min-light"],
	useThemedScrollbars: false,
};
