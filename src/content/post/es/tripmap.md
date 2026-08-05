---
title: "TripMap: un mapa interactivo para narrar un viaje"
publishDate: "2026-08-05T19:00:00+02:00"
description: "Cómo he construido TripMap: Astro con una isla de React, MapLibre, Turf y Zustand, con la ruta generada a partir de las paradas."
tags: [astro, react, maplibre]
coverImage:
  src: ../_assets/tripmap-escritorio.png
  alt: "El mapa sobre imagen de satélite con la ruta siguiendo la carretera de circunvalación de Islandia, el panel de la parada a la derecha y la línea de tiempo abajo"
draft: false
---

Un viaje largo se cuenta mal con las herramientas de siempre. Un álbum de fotos pierde el orden y la geografía; un mapa con chinchetas pierde el relato; un blog cronológico no te deja ver dónde estabas. Lo que quería era las tres cosas a la vez: un mapa con la ruta, una línea de tiempo que diga qué visité en cada fecha, y para cada parada su texto y sus fotos. Una especie de álbum interactivo donde el mapa y el tiempo son la navegación.

Eso es TripMap. El mapa ocupa casi toda la pantalla y dibuja la ruta y las paradas; abajo hay una línea de tiempo dividida en capítulos; al lado, un panel con el título, las fechas, el texto y las fotos de la parada activa. Todo está sincronizado: da igual si haces click en un punto del mapa, arrastras el cursor de la timeline o pulsas las flechas del teclado.

El viaje que va a llenarlo es uno de varios años por África, con más de cien paradas. Mientras preparo ese contenido, los datos del repo son un viaje de prueba por Islandia con ocho paradas, que es lo que se ve en las capturas de este post.

---

## El stack, y por qué islas de React

| Pieza | Elección |
| --- | --- |
| Framework | Astro con islas de React |
| Lenguaje | TypeScript estricto |
| Mapa | MapLibre GL JS |
| Geometría | Turf.js |
| Estado | Zustand |
| Validación | Zod |
| Estilos | Tailwind |
| Tests | Vitest y Playwright |

La decisión de partida fue que el sitio es **estático**: sin backend, sin base de datos, sin usuarios. El contenido vive en el repositorio y se resuelve en build time. Para un sitio que solo tiene que mostrar un viaje ya escrito, un servidor no aporta nada y sí añade coste y mantenimiento.

Eso deja una tensión: el contenido es estático, pero el mapa no. MapLibre necesita WebGL, estado en cliente y eventos. Aquí es donde entran las **islas**.

Una isla es un componente interactivo dentro de una página que, por lo demás, es HTML estático. Astro renderiza toda la página en build time y envía HTML; solo los componentes que marcas explícitamente llegan al navegador con su JavaScript y se hidratan. El resto de la página no arrastra ningún runtime. La marca es una directiva en el propio componente:

```astro
---
import { App } from '@/components/App';
---

<body>
  <App client:load />
</body>
```

`client:load` significa "hidrata esto en cuanto cargue la página". Hay otras: `client:idle` espera a que el navegador esté ocioso, `client:visible` espera a que el componente entre en el viewport. Sin directiva, el componente se renderiza a HTML en build time y nunca llega JavaScript al navegador.

Conviene ser honesto con lo que aporta aquí: mi isla ocupa la pantalla entera, así que el ahorro de bytes frente a una aplicación de React normal es pequeño. Lo que gano es una frontera explícita, porque la interactividad empieza donde yo digo y todo lo que quede fuera es HTML estático sin que tenga que hacer nada, y no pagar por un framework de rutas ni por SSR que no uso: el build produce un `index.html` y unos cuantos archivos estáticos, que es lo que Pages sabe servir. Dentro de la isla elegí React porque MapLibre y una timeline con arrastre son interactividad de verdad, con bastante estado y ciclo de vida.

Lo que sí decidí a propósito es que **hay una sola isla**, no tres. Mapa, timeline y panel viven dentro de un único `<App client:load />`. Tres islas compartirían el módulo de Zustand igual, porque es el mismo grafo de módulos en la misma página, pero esa suposición sobre el empaquetado es frágil: si cada isla acabara en su propio chunk con su copia del módulo, tendría tres stores independientes y un fallo muy difícil de ver.

---

## Un solo estado

Antes de las funcionalidades hay que explicar esto, porque es de donde salen todas.

Hay **un único estado central** en Zustand. El mapa, la timeline y el panel leen de él y escriben en él, y nunca se hablan entre sí. Todas las formas de navegar hacen exactamente lo mismo: cambiar `currentStopIndex`.

```ts
goToStop: (index) => {
  if (!Number.isFinite(index)) return;
  const target = Math.min(Math.max(Math.trunc(index), 0), lastIndex);
  // Sin cambio no se notifica: la capa de URL cuenta cada aviso como una
  // navegación y metería entradas de historial de más.
  if (target === get().currentStopIndex) return;
  set({ currentStopIndex: target });
},
```

Lo que no está en el store es tan importante como lo que está. El capítulo activo no se guarda: se deriva de la parada activa. La URL tampoco es un estado paralelo, es un suscriptor más. La regla que me puse fue: si me encuentro escribiendo un `useEffect` que sincroniza dos componentes, la respuesta está en el store.

La URL refleja la parada como `?stop=<id>`, con el id y nunca con el índice, porque los índices se desplazan al insertar contenido y romperían los enlaces compartidos. Lo que costó más de lo esperado fue el historial: si cada cambio de parada empujara una entrada, arrastrar el cursor de la timeline metería decenas y el botón de atrás quedaría inservible. La navegación discreta hace `pushState`; el arrastre hace `replaceState` mientras dura, y al soltar restaura la URL de partida antes de empujar la final. El resultado es que un arrastre deja exactamente dos entradas: de dónde venías y dónde has soltado.

---

## Cómo se calcula la ruta

La ruta no se dibuja a mano tramo a tramo: los datos son solo las paradas en orden, y la línea se genera a partir de sus coordenadas. Cómo se genera ha cambiado dos veces desde la primera versión, así que lo cuento en orden.

**Primer intento: un spline sobre la ruta entera.** Lo obvio era coger la polilínea completa de todas las paradas y suavizarla de una vez con `turf.bezierSpline`, que convierte una secuencia de puntos en una curva continua. Tiene dos problemas. El primero es que la curva resultante deja de pasar exactamente por las paradas: los puntos quedan al lado de su propia ruta. El segundo es que "ruta recorrida hasta la parada N" pierde su punto de corte exacto, porque ya no sé en qué coordenada de la curva global cortar.

**Segundo intento: el spline por tramo.** Cada tramo genera su propia geometría y después se concatenan:

```ts
const line = lineString([from.coords, ...leg.via, to.coords]);
return bezierSpline(line).geometry.coordinates;
```

Así cada parada cae exactamente sobre la línea, la ruta recorrida es la concatenación de los primeros N tramos, y un `via` mal puesto (el array opcional de puntos intermedios que uso para corregir los tramos donde la curva se iba por donde no pasé) solo estropea su tramo en vez de deformar la curva entera. El coste es que las uniones entre tramos tienen un pequeño quiebre angular en vez de ser suaves, que a escala continental no se aprecia. Un caso a cubrir con test: un tramo sin `via` son dos puntos, y `bezierSpline` con dos coordenadas devuelve una recta.

**Y ahora: cada tramo según cómo se viajó.** El spline resuelve el problema estético, pero sigue siendo una curva inventada. Mientras el mapa está a escala continental da igual; en cuanto te acercas, se nota. En Islandia el viaje entero es la carretera de circunvalación, y una curva suave que corta por el interior, donde no hay carretera, está contando algo que no pasó. Así que la geometría de cada tramo sale ahora de tres fuentes, por orden de prioridad:

1. **Avión, tren o barco: arco de gran círculo.** Ninguno de los tres sigue una carretera, así que se dibujan con `turf.greatCircle` entre las dos paradas.
2. **Coche o bus: la carretera real**, si está precalculada.
3. **El resto: el spline de antes**, sin cambios.

Esto revierte una decisión que estaba cerrada en la especificación de la v1: que el `mode` del tramo se guardara en los datos pero no cambiara el render. No hizo falta ningún campo nuevo, porque `leg.mode` ya era "cómo llegué a esta parada"; lo que cambia es que ahora el mapa lo lee.

**De dónde salen las carreteras.** No de una llamada en vivo: el sitio sigue siendo estático y, una vez desplegado, no habla con nadie. Hay un script, `npm run roads`, que lee las paradas y los tramos, le pide a [OSRM](https://project-osrm.org/) la ruta de cada tramo en coche o bus que todavía no tenga entrada, y escribe `src/data/generated/road-routes.json`, que se comitea como cualquier otro contenido. Es incremental, para no repetir peticiones al servidor público de demostración cada vez que añado una parada, y falla alto: si OSRM no encuentra ruta, el script para con un error que nombra el tramo. Un fallback silencioso sería lo peor que podría hacer aquí, porque dejaría una curva inventada haciéndose pasar por una carretera.

**Un detalle que no es evidente:** un motor de rutas engancha el punto que le pides a la carretera más cercana, así que lo que devuelve no empieza ni acaba justo en la parada. Por eso, venga de donde venga la geometría, una función `snapEndpoints` fuerza el primer y el último punto a la coordenada exacta de la parada. La garantía que dio el segundo intento, que cada parada caiga sobre la línea, ya no depende de qué generó el tramo.

**Y el coste, que conviene decirlo.** Ese JSON se importa como módulo, así que su contenido acaba dentro del bundle de la aplicación. Con los siete tramos de Islandia ya son unos 760 KB, y el bundle principal pasa de 1 MB. Es asumible con el volumen actual; con cien paradas no lo será, y la salida natural es mover el JSON a `public/` y pedirlo con `fetch`, a cambio de que el cálculo de la geometría deje de ser síncrono.

Todo esto sigue siendo lógica pura sobre GeoJSON, sin React ni DOM por medio, y se calcula una sola vez por viaje con `useMemo`.

---

## El mapa

Uso MapLibre GL JS, que es el fork libre de Mapbox GL. Hay dos basemaps: CARTO Positron, sobrio en grises, y una vista de satélite con teselas de Esri. Los dos se sirven sin token, y los dos exigen mantener su atribución mientras están activos.

Esa condición, que parece un detalle legal, ha acabado decidiendo el layout. La atribución va abajo a la derecha del mapa y tiene que verse entera, así que el panel no puede flotar sobre el mapa: ocupa su sitio en el flujo y el mapa se encoge. En móvil, la hoja del panel se apila entre el mapa y la timeline en vez de superponerse. Es la restricción externa que más ha condicionado el diseño, y no venía de ningún requisito de producto.

Sobre el rendimiento, la decisión que más importa es no usar `maplibregl.Marker`. Cada marker es un elemento del DOM que el navegador reposiciona en cada frame del mapa, y con el volumen previsto, más de cien paradas, eso no se sostiene. Las paradas van como una **source de GeoJSON** con capas de círculos, que las dibuja WebGL. Es una decisión tomada a priori por ese volumen, no una optimización medida: el viaje de prueba tiene ocho paradas y ahí cualquiera de las dos opciones habría ido igual de bien.

De ahí sale otro truco: la parada activa no es una reescritura de los datos, es una segunda capa sobre la misma source, filtrada por índice.

```ts
const activeStopFilter = (index: number): Filter => ['==', ['get', 'index'], index];
```

Cambiar de parada es un `setFilter`, no volver a enviar cien features al worker.

Al navegar, el mapa hace un `flyTo` de 1500 ms, salvo en dos casos: el primer encuadre, que salta porque no hay de dónde venir, y mientras se arrastra el cursor de la timeline, donde el vuelo no daría tiempo a terminar antes del siguiente cambio. El `flyTo` no está marcado como `essential`, así que quien tenga activado `prefers-reduced-motion` obtiene un salto en vez de un vuelo.

Los dos bugs que más tiempo me costaron aquí fallaban igual: el mapa en blanco, sin ninguna excepción en consola.

El primero era el worker de MapLibre. La librería lo busca con `new URL('./maplibre-gl-worker.mjs', import.meta.url)`, que una vez empaquetado apunta al directorio del bundle, donde ese archivo no está. Sin worker no se procesa ninguna tesela. La única pista era un 404 en la pestaña de red. Se arregla importándolo con `?worker&url` para que lo empaquete Vite y pasándole la URL a mano con `setWorkerUrl`.

El segundo era el cambio de basemap. `setStyle` hace por defecto un diff con el style anterior en vez de cargar el nuevo entero: no dispara `style.load` y las capas del viaje se quedan colgando de sources que ya no existen. Con `diff: false` el style se carga completo, y como las capas del viaje se añaden en `style.load`, que salta con el primer style y con todos los posteriores, el mismo código sirve para montar el mapa y para reponerlo después de cambiar.

---

## El panel y las fotos

El panel es donde vive lo que hace que esto sea un álbum y no un mapa: el título de la parada, sus fechas, el texto y las fotos.

![La versión móvil con la hoja del panel desplegada: el mapa arriba, el texto de la parada en medio y la línea de tiempo abajo](../_assets/tripmap-movil.png)

Es el mismo marcado en escritorio y en móvil, con variantes de Tailwind. En escritorio es una columna lateral; en móvil, una hoja inferior que empieza plegada, con la cabecera y los botones de anterior y siguiente siempre visibles, de modo que se puede recorrer el viaje sin perder el mapa de vista. No hay ninguna media query en JavaScript: consultar el ancho en cliente obligaría a un primer render sin saberlo y a arrastrar un listener de `resize`, y la diferencia entre los dos modos es puramente de disposición.

El cuerpo de la parada se escribe en markdown, pero no uso ninguna librería de markdown. Son 62 líneas que reconocen párrafos, negrita, cursiva y enlaces, y que devuelven elementos de React en vez de HTML inyectado: es lo que necesita el texto de una parada, es lógica pura, se testea sin DOM y me ahorra una superficie de sanitización que no quiero mantener.

Con las fotos hay un detalle que no es opcional: el esquema exige `width` y `height` para cada una. Sin esas medidas el navegador no sabe cuánto sitio reservar y la página da un salto cuando la imagen carga. Hoy los escribo a mano, que es justo el tipo de trabajo mecánico que acaba haciéndose mal, así que medir y comprimir las fotos antes de meterlas al repo es lo siguiente que toca automatizar.

En las capturas de este post las fotos son rectángulos grises, porque el viaje de prueba usa placeholders. Es la pieza que falta para que esto esté terminado.

---

## La línea de tiempo

No usé ninguna librería de timeline. Ninguna de las que miré hacía lo que necesitaba, y lo que necesitaba es bastante concreto.

![La pista de la línea de tiempo, con los capítulos "Costa Sur" y "Círculo Norte" y las paradas del capítulo activo expandidas con su nombre y su fecha](../_assets/tripmap-timeline.png)

La escala es **uniforme por índice**, no proporcional al tiempo. En un viaje de varios años una escala temporal real deja huecos enormes: tres meses en un sitio y dos días en el siguiente harían la mayoría de paradas inclicables. Las fechas son etiquetas, no posición.

Tiene dos niveles en la misma pista: los capítulos siempre visibles, y las paradas del capítulo activo expandidas dentro. Los dos niveles salen del mismo reparto, porque la banda de un capítulo crece con `flex-grow` igual a su número de paradas y cada parada se sitúa en `(índice + 0.5) / total`, así que encajan sin sincronizar nada. Y como el capítulo activo se deriva de la parada, arrastrar el cursor hasta otro capítulo lo expande solo: no hay ningún estado de "capítulo abierto" que mantener.

Dos detalles de accesibilidad que salieron de aquí. La pista de paradas es un `slider` de ARIA en vez de un botón por parada: con más de cien paradas, botones llenarían la navegación por tabulador, y las flechas ya son la interacción natural de un slider. Y hubo que desactivar el teclado de MapLibre (`keyboard: false`), porque el canvas procesa las flechas antes de que lleguen a `window` en cuanto tiene el foco: después de hacer click en un pin, las flechas movían el mapa en vez de cambiar de parada.

---

## Calidad de código y tests

Las reglas del proyecto son cortas: TypeScript estricto con `any` prohibido, `noUncheckedIndexedAccess` activado, toda la lógica pura en `src/lib`, y los componentes de React solo renderizan y disparan acciones del store.

`noUncheckedIndexedAccess` merece una mención porque es la opción que más ha cambiado el código. Con ella, indexar un array devuelve `T | undefined` en vez de `T`. En un proyecto que vive de hacer `stops[currentStopIndex]` eso obliga a tratar el caso en todas partes, y la tentación es silenciarlo con `!`. Donde encontró cosas de verdad fue en los bordes: el cálculo de tramos necesita `stops[i]` y `stops[i+1]`, y el `i+1` de la última posición no existe; la ruta parcial con un índice fuera de rango; el bounding box de un capítulo sin paradas. El flag no encuentra bugs por sí solo, te obliga a decidir qué pasa en los casos que ibas a ignorar.

Los datos se validan al cargar. Zod se ocupa de la forma (coordenadas, fechas, códigos de país) y encima hay validaciones de dominio escritas a mano: ids únicos, que el capítulo de cada parada exista, que ningún capítulo se quede sin paradas, que las paradas de un mismo capítulo sean contiguas en el array, y que la cadena de tramos reproduzca el orden de las paradas. Todas fallan con un mensaje que nombra las entidades implicadas. Si al reordenar el viaje dejo una parada de "Costa Sur" detrás de las del "Círculo Norte", el sitio no arranca y dice exactamente esto:

```
El capítulo "costa-sur" se reabre en la parada "borgarnes":
las paradas de un capítulo deben ser contiguas en el array.
```

Esto no es defensivo por gusto. El contenido lo escribo a mano en archivos de TypeScript, y estas son exactamente las formas en que me voy a equivocar al meter cien paradas.

Los **tests unitarios** son 155 con Vitest, y todos van contra `src/lib`: geometría de la ruta, ruta parcial, transiciones del store, sincronización con la URL, agrupación en capítulos, formateo de fechas, el subconjunto de markdown. Corren en entorno `node`, sin DOM. Que la lógica esté separada de los componentes es justo lo que hace que estos tests sean rápidos y no toquen React. Lo que no testeo unitariamente son los componentes, porque por diseño no tienen lógica que probar.

Ese diseño se notó con el cambio de la ruta. Como la elección de fuente por tramo es una función pura, los tests nuevos le inyectan una tabla de carreteras de prueba y comprueban la prioridad entre las tres fuentes sin levantar un mapa ni pedirle nada a OSRM.

Los **tests end-to-end** son de Playwright, y tienen un objetivo distinto: no verifican lógica, verifican que el layout es correcto en escritorio y en móvil. Comprueban que ningún elemento se sale de la ventana caja por caja, porque el `body` es `overflow-hidden` y un desbordamiento no se ve como scroll de la página, que la atribución sigue visible, que la timeline navega, y que cambiar de basemap y volver no deja el mapa sin capas.

El más curioso es el que detecta el mapa en blanco. En headless no hay GPU, Chromium cae en SwiftShader, y desde la versión 125 lo considera inseguro y no llega a crear el contexto WebGL: MapLibre no pinta nada y no da ningún error. La forma de detectarlo sin decodificar la imagen es el peso del PNG del canvas: un color plano se comprime a unos cientos de bytes, y el mapa pintado pasa de cien mil.

```ts
const CANVAS_BLANK_BYTES = 15_000;

await expect
  .poll(async () => (await canvas.screenshot()).byteLength, { timeout: 30_000 })
  .toBeGreaterThan(CANVAS_BLANK_BYTES);
```

Es una heurística, pero el umbral está a un orden de magnitud de los dos casos y falla del lado seguro: como mucho da un falso negativo, no una alarma falsa que bloquee el trabajo.

Playwright no va en CI: necesita navegador y descarga el basemap de un CDN en cada pasada, así que una caída de CARTO o de Esri me bloquearía el despliegue sin que hubiera nada roto. Lo ejecuto en local cuando toco el layout, y deja las capturas en disco para revisarlas. Las tres imágenes de este post salen de ahí. Esa revisión encontró algo que ningún assert habría pillado: el cursor de la timeline dibujaba su tirador justo encima de la marca de la parada activa y las dos se solapaban como un muñeco de nieve.

---

## Qué he aprendido

Lo que más me llevo es la disciplina del estado único. La versión que habría escrito hace un tiempo tendría el mapa avisando a la timeline y un par de `useEffect` intentando que no se pisaran: con cuatro formas distintas de navegar, doce caminos posibles entre componentes. Con un store en el medio son cuatro escrituras y tres lecturas, y añadir la quinta no toca a nadie.

Lo segundo es que las restricciones externas deciden más de lo que parece. La atribución obligatoria de los basemaps no es un requisito de producto ni una decisión de diseño, pero es la razón de que el panel no flote sobre el mapa, de que la hoja móvil se apile en vez de superponerse, y de que uno de los tests e2e compruebe que esa caja sigue dentro de la ventana. Vino de las condiciones de uso de un servicio gratuito y acabó fijando el layout.

Y lo tercero es sobre escribir la especificación antes que el código. Lo valioso no fue el plan de incrementos, que cambió, sino que el documento recoge el *porqué* de cada decisión con su coste aceptado. También sirve para revertirlas a propósito: cuando cambié el cálculo de la ruta, lo primero que hubo que reescribir fue el apartado que decía que el modo de transporte no afectaba al render, y ahí queda por qué se decidió una cosa y por qué se decidió la contraria. Sigue en el repo, en [docs/SPEC.md](https://github.com/unaibermudez/TripMap/blob/main/docs/SPEC.md).

---

## Mejoras futuras

Lo inmediato es meter el contenido real, con las fotos de verdad en vez de los placeholders, automatizar su procesado, y un dominio propio: al ser un project site de GitHub Pages, el sitio cuelga de una subcarpeta, y quitarla pasa por un `CNAME` y por retirar la `base` de la configuración. Y bajar del megabyte de bundle sacando las carreteras del JavaScript.

Con las carreteras ya calculadas, dar distancias y tiempos reales está más cerca de lo que estaba: OSRM los devuelve en la misma respuesta y hoy solo guardo la geometría. Lo grande sería que cualquiera pudiera crear su viaje: un editor de "momentos" (fecha, título, texto y fotos) con la ruta dibujándose en vivo mientras lo rellenas, un modo invitado que guarde el borrador en `localStorage`, y en algún punto cuentas, backend y almacenamiento de imágenes.

Eso último choca de frente con la decisión de partida de que esto es un sitio estático, así que de momento vive en el backlog y no en el plan. Lo que sí se puede hacer sin romperla es el editor y el modo invitado, que solo necesitan `localStorage`.

---

## El despliegue

GitHub Pages, con Actions en cada push a `main`. El workflow instala, pasa `typecheck` y los tests, y solo entonces construye y publica. Son las dos condiciones de "tarea terminada" del proyecto; si no pasan, no se despliega.

El detalle que sí tiene miga es la `base`. El sitio cuelga de `/TripMap/`, y esa `base` está puesta **siempre**, no solo en el build de CI. Eso significa que `npm run dev` sirve en `http://localhost:4321/TripMap/` en vez de en la raíz, que es algo más incómodo. La razón es que ponerla solo en CI dejaría el único entorno parecido a producción sin verificar nunca: desarrollo y tests seguirían en la raíz, y un enlace roto solo aparecería una vez publicado.

Que ese riesgo es real lo demuestran las fotos: Astro reescribe las rutas que ve, pero las suyas las escribo yo a mano en los datos y no pasan por él. Sin prefijo darían 404 en producción mientras el resto del sitio funciona, que es la peor manera de romperse, así que pasan todas por un helper `withBase`.

---

Con esto, el sitio ya hace lo que quería: abres una URL, ves la ruta entera de un vistazo, arrastras el cursor y vas viendo dónde estaba cada semana y qué había allí. Lo que queda es lo que menos código tiene y más trabajo lleva, que es escribir el viaje.

El código está en [github.com/unaibermudez/TripMap](https://github.com/unaibermudez/TripMap) y el sitio en [unaibermudez.github.io/TripMap](https://unaibermudez.github.io/TripMap/).
