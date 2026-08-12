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
 * Proyectos de la home. Queda una entrada con `placeholder: true`: sustitúyela
 * por un proyecto real; ver README.md "Cómo añadir un proyecto" para el formato.
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
		name: "Próximamente",
		description: "Proyecto en camino. Vuelve pronto.",
		stack: [],
		placeholder: true,
	},
];
