# CLAUDE.md

Guía para Claude Code al trabajar en este repositorio. Para instrucciones de uso orientadas al
usuario (cómo añadir un proyecto, un post, desplegar) usa **README.md**, no este archivo.

## Qué es esto

Portfolio personal de una sola página (landing + blog) de Unai Bermúdez, Full Stack Developer.
Base técnica: [Astro Sienna](https://github.com/AnjayGoel/astro-sienna) (tema de blog en Astro).
Estética: reskin completo inspirado en una landing editorial de referencia — paleta "papel" +
azul Klein, tipografías Fraunces / Hanken Grotesk / Fragment Mono, cursor personalizado, intro
loader, tarjetas de proyecto apiladas. El sitio es **bilingüe (español/inglés)** — ver "i18n"
más abajo, es la parte más fácil de romper por accidente si no se conoce el mecanismo.

No es un tema genérico sin tocar: el pipeline de Sienna (content collections, dark/light, RSS,
OG images, Pagefind) se mantiene, pero casi todos los componentes visuales se han reescrito.

## Comandos

- `npm install` — usa **npm**, no pnpm/yarn, aunque el tema original venía pensado para pnpm.
  `.npmrc` ya tiene `legacy-peer-deps=true` porque `@astrojs/tailwind@6.0.2` declara un peer
  range de Astro ≤5 aunque funciona bien con Astro 6.3.1 (la versión real instalada).
- `npm run dev` — servidor de desarrollo.
- `npm run build` — `astro check && astro build`, luego `postbuild` corre `pagefind --site dist`.
  En Windows puede imprimir avisos de `sharp` (`Could not load the "sharp" module...`) que son
  inofensivos — el build igual termina con `0 errors` y genera iconos/manifest correctamente
  (verificado). No merece la pena perseguir ese warning.
- `npm run preview` — sirve `dist/` como quedaría en producción. Úsalo para verificar cambios
  que dependan de post-build (Pagefind, OG images, manifest), no solo `npm run dev`.
- `npm run lint` / `npm run format` — Biome + Prettier.

## Arquitectura clave

- **`src/pages/index.astro`** compone la home a partir de los componentes en
  `src/components/landing/` (Hero, About, Projects, BlogSection, Contact, LandingFx). Cada
  sección es un componente independiente con su propio `<style>` scoped.
- **`src/layouts/Base.astro`** tiene una prop `wide`: `true` para la home (secciones full-bleed
  que gestionan su propio ancho vía `.section`/`var(--container)`), `false` (por defecto) para
  páginas internas (`/posts`, `/about`, posts individuales), que se envuelven en `.prose-shell`
  (columna de lectura de ~46rem). Si añades una página nueva, decide cuál de los dos modos le
  corresponde — no asumas que todo el sitio es full-bleed.
- **Nav fija (`Header.astro`)**: usa fondo translúcido con blur, **no** `mix-blend-mode`. Se
  probó `mix-blend-mode: difference` (como en la landing de referencia) y renderizaba el texto
  casi invisible en algunos contextos — no lo reintroduzcas sin verificar visualmente en ambos
  temas. El cursor personalizado (`PortfolioFx.astro`) sí usa blend-difference y ahí funciona
  bien (se verificó con capturas).
- **Anchor navigation**: como la nav es `position:fixed` y no reserva espacio en el flujo, todo
  elemento objetivo de un ancla (`.section`) necesita `scroll-margin-top` (ya está en
  `global.css`). Si añades una sección nueva ancorable, dale la clase `.section` o replica ese
  `scroll-margin-top`.
- **Reveals y contadores**: el sistema `.lr` / `.lr.in` (fade-in al hacer scroll) y los
  `[data-count]` (contadores animados, soportan un decimal si el valor tiene punto) están
  cableados en `src/components/landing/LandingFx.astro`, que solo se incluye en la home. No
  dupliques esta lógica en otros componentes; impórtalos desde ahí si hace falta en otra página.
- **Tokens de diseño**: todo pasa por las variables CSS de `src/styles/global.css`
  (`--theme-bg`, `--theme-text`, `--theme-accent`, `--theme-text-muted`, `--paper`, `--hairline`,
  `--klein`, `--font-serif/sans/mono`, `--container`, `--gutter`, `--ease`). Se reutilizan los
  mismos nombres que ya traía Sienna (evita introducir un segundo sistema de variables paralelo).
  Cambiar la paleta o las fuentes se hace en un único sitio.
- **Dark/light**: `About.astro` usa a propósito el patrón "bloque de contraste" invertido
  (`background: hsl(var(--theme-text))` / `color: hsl(var(--theme-bg))`) — es intencional, sirve
  para que la tarjeta destaque siempre sobre el fondo de la página, en ambos temas. **El menú
  móvil de `Header.astro` NO sigue este patrón** — usa `background: var(--paper)` /
  `color: hsl(var(--theme-text))` para seguir el tema activo. Se probó invertirlo igual que
  `About.astro` y el usuario lo reportó como bug (el menú se abría en el tema contrario al
  seleccionado) — no repitas ese patrón ahí.

## i18n (español/inglés, misma URL)

Decisión explícita del usuario: **una sola URL sirve los dos idiomas** (no `/en/...`), con el
idioma elegido vía toggle y guardado en `localStorage`. Esto se implementó SIN la i18n nativa de
Astro (que genera rutas por idioma) porque esa exige URLs distintas. En su lugar:

- **Ambos idiomas se renderizan a la vez** en el HTML; CSS oculta el que no toca según
  `html[data-lang="es|en"]` (reglas en `global.css`: `[data-lang-es]`/`[data-lang-en]`, análogas
  al `[data-theme]` del tema). `LangProvider.astro` (mismo patrón que `ThemeProvider.astro`) fija
  `data-lang` en un script bloqueante en `<head>` antes del primer pintado — sin esto habría un
  flash del idioma incorrecto.
- **`T.astro`** — `<T k="hero.scroll" />` para literales estáticos de `src/i18n/{es,en}.json`.
  Renderiza `<span data-lang-es>…</span><span data-lang-en>…</span>`; soporta HTML simple embebido
  en el JSON (`<strong>`, `<em>`) vía `set:html`, y sustitución `{token}` con la prop `vars`.
- **`Bilingual.astro`** — igual pero para contenido que NO sale de un diccionario fijo (títulos de
  post, bio de `/about`, fechas formateadas). Usa slots `es`/`en`; con `hasEn={false}` renderiza
  solo el slot `es` sin envolver (fallback si un post no tiene traducción todavía — no lo dejes
  vacío/roto).
- **Blog bilingüe**: cada post vive como dos archivos (mismo nombre) en `src/content/post/es/` y
  `src/content/post/en/`. `data/post.ts` los empareja en un `PostPair` por slug compartido.
  `publishDate`/`tags`/`draft` son metadatos **a nivel de par** (solo hace falta ponerlos en el
  archivo `es/`, `en/` los hereda — ver `getPairDate`/`getPairTags`); `title`/`description`/body
  son por idioma. `posts/[...slug].astro` genera **una** página por slug (no una por archivo), así
  que `/posts/<slug>/` es la misma URL en ambos idiomas. Sigue este mismo patrón si añades otra
  colección con contenido traducible (ver también `src/content/page/{es,en}/about.md`).
- **Metadatos que NO pueden ser bilingües en un único documento** (canónicos en español, a
  propósito): `<title>`/meta description, JSON-LD Schema, RSS (`rss.xml.ts`), imágenes OG
  (`og-image/[...slug].png.ts`). Todos calculan el "canonical" como `pair.es ?? pair.en`. No
  intentes hacerlos bilingües sin cambiar a rutas por idioma primero.
- `src/utils/date.ts` — todos los formateadores aceptan un `locale: "es" | "en"` explícito (no
  hardcodees `en-US`/`es-ES`); los sitios bilingües (`BlogPost.astro`, archivo de posts,
  `BlogSection.astro`) llaman al formateador dos veces, una por idioma, envueltas en `Bilingual`.
- **Gotcha ya pisado**: `LangToggle.astro` compartía la clase `.theme-toggle` con
  `ThemeToggle.astro` para reutilizar estilos — sus reglas `.label::before` colisionaban a
  especificidad igual y uno de los dos botones mostraba el texto del otro. Cada toggle tiene ahora
  su propia clase con estilos duplicados a propósito; no vuelvas a compartir clase entre controles
  que usan `content:` distinto en pseudo-elementos.
- Datos personales centralizados en `src/site.config.ts`. No hay `email` ni `avatar` configurados
  a propósito (sin foto de perfil, contacto solo por GitHub/LinkedIn) — no los añadas sin que el
  usuario lo pida explícitamente. `menuLinks` usa `titleKey` (no texto literal) — renderízalo con
  `<T k={link.titleKey} />`.

## Features desactivadas a propósito

Showcase, comentarios (Giscus), webmentions, analytics (GA4/Goatcounter) y Partytown se
eliminaron del tema original (código y dependencias). Si el usuario pide reactivar alguna:
- Analytics/Partytown: hay que reinstalar `@astrojs/partytown` y volver a añadir los bloques de
  script en `src/components/BaseHead.astro` (hay un comentario ahí mismo señalando dónde iban).
- Comentarios/webmentions: no reintroduzcas los componentes de golpe; confirma primero que es lo
  que quiere el usuario, ya que se quitaron deliberadamente para simplificar el sitio.

## Despliegue

- `astro.config.ts`: `base: "/"` porque el repo de GitHub es `unaibermudez.github.io` (repo de
  usuario, servido en la raíz). Si esto cambia a un repo de proyecto con otro nombre, el
  workflow de `.github/workflows/deploy.yml` detecta el subpath automáticamente vía
  `actions/configure-pages`; no hace falta tocar `astro.config.ts` para eso.
- `.github/workflows/{ci,deploy}.yml` usan `npm ci`/`npm run build` (no pnpm).

## Convenciones de commits

El historial se organizó en commits pequeños e incrementales por categoría (tooling → config →
tipos → estilos → componentes → páginas → deploy). Si añades trabajo nuevo, sigue ese patrón en
vez de un único commit grande, y no añadas trailers de co-autoría de Claude/IA — los commits van
a nombre del usuario.

## Cosas que ya se intentaron y no funcionaron

- `mix-blend-mode: difference` en la nav fija (ver arriba) — sustituido por fondo translúcido.
- Confiar en el scroll nativo del navegador para anclas en la carga inicial: el intro loader y
  las animaciones de la home desplazan el layout después de que el navegador ya hizo el salto de
  ancla, dejándolo desalineado. `PortfolioFx.astro` corrige esto re-aplicando `scrollIntoView()`
  tras `load` y `document.fonts.ready`. Si tocas el timing del intro o de las animaciones del
  hero, vuelve a probar la navegación por ancla desde otra página (`/posts/#sobre`, etc.).

# Contexto del proyecto

Lee los siguientes archivos antes de hacer cualquier cosa:

- `.claude/tono_blog.md` — tono y estilo de escritura
