# EneaTeams — Plan de integraciones (costo $0)

> Objetivo: que operarios y admins puedan **sincronizar EneaTeams con las apps que ya usan** (calendario, chat) sin pagar nada. Ordenado de más barato/rápido a más completo.

## Principio: empezar por lo que NO necesita OAuth ni servidores pagos

La forma más barata de "sincronizar" no siempre es la API oficial. Hay tres niveles:

| Nivel | Qué es | Costo | Esfuerzo |
|---|---|---|---|
| 1. Feeds / Webhooks | El usuario pega una URL en su app | **$0**, sin OAuth | Bajo |
| 2. OAuth API (lectura/escritura) | Login con Google/Slack, dos vías | $0 (free tier) | Medio-alto |
| 3. iPaaS (Zapier/Make) | Pegamento visual | Free tier limitado | Bajo (pero topes) |

---

## ✅ FASE A — Lo que conviene hacer primero (todo $0, sin claves pagas)

### A1. Feed de calendario `.ics` (suscripción) — *el más recomendado*
**Qué:** EneaTeams expone una URL secreta tipo `.../calendar/<token>.ics` con las tareas con vencimiento + reuniones del usuario. Él la **pega una vez** en Google Calendar / Outlook / Apple Calendar ("Suscribirse a un calendario por URL").
- **Para qué sirve:** ven sus tareas y reuniones de EneaTeams dentro del calendario que ya usan, **sin entrar a la app**. Se actualiza solo.
- **Costo:** $0. **No** necesita OAuth, ni app de Google, ni claves.
- **Sentido:** una vía (EneaTeams → su calendario). Es lo que cubre el 80% del pedido "que se sincronice con el calendar".
- **Cómo:** una Edge Function de Supabase (o ruta serverless en Vercel) que valida el token y devuelve texto `.ics`. El token va en la tabla `profiles` (columna `ics_token`).
- **Esfuerzo:** bajo. **Esto haría primero.**

### A2. Webhooks entrantes de Slack / Discord
**Qué:** el admin crea un "Incoming Webhook" en su Slack/Discord (gratis, 2 clics) y pega esa URL en EneaTeams.
- **Para qué sirve:** publicar automáticamente en un canal: **resumen semanal**, **alertas de clima/desgaste**, **check-ins del equipo**, nuevos reconocimientos (kudos).
- **Costo:** $0. Sin OAuth, sin app aprobada. Solo una URL.
- **Cómo:** guardar la webhook URL por empresa; una Edge Function hace `POST` con el mensaje.
- **Esfuerzo:** bajo.

### A3. Exportar a CSV / Google Sheets (manual)
**Qué:** botón "Exportar" (ya existe en Analytics) ampliado a personas, tareas y check-ins → CSV que se importa a Sheets/Excel.
- **Costo:** $0, sin API.
- **Esfuerzo:** muy bajo (reusar `ExportButton`).

---

## 🔶 FASE B — APIs oficiales (gratis pero más setup, dos vías)

### B1. Google Calendar API (OAuth)
**Qué:** "Conectar Google" → EneaTeams **crea/edita eventos** en el Google Calendar del usuario (reuniones, 1:1) y opcionalmente lee disponibilidad.
- **Para qué sirve:** sincronización **bidireccional** real de reuniones. Agendar un 1:1 en EneaTeams aparece en su Google Calendar con invitación.
- **Costo:** **$0** (la API de Google Calendar es gratis; cuota muy alta). Necesita: crear un proyecto en Google Cloud (gratis) + pantalla de consentimiento OAuth.
- **Lo que requiere de vos:** configurar el OAuth Client en Google Cloud (gratis) y pegar 2 claves. Yo no puedo hacerlo solo (son credenciales tuyas).
- **Esfuerzo:** medio-alto. Es el paso lógico **después** del feed `.ics`.

### B2. Slack OAuth (app instalable)
Más potente que el webhook (responder comandos, DMs), pero requiere publicar una app de Slack. **Solo si lo piden:** el webhook (A2) ya cubre casi todo gratis.

---

## ⚪ FASE C — Otras apps (cuando haya demanda)

| App | Uso | Costo | Nota |
|---|---|---|---|
| Notion | Volcar reportes/equipos a una base | $0 free tier | API simple |
| Trello | Espejar tareas en tableros | $0 free tier | Útil si ya lo usan |
| Google Sheets API | Export automático periódico | $0 | Más que el CSV manual |
| **WhatsApp Business** | Avisos por WhatsApp | **💲 NO gratis** | La API oficial cobra por conversación. **Evitar** por ahora |
| Zapier / Make | Conectar con 1000+ apps sin código | Free tier con topes | Atajo, pero limitado |

---

## Recomendación (orden y porqué)

1. **A1 — Feed `.ics`** → resuelve "sincronizar con el calendario" para todos, $0, sin que toques claves. *Arrancaría por acá.*
2. **A2 — Webhook Slack/Discord** → lleva los avisos a donde el equipo ya conversa, $0.
3. **A3 — Export CSV** → rápido, reusa lo que hay.
4. **B1 — Google Calendar OAuth** → sincronización bidireccional, cuando quieras invertir el setup (gratis pero más trabajo).
5. Resto (Notion/Trello/Sheets) según pedidos reales. **WhatsApp queda afuera** porque cuesta.

> Nota: A1, A2 y A3 los puedo implementar yo casi enteros; solo necesitás pegar una URL (webhook) o suscribir el feed. B1 te pide crear el proyecto OAuth en Google Cloud (gratis) y pasarme 2 claves.
