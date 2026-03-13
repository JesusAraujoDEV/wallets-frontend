---
name: frontend-api-docs
description: "Fuente canónica de contratos Wallets API (endpoints, métodos, query/body/headers y respuestas) para frontend. Usar SIEMPRE antes de crear o refactorizar funciones de red http/api para enviar y parsear exactamente lo que el backend espera."
argument-hint: "Feature o endpoint a implementar/refactorizar (ej: stats net cash flow, transfer export, auth forgot-password)"
user-invocable: true
---

# Frontend API Docs

## Resultado esperado
Garantizar que toda integración de frontend con Wallets API respete al pie de la letra el contrato backend: ruta, método HTTP, parámetros de query, body, headers, y forma exacta de respuesta.

Regla OBLIGATORIA:
1. Antes de crear o modificar cualquier función en la capa de red (`http`/`api`), debes consultar [Wallets API Reference](./references/wallets-api-reference.md).
2. No se permite implementar funciones por suposición de payloads o respuestas.
3. Si el endpoint o campo no está documentado, detener implementación y pedir confirmación explícita.

## Cuándo usar
- Al agregar nuevos servicios en `src/lib/http.ts` o módulos de API.
- Al conectar nuevas páginas/componentes con backend.
- Al corregir bugs de integración por payload o parseo incorrecto.
- Al tipar request/response en TypeScript para endpoints existentes.

## Fuente oficial
- Base URL del frontend: variable `VITE_BACKEND_URL` en `.env`.
- Documentación contractual: [Wallets API Reference](./references/wallets-api-reference.md).

Nota de uso de URL:
- Construir rutas con el helper estándar del proyecto (si aplica) y respetar el path del endpoint tal como está documentado.
- Si `VITE_BACKEND_URL` ya incluye `/api`, no duplicarlo; si no lo incluye, agregarlo una sola vez según la convención activa del proyecto.

## Procedimiento obligatorio por cada función de red

### 1. Selección de endpoint
1. Identificar la necesidad funcional.
2. Buscar endpoint exacto en [Wallets API Reference](./references/wallets-api-reference.md).
3. Confirmar método HTTP exacto (`GET`, `POST`, `PATCH`, `DELETE`).

Criterio de salida:
- Endpoint único y método confirmado contra la referencia.

### 2. Contrato de entrada
1. Extraer parámetros de `query` requeridos y opcionales.
2. Extraer `body` exacto (campos, tipos, nombres).
3. Extraer `headers` requeridos (por ejemplo `Authorization`, `Origin`, `Referer`).
4. Confirmar formatos (`YYYY-MM-DD`, `YYYY-MM`, boolean serializado, listas separadas por coma, etc.).

Criterio de salida:
- Firma de función alineada al contrato de entrada del backend.

### 3. Contrato de salida
1. Extraer respuesta esperada (`200`, `201`, etc.) con forma JSON exacta.
2. Modelar tipos TypeScript de respuesta y errores relevantes.
3. Si retorna stream (PDF/XLSX), configurar manejo binario y headers de descarga.

Criterio de salida:
- Tipos de respuesta correctos y parseo alineado al contrato.

### 4. Implementación en capa HTTP
1. Implementar la función en la capa de red estandarizada del proyecto.
2. Enviar únicamente los campos documentados.
3. No transformar nombres de campos si no hay necesidad explícita.
4. Mantener semántica de autenticación y manejo de errores uniforme.

Criterio de salida:
- Función implementada sin suposiciones fuera de la documentación.

### 5. Verificación contractual
Checklist obligatorio:
1. Método y path coinciden exactamente con la referencia.
2. Query/body/headers coinciden exactamente con la referencia.
3. Tipos TypeScript reflejan respuesta real documentada.
4. Manejo de estados de error cubre códigos esperados.
5. Para exports, se procesa stream y `Content-Disposition` correctamente.

## Decisiones y ramas
- Si existen dos variantes de endpoint (ej. export por `GET` query y `POST` body), preferir la variante indicada como preferida en la referencia.
- Si hay conflicto entre código legacy y referencia, priorizar referencia backend y ajustar frontend.
- Si la referencia no especifica un detalle crítico, detener y pedir aclaración antes de continuar.

## Anti-patrones bloqueados
- Crear funciones API sin revisar referencia contractual.
- Inferir nombres de campos por convención local sin confirmación.
- Reutilizar tipos antiguos cuando no coinciden con el endpoint real.
- Ignorar headers especiales requeridos por endpoint.

## Definición de terminado
La tarea se considera terminada cuando cada función de red nueva o modificada demuestra trazabilidad directa al contrato en [Wallets API Reference](./references/wallets-api-reference.md) y pasa el checklist contractual completo.
