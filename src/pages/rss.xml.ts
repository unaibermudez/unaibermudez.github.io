import { getPairDate, getPostPairs, sortPairsByDate } from "@/data/post";
import { siteConfig } from "@/site-config";
import { absoluteUrl } from "@/utils/path";
import rss from "@astrojs/rss";

// One item per post (pair), not per language file — an RSS <item> can only
// have one title/description, so Spanish (the site's base language) is
// canonical here, same tradeoff as <title>/meta description elsewhere.
export const GET = async () => {
	const pairs = sortPairsByDate(await getPostPairs());

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: absoluteUrl("/", import.meta.env.SITE),
		items: pairs.map((pair) => {
			const canonical = pair.es ?? pair.en!;
			return {
				title: canonical.data.title,
				description: canonical.data.description,
				pubDate: getPairDate(pair),
				link: `posts/${pair.slug}/`,
			};
		}),
	});
};
