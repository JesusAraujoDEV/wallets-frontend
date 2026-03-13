---
name: task-completion-enforcer
description: "Erradica entregas parciales: cuando se pide un flujo completo (ej. recovery password, CRUD), obliga a implementar todas las partes implicadas (API, vistas, rutas, validación) en una sola respuesta y cerrar con verificación integral."
argument-hint: "Flujo completo a implementar (ej: reset-password end-to-end, CRUD categories)"
user-invocable: true
---

# Task Completion Enforcer

## Resultado esperado
Garantizar entregas completas de extremo a extremo, sin dejar tareas a medias ni diferir partes críticas para pasos posteriores.

Reglas obligatorias:
1. Si se solicita un flujo completo, implementar todas las piezas implicadas en una sola respuesta.
2. Prohibido detenerse a mitad para proponer “puedo hacerlo después”.
3. Antes de cerrar, verificar internamente que no existan rutas huérfanas ni componentes incompletos.

## Cuándo usar
- Implementaciones end-to-end (auth, recovery password, onboarding, checkout, CRUD).
- Refactors que tocan múltiples capas (UI, API, routing, estado).
- Tareas con criterios funcionales explícitos y dependencias entre archivos.

## Procedimiento

### 1. Expandir alcance completo
1. Traducir el pedido en lista de entregables funcionales.
2. Mapear capas impactadas:
   - API/servicios
   - vistas/componentes
   - routing/navegación
   - validaciones/feedback UX
3. Detectar dependencias obligatorias entre piezas.

Criterio de salida:
- Existe un mapa de trabajo que cubre todo el flujo de punta a punta, no solo una parte.

### 2. Implementar todas las piezas en el mismo ciclo
1. Ejecutar cambios en API/servicios requeridos por el flujo.
2. Crear/ajustar vistas y componentes necesarios para completar la UX.
3. Registrar rutas y guards coherentes con el modelo público/privado.
4. Conectar estados de carga, errores y feedback al usuario.

Decisión:
- Si una pieza bloquea la funcionalidad final, es obligatoria en este mismo ciclo.
- Solo se difiere trabajo no crítico que no impacte el flujo solicitado y se documenta como mejora opcional, no como parte faltante.

Criterio de salida:
- El flujo solicitado se puede ejecutar de principio a fin sin pasos manuales pendientes.

### 3. Prohibición de cierre parcial
1. No finalizar con propuestas de “siguiente paso” para partes esenciales no implementadas.
2. No presentar como “completo” algo que no incluya rutas, pantallas o llamadas necesarias.
3. No dejar wiring incompleto entre capas.

Señales de incumplimiento:
- Endpoint creado sin vista conectada.
- Vista creada sin ruta registrada.
- Ruta registrada sin componente final o sin integración API.
- Mensajes de cierre que delegan lo faltante a un próximo turno.

### 4. Verificación interna previa al cierre
1. Confirmar compilación/tipos/lint (si aplica en el proyecto).
2. Revisar navegación para detectar rutas huérfanas.
3. Revisar imports/export para detectar componentes sin uso o referencias rotas.
4. Validar casos feliz y error del flujo.

Checklist de cierre obligatorio:
1. API conectada correctamente.
2. UI completa y accesible.
3. Rutas registradas y funcionales.
4. Manejo de loading/error/feedback operativo.
5. Sin archivos intermedios sin integrar.
6. Sin mensajes de “lo hago en el siguiente paso” para partes críticas.

### 5. Definición de terminado
El trabajo se considera terminado únicamente cuando el flujo solicitado funciona end-to-end en una sola entrega y no quedan componentes, rutas o integraciones a medio implementar.

## Anti-patrones bloqueados
- Entregar solo la capa visual sin conexión a API.
- Entregar solo API sin vista/ruta.
- Dejar componentes creados pero no montados en routing.
- Cerrar tareas completas con propuestas diferidas de partes esenciales.
