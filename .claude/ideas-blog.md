# Ideas de posts (borradores, sin publicar)

Notas de trabajo: aquí no hay posts, solo ideas y esquemas. Cuando una se escriba, va a
`src/content/post/{es,en}/` siguiendo `tono_blog.md` (primera persona, sin rayas largas, sin
postureo) y el modelo editorial: un post por proyecto terminado o fase completa, más
aprendizajes sueltos; nunca posts incrementales de un proyecto en marcha.

## Regla para todo lo de Picharreal Fantasy

El repo es privado porque guarda datos reales de la liga. En los posts: ni nombres ni apellidos
de jugadores, ni resultados reales, ni capturas que no salgan del dataset ficticio
(`pf.mock.dataset=demo`, el equipo «Atlético Cantera»). Enlazar solo a la landing:
<https://unaibermudez.github.io/picharreal-fantasy-landing/>.

---

## 1. Picharreal Fantasy (post del proyecto, fase v1)

**Cuándo:** la v1.x está en producción (tags v1.0.0 a v1.2.0), así que cuenta como fase
completa. Decidir si se publica ya o se espera a cerrar la v2 (rama `feat/v2-game-redesign`) y
se escribe un único post con el proyecto entero.

**Esquema (contexto, proceso, resultado):**

- Qué problema tenía: la organización del equipo vivía en el grupo de WhatsApp (quién va,
  coches, multas) y quería que cada partido tuviera algo en juego.
- Qué es: un fantasy entre compañeros (Quinteto, porra, clasificaciones) más la gestión del
  equipo real (convocatoria, bajas, coches, caja, calendario ICS), como PWA para el móvil.
- Decisiones técnicas:
  - Go en el backend viniendo de Java y Spring Boot. **Por confirmar: por qué Go.**
  - Un solo binario que hace de API y de worker.
  - Contrato primero: `api/openapi.yaml` como fuente de verdad, `oapi-codegen` para el
    servidor y los tipos de TypeScript generados del mismo contrato.
  - `sqlc` + `pgx` en vez de un ORM; migraciones con `goose`.
  - Jobs con River sobre el propio PostgreSQL (ver `docs/adr-jobs.md`).
  - Directo con Server-Sent Events, no WebSockets: el flujo va en un solo sentido.
- Los datos de la liga: un cliente educado contra la API pública de MyGol (1 petición/s,
  caché por hash) y recálculo automático de puntos cuando la organización corrige un acta.
- Privacidad: acceso solo con Google y aprobación del admin, `noindex`, repo privado y landing
  pública con un equipo inventado, más una guardia que falla si aparece un nombre real.
- Despliegue: AWS Lightsail con Docker Compose, Caddy delante y copia diaria a S3.
- Pruebas: Playwright con mocks y un e2e real contra docker compose, con un barrido que
  comprueba que ningún rival aparece en el DOM ni en la red.
- Qué aprendí. **Por escribir: es la parte que más pesa en el modelo del blog.**

**Material:** `docs/architecture.png` (diagrama), capturas de la landing, `docs/adr-*.md`.
Para LinkedIn, el vídeo promocional `video/out/picharreal-fantasy.mp4` (datos ficticios).

## 2. Picharreal Fantasy v2 (post aparte, cuando se cierre)

Solo si la v2 se publica después del post de la v1: invitados, puntos explicados, revisión del
acta por el staff y la nueva navegación (ver `docs/roadmap-v2.md`). No editar el post original.

## 3. Aprendizaje: enseñar un proyecto con datos reales sin enseñar los datos

Post general, no atado al proyecto: repo privado, landing pública con un dataset ficticio
generado desde los mocks, y una comprobación automática (`pnpm check`) que rompe el build si se
cuela un nombre de los fixtures reales. Sirve para cualquier proyecto con datos de terceros.

## 4. Aprendizaje: SSE para un marcador en directo

Por qué Server-Sent Events bastan cuando el servidor es el único que habla: reconexión
automática del navegador, funciona sobre HTTP normal detrás de Caddy, y qué hubo que resolver
(cierre de conexiones, proxies, la PWA en segundo plano). **Por confirmar con el código de
`internal/live` qué problemas hubo de verdad antes de escribirlo.**
