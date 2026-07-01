# Portfolio de Unai Bermúdez

Portfolio personal de una sola página (landing + blog), construido sobre el tema
[Astro Sienna](https://github.com/AnjayGoel/astro-sienna) con una estética propia inspirada en
una landing editorial de referencia: paleta "papel" + azul Klein, tipografías Fraunces / Hanken
Grotesk / Fragment Mono, tarjetas de proyecto apiladas, cursor personalizado y modo claro/oscuro.

## Requisitos

- Node.js 22 (ver `.nvmrc`)
- npm (el repo usa `npm`, no `pnpm`/`yarn`)

## Empezar en local

```sh
npm install
npm run dev
```

Abre http://localhost:4321/ (el puerto puede variar si ya hay otro servidor Astro corriendo; la
terminal te dirá la URL exacta).

> **Nota:** `npm install` necesita `legacy-peer-deps=true` porque `@astrojs/tailwind@6.0.2`
> declara como peer dependency Astro ≤5 aunque funciona bien con Astro 6.3.1 (que es lo que usa
> este repo). Esa flag ya está en `.npmrc`, así que un `npm install` normal funciona sin nada
> adicional.

## Comandos

| Comando           | Qué hace                                                             |
|-------------------|-----------------------------------------------------------------------|
| `npm run dev`     | Servidor de desarrollo con recarga en caliente                       |
| `npm run build`   | Type-check (`astro check`) + build a `dist/` + indexado con Pagefind |
| `npm run preview` | Sirve el build de `dist/` en local, tal como quedaría en producción  |
| `npm run format`  | Formatea con Biome + Prettier                                        |
| `npm run lint`    | Lint con Biome                                                       |

`npm run build` puede imprimir avisos de `sharp` (`Could not load the "sharp" module...`) en
Windows si el binario nativo no coincide con tu entorno — son inofensivos: el build termina con
`0 errors` y los iconos/manifest se generan igualmente (verificado). Si te resulta molesto,
`npm rebuild sharp` suele arreglarlo.

## Cómo añadir un proyecto

La sección **Proyectos** de la home lee de `src/data/projects.ts`. Cada proyecto es un objeto:

```ts
{
  name: "Nombre del proyecto",
  description: "Descripción corta (1–2 frases): qué es y qué problema resuelve.",
  stack: ["React", "Spring Boot", "PostgreSQL"],
  github: "https://github.com/unaibermudez/mi-proyecto", // opcional
  demo: "https://mi-proyecto.vercel.app",                 // opcional
}
```

Los dos proyectos que hay ahora tienen `placeholder: true` (muestran "Próximamente" en vez de
enlaces). Para publicar uno real, sustituye una entrada por la tuya **sin** el campo
`placeholder` — con `github`/`demo` definidos, la tarjeta mostrará automáticamente los enlaces
"Código" y "Demo". Si vacías el array (`projects = []`), la sección muestra un estado "todavía no
hay proyectos" en vez de romperse.

## Cómo añadir un post al blog

Los posts viven en `src/content/post/` como archivos `.md` (o `.mdx`). El nombre de archivo es el
slug de la URL. Frontmatter mínimo:

```yaml
---
title: "Título del post"
publishDate: 2026-08-01
description: "Resumen de una frase (10–160 caracteres) — se usa en tarjetas, RSS y meta tags."
tags: [algun-tag]
# updatedDate: 2026-08-15   # opcional, se muestra como "Actualizado el …"
# draft: true                # excluye el post de los builds de producción
# coverImage:
#   src: ./_assets/portada.png
#   alt: "Descripción para lectores de pantalla"
---

Contenido en Markdown normal.
```

El post aparece automáticamente en la sección "Blog" de la home (los 4 más recientes) y en
`/posts/`. Cada post genera su propia imagen OG (1200×630) en el build, y el buscador
(`/posts/` tiene una caja de búsqueda con [Pagefind](https://pagefind.app)) lo indexa sin
configuración adicional — solo hace falta volver a construir el sitio (`npm run build`).

## Estructura del proyecto

```
src/
  site.config.ts          # nombre, título, GitHub/LinkedIn, idioma, menú
  content.config.ts       # esquemas de las colecciones (post, page)
  content/
    post/*.md              # posts del blog
    page/about.md          # página /about (bio ampliada, no está en el menú)
  data/
    projects.ts            # proyectos de la sección "Proyectos"
    post.ts                # helpers para leer/ordenar posts
  components/
    landing/                # Hero, About, Projects, BlogSection, Contact, LandingFx (home)
    layout/                 # Header (nav fija + menú móvil), Footer
    PortfolioFx.astro       # cursor personalizado, intro loader, botón volver arriba
    ThemeToggle.astro       # toggle claro/oscuro
  layouts/
    Base.astro              # layout común (nav, footer, contenedor de lectura)
    BlogPost.astro          # layout de cada post individual
  pages/                    # rutas: /, /about, /posts, /posts/[slug], /404, rss.xml, etc.
  styles/global.css         # tokens de diseño (paleta, tipografías, secciones editoriales)
public/                      # estáticos servidos en la raíz del sitio
```

## Personalizar

- **Datos personales**: `src/site.config.ts` (nombre, puesto, GitHub, LinkedIn, título/descripción
  del sitio). No hay email de contacto ni avatar configurados a propósito — el contacto es solo
  GitHub/LinkedIn y no hay foto de perfil.
- **Paleta y tipografías**: `src/styles/global.css`, bloque `:root[data-theme="light|dark"]`.
  Los mismos nombres de variable (`--theme-bg`, `--theme-text`, `--theme-accent`, `--klein`,
  `--paper`, `--hairline`, `--font-serif/sans/mono`) se usan en todo el sitio (nav, footer, blog,
  landing), así que cambiarlos ahí se propaga a todas partes.
- **Secciones de la home**: cada una es un componente en `src/components/landing/`, compuestas
  en `src/pages/index.astro`.

## Modo claro/oscuro

Toggle sin JavaScript de layout: el tema se guarda en `localStorage` y se aplica vía el atributo
`data-theme` en `<html>` (ver `src/components/ThemeProvider.astro` y `ThemeToggle.astro`). La
sección "Sobre mí" y el menú móvil usan un bloque de contraste que se invierte automáticamente
según el tema (oscuro-sobre-claro en modo claro, claro-sobre-oscuro en modo oscuro).

## Desplegar en GitHub Pages

El repo incluye `.github/workflows/deploy.yml`, que construye con `npm run build` y publica
`dist/` vía GitHub Actions, detectando automáticamente el base path del repo.

El sitio está configurado como **repo de usuario** (`base: "/"`), lo que en GitHub Pages exige
que el repositorio se llame **exactamente `unaibermudez.github.io`** — así se sirve en
`https://unaibermudez.github.io/` en vez de en una subcarpeta.

1. Crea el repositorio en GitHub con el nombre exacto **`unaibermudez.github.io`** (público) y
   sube el código:
   ```sh
   git init
   git add -A
   git commit -m "Initial commit"
   git remote add origin https://github.com/unaibermudez/unaibermudez.github.io.git
   git push -u origin main
   ```
2. En GitHub, ve a **Settings → Pages** y en "Source" elige **GitHub Actions**.
3. Cada push a `main` dispara el workflow y publica el sitio en
   `https://unaibermudez.github.io/`.

### Sobre el base path

`astro.config.ts` fija `base: "/"` porque el repo es de tipo usuario (`unaibermudez.github.io`),
servido en la raíz del dominio. Si en algún momento prefieres publicarlo como repo de **proyecto**
con otro nombre (por ejemplo `unaibermudez/portfolio`, servido en
`unaibermudez.github.io/portfolio/`), el workflow de GitHub Actions detecta el subpath
automáticamente sin que tengas que tocar nada — o para construir en local con un subpath
concreto:

```sh
BASE_PATH=/portfolio/ npm run build
```

## Créditos

Base técnica: [Astro Sienna](https://github.com/AnjayGoel/astro-sienna) de Anjay Goel (MIT).
Diseño adaptado de una landing de referencia con estética "atelier digital" (papel + azul Klein).

## Licencia

[MIT](./LICENSE) (heredada del tema base).
