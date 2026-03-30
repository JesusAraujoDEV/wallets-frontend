# Plan de Implementación: Refactor UX de Suscripciones

## Resumen

Implementación incremental del refactor UX de suscripciones en Platica. Se extienden los tipos TypeScript, se extrae el componente `CategorySelector`, se refactoriza el `SubscriptionForm` con copy humanizado y soporte multi-moneda, se crea el `ConfirmPaymentModal` con auto-cálculo BCV, y se integra todo en la página de Suscripciones. Los tests de propiedades usan fast-check.

## Tareas

- [x] 1. Extensiones de tipos y mapeo de datos
  - [x] 1.1 Extender interfaces en `src/lib/types.ts`
    - Agregar campo `currency: "USD" | "EUR" | "VES"` a `RecurringTransaction`
    - Agregar campo `currency: "USD" | "EUR" | "VES"` a `RecurringTransactionPayload`
    - Cambiar `accountId` a opcional (`accountId?: number`) en `RecurringTransactionPayload`
    - Extender `ConfirmPendingTransactionPayload` con `accountId: number`, `amount: number`, `currency: "USD" | "EUR" | "VES"`
    - _Requisitos: 3.1, 3.2, 3.3, 6.1_

  - [x] 1.2 Actualizar `mapRecurringTransaction` en `src/lib/subscriptions.ts`
    - Agregar `currency?: string` al tipo `ApiRecurringTransaction`
    - Mapear `currency` con fallback `"USD"` en `mapRecurringTransaction`
    - _Requisitos: 3.4_

  - [ ]* 1.3 Test de propiedad para mapRecurringTransaction (Propiedad 5)
    - **Propiedad 5: mapRecurringTransaction aplica fallback de moneda**
    - Generar objetos API con/sin campo `currency` usando fast-check
    - Verificar que `result.currency` siempre es "USD", "EUR" o "VES"; sin input → "USD"
    - **Valida: Requisitos 3.1, 3.4**

  - [x] 1.4 Actualizar `confirmPendingTransaction` en `src/lib/subscriptions.ts`
    - Enviar payload extendido `{ date, accountId, amount, currency }` al endpoint PATCH
    - _Requisitos: 6.1, 6.2_

  - [ ]* 1.5 Test de propiedad para confirmPendingTransaction (Propiedad 8)
    - **Propiedad 8: confirmPendingTransaction envía payload completo**
    - Generar payloads con `fc.record({ date, accountId, amount, currency })`
    - Verificar que el body del PATCH contiene los 4 campos con valores correctos
    - **Valida: Requisitos 6.1, 6.2**

- [x] 2. Checkpoint — Verificar tipos y mapeo
  - Asegurar que no hay errores de TypeScript. Preguntar al usuario si surgen dudas.

- [x] 3. Extracción del componente CategorySelector
  - [x] 3.1 Crear `src/components/CategorySelector.tsx`
    - Extraer toda la lógica del selector de categorías de `TransactionForm.tsx`: estado del Dialog, grid de categorías, pestañas income/expense, formulario inline de creación (nombre, grupo, color, ícono)
    - Exponer props `value`, `onChange`, `filterType?`, `categories`, `className?`
    - Si `filterType` está definido, ocultar `TabsList` y fijar pestaña al valor dado
    - Dialog fluido: `w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto`
    - Al crear categoría inline → invocar `onChange(newCat.id)` y cerrar Dialog
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.7_

  - [x] 3.2 Reemplazar selector inline en `TransactionForm.tsx`
    - Sustituir toda la lógica inline del selector de categorías por una instancia de `CategorySelector`
    - Mantener comportamiento funcional idéntico al actual
    - Eliminar estado y JSX redundante del selector de categorías
    - _Requisitos: 1.5_

  - [ ]* 3.3 Test de propiedad para CategorySelector onChange (Propiedad 1)
    - **Propiedad 1: CategorySelector invoca onChange con el ID correcto**
    - Generar categorías con `fc.record({ id: fc.uuid(), name: fc.string(), type: fc.constantFrom("income","expense") })`
    - Verificar que `onChange` recibe el `id` exacto de la categoría seleccionada
    - **Valida: Requisitos 1.2**

  - [ ]* 3.4 Test de propiedad para filterType (Propiedad 2)
    - **Propiedad 2: filterType restringe las categorías visibles**
    - Generar listas de categorías con tipos mixtos + `fc.constantFrom("income","expense",undefined)`
    - Verificar que las categorías visibles coinciden con el filtro aplicado
    - **Valida: Requisitos 1.3**

- [x] 4. Checkpoint — Verificar CategorySelector
  - Asegurar que TransactionForm funciona igual que antes con el nuevo CategorySelector. Preguntar al usuario si surgen dudas.

- [x] 5. Refactorizar SubscriptionForm con copy humanizado y multi-moneda
  - [x] 5.1 Refactorizar el formulario de creación en `src/pages/Subscriptions.tsx`
    - Reemplazar "Modo de ejecución" por "¿Cómo pagas esto?" con radio cards (Automático / Recordatorio)
    - Mostrar descripciones contextuales en cada radio card
    - Hacer campo "Cuenta" opcional con placeholder "Sin cuenta asignada (opcional)"
    - Agregar selector de "Moneda de referencia" (USD, EUR, VES) junto al campo de monto
    - Integrar `CategorySelector` con `filterType="expense"` en lugar del Select actual
    - Enviar `currency` en el payload de creación
    - Enviar `accountId` como `undefined` si no se selecciona cuenta
    - _Requisitos: 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 5.2 Test de propiedad para payload con currency (Propiedad 3)
    - **Propiedad 3: El payload de suscripción incluye la moneda seleccionada**
    - Generar monedas con `fc.constantFrom("USD","EUR","VES")` + datos de formulario válidos
    - Verificar que `payload.currency === currencySeleccionada`
    - **Valida: Requisitos 2.6, 2.7**

  - [ ]* 5.3 Test de propiedad para accountId opcional (Propiedad 4)
    - **Propiedad 4: Suscripción permite accountId opcional**
    - Generar estados de formulario sin cuenta seleccionada
    - Verificar que el payload tiene `accountId` como `undefined` o ausente
    - **Valida: Requisitos 2.4**

- [x] 6. Checkpoint — Verificar SubscriptionForm
  - Asegurar que el formulario de suscripciones funciona con el nuevo copy, radio cards, moneda y cuenta opcional. Preguntar al usuario si surgen dudas.

- [x] 7. Crear ConfirmPaymentModal con auto-cálculo BCV
  - [x] 7.1 Crear función auxiliar de formato monto+moneda
    - Implementar función `formatAmountWithCurrency(amount, currency)` que retorne string con monto y moneda (ej: "37.00 EUR")
    - _Requisitos: 4.1, 7.1_

  - [ ]* 7.2 Test de propiedad para formato monto+moneda (Propiedad 6)
    - **Propiedad 6: Formato de monto con moneda**
    - Generar montos con `fc.float({ min: 0, noNaN: true })` + `fc.constantFrom("USD","EUR","VES")`
    - Verificar que el string resultado contiene tanto el monto formateado como el identificador de moneda
    - **Valida: Requisitos 4.1, 7.1**

  - [x] 7.3 Crear función auxiliar de conversión de moneda
    - Implementar `calculateConvertedAmount(referenceAmount, referenceCurrency, accountCurrency, snapshot)` que aplique la lógica de conversión BCV
    - Si monedas iguales → retornar monto original
    - Si cuenta VES y referencia USD → `snap.vesPerUsd × monto`
    - Si cuenta VES y referencia EUR → `snap.vesPerEur × monto`
    - _Requisitos: 5.1, 5.2, 5.3_

  - [-] 7.4 Test de propiedad para conversión BCV (Propiedad 7)
    - **Propiedad 7: Conversión de moneda con tasa BCV**
    - Generar montos positivos, monedas de referencia (USD/EUR), y `ExchangeSnapshot` con tasas positivas finitas
    - Verificar que el resultado es `tasa × monto` (con tolerancia de redondeo) para VES, o igual al monto para misma moneda
    - **Valida: Requisitos 5.1, 5.2, 5.3**

  - [x] 7.5 Crear componente `src/components/ConfirmPaymentModal.tsx`
    - Implementar modal con: referencia original ("Referencia: {monto} {moneda}"), selector de cuenta obligatorio, campo de monto final editable, selector de moneda final, campo de fecha pre-rellenado con hoy
    - Auto-cálculo: al seleccionar cuenta con moneda diferente → invocar `getRateByDate(paymentDate)` → calcular y auto-rellenar monto
    - Indicador de carga mientras se obtiene tasa BCV
    - Permitir edición manual del monto auto-calculado
    - Toast de error si `getRateByDate` falla, campo vacío para entrada manual
    - Re-calcular al cambiar fecha de pago
    - Validación: no confirmar sin cuenta seleccionada, mostrar mensaje inline
    - Dialog fluido: `w-[95vw] max-w-md max-h-[85vh] overflow-y-auto`
    - Invocar `confirmPendingTransaction` con payload `{ date, accountId, amount, currency }`
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 7.2, 7.3_

- [x] 8. Integrar ConfirmPaymentModal en la página de Suscripciones
  - [x] 8.1 Reemplazar dialog de confirmación inline en `src/pages/Subscriptions.tsx`
    - Sustituir el Dialog simple de confirmación por `ConfirmPaymentModal`
    - Pasar `referenceCurrency` y `referenceAmount` desde la suscripción asociada (cruzar por `description` o `Transaction.currency`)
    - Usar `Transaction.currency` con fallback `"USD"` si no está presente
    - Mostrar moneda de referencia junto al monto en las alertas de pago (ej: "37.00 EUR")
    - _Requisitos: 7.1, 7.2, 7.3_

- [x] 9. Checkpoint final — Verificar integración completa
  - Asegurar que todos los tests pasan, que el flujo completo funciona (crear suscripción con moneda → generar pendiente → confirmar con auto-cálculo). Preguntar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido.
- Cada tarea referencia requisitos específicos para trazabilidad.
- Los checkpoints aseguran validación incremental.
- Los tests de propiedades validan propiedades universales de correctitud con fast-check.
- Los tests unitarios validan ejemplos específicos y edge cases.
- El backend `PATCH /api/transactions/:id/confirm` ya acepta `{ date, accountId, amount, currency }` — no hay bloqueante.
- El servicio BCV (`src/lib/rates.ts`) con `getRateByDate` ya existe y se reutiliza.
