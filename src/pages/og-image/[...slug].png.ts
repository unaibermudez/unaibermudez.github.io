import FrauncesItalic from "@fontsource/fraunces/files/fraunces-latin-400-italic.woff";
import FrauncesRegular from "@fontsource/fraunces/files/fraunces-latin-400-normal.woff";
import FrauncesSemiBold from "@fontsource/fraunces/files/fraunces-latin-600-normal.woff";
import FragmentMono from "@fontsource/fragment-mono/files/fragment-mono-latin-400-normal.woff";
import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site-config";
import { formatBylineDate, formatEyebrowDate } from "@/utils/date";
import { Resvg } from "@resvg/resvg-js";
import type { APIContext, InferGetStaticPropsType } from "astro";
import { render } from "astro:content";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";

const ogOptions: SatoriOptions = {
	fonts: [
		{ data: Buffer.from(FrauncesRegular), name: "Fraunces", style: "normal", weight: 400 },
		{ data: Buffer.from(FrauncesSemiBold), name: "Fraunces", style: "normal", weight: 600 },
		{ data: Buffer.from(FrauncesItalic), name: "Fraunces", style: "italic", weight: 400 },
		{ data: Buffer.from(FragmentMono), name: "Fragment Mono", style: "normal", weight: 400 },
	],
	height: 630,
	width: 1200,
};

const SEP = " · ";

const titleClass = (title: string) =>
	title.length > 80
		? "text-5xl leading-tight mb-10"
		: title.length > 55
			? "text-6xl leading-tight mb-10"
			: "text-7xl leading-tight mb-10";

const markup = (props: {
	eyebrow: string;
	title: string;
	byline: string;
	tagsLine: string;
	host: string;
}) =>
	html`<div tw="flex flex-col w-full h-full px-20 py-16" style="background-color: #181611; font-family: Fraunces;">
		<p tw="text-2xl mb-10 tracking-widest uppercase" style="font-family: Fragment Mono; color: #8C9EFF;">
			${props.eyebrow}
		</p>
		<h1 tw="${titleClass(props.title)}" style="color: #F5F2EA; font-weight: 600;">
			${props.title}
		</h1>
		<p tw="text-2xl mb-4" style="font-family: Fragment Mono; color: #C9C4B7;">
			${props.byline}
		</p>
		<p tw="text-xl tracking-wider uppercase" style="font-family: Fragment Mono; color: #8C9EFF;">
			${props.tagsLine}
		</p>
		<div tw="flex flex-1"></div>
		<div tw="flex justify-end w-full">
			<p tw="text-lg tracking-wide" style="font-family: Fragment Mono; color: #6b6154;">
				${props.host}
			</p>
		</div>
	</div>`;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
	const { pubDate, title, tags, readingTime } = context.props as Props;

	const date = new Date(pubDate);
	const authorName = siteConfig.profile?.name ?? siteConfig.author;
	const bylineParts = [
		authorName ? `Por ${authorName}` : null,
		formatBylineDate(date),
		readingTime,
	].filter(Boolean) as string[];

	const host = context.site ? new URL(context.site).host : siteConfig.title;

	const svg = await satori(
		markup({
			eyebrow: `Blog${SEP}${formatEyebrowDate(date)}`,
			title,
			byline: bylineParts.join(SEP),
			tagsLine: tags.join(SEP),
			host,
		}),
		ogOptions,
	);
	const png = new Resvg(svg).render().asPng();
	return new Response(new Uint8Array(png), {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
}

export async function getStaticPaths() {
	const posts = await getAllPosts();
	const filtered = posts.filter(({ data }) => !data.ogImage);
	const items = await Promise.all(
		filtered.map(async (post) => {
			const { remarkPluginFrontmatter } = await render(post);
			const readingTime =
				(remarkPluginFrontmatter as { minutesRead?: string })?.minutesRead ?? "";
			return {
				params: { slug: post.id },
				props: {
					pubDate: (post.data.updatedDate ?? post.data.publishDate).toISOString(),
					title: post.data.title,
					tags: post.data.tags ?? [],
					readingTime,
				},
			};
		}),
	);
	return items;
}
