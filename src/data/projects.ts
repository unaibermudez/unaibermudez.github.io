export interface Project {
	/** Project name; supports a trailing accent word rendered in italics — see ProjectsSection.astro. */
	name: string;
	description: string;
	stack: string[];
	github?: string;
	demo?: string;
	/** Placeholder entries render "Próximamente" instead of live links. */
	placeholder?: boolean;
}

/**
 * Proyectos de la home. Ya no queda ninguna entrada con `placeholder: true`.
 * Para añadir otro proyecto, ver README.md "Cómo añadir un proyecto".
 *
 * Antes de enlazar un repo, comprueba que es público: si no lo es, la tarjeta
 * mostrará un enlace "Código" que lleva a un 404.
 */
export const projects: Project[] = [
	{
		name: "TripMap",
		description:
			"Visualizador de viajes: un mapa interactivo con la ruta y sus paradas, sincronizado con una línea de tiempo, y cada parada con su texto y sus fotos. Los tramos se trazan por carretera real, y todo se resuelve en tiempo de build: sin backend.",
		stack: ["Astro", "React", "TypeScript", "MapLibre GL", "Zustand", "Tailwind"],
		github: "https://github.com/unaibermudez/TripMap",
		demo: "https://unaibermudez.github.io/TripMap/",
	},
	{
		name: "Commit Drawings",
		description:
			"Dibujas un patrón sobre la rejilla de contribuciones de GitHub y te devuelve el script que lo recrea con commits reales retrodatados. En lugar de un bucle de commits, que sería lentísimo para cientos de fechas, genera un stream de git fast-import.",
		stack: ["React", "Vite", "TypeScript", "Tailwind", "shadcn/ui"],
		github: "https://github.com/unaibermudez/github-commit-drawingsV2",
		demo: "https://github-commit-drawings.vercel.app/",
	},
];
