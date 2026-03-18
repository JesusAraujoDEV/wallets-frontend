---
name: frontend-strict-api-contract
description: "Erradica alucinaciones de endpoints y funciones mockeadas: obliga verificacion previa en frontend-api-docs, prohbe inventar rutas y detiene implementacion cuando falte contrato backend."
argument-hint: "Feature API o formulario a implementar (ej: transferencias, recovery password, stats nuevos)"
user-invocable: true
---

# Frontend Strict API Contract

## Resultado esperado
Garantizar que ninguna implementacion frontend invente endpoints, payloads o respuestas. Toda integracion HTTP debe nacer desde el contrato oficial documentado.

Reglas OBLIGATORIAS:
1. Antes de crear cualquier funcion en capa de red o formulario que envie datos, debes verificar estrictamente la skill frontend-api-docs y su referencia oficial.
2. Si el endpoint necesario no existe en la documentacion oficial, esta totalmente prohibido inventar URL, metodo o payload, y tambien esta prohibido crear funciones simuladas (mocks, Promise.resolve, datos falsos).
3. Si falta el endpoint, debes detener unicamente esa funcionalidad de red, aplicar los demas cambios visuales solicitados y reportar exactamente cual endpoint falta para que backend lo construya primero.

## Cuando usar
- Al crear o refactorizar funciones en src/lib/http.ts y modulos de servicios API.
- Al crear formularios que hacen submit a backend.
- Al implementar features nuevas con dependencias de endpoints no confirmados.
- Al revisar PRs para detectar alucinaciones de contrato backend.

## Fuente contractual obligatoria
- Skill base: frontend-api-docs.
- Referencia oficial: .github/skills/frontend-api-docs/references/wallets-api-reference.md.

## Procedimiento

### 1. Verificacion previa obligatoria
1. Identificar la necesidad funcional exacta (que accion HTTP necesita el frontend).
2. Abrir frontend-api-docs y consultar wallets-api-reference.md.
3. Confirmar endpoint, metodo, query/body/headers y respuesta esperada.

Criterio de salida:
- Existe trazabilidad directa entre necesidad funcional y endpoint documentado.

### 2. Gating estricto anti-alucinacion
1. Si endpoint existe:
   - implementar funcion de red solo con contrato documentado.
   - tipar request/response con los campos exactos del contrato.
2. Si endpoint no existe:
   - bloquear implementacion de esa llamada HTTP.
   - prohibido crear fallback mock o Promise.resolve.
   - continuar con cambios no bloqueados (UI/UX/estructura) cuando aplique.

Decision:
- El bloqueo aplica solo a la parte dependiente del endpoint faltante, no al resto del trabajo independiente.

Criterio de salida:
- Cero endpoints inventados y cero funciones simuladas para suplir backend.

### 3. Reporte de endpoint faltante (obligatorio)
Cuando no exista contrato, reportar explicitamente:
1. Metodo HTTP requerido (ej: POST).
2. Ruta requerida propuesta por negocio (sin implementarla en frontend).
3. Body/query esperados por la UI.
4. Respuesta minima requerida para desbloquear frontend.
5. Archivos frontend impactados que quedan pendientes de conexion.

Formato recomendado de reporte:
- Missing endpoint: <METHOD> <PATH>
- Needed by: <feature/form>
- Request contract needed: <fields>
- Response contract needed: <fields>
- Frontend status: UI lista / Integracion bloqueada por backend

Criterio de salida:
- El backend recibe un requerimiento preciso, accionable y sin ambiguedad.

### 4. Verificacion final
Checklist obligatorio:
1. Se consulto frontend-api-docs antes de tocar capa de red/form submit.
2. Todo endpoint usado existe en wallets-api-reference.md.
3. No hay rutas, metodos ni payloads inventados.
4. No hay mocks/Promise.resolve para simular endpoints faltantes.
5. Si hubo endpoint faltante, se reporto de forma exacta y se bloqueo solo esa parte.
6. El resto de cambios no bloqueados quedo implementado correctamente.

## Anti-patrones bloqueados
- "Asumir" que existe un endpoint por nombre parecido.
- Crear funciones API con TODO/fake para desbloquear temporalmente.
- Conectar formularios a rutas no documentadas.
- Completar feature end-to-end ocultando que falta backend.

## Definicion de terminado
La tarea se considera terminada cuando toda integracion de red implementada esta respaldada por contrato oficial, no hay endpoints inventados, y cualquier dependencia faltante de backend esta reportada con precision y sin mocks.
