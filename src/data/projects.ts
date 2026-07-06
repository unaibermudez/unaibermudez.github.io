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
 * Proyectos — de momento en construcción. Sustituye estas entradas por tus
 * proyectos reales; ver README.md "Añadir un proyecto" para el formato.
 */
export const projects: Project[] = [
	{
		name: "Próximamente",
		description: "Proyecto en camino. Vuelve pronto.",
		stack: [],
		placeholder: true,
	},
	{
		name: "Próximamente",
		description: "Proyecto en camino. Vuelve pronto.",
		stack: [],
		placeholder: true,
	},
];
