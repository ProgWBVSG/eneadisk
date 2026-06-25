# EneaTeams — Roadmap operativo

> Documento vivo. Convierte el plan de producto en fases, user stories, prioridades, estimaciones y entregables por sprint — **mapeado contra lo que ya está construido**.
>
> Estados: ✅ Hecho · 🟡 Parcial · ⬜ Pendiente

---

## 1. Visión y propuesta de valor

**No es una "app de eneagrama".** Es una **plataforma para entender equipos, mejorar la comunicación y organizar el trabajo con menos fricción**, usando el eneagrama como motor de comprensión humana.

**Promesa central:** *"Conocé cómo funciona tu equipo y convertí ese conocimiento en acciones concretas."*

**El eneagrama es el medio, no el fin:** se traduce siempre en decisiones de trabajo (cómo comunicar, cómo asignar tareas, cómo liderar, cómo evitar conflictos).

### Usuarios
| Rol | Qué necesita | Qué obtiene |
|---|---|---|
| **Admin / RRHH / Dueño** | Visibilidad del equipo y decisiones | Dashboard de clima, métricas, organigrama, acciones sugeridas |
| **Líder / Supervisor** | Gestionar a su gente | Bienestar agregado, asignar/revisar tareas, guía de liderazgo por tipo |
| **Colaborador** | Entenderse y comunicarse mejor | Perfil, asistente personal, tareas, check-ins, chat |

### Problema central
Desorden, mala comunicación, conflicto latente, baja claridad de roles y poca visibilidad del clima del equipo.

### Criterio de éxito
1. Los empleados completan el test sin fricción.
2. Los managers usan el dashboard semanalmente.
3. Los check-ins se vuelven rutina.
4. Se toman mejores decisiones de tareas y comunicación.
5. El equipo percibe menos conflicto y más claridad.

---

## 2. Estado actual vs. plan (dónde estamos parados)

La app ya cubre buena parte de las Fases 1–5. Resumen honesto:

### Fase 2 — MVP funcional · **~95% ✅**
| Ítem | Estado | Dónde |
|---|---|---|
| Eneatest 10 preguntas | ✅ | `QuestionnaireFlow`, afirmaciones reales del Excel |
| Test profundo 20 (rehacer) | ✅ | `DEEP_QUESTIONS` |
| Guardado del eneatipo en Supabase | ✅ | `persistEnneagramType` |
| Perfil de eneatipo (lenguaje simple) | ✅ | `EmployeeProfile`, `enneagramWorkData` |
| Compatibilidad entre miembros | ✅ | `compatibility.ts` |
| Vista de equipo (fortalezas/riesgos) | ✅ | `EmployeeTeam`, `teamSuggester` |
| Panel admin para invitar | ✅ | código de invitación |
| Tablero de tareas | ✅ | `EmployeeTasks`, `tasks.ts` |
| Check-in emocional | ✅ | `EmployeeCheckins`, `checkIns.ts` |
| Guía de los 9 eneatipos | ✅ | `EnneagramLibrary` |
| Resumen por persona (cómo trabaja/motiva/estresa/comunicar) | ✅ | `AdminPeople` ficha 360, `enneagramWorkData` |
| Recomendaciones por combinación | ✅ | `compatibility`, `teamCollaboration` |
| **Alerta de fricción** | 🟡 | hay flags de riesgo en `AdminPeople`; falta motor dedicado |
| Vista tablero + base de conocimiento | 🟡 | tablero ✅, base de conocimiento integrada parcial |

### Fase 3 — Productividad y seguimiento · **~70% 🟡**
| Ítem | Estado | Nota |
|---|---|---|
| Chat (mensajería en vivo) | ✅ | DMs 1‑a‑1 con tareas y correcciones |
| Presencia "en línea" | ✅ | `subscribeToPresence` |
| **Chat por equipo / proyecto** | ⬜ | hoy solo DMs directos |
| Comentarios y notas internas | ✅ | notas 1‑on‑1, notas de revisión de tareas |
| **Calendario de tareas y reuniones** | ⬜ | no existe módulo |
| Historial de check‑ins | ✅ | `wellbeingInsights`, tracking |
| Organigramas dinámicos | ✅ | rol supervisor + líder de equipo |
| Vistas por jerarquía / compatibilidad | ✅ | falta **vista por proyecto** ⬜ |
| Registro de mejoras personales/equipo | ✅ | metas + diario (`employeeFeatures`) |
| Check‑in automático al cerrar tarea | ⬜ | mejora nueva |
| Plantillas de feedback / sugerencias 1:1 | 🟡 | guía de liderazgo ✅; plantillas dedicadas ⬜ |

### Fase 4 — Inteligencia aplicada · **~50% 🟡**
| Ítem | Estado | Nota |
|---|---|---|
| Asistente IA (Claude) | ✅ | `EmployeeAssistant`, `AIAssistant`, `api/chat.ts` |
| Motor de compatibilidad | ✅ | base; "más fino" por contexto ⬜ |
| Resúmenes semanales | 🟡 | insights de bienestar ✅; **resumen IA automático** ⬜ |
| Recomendaciones por contexto ("qué hacer hoy", "cómo hablar con X", "cómo evitar conflicto") | ⬜ | mejora nueva clave |
| Reasignación sugerida de tareas | ⬜ | |
| Alertas de desgaste/tensión | 🟡 | termómetro ✅; alertas proactivas ⬜ |

### Fase 5 — Panel admin y métricas · **~75% 🟡**
| Ítem | Estado | Nota |
|---|---|---|
| Invitar empleados / ver quién completó test | ✅ | `AdminPeople` |
| Compatibilidad general / clima por equipo | ✅ | `CompanyPanel`, `CompanyAnalytics` |
| Riesgos y tensiones / evolución temporal | ✅ | `CompanyTracking`, tracking components |
| Exportar datos | 🟡 | `ExportButton` (analytics); falta export por área/jerarquía |
| Métricas de bienestar / adopción / interacción | 🟡 | bienestar ✅; **adopción e interacción** ⬜ |
| Alertas automáticas para casos críticos | ⬜ | |

### Fase 6 — Escalado e integraciones · **0% ⬜**
Slack, Google Calendar, Trello, Notion, Google Sheets, WhatsApp Business, API/webhooks. **Nada todavía** (es lo último, correcto).

---

## 3. Alcance y qué queda fuera (por ahora)
**Dentro:** todo lo que conecte personalidad ↔ trabajo real (tareas, comunicación, clima, liderazgo).
**Fuera del MVP inmediato:** integraciones externas, app móvil nativa, reporting white‑label, multi‑idioma. Se retoman post‑validación.

---

## 4. Backlog operativo por sprints (lo que falta)

> Cada sprint ≈ 1–2 semanas. Orden pensado para que cada bloque sume valor de uso real, no complejidad.

### 🟢 Sprint 1 — Cerrar Fase 3 (productividad diaria)
**Objetivo:** que el equipo viva en la app día a día.

- **US‑1** Como colaborador, quiero un **chat por equipo/proyecto** (no solo 1‑a‑1) para coordinar con todos. *(M)*
- **US‑2** Como colaborador, al **marcar una tarea como completada**, quiero un **check‑in rápido** (energía/estrés) para dejar registro del clima. *(S)*
- **US‑3** Como líder, quiero **plantillas de feedback** y **guion de 1:1** según el eneatipo de mi colaborador. *(M)*
- **Entregables:** canales de chat por equipo · check‑in automático al cerrar tarea · plantillas de feedback/1:1.

### 🟢 Sprint 2 — Calendario y agenda
**Objetivo:** centralizar tareas con fecha y reuniones.

- **US‑4** Como usuario, quiero un **calendario** con mis tareas con vencimiento y reuniones del equipo. *(L)*
- **US‑5** Como líder, quiero **agendar reuniones/1:1** y que queden en el calendario del colaborador. *(M)*
- **US‑6** Como app, al cerrar una reunión quiero **sugerir un cierre** según el clima del equipo. *(S)*
- **Entregables:** módulo calendario · agenda de reuniones · sugerencia de cierre de reunión.

### 🟢 Sprint 3 — Inteligencia proactiva (Fase 4, el diferencial)
**Objetivo:** que la app **recomiende acciones**, no solo muestre datos.

- **US‑7** Como líder, quiero un panel **"Qué hacer hoy"** por equipo (acciones concretas según clima y perfiles). *(L)*
- **US‑8** Como usuario, quiero **"Cómo hablar con esta persona"** y **"Cómo evitar conflicto en esta tarea"** generados por IA con el contexto del eneatipo. *(M)*
- **US‑9** Como admin, quiero un **resumen semanal automático** del equipo (bienestar, adopción, focos de tensión). *(M)*
- **Entregables:** sistema de sugerencias · motor de prompts internos (apoyado en la skill `enneagram-expert`) · reportes semanales automáticos.

### 🟢 Sprint 4 — Motor de fricción y reasignación
**Objetivo:** anticipar choques y equilibrar carga.

- **US‑10** Como líder, quiero **alertas de fricción** cuando una combinación de perfiles tiene alto riesgo de choque. *(M)*
- **US‑11** Como líder, quiero **reasignación sugerida** de tareas según perfil + estado actual (estrés/energía). *(L)*
- **US‑12** Como admin, quiero saber **qué combinación necesita mediación**. *(S)*
- **Entregables:** motor de fricción · reglas inteligentes por tipo de equipo · sugerencias de redistribución.

### 🟢 Sprint 5 — Panel admin y métricas (cerrar Fase 5)
**Objetivo:** decisiones con datos vivos.

- **US‑13** Como admin, quiero **métricas de adopción e interacción** (quién usa qué, conexiones entre miembros). *(M)*
- **US‑14** Como admin, quiero **reportes por área/grupo/jerarquía** y **exportarlos**. *(M)*
- **US‑15** Como admin, quiero **alertas automáticas** ante casos críticos de clima. *(S)*
- **Entregables:** panel de métricas ampliado · export por segmento · alertas críticas.

### 🟢 Sprint 6+ — Escalado e integraciones (Fase 6)
- **US‑16** Slack: publicar check‑ins y resúmenes en canales. *(L)*
- **US‑17** Google Calendar: sincronizar reuniones/tareas. *(L)*
- **US‑18** API + webhooks para automatizaciones y export externo. *(L)*
- Luego: Trello, Notion, Google Sheets, WhatsApp Business.
- **Entregables:** integraciones iniciales · webhooks · API.

> Estimación rápida: S = ~1–2 días · M = ~3–5 días · L = ~1–2 semanas.

---

## 5. Métricas a instrumentar (para medir el éxito)
- **Adopción:** % empleados que completan el test · % que entra semanalmente.
- **Rutina:** check‑ins por semana · tareas creadas/cerradas.
- **Clima:** energía/estrés promedio · tendencia · alertas disparadas.
- **Interacción:** mensajes, kudos, tareas asignadas entre miembros.

---

## 6. Cómo debería sentirse
Una mezcla de **tablero de trabajo + mapa humano del equipo + guía de liderazgo + asistente de clima laboral**. Nunca un test aislado.

---

## 7. Decisiones abiertas
- ¿Test completo de 270 (checklist) como modo opcional además del rápido/profundo?
- ¿Calendario propio o integración directa con Google Calendar (saltear módulo propio)?
- ¿Chat por proyecto además de por equipo?
- Prioridad de la primera integración (Slack vs Google Calendar vs WhatsApp).
