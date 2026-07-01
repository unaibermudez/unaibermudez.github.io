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
		description:
			"El primer proyecto de esta lista está en camino. Vuelve pronto — mientras tanto, echa un vistazo al código de este mismo portfolio en GitHub.",
		stack: ["React", "TypeScript", "Spring Boot"],
		placeholder: true,
	},
	{
		name: "Próximamente",
		description:
			"Segundo hueco reservado para un proyecto real: nombre, descripción, stack y enlaces a GitHub y demo en cuanto esté listo para mostrarse.",
		stack: ["PostgreSQL", "Docker", "CI/CD"],
		placeholder: true,
	},
];
