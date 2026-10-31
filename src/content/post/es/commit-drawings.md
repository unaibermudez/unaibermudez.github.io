---
title: "Commit Drawings: dibujar en el gráfico de contribuciones de GitHub"
publishDate: "2026-10-31T21:00:00+01:00"
description: "Cómo funciona Commit Drawings: una rejilla en React que genera un script con git fast-import y cómo se adapta a pantallas pequeñas."
tags: [react, git, typescript]
coverImage:
  src: ../_assets/commit-drawings-escritorio.png
  alt: "La rejilla de contribuciones de 2026 con tres corazones dibujados, y debajo el panel con las instrucciones del script de generación"
draft: false
---

Commit Drawings es una web donde dibujas un patrón sobre la rejilla de contribuciones de GitHub y te devuelve un script que lo recrea con commits reales, con fecha retroactiva. El resultado no es una imagen: es un repositorio con cientos de commits repartidos por un año.

Empecé por la rejilla, que era la parte visible, y lo difícil resultó ser generar los commits. Este post trata de eso y de cómo se comporta la rejilla en el móvil.

---

## La rejilla

La rejilla tiene 53 columnas por 7 filas, un año completo. Cada celda es una fecha, y la primera columna empieza en el día de la semana en que cae el 1 de enero, así que las celdas anteriores a esa fecha y posteriores al 31 de diciembre quedan vacías:

```ts
const startDay = new Date(year, 0, 1).getDay();
// para cada semana y cada día de la semana:
const dayOffset = week * 7 + day - startDay;
const currentDate = new Date(year, 0, 1 + dayOffset);
```

Con un click, una celda pasa por los cinco niveles de intensidad, del 0 al 4, y arrastrando se rellenan varias a la vez. Todo el estado es un único objeto de fecha a nivel que vive en la página, y el nivel de cada día es el número de commits que se crean ese día. Los commits se fechan a las 12:00 UTC, para que la zona horaria no mueva uno al día de al lado.

---

## Por qué `git fast-import`

La forma obvia de crear los commits es un bucle de `git commit --date`. Cada vuelta lanza un proceso de git y toca el índice y el árbol de trabajo. `git fast-import` hace lo mismo leyendo un stream de texto por la entrada estándar, en un solo proceso.

Lo medí con un patrón de tres corazones, que son 348 commits, en Git Bash sobre Windows: el bucle tarda 34,5 segundos y `fast-import` 0,26. La diferencia grande es en parte el coste de lanzar procesos en Windows, pero el orden de magnitud es el que justifica el diseño.

El stream de cada commit tiene este aspecto:

```
blob
mark :1
data 29
fun commit - 2026-04-12 (1/3)
commit refs/heads/main
mark :2
author Nombre <correo> 1775995200 +0000
committer Nombre <correo> 1775995200 +0000
data 10
fun commit
from :anterior
M 100644 :1 contribution.txt
```

Cada commit cambia `contribution.txt` con un contenido distinto, así que hay un blob por commit. `data` declara la longitud, en bytes, del bloque que viene a continuación.

---

## La rejilla en el móvil

La primera versión encogía las celdas para que las 53 semanas cupieran en el ancho disponible, con un mínimo de 8 píxeles. En un móvil eso necesita unos 616 píxeles, así que la página se salía de la pantalla: 657 de ancho en una de 393.

Bajar el mínimo era peor, porque cabía todo pero con celdas de unos 4 píxeles, demasiado pequeñas para verlas y tocarlas. La solución es la contraria: por debajo de 640 píxeles las celdas se quedan en 14 y la rejilla se desplaza en horizontal.

![La rejilla en el móvil, con celdas grandes, el botón Dibujar y la leyenda debajo](../_assets/commit-drawings-movil.png)

Eso choca con dibujar arrastrando, porque en una pantalla táctil arrastrar un dedo ya significa desplazar. Un dedo desplaza y un toque pinta una celda, y un botón **Dibujar** convierte el arrastre en pintura. Para que funcione con ratón y con dedo uso eventos de puntero, y mientras se arrastra busco la celda con `document.elementFromPoint`: en táctil, los eventos siguen apuntando a la celda donde empezó el dedo. Como un gesto rápido salta varias celdas entre dos eventos, muestreo la línea entre las dos posiciones para no dejar huecos.

---

## Qué he aprendido

Generar código para dos shells distintos duplica las formas de romperlo, y probar el generador no basta: hay que ejecutar lo que genera.

El proyecto arrancó desde una plantilla generada con Lovable y todavía arrastra dependencias y componentes de shadcn sin usar.

---

El código está en [github.com/unaibermudez/github-commit-drawingsV2](https://github.com/unaibermudez/github-commit-drawingsV2) y la web en [github-commit-drawings.vercel.app](https://github-commit-drawings.vercel.app/).
