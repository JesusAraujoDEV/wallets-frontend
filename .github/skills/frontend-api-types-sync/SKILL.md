---
name: frontend-api-types-sync
description: "Garantiza Type Safety estricto para integraciones frontend-backend: define/actualiza tipos Request y Response desde frontend-api-docs, prohibe any en API y exige genericos en apiFetch. Usar al crear o refactorizar servicios HTTP en TypeScript."
argument-hint: "Endpoint o modulo a tipar/sincronizar (ej: src/lib/stats.ts o POST /transactions/transfer)"
user-invocable: true
---

# Frontend API Types Sync

## Resultado esperado
Asegurar tipado estricto en TypeScript para toda comunicacion con el backend, manteniendo sincronizados contratos de Request/Response y evitando drift entre API real y tipos del frontend.

Reglas OBLIGATORIAS:
1. Antes de consumir o modificar un endpoint con `apiFetch`, debes generar o actualizar interfaces/types TypeScript (Request y Response) basandote estrictamente en `frontend-api-docs`.
2. Esta totalmente prohibido usar `any` en respuestas de API.
3. Los tipos deben guardarse de forma centralizada y organizada, priorizando `src/lib/types.ts` (o `src/types/` si el dominio crece).
4. Debes pasar genericos al wrapper HTTP (por ejemplo `apiFetch<MyExpectedResponse>(...)`).

## Dependencia obligatoria
- Esta skill depende de la habilidad `frontend-api-docs`.
- Antes de tipar, consultar el contrato canonico de endpoint (metodo, path, query, body, headers y respuesta).

## Cuando usar
- Al crear una nueva funcion de red en frontend.
- Al refactorizar servicios existentes en `src/lib/*.ts`.
- Al corregir bugs por parseo incorrecto o campos faltantes.
- Al incorporar endpoints nuevos o cambios de contrato backend.

## Procedimiento obligatorio

### 1. Leer contrato backend
1. Abrir la referencia de `frontend-api-docs` y localizar endpoint exacto.
2. Confirmar metodo HTTP, query params, body, headers y codigos de respuesta.
3. Identificar diferencias con los tipos existentes en frontend.

Criterio de salida:
- Contrato del endpoint validado y sin ambiguedades.

### 2. Definir tipos Request/Response
1. Crear o actualizar tipos en ubicacion central:
   - Preferido: `src/lib/types.ts`
   - Escalado por dominio: `src/types/<dominio>.ts`
2. Definir tipos de entrada (query/body) y salida (success + errores relevantes cuando aplique).
3. Reutilizar tipos existentes cuando el contrato sea el mismo; evitar duplicados semanticamente iguales.

Criterio de salida:
- Tipos canonicos creados/actualizados y reutilizables.

### 3. Conectar tipos con la capa HTTP
1. Tipar la llamada con generico explicito en `apiFetch`.
2. Tipar parametros de funcion para evitar objetos anonimos sin contrato.
3. Evitar casts inseguros (`as any`, doble-cast) salvo justificacion tecnica excepcional documentada.

Ejemplo esperado:
```ts
type NetCashFlowQuery = {
  from_date: string
  to_date: string
  time_unit?: "month" | "week"
  accountId?: string
}

type NetCashFlowResponse = {
  summary: {
    total_income: number
    total_expenses: number
    net_cash_flow: number
    avg_savings_rate: number
  }
  time_series: Array<{
    period: string
    income: number
    expenses: number
    net_flow: number
    savings_rate: number
  }>
}

export async function getNetCashFlow(query: NetCashFlowQuery) {
  return apiFetch<NetCashFlowResponse>("/stats/net-cash-flow", {
    method: "GET",
    query
  })
}
```

Criterio de salida:
- Todas las llamadas API nuevas/modificadas usan genericos y tipos explicitos.

### 4. Verificar anti-drift
1. Comparar tipos frontend con contrato de `frontend-api-docs`.
2. Confirmar que nombres de campos y tipos primitivos coinciden exactamente.
3. Validar casos especiales: streams, union de estados, campos opcionales, defaults de backend.

Criterio de salida:
- No hay discrepancias entre contrato backend y tipado frontend.

### 5. Validacion final
Checklist obligatorio:
1. Endpoint verificado contra `frontend-api-docs` antes de codificar.
2. Request y Response tipados y centralizados.
3. Cero `any` en respuestas API.
4. `apiFetch<RespuestaEsperada>` aplicado en todas las llamadas del alcance.
5. Sin casts inseguros para forzar compilacion.
6. Nombres de propiedades alineados al contrato backend.

## Decisiones y ramas
- Si un endpoint devuelve estructuras distintas segun filtros, modelar con unions discriminadas o tipos compuestos claros; no usar `any`.
- Si un endpoint retorna stream (PDF/XLSX), tipar retorno binario y metadata de headers en tipo dedicado.
- Si hay contrato incompleto o ambiguo, detener implementacion y pedir precision al backend antes de tipar.

## Anti-patrones bloqueados
- Consumir endpoint nuevo sin crear/actualizar tipos primero.
- Usar `any` o `unknown` sin narrowing real para respuestas HTTP.
- Definir tipos inline repetidos en multiples archivos de servicio.
- Llamar `apiFetch` sin generico de respuesta.
- Renombrar campos del backend sin transformacion explicita y documentada.

## Definicion de terminado
La tarea termina cuando cada endpoint tocado tiene tipos Request/Response sincronizados con `frontend-api-docs`, sin `any` en respuestas, y todas las llamadas `apiFetch` usan genericos explicitos desde una fuente de tipos centralizada.
