import { toString as mdastToString } from "mdast-util-to-string";
import getReadingTime from "reading-time";

export function remarkReadingTime() {
	// @ts-expect-error:next-line
	return (tree, { data }) => {
		const textOnPage = mdastToString(tree);
		const readingTime = getReadingTime(textOnPage);
		// `reading-time`'s own `.text` is English-only ("X min read"); build the
		// Spanish label ourselves since the whole site is in es-ES.
		const minutes = Math.max(1, Math.ceil(readingTime.minutes));
		data.astro.frontmatter.minutesRead = `${minutes} min de lectura`;
	};
}
