import { siteConfig } from "@/site-config";

const dateFormat = new Intl.DateTimeFormat(siteConfig.date.locale, siteConfig.date.options);

// Locale codes used for the two supported languages. Bilingual UI (see
// components using <Bilingual>/<T>) renders both variants side by side, so
// every formatter below takes an explicit locale rather than always reading
// siteConfig.date.locale.
const LOCALES = { es: "es-ES", en: "en-US" } as const;
export type DateLocale = keyof typeof LOCALES;

function formatterFor(locale: DateLocale, options: Intl.DateTimeFormatOptions) {
	return new Intl.DateTimeFormat(LOCALES[locale], options);
}

export function getFormattedDate(
	date: string | number | Date,
	options?: Intl.DateTimeFormatOptions,
): string {
	if (typeof options !== "undefined") {
		return new Date(date).toLocaleDateString(siteConfig.date.locale, {
			...(siteConfig.date.options as Intl.DateTimeFormatOptions),
			...options,
		});
	}

	return dateFormat.format(new Date(date));
}

/** Short rail date: `5 mar 2026` (es) / `Mar 5, 2026` (en). */
export function formatRailDate(date: Date, locale: DateLocale = "es"): string {
	return formatterFor(locale, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

/** Featured-card stamp: `marzo de 2026` / `March 2026`. */
export function formatStampDate(date: Date, locale: DateLocale = "es"): string {
	return formatterFor(locale, { month: "long", year: "numeric" }).format(date);
}

/** Article byline date: `5 de marzo de 2026` / `March 5, 2026`. */
export function formatBylineDate(date: Date, locale: DateLocale = "es"): string {
	return formatterFor(locale, { day: "numeric", month: "long", year: "numeric" }).format(date);
}

/** Article byline date + time: `5 de marzo de 2026, 14:30` / `March 5, 2026, 2:30 PM`. */
export function formatBylineDateTime(date: Date, locale: DateLocale = "es"): string {
	return formatterFor(locale, {
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
}

/** Article eyebrow date: `marzo de 2026` / `March 2026`. */
export function formatEyebrowDate(date: Date, locale: DateLocale = "es"): string {
	return formatterFor(locale, { month: "long", year: "numeric" }).format(date);
}
