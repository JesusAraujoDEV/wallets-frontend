---
name: frontend-ui-architect
description: "Mantiene coherencia visual en React usando solo Tailwind CSS y primitives shadcn/Radix de components/ui; organiza páginas en pages y fragmentos en components; prioriza react-hook-form en formularios; evita MUI/Emotion salvo Date Picker excepcional."
argument-hint: "Pantalla o feature UI a diseñar/refactorizar (ej: pages/Index.tsx)"
user-invocable: true
---

# Frontend UI Architect

## Resultado esperado
Asegurar que la UI evolucione con una arquitectura visual consistente, reutilizable y alineada al stack existente.

Reglas obligatorias:
1. Nuevos componentes visuales y estilos: usar exclusivamente Tailwind CSS + primitives shadcn/Radix en components/ui.
2. Prohibido usar Material UI (MUI) o Emotion, excepto cuando sea estrictamente para Date Picker.
3. Vistas completas deben vivir en pages; fragmentos o bloques reutilizables en components.
4. Formularios nuevos deben priorizar react-hook-form frente a manejo manual con useState.

## Cuándo usar
- Al crear nuevas pantallas o rediseñar vistas existentes.
- Al introducir nuevos componentes visuales.
- Al construir o refactorizar formularios.
- Al revisar PRs por consistencia de UI y estructura de carpetas.

## Procedimiento

### 1. Auditoría rápida de alcance
1. Identificar si el trabajo es una vista completa o un fragmento reutilizable.
2. Revisar si aparecen dependencias o imports prohibidos (MUI/Emotion).
3. Verificar estrategia de estilos (Tailwind y primitives de components/ui).
4. Detectar formularios con useState que puedan migrarse a react-hook-form.

Criterio de salida:
- Queda definido qué mover/crear en pages vs components y qué anti-patrones deben eliminarse.

### 2. Arquitectura de ubicación de archivos
1. Si representa ruta o pantalla completa, ubicar en pages.
2. Si representa bloque UI reutilizable, ubicar en components.
3. Mantener separación clara entre composición de página y piezas reusables.

Decisión:
- Si el archivo mezcla lógica de página con muchos sub-bloques, extraer esos bloques a components.
- Si un componente deja de ser reutilizable y solo arma layout de pantalla, evaluar moverlo a pages.

Criterio de salida:
- La estructura del cambio respeta pages para vistas y components para fragmentos.

### 3. Enforzar stack visual permitido
1. Construir UI con clases Tailwind.
2. Priorizar primitives existentes en components/ui (dialog, select, input, button, etc.).
3. Evitar CSS ad-hoc innecesario cuando la solución exista en el sistema UI.

Decisión:
- Si falta un primitive, extender components/ui usando la misma base shadcn/Radix.
- No introducir MUI/Emotion para resolver problemas de layout o estilos generales.

Excepción permitida:
- Date Picker puede usar MUI/Emotion solo cuando no exista alternativa viable con components/ui + Tailwind y se documente explícitamente la razón.

Criterio de salida:
- No hay uso nuevo de librerías visuales fuera del stack permitido, salvo excepción documentada de Date Picker.

### 4. Formularios con prioridad react-hook-form
1. Para formularios nuevos, iniciar con react-hook-form como patrón por defecto.
2. Integrar validaciones y manejo de errores en el flujo del formulario.
3. Usar useState manual solo en casos puntuales justificados (no como patrón principal).

Decisión:
- Si el formulario incluye varios campos, validaciones o interacción compleja, react-hook-form es obligatorio.
- Si es un input aislado no-form (filtro simple), puede mantenerse estado local.

Criterio de salida:
- Los nuevos formularios siguen patrón react-hook-form y reducen deuda técnica de estado manual.

### 5. Verificación final
Checklist de cumplimiento:
1. Nuevos estilos y componentes construidos con Tailwind + components/ui.
2. Sin MUI/Emotion, excepto Date Picker estrictamente justificado.
3. Vistas completas en pages.
4. Fragmentos reutilizables en components.
5. Formularios nuevos con react-hook-form como opción prioritaria.

Pruebas mínimas recomendadas:
1. Render correcto responsive en desktop y mobile.
2. Estados de formulario: inicial, error y submit.
3. Reutilización del componente en al menos un contexto real (si aplica).
4. Verificación de imports para confirmar ausencia de MUI/Emotion fuera de excepción.

## Anti-patrones bloqueados
- Crear nuevas vistas completas dentro de components.
- Mezclar primitives externos cuando ya existe equivalente en components/ui.
- Introducir MUI/Emotion para botones, modales, tablas, inputs o layout general.
- Construir formularios nuevos complejos con useState campo por campo.

## Definición de terminado
La implementación está terminada cuando pasa el checklist completo y no deja deuda nueva de coherencia visual, estructura de carpetas ni formularios fuera del patrón definido.
