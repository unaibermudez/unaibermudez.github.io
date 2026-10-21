/** Inicio de la experiencia profesional en LKS NEXT (prácticas, septiembre de 2024). */
const CAREER_START = new Date("2024-09-01");

/** Años completos de experiencia, calculados en build para no dejar el número hardcodeado. */
export function yearsOfExperience(now: Date = new Date()): number {
	const years = (now.getTime() - CAREER_START.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
	return Math.max(0, Math.floor(years));
}
