# Documento de Requisitos — Refactor UX de Suscripciones

## Introducción

Este documento define los requisitos para el refactor de la experiencia de usuario (UX) de la página de Suscripciones en Platica, una aplicación de finanzas personales construida con React + TypeScript. El alcance cubre tres ejes: (1) extracción de un componente reutilizable `CategorySelector`, (2) humanización del copy en el formulario de suscripciones con soporte multi-moneda, y (3) un modal inteligente de confirmación de pago con conversión automática vía tasas BCV.

## Glosario

- **Platica**: Nombre de la aplicación de finanzas personales.
- **CategorySelector**: Componente React reutilizable que encapsula la lógica del selector de categorías (combobox con formulario inline de creación).
- **TransactionForm**: Componente existente (`src/components/TransactionForm.tsx`) que contiene la lógica del selector de categorías a extraer.
- **SubscriptionForm**: Formulario de creación/edición de suscripciones recurrentes dentro de la página de Suscripciones.
- **ConfirmPaymentModal**: Dialog modal que se abre al confirmar un pago pendiente, con selector de cuenta, monto final y moneda.
- **BCV_API**: API externa de tasas de cambio del Banco Central de Venezuela (`https://bcv-api.irissoftware.lat/api/v1/exchange-rates`).
- **Moneda_de_Referencia**: Moneda en la que se define el monto original de una suscripción (USD, EUR o VES).
- **Cuenta_de_Origen**: Cuenta bancaria asociada a una suscripción recurrente.
- **Modo_de_Ejecución**: Configuración que determina si una suscripción se procesa automáticamente o requiere confirmación manual.
- **Tasa_BCV**: Tasa de cambio oficial publicada por el BCV para una fecha específica.
- **Transacción_Pendiente**: Transacción con `status: "pending"` generada por una suscripción en modo manual que requiere confirmación del usuario.
- **apiFetch**: Cliente HTTP centralizado de Platica (`src/lib/http.ts`) que gestiona autenticación JWT y prefijo de API.
- **getRateByDate**: Función existente en `src/lib/rates.ts` que obtiene tasas BCV históricas por fecha con caché local.
- **Confirm_Endpoint**: Endpoint `PATCH /api/transactions/:id/confirm` usado para confirmar transacciones pendientes.

## Requisitos

### Requisito 1: Extracción del componente CategorySelector

**User Story:** Como desarrollador de Platica, quiero extraer la lógica del selector de categorías del TransactionForm a un componente reutilizable `CategorySelector`, para poder usarlo tanto en el TransactionForm como en el SubscriptionForm sin duplicar código.

#### Criterios de Aceptación

1. THE CategorySelector SHALL encapsular el botón de apertura, el Dialog con grid de categorías, las pestañas income/expense, el formulario inline de creación de categoría (nombre, grupo, color, ícono) y la lógica de estado asociada.
2. THE CategorySelector SHALL exponer una prop `value` (ID de categoría seleccionada) y una prop `onChange` (callback con el ID seleccionado) para integrarse con formularios controlados.
3. THE CategorySelector SHALL aceptar una prop opcional `filterType` de tipo `"income" | "expense" | undefined` para restringir las categorías visibles; WHEN `filterType` es `undefined`, THE CategorySelector SHALL mostrar ambas pestañas income/expense.
4. WHEN el usuario crea una categoría inline dentro del CategorySelector, THE CategorySelector SHALL invocar `onChange` con el ID de la categoría recién creada y cerrar el Dialog.
5. THE TransactionForm SHALL reemplazar toda la lógica inline del selector de categorías por una instancia del componente CategorySelector, manteniendo el comportamiento funcional idéntico al actual.
6. THE SubscriptionForm SHALL utilizar una instancia del componente CategorySelector con `filterType="expense"` para la selección de categoría.
7. THE CategorySelector SHALL seguir el patrón de Dialog fluido existente: `max-h-[85vh]`, `overflow-y-auto`, ancho responsivo con `w-[95vw] max-w-lg`.

### Requisito 2: Humanización del copy y soporte multi-moneda en SubscriptionForm

**User Story:** Como usuario de Platica, quiero que el formulario de suscripciones use un lenguaje claro y cercano en lugar de términos técnicos, para entender fácilmente cómo se comportará cada suscripción.

#### Criterios de Aceptación

1. THE SubscriptionForm SHALL reemplazar la etiqueta "Modo de ejecución" por "¿Cómo pagas esto?" y presentar dos opciones con radio buttons o cards seleccionables.
2. WHEN el usuario selecciona la opción "Automático", THE SubscriptionForm SHALL mostrar la descripción "Platica lo registrará solo cada mes (ideal para débitos automáticos)."
3. WHEN el usuario selecciona la opción "Recordatorio", THE SubscriptionForm SHALL mostrar la descripción "Platica te avisará para que confirmes la fecha, el monto y de qué cuenta lo pagaste."
4. THE SubscriptionForm SHALL presentar el campo "Cuenta de Origen" como opcional, permitiendo al usuario guardar la suscripción sin seleccionar una cuenta.
5. THE SubscriptionForm SHALL incluir un selector de "Moneda de Referencia" con las opciones USD, EUR y VES.
6. WHEN el usuario selecciona una Moneda_de_Referencia, THE SubscriptionForm SHALL asociar esa moneda al monto ingresado en el campo "Monto".
7. THE SubscriptionForm SHALL enviar el campo `currency` (Moneda_de_Referencia seleccionada) como parte del payload al crear o actualizar una suscripción recurrente.

### Requisito 3: Extensión del tipo RecurringTransaction para multi-moneda

**User Story:** Como desarrollador de Platica, quiero que los tipos TypeScript de suscripciones recurrentes soporten moneda de referencia y cuenta opcional, para que el frontend refleje correctamente el nuevo modelo de datos.

#### Criterios de Aceptación

1. THE RecurringTransaction interface SHALL incluir un campo `currency` de tipo `"USD" | "EUR" | "VES"` con valor por defecto `"USD"`.
2. THE RecurringTransactionPayload interface SHALL incluir un campo `currency` de tipo `"USD" | "EUR" | "VES"`.
3. THE RecurringTransactionPayload interface SHALL definir el campo `accountId` como opcional (`accountId?: number`).
4. THE mapRecurringTransaction function SHALL mapear el campo `currency` del response de la API al tipo RecurringTransaction, usando `"USD"` como fallback cuando el campo no esté presente.

### Requisito 4: Modal inteligente de confirmación de pago (ConfirmPaymentModal)

**User Story:** Como usuario de Platica, quiero que al confirmar un pago pendiente se abra un modal con la referencia original, selector de cuenta y monto final, para registrar el pago real con precisión.

#### Criterios de Aceptación

1. WHEN el usuario hace clic en "Confirmar Pago" en una Transacción_Pendiente, THE ConfirmPaymentModal SHALL abrirse mostrando la referencia original con formato "Referencia: {monto} {moneda}" (ejemplo: "Referencia: 37 EUR").
2. THE ConfirmPaymentModal SHALL incluir un selector de cuenta obligatorio que liste todas las cuentas del usuario.
3. THE ConfirmPaymentModal SHALL incluir un campo de monto final editable y un selector de moneda final.
4. THE ConfirmPaymentModal SHALL incluir un campo de fecha de pago pre-rellenado con la fecha actual.
5. THE ConfirmPaymentModal SHALL seguir el patrón de Dialog fluido: `max-h-[85vh]`, `overflow-y-auto`, ancho responsivo.
6. IF el usuario intenta confirmar sin seleccionar una cuenta, THEN THE ConfirmPaymentModal SHALL mostrar un mensaje de validación indicando que la cuenta es obligatoria.

### Requisito 5: Auto-cálculo de conversión con tasa BCV

**User Story:** Como usuario de Platica, quiero que al seleccionar una cuenta en VES para un pago en USD o EUR, el monto final se calcule automáticamente usando la tasa BCV del día, para no tener que buscar la tasa manualmente.

#### Criterios de Aceptación

1. WHEN el usuario selecciona una cuenta cuya moneda difiere de la Moneda_de_Referencia de la suscripción, THE ConfirmPaymentModal SHALL invocar `getRateByDate` con la fecha de pago seleccionada para obtener la Tasa_BCV.
2. WHEN la cuenta seleccionada es VES y la Moneda_de_Referencia es USD, THE ConfirmPaymentModal SHALL calcular el monto final como `Tasa_BCV.vesPerUsd × monto_referencia` y auto-rellenar el campo de monto final.
3. WHEN la cuenta seleccionada es VES y la Moneda_de_Referencia es EUR, THE ConfirmPaymentModal SHALL calcular el monto final como `Tasa_BCV.vesPerEur × monto_referencia` y auto-rellenar el campo de monto final.
4. WHILE la tasa BCV se está cargando, THE ConfirmPaymentModal SHALL mostrar un indicador de carga en el campo de monto final.
5. THE ConfirmPaymentModal SHALL permitir al usuario editar manualmente el monto final auto-calculado.
6. IF la obtención de la Tasa_BCV falla, THEN THE ConfirmPaymentModal SHALL mostrar un toast de error y dejar el campo de monto final vacío para entrada manual.
7. WHEN el usuario cambia la fecha de pago después de un auto-cálculo, THE ConfirmPaymentModal SHALL re-obtener la Tasa_BCV para la nueva fecha y recalcular el monto final.

### Requisito 6: Extensión del payload de confirmación de pago

**User Story:** Como desarrollador de Platica, quiero que el payload de confirmación de pago incluya cuenta, monto final y moneda final, para que el backend registre el pago con los datos reales.

#### Criterios de Aceptación

1. THE ConfirmPendingTransactionPayload interface SHALL extenderse para incluir los campos `accountId` (number, obligatorio), `amount` (number, obligatorio) y `currency` (string `"USD" | "EUR" | "VES"`, obligatorio) además del campo `date` existente.
2. THE confirmPendingTransaction function SHALL enviar el payload extendido (`{ date, accountId, amount, currency }`) al Confirm_Endpoint vía `PATCH /api/transactions/:id/confirm`.
3. THE Documento de Requisitos SHALL señalar que el Confirm_Endpoint actualmente solo acepta `{ date }` y que se requiere un cambio en el contrato del backend para aceptar los campos adicionales `accountId`, `amount` y `currency`. Este cambio de contrato backend es un prerequisito para la implementación completa de este requisito.

### Requisito 7: Integración de datos entre suscripción y transacción pendiente

**User Story:** Como usuario de Platica, quiero que el modal de confirmación conozca la moneda de referencia y el monto original de la suscripción asociada, para que el auto-cálculo funcione correctamente.

#### Criterios de Aceptación

1. WHEN una Transacción_Pendiente se muestra en la lista de alertas de pago, THE Subscriptions page SHALL mostrar la moneda de referencia junto al monto (ejemplo: "37.00 EUR" en lugar de solo "37.00").
2. THE ConfirmPaymentModal SHALL recibir la Moneda_de_Referencia y el monto original de la suscripción asociada para usarlos como base del auto-cálculo.
3. IF la Transacción_Pendiente no tiene moneda asociada, THEN THE ConfirmPaymentModal SHALL usar "USD" como moneda por defecto para la referencia.
