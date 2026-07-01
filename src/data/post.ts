import { type CollectionEntry, getCollection } from "astro:content";
import { siteConfig } from "@/site-config";

export type Locale = "es" | "en";

/** A post's Spanish and/or English entry, paired by shared filename (slug). */
export interface PostPair {
	slug: string;
	es?: CollectionEntry<"post">;
	en?: CollectionEntry<"post">;
}

function parseId(id: string): { locale: Locale | null; slug: string } {
	const slashIndex = id.indexOf("/");
	if (slashIndex === -1) return { locale: null, slug: id };
	const locale = id.slice(0, slashIndex);
	const slug = id.slice(slashIndex + 1);
	return locale === "es" || locale === "en" ? { locale, slug } : { locale: null, slug: id };
}

/** All post entries (both locales), drafts excluded in production builds. */
export async function getAllPosts(): Promise<CollectionEntry<"post">[]> {
	return await getCollection("post", ({ data }) => (import.meta.env.PROD ? !data.draft : true));
}

/** Groups es/ and en/ entries that share the same filename into one pair per post. */
export async function getPostPairs(): Promise<PostPair[]> {
	const all = await getAllPosts();
	const bySlug = new Map<string, PostPair>();
	for (const entry of all) {
		const { locale, slug } = parseId(entry.id);
		if (!locale) continue; // stray file outside es/ or en/ — ignore
		const pair = bySlug.get(slug) ?? { slug };
		pair[locale] = entry;
		bySlug.set(slug, pair);
	}
	return Array.from(bySlug.values());
}

/**
 * Pair-level date: publishDate/updatedDate are shared metadata, only the
 * `es/` file needs to carry them (see content.config.ts) — `en/` falls back
 * to its sibling automatically.
 */
export function getPairDate(pair: PostPair): Date {
	const primary = pair.es ?? pair.en;
	const fallback = pair.en ?? pair.es;
	const source =
		(siteConfig.sortPostsByUpdatedDate && (primary?.data.updatedDate ?? fallback?.data.updatedDate)) ||
		primary?.data.publishDate ||
		fallback?.data.publishDate;
	return source ?? new Date();
}

export function sortPairsByDate(pairs: PostPair[]): PostPair[] {
	return [...pairs].sort((a, b) => getPairDate(b).valueOf() - getPairDate(a).valueOf());
}

/** Tags/draft are also pair-level; `es/` is canonical, `en/` is the fallback. */
export function getPairTags(pair: PostPair): string[] {
	return pair.es?.data.tags ?? pair.en?.data.tags ?? [];
}
