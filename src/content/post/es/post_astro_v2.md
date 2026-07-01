---
title: "Por qué he usado Astro para mi portfolio"
publishDate: 2026-07-01
description: "Por qué elegí Astro en vez de React o Next.js para este portfolio: rendimiento, content collections y cuándo tiene sentido cada herramienta."
tags: [astro]
---

Cuando decidí montar mi web personal tenía claro que quería dos cosas: una sección de proyectos y un blog donde documentar lo que voy aprendiendo. La pregunta era con qué tecnología hacerlo.

Las opciones obvias eran React puro o Next.js. Al final elegí Astro, y en este post explico por qué.

---

## Qué es Astro

Astro es un framework web orientado a sitios de contenido: portfolios, blogs, documentación. Su característica principal es que genera HTML estático en build time y envía el mínimo JavaScript posible al navegador.

La mayoría de frameworks modernos funcionan al revés: envían JavaScript al navegador y este construye la página. Astro construye la página en el servidor cuando haces `npm run build` y el resultado es HTML puro. El usuario recibe la página ya construida, sin esperar a que se ejecute ningún script.

---

## La diferencia con React y Next.js

**React puro** está pensado para aplicaciones interactivas: dashboards, herramientas, apps con mucho estado. Para un portfolio no tiene mucho sentido: estás enviando un bundle de JavaScript al navegador para renderizar contenido que no cambia. El usuario espera, el navegador ejecuta JS, y entonces ve la página. Para un blog o un portfolio es excesivo.

**Next.js** soluciona parte de esto con su modo de generación estática (SSG), pero sigue siendo una herramienta pensada para aplicaciones complejas. Tiene sentido cuando necesitas rutas dinámicas, autenticación, API routes, o renderizado en servidor. Para una web personal es demasiado.

**Astro** está pensado exactamente para este caso: sitios donde el contenido importa más que la interactividad. No tienes que configurar nada para que genere páginas estáticas: es su comportamiento por defecto.

La diferencia en rendimiento es notable. Un portfolio en React típico puede enviar 200-400kb de JavaScript al navegador antes de que el usuario vea algo. El mismo portfolio en Astro envía prácticamente cero.

---

## Cómo funciona un componente en Astro

La estructura de un componente Astro tiene dos partes separadas por `---`:

```astro
---
// Esto se ejecuta en build time, no en el navegador
// Puedes hacer fetch, leer archivos, importar datos

const proyectos = [
  { nombre: "FinTrack", stack: "React + Node.js + MongoDB" },
  { nombre: "SplitApp", stack: "React + Spring Boot + PostgreSQL" },
]
---

<!-- Esto es el HTML que se genera -->
<ul>
  {proyectos.map(p => (
    <li>
      <strong>{p.nombre}</strong>: {p.stack}
    </li>
  ))}
</ul>

<style>
  /* Scoped por defecto, solo afecta a este componente */
  li {
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
  }
</style>
```

El bloque entre `---` se ejecuta cuando construyes el proyecto, no cuando el usuario abre la página. Si haces un `fetch` ahí, la petición ocurre en build time. El usuario recibe el HTML con los datos ya dentro.

---

## Content Collections para el blog

Una de las razones principales para elegir Astro fue su sistema de Content Collections. Defines el esquema de tus posts y Astro valida que cada archivo Markdown lo cumpla:

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

A partir de ahí, cada post es un archivo `.md` en `src/content/posts/`. Astro genera las rutas automáticamente, valida el frontmatter, y te avisa si falta algún campo obligatorio. No tienes que configurar nada más para tener un blog funcional.

---

## Cuándo usar Astro y cuándo no

**Tiene sentido usar Astro cuando:**
- Estás construyendo un portfolio, blog, o web de documentación
- El contenido es mayormente estático y no cambia en tiempo real
- El rendimiento y el SEO son importantes
- Quieres escribir posts en Markdown sin configurar nada

**No tiene sentido usar Astro cuando:**
- Estás construyendo una aplicación con mucho estado: un dashboard, una herramienta, una app con autenticación compleja
- Necesitas datos en tiempo real: notificaciones, feeds que se actualizan constantemente
- Tienes mucha interactividad: formularios complejos, drag and drop, gráficos en tiempo real

Astro no reemplaza a React ni a Next.js. Son herramientas para casos de uso distintos.

---

## Por qué lo he usado para mi web

Mi portfolio tiene una sección de proyectos, una de sobre mí, y un blog. Ninguna de estas secciones necesita interactividad compleja ni datos en tiempo real. El contenido es estático.

Consideré React puro, pero montar un sistema de blog desde cero (routing, Markdown, sintaxis de código) requería demasiada configuración para algo que Astro te da por defecto. Consideré Next.js, pero es más de lo que necesito: su potencia tiene sentido en aplicaciones más complejas.

Astro me da rendimiento alto sin configuración, un sistema de blog nativo con Markdown, y la opción de añadir componentes React en las partes donde necesite interactividad. Para una web personal es la opción más razonable.

---

Si estás en la misma situación, developer que quiere montar un portfolio con blog, Astro es probablemente la opción más directa. La documentación es buena, el setup es rápido, y el resultado es una web que carga rápido sin tener que optimizar nada manualmente.
