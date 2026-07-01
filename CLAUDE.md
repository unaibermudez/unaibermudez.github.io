# CLAUDE.md

Guía para Claude Code al trabajar en este repositorio. Para instrucciones de uso orientadas al
usuario (cómo añadir un proyecto, un post, desplegar) usa **README.md**, no este archivo.

## Qué es esto

Portfolio personal de una sola página (landing + blog) de Unai Bermúdez, Full Stack Developer.
Base técnica: [Astro Sienna](https://github.com/AnjayGoel/astro-sienna) (tema de blog en Astro).
Estética: reskin completo inspirado en una landing editorial de referencia — paleta "papel" +
azul Klein, tipografías Fraunces / Hanken Grotesk / Fragment Mono, cursor personalizado, intro
loader, tarjetas de proyecto apiladas. Todo el contenido visible está **en español**.

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
- **Dark/light**: el patrón "bloque de contraste" (`About.astro`, el menú móvil de `Header.astro`)
  usa `background: hsl(var(--theme-text))` / `color: hsl(var(--theme-bg))` a propósito — se
  invierte solo según el tema (oscuro-sobre-claro en modo claro, claro-sobre-oscuro en modo
  oscuro). Es intencional, no un bug, aunque a primera vista parezca "colores cambiados".

## Idioma y contenido

- Todo el copy visible (UI, aria-labels, fechas, meta descriptions, mensajes de OG image, reading
  time) está en español. `src/utils/date.ts` usa `siteConfig.date.locale` (es-ES) para todos los
  formateadores — si añades un formateador de fecha nuevo, síguelo desde ahí, no hardcodees
  `en-US`/`en-GB` como venía en el tema original.
- Datos personales centralizados en `src/site.config.ts`. No hay `email` ni `avatar` configurados
  a propósito (sin foto de perfil, contacto solo por GitHub/LinkedIn) — no los añadas sin que el
  usuario lo pida explícitamente.

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
