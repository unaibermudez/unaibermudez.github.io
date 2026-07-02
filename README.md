# Portfolio de Unai Bermúdez

Portfolio personal de una sola página (landing + blog), construido sobre el tema
[Astro Sienna](https://github.com/AnjayGoel/astro-sienna) con una estética propia inspirada en
una landing editorial de referencia: paleta "papel" + azul Klein, tipografías Fraunces / Hanken
Grotesk / Fragment Mono, tarjetas de proyecto apiladas, cursor personalizado, modo claro/oscuro
y **contenido en español e inglés** (mismo URL para ambos idiomas, se elige con un toggle y se
recuerda en `localStorage`).

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

`name`/`description` de un proyecto real **no se traducen automáticamente** (a diferencia de los
posts del blog) — se muestran tal cual los escribas, en el idioma que elijas, en ambas versiones
del sitio.

## Cómo añadir un post al blog

Los posts son **bilingües**: cada uno vive como dos archivos con el **mismo nombre**, uno en
`src/content/post/es/` y otro en `src/content/post/en/`. Ambos se sirven en la misma URL
(`/posts/<nombre-de-archivo>/`) — el visitante ve el idioma que tenga seleccionado.

```yaml
# src/content/post/es/mi-post.md
---
title: "Título del post"
publishDate: "2026-08-01T10:00:00+02:00" # hora opcional — solo desempata orden entre posts del mismo día
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

```yaml
# src/content/post/en/mi-post.md  (mismo nombre de archivo)
---
title: "Post title"
description: "One-sentence summary (10–160 characters)."
---

Content in plain Markdown.
```

Reglas importantes:

- **`publishDate`, `tags` y `draft` solo hacen falta en el archivo de `es/`** — son metadatos
  compartidos del post (fecha, etiquetas, si es borrador), no algo que cambie por idioma. El
  archivo de `en/` solo necesita su propio `title` y `description` traducidos; si por lo que sea
  el de `es/` no existiera, se usarían los de `en/` como respaldo.
- **`publishDate` admite hora** (entre comillas, con offset explícito como en el ejemplo). Los
  posts se ordenan siempre de más nuevo a más viejo; si dos posts comparten fecha, la hora
  desempata. La hora se muestra en la página del post (byline); en las listas (home, `/posts/`)
  solo se ve la fecha. Si omites la hora (`publishDate: 2026-08-01`), se trata como medianoche UTC.
- Si todavía no has traducido un post, **puedes omitir el archivo `en/`** — el post se sigue
  mostrando (en español) da igual qué idioma tenga seleccionado el visitante, en vez de
  desaparecer o romper la build.
- El post aparece automáticamente en la sección "Blog" de la home (los 4 más recientes) y en
  `/posts/`. Genera una única imagen OG (1200×630, en español) y una única entrada RSS por post,
  no una por idioma — ver la sección "Idiomas" más abajo sobre esta limitación.
- El buscador de `/posts/` ([Pagefind](https://pagefind.app)) indexa el HTML ya construido, así
  que un post nuevo aparece en la búsqueda después de `npm run build` (no en `npm run dev`).

## Estructura del proyecto

```
src/
  site.config.ts          # nombre, título, GitHub/LinkedIn, menú (por clave i18n)
  content.config.ts       # esquemas de las colecciones (post, page)
  content/
    post/es/*.md            # posts del blog en español
    post/en/*.md            # posts del blog en inglés (mismo nombre de archivo que su par es/)
    page/es/about.md        # página /about en español
    page/en/about.md        # página /about en inglés
  i18n/
    es.json                 # todos los literales de la interfaz, en español
    en.json                 # los mismos literales, en inglés (misma forma que es.json)
  data/
    projects.ts            # proyectos de la sección "Proyectos"
    post.ts                # helpers para leer/emparejar posts es/en (PostPair)
  components/
    T.astro                 # <T k="hero.tagline" /> — renderiza un literal en ambos idiomas
    Bilingual.astro          # como T, pero para contenido dinámico (slots "es"/"en")
    LangProvider.astro       # aplica el idioma guardado antes del primer pintado (evita flash)
    LangToggle.astro         # botón para cambiar de idioma
    landing/                 # Hero, About, Projects, BlogSection, Contact, LandingFx (home)
    layout/                  # Header (nav fija + menú móvil), Footer
    PortfolioFx.astro        # cursor personalizado, intro loader, botón volver arriba
    ThemeToggle.astro        # toggle claro/oscuro
  layouts/
    Base.astro              # layout común (nav, footer, contenedor de lectura)
    BlogPost.astro          # layout de cada post individual (renderiza ambos idiomas)
  pages/                    # rutas: /, /about, /posts, /posts/[slug], /404, rss.xml, etc.
  styles/global.css         # tokens de diseño + reglas CSS que ocultan/muestran cada idioma
public/                      # estáticos servidos en la raíz del sitio
```

## Idiomas (español / inglés)

El sitio es bilingüe con una particularidad: **una sola URL sirve ambos idiomas**. No hay rutas
`/en/...` — el español y el inglés se renderizan a la vez en el HTML, y CSS oculta el que no
corresponde según el atributo `data-lang` en `<html>`. Un script bloqueante en `<head>`
(`LangProvider.astro`, igual que hace `ThemeProvider.astro` con el tema) decide el idioma antes
de la primera pintura — de `localStorage`, o si no hay nada guardado, del idioma del navegador —
así que no hay parpadeo del idioma incorrecto.

### Cómo añadir o cambiar un literal de la interfaz

1. Añade la clave en **ambos** `src/i18n/es.json` y `src/i18n/en.json` (misma ruta de clave,
   por ejemplo `"hero": { "scroll": "..." }`).
2. Úsala en el componente con `<T k="hero.scroll" />`. Si el texto necesita HTML simple (como
   `<strong>`), inclúyelo directamente en el string del JSON — `T` lo inyecta tal cual.
3. Para contenido que no sale de un diccionario fijo (título de un post, la bio de `/about`, algo
   traído de una colección), usa `<Bilingual>` con los slots `es`/`en` en vez de `T` — mira
   cualquier componente en `src/components/landing/BlogSection.astro` como ejemplo.

### Limitaciones conocidas de "una URL, dos idiomas"

Algunas cosas no pueden ser bilingües a la vez en un único documento HTML, así que se quedan en
**español como idioma canónico**, sea cual sea el idioma que el visitante tenga seleccionado:

- `<title>` de la pestaña y `<meta name="description">` (SEO/compartir en redes).
- El feed RSS (`/rss.xml`) — una entrada por post, con título/descripción en español.
- Las imágenes OG generadas (`/og-image/<slug>.png`).
- Los resultados del buscador de Pagefind pueden mezclar fragmentos de ambos idiomas, ya que
  indexa el HTML construido (que contiene el texto de los dos idiomas, uno oculto con CSS).

Si en algún momento el proyecto necesita SEO fino por idioma (URLs `/en/...` separadas,
`hreflang`, sitemap por idioma), el camino natural es migrar a la
[i18n nativa de Astro](https://docs.astro.build/en/guides/internationalization/), que sí genera
rutas por idioma — pero eso implicaría URLs distintas para cada idioma, la decisión contraria a
la que se tomó aquí a propósito (mantener una sola URL).

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
