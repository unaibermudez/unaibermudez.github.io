import { toString as mdastToString } from "mdast-util-to-string";
import getReadingTime from "reading-time";

export function remarkReadingTime() {
	// @ts-expect-error:next-line
	return (tree, { data }) => {
		const textOnPage = mdastToString(tree);
		const readingTime = getReadingTime(textOnPage);
		// Just the number — the "X min read"/"X min de lectura" label is
		// rendered bilingually at the template level (see blogPost.readingTime
		// in src/i18n/{es,en}.json) since this runs per-language body.
		data.astro.frontmatter.minutesRead = Math.max(1, Math.ceil(readingTime.minutes));
	};
}
