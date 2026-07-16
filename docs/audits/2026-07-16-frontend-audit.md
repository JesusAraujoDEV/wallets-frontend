# Auditoría de frontend — 2026-07-16

Alcance: `wallets-frontend` completo (`src/pages`, `src/components`, `src/lib`, `src/hooks`). Metodología: lectura exhaustiva del código, no solo muestreo — cada hallazgo cita archivo y línea. Tres hallazgos de mayor impacto ya se corrigieron en la misma sesión (marcados **✅ Resuelto**); el resto queda priorizado para decidir cuándo abordarlo.

## Resumen para decidir

| # | Hallazgo | Severidad | Estado |
|---|---|---|---|
| 1 | Onboarding ya construido pero nunca conectado | Alta | ✅ Resuelto |
| 2 | Dashboard sin estado vacío para cuentas nuevas | Alta | ✅ Resuelto |
| 3 | Fetch N+1 de tasas en Transacciones | Alta | ✅ Resuelto |
| 4 | `Subscriptions.tsx`: 3 implementaciones paralelas del mismo formulario | Alta | Pendiente |
| 5 | Mezcla inglés/español en Cuentas y Categorías | Alta (visible) | Pendiente |
| 6 | Patrón de datos inconsistente (react-query vs Store propio) | Media-Alta | Pendiente |
| 7 | Archivos que aún exceden el límite de tamaño del proyecto | Media | Pendiente |
| 8 | Accesibilidad: botones de ícono sin `aria-label` | Media | Parcialmente resuelto |
| 9 | Sin memoización en `Subscriptions.tsx` | Media | Pendiente |
| 10 | Responsive/mobile | — | Sin hallazgos relevantes |

---

## 1. Onboarding — ✅ Resuelto

Ya existe (y ahora está conectado) un tour animado de 6 pasos (`src/components/onboarding/`) que se muestra automáticamente la primera vez que cada usuario entra, y un botón "Ayuda" en el sidebar para volver a verlo cuando quieras. Usa el mismo lenguaje de animación (`framer-motion`, fade + slide, ~0.2s) que ya usa la pantalla de Login, para no introducir un estilo nuevo.

## 2. Dashboard sin estado vacío — ✅ Resuelto

Una cuenta nueva sin cuentas registradas ahora ve una invitación clara a crear su primera cuenta, en vez de 8 gráficas vacías sin contexto (`src/components/EmptyDashboardState.tsx`, integrado en `src/pages/Index.tsx`).

## 3. Fetch N+1 de tasas — ✅ Resuelto

`TransactionsList.tsx` pedía la tasa BCV **una vez por cada fecha distinta** visible en la lista (y, en el peor caso, una vez por cada transacción sin `amountUsd`). Ahora hace **una sola petición** por rango de fechas (`/exchange-rates/history`), verificado en el navegador: antes N peticiones, ahora 1.

---

## 4. `Subscriptions.tsx`: tres implementaciones del mismo formulario (Alta, pendiente)

`src/pages/Subscriptions.tsx` (1102 líneas) contiene dos diálogos de ~250 líneas cada uno ("Crear nueva suscripción" y "Editar suscripción") que reimplementan casi el mismo formulario. Mientras tanto, `src/components/SubscriptionCreateDialog.tsx` (382 líneas) ya implementa el mismo formulario de creación — pero solo lo usa `CalendarView.tsx`; `Subscriptions.tsx` nunca lo importa. Resultado: tres copias del mismo formulario mantenidas por separado.

**Recomendación**: extraer un único `SubscriptionFormDialog` reutilizado por crear/editar/CalendarView. Es el mayor ahorro de líneas y de superficie de bugs de todo el frontend, pero requiere pruebas cuidadosas del flujo de suscripciones — no se abordó en esta pasada por el riesgo de tocar un flujo con lógica de negocio (vínculo a deudas, frecuencias) sin tiempo dedicado a probarlo a fondo.

## 5. Mezcla inglés/español (Alta visibilidad, pendiente)

Ya se tradujo la lista de Transacciones, sus filtros y el diálogo de edición. Quedan en inglés, casi en su totalidad:

- `src/components/AccountManager.tsx` — "Edit Account", "Delete account?", toasts de éxito/error.
- `src/components/CategoryManager.tsx` — "EXPENSE CATEGORIES"/"INCOME CATEGORIES", "Delete category?".
- `src/components/AccountEditorDialog.tsx`, `src/components/CategoryEditorDialog.tsx` — títulos y botones.
- `src/components/TransactionsDeleteConfirm.tsx` — "Delete transaction?".

Estas son justamente las pantallas de configuración inicial (cuentas y categorías) — las primeras que un usuario nuevo toca después del onboarding. Recomendado como siguiente lote de traducción.

## 6. Patrón de datos inconsistente (Media-Alta, pendiente)

El proyecto tiene dos formas de traer datos conviviendo, a veces en el mismo archivo:

- React Query (el estándar documentado en `AGENTS.md`): `CalendarView.tsx`, `CategoryGroups.tsx`, `Debts.tsx`, `Subscriptions.tsx`.
- Un `Store` propio hecho a mano (`src/lib/storage.ts`, 355 líneas — caché + eventos, reimplementando lo que React Query ya hace): `AccountManager.tsx`, `AccountSelector.tsx`, y ahora una parte de `Index.tsx`/`TransactionsList.tsx` (heredado, no se migró en esta pasada por no ampliar el radio de cambio).

No es un bug puntual — es una decisión arquitectónica pendiente: ¿se migra todo a React Query y se retira `storage.ts`, o se documenta como decisión consciente en `docs/DEVIATIONS.md`? Vale la pena resolverlo antes de que crezca más.

## 7. Archivos que aún exceden el límite de tamaño (Media, pendiente)

División ya hecha en esta sesión: `Index.tsx` (494→81 líneas), `TransactionsList.tsx` (703→147 líneas), `TransactionForm.tsx`, `SidebarLayout.tsx`, `stats_service.js`/`transaction_service.js` (backend). Quedan por dividir, de mayor a menor:

| Archivo | Líneas | Nota |
|---|---|---|
| `src/pages/Subscriptions.tsx` | 1102 | Ligado al hallazgo #4 — dividir junto con la deduplicación |
| `src/pages/Profile.tsx` | 858 | |
| `src/pages/CalendarView.tsx` | 653 | |
| `src/pages/Budgets.tsx` | 570 | |
| `src/components/DebtPayDialog.tsx` | 517 | |
| `src/pages/Login.tsx` | 491 | |
| `src/pages/CategoryGroups.tsx` | 462 | |

## 8. Accesibilidad (Media, parcialmente resuelto)

Botones de solo-ícono (editar/eliminar) sin `aria-label` — se corrigió al dividir `TransactionsList.tsx` (`TransactionRow.tsx` ya los tiene). Mismo patrón pendiente en:
- `src/components/CategoryManager.tsx` (líneas ~196-204, ~247-255).

El resto de la app (`Budgets.tsx`, `Subscriptions.tsx`, `DebtCard.tsx`, `CalendarView.tsx`, `ThemeToggle.tsx`) ya lo hace bien — es cuestión de copiar el patrón existente, no de diseñarlo.

## 9. Sin memoización en `Subscriptions.tsx` (Media, pendiente)

Cero `useMemo`/`useCallback` en un archivo de 1102 líneas; varios `.filter().map()` se recalculan en cada tecla escrita en los diálogos de crear/editar. Se resuelve naturalmente al abordar el hallazgo #4.

## 10. Responsive / mobile

Sin hallazgos que requieran acción — diálogos, tablas y badges ya siguen un patrón mobile-safe consistente en toda la app.

---

## Qué no se tocó y por qué

- **Hallazgo #4 (Subscriptions)** — es el de mayor impacto potencial, pero fusionar tres formularios de un flujo con lógica de negocio (deudas vinculadas, frecuencias, montos multi-moneda) sin una sesión dedicada a probarlo a fondo es más riesgo del que vale la pena asumir de paso.
- **Traducción completa (#5)** — se tradujo lo que ya se estaba tocando; el resto es mecánico pero extenso, mejor como lote propio.
- **Migración de `storage.ts` a React Query (#6)** — es una decisión arquitectónica, no un fix; corresponde decidirla explícitamente, no ejecutarla de pasada.
