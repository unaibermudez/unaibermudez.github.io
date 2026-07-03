---
title: "Why I used Astro for my portfolio"
description: "Why I chose Astro over React or Next.js for this portfolio: performance, content collections, and when each tool actually makes sense."
---

When I decided to build my personal site I had two things clear from the start: a projects section and a blog to document what I'm learning. The question was which framework to use.

The obvious options were plain React or Next.js. I ended up going with Astro, and this post explains why.

---

## What Astro is

Astro is a web framework built for content-driven sites: portfolios, blogs, documentation. Its main feature is that it generates static HTML at build time and ships the minimum amount of JavaScript possible to the browser.

Most modern frameworks work the other way around: they ship JavaScript to the browser and let it build the page. Astro builds the page on the server when you run `npm run build`, and the result is plain HTML. The user receives a page that's already rendered, with no scripts to wait for.

---

## The difference from React and Next.js

**Plain React** is meant for interactive applications: dashboards, tools, apps with a lot of state. For a portfolio it doesn't make much sense — you're shipping a JavaScript bundle to the browser just to render content that never changes. The user waits, the browser runs JS, and then they see the page. For a blog or a portfolio, that's overkill.

**Next.js** solves part of this with its static site generation mode (SSG), but it's still a tool designed for complex applications. It makes sense when you need dynamic routes, authentication, API routes, or server-side rendering. For a personal site, it's too much.

**Astro** is built exactly for this use case: sites where content matters more than interactivity. You don't have to configure anything to get static pages — it's the default behavior.

The performance difference is noticeable. A typical React portfolio might ship 200–400 KB of JavaScript before the user sees anything. The same portfolio in Astro ships practically zero.

---

## How an Astro component works

An Astro component has two parts separated by `---`:

```astro
---
// This runs at build time, not in the browser
// You can fetch, read files, import data

const projects = [
  { name: "FinTrack", stack: "React + Node.js + MongoDB" },
  { name: "SplitApp", stack: "React + Spring Boot + PostgreSQL" },
]
---

<!-- This is the HTML that gets generated -->
<ul>
  {projects.map(p => (
    <li>
      <strong>{p.name}</strong>: {p.stack}
    </li>
  ))}
</ul>

<style>
  /* Scoped by default — only applies to this component */
  li {
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
  }
</style>
```

The block between `---` runs when you build the project, not when the user opens the page. If you do a `fetch` there, the request happens at build time. The user receives HTML with the data already baked in.

---

## Content Collections for the blog

One of the main reasons I chose Astro was its Content Collections system. You define the schema for your posts and Astro validates that each Markdown file matches it:

```ts
// src/content/config.ts
const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
  })
});
```

From there, each post is a `.md` file inside `src/content/posts/`. Astro generates the routes automatically, validates the frontmatter, and warns you if a required field is missing. No extra configuration needed to have a working blog.

---

## When to use Astro and when not to

**Astro makes sense when:**
- You're building a portfolio, blog, or documentation site
- The content is mostly static and doesn't change in real time
- Performance and SEO matter
- You want to write posts in Markdown without configuring anything

**Astro doesn't make sense when:**
- You're building an application with a lot of state: a dashboard, a tool, an app with complex auth
- You need real-time data: notifications, constantly-updating feeds
- You have a lot of interactivity: complex forms, drag and drop, real-time charts

Astro doesn't replace React or Next.js. They're tools for different use cases.

---

## Why I used it for this site

My portfolio has a projects section, an about page, and a blog. None of these need complex interactivity or real-time data. The content is static.

I considered plain React, but building a blog system from scratch (routing, Markdown, syntax highlighting) would have required too much setup for something Astro gives you out of the box. I considered Next.js, but it's more than I need — its strengths make sense in more complex applications.

Astro gives me high performance without configuration, a native Markdown blog system, and the option to drop in React components wherever I need interactivity. For a personal site, it's the most straightforward choice.

---

If you're in the same situation — developer wanting to build a portfolio with a blog — Astro is probably the most direct path. The documentation is solid, the setup is fast, and the result is a site that loads quickly without having to manually optimize anything.
