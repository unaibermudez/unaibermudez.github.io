export interface Bilingual {
	es: string;
	en: string;
}

/** Ilustración generada en build (ver ProjectArt.astro). `fallback` se deriva del nombre. */
export type ProjectArtVariant = "route" | "grid" | "fallback";

export interface Project {
	name: string;
	description: Bilingual;
	year: string;
	stack: string[];
	art: ProjectArtVariant;
	github?: string;
	demo?: string;
}

/**
 * Proyectos de la home.
 * Para añadir otro proyecto, ver README.md "Cómo añadir un proyecto".
 *
 * Antes de enlazar un repo, comprueba que es público: si no lo es, la tarjeta
 * mostrará un enlace "Código" que lleva a un 404.
 */
export const projects: Project[] = [
	{
		name: "TripMap",
		year: "2026",
		art: "route",
		description: {
			es: "Visualizador de viajes: un mapa interactivo con la ruta y sus paradas, sincronizado con una línea de tiempo, y cada parada con su texto y sus fotos. Los tramos se trazan por carretera real, y todo se resuelve en tiempo de build: sin backend.",
			en: "Trip visualizer: an interactive map with the route and its stops, synced with a timeline, each stop with its own text and photos. Legs follow real roads, and everything is resolved at build time: no backend.",
		},
		stack: ["Astro", "React", "TypeScript", "MapLibre GL", "Zustand", "Tailwind"],
		github: "https://github.com/unaibermudez/TripMap",
		demo: "https://unaibermudez.github.io/TripMap/",
	},
	{
		name: "Commit Drawings",
		year: "2026",
		art: "grid",
		description: {
			es: "Dibujas un patrón sobre la rejilla de contribuciones de GitHub y te devuelve el script que lo recrea con commits reales retrodatados. En lugar de un bucle de commits, que sería lentísimo para cientos de fechas, genera un stream de git fast-import.",
			en: "You draw a pattern on GitHub's contribution grid and get back the script that recreates it with real backdated commits. Instead of a commit loop, which would be very slow for hundreds of dates, it generates a git fast-import stream.",
		},
		stack: ["React", "Vite", "TypeScript", "Tailwind", "shadcn/ui"],
		github: "https://github.com/unaibermudez/github-commit-drawingsV2",
		demo: "https://github-commit-drawings.vercel.app/",
	},
];
