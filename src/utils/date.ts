import { siteConfig } from "@/site-config";

const dateFormat = new Intl.DateTimeFormat(siteConfig.date.locale, siteConfig.date.options);

// All formatters below follow the site locale (see site.config.ts `date.locale`)
// so blog dates, OG images, and the homepage timeline stay in Spanish.
const railFormatter = new Intl.DateTimeFormat(siteConfig.date.locale, {
	day: "numeric",
	month: "short",
	year: "numeric",
});

const stampFormatter = new Intl.DateTimeFormat(siteConfig.date.locale, {
	month: "long",
	year: "numeric",
});

const bylineFormatter = new Intl.DateTimeFormat(siteConfig.date.locale, {
	day: "numeric",
	month: "long",
	year: "numeric",
});

const eyebrowFormatter = new Intl.DateTimeFormat(siteConfig.date.locale, {
	month: "long",
	year: "numeric",
});

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

/** Short rail date: `5 mar 2026`. */
export function formatRailDate(date: Date): string {
	return railFormatter.format(date);
}

/** Featured-card stamp: `marzo de 2026`. */
export function formatStampDate(date: Date): string {
	return stampFormatter.format(date);
}

/** Article byline date: `5 de marzo de 2026`. */
export function formatBylineDate(date: Date): string {
	return bylineFormatter.format(date);
}

/** Article eyebrow date: `marzo de 2026`. */
export function formatEyebrowDate(date: Date): string {
	return eyebrowFormatter.format(date);
}
