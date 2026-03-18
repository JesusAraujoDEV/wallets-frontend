---
name: frontend-mobile-first-refinement
description: "Garantiza integridad de layout en moviles (<640px): acciones apiladas, cero margenes negativos agresivos, separacion texto/UI, tablas a cards en movil y prioridad de crecimiento vertical para evitar compresion visual."
argument-hint: "Vista o componente a refinar para movil (ej: Transactions, dashboard header, tablas)"
user-invocable: true
---

# Frontend Mobile First Refinement

## Resultado esperado
Asegurar que la UX en moviles por debajo de 640px sea estable, legible y accionable sin hacks de layout, con reglas estrictas para acciones, textos largos, tablas y crecimiento de componentes.

Reglas OBLIGATORIAS:
1. Todo contenedor de acciones con mas de dos botones debe usar `flex-col gap-2` en movil y `sm:flex-row sm:gap-4` en pantallas mayores. Los botones deben usar `w-full` cuando esten apilados.
2. Prohibido usar margenes negativos agresivos para encajar contenido.
3. Cuando textos largos descriptivos compartan ancho con elementos de UI, el texto debe vivir como bloque separado con margen vertical (`my-4` o similar) y los elementos de UI deben usar `flex-wrap`.
4. Las vistas de tablas pesadas deben transformarse obligatoriamente a vista de cards apiladas en movil.
5. Verificar que componentes no queden decolorados ni aplastados; priorizar crecimiento en alto antes de reducir ancho.

## Cuando usar
- Al refactorizar pantallas con overflow horizontal o bloques comprimidos en movil.
- Al trabajar componentes con grupos de acciones (ej: Transactions, toolbars, headers con CTAs).
- Al adaptar tablas de datos a experiencia movil.
- Al revisar regresiones de UX en dispositivos pequenos (<640px).

## Procedimiento

### 1. Auditoria de layout movil
1. Inspeccionar la vista en ancho base (<640px) sin depender de prefijos.
2. Detectar:
   - contenedores de acciones con 3+ botones
   - uso de margenes negativos para forzar encaje
   - textos largos compitiendo horizontalmente con controles
   - tablas densas sin alternativa movil
   - componentes con altura insuficiente que aplastan contenido
3. Priorizar correcciones de mayor impacto de legibilidad y accionabilidad.

Criterio de salida:
- Existe lista de hallazgos por tipo (acciones, spacing, texto/UI, tablas, compresion visual).

### 2. Enforzar patron de acciones apiladas
1. Para 3+ acciones en movil:
   - contenedor base: `flex flex-col gap-2`
   - en `sm:` escalar a `sm:flex-row sm:gap-4`
2. Asignar `w-full` a botones en modo apilado para mejorar tap targets.
3. Evitar variantes que reduzcan ancho util de botones en movil.

Decision:
- Si hay 1-2 acciones criticas, puede mantenerse fila en movil solo si no compromete legibilidad ni toque.
- Si hay 3 o mas acciones, el apilado es obligatorio.

Criterio de salida:
- Todos los grupos de acciones complejos son verticales en movil y fluidos en `sm+`.

### 3. Eliminar hacks de espaciado y separar texto largo
1. Remover margenes negativos agresivos (`-mt-*`, `-mx-*`, `-ml-*`, `-mr-*`, `-mb-*`) usados para encajar bloques.
2. Cuando haya texto descriptivo largo junto a UI horizontal:
   - mover texto a bloque independiente
   - aplicar margen vertical (`my-4` o equivalente)
   - aplicar `flex-wrap` al contenedor de UI
3. Ajustar padding/gap antes de considerar cualquier hack.

Decision:
- Si texto y controles no caben en una fila base, el texto va siempre en su propio bloque.

Criterio de salida:
- No hay colisiones texto/control y el layout conserva respiracion visual en movil.

### 4. Convertir tablas pesadas a cards en movil
1. Mantener tabla para `sm+` o `md+` segun complejidad.
2. Implementar en base movil una lista de cards apiladas con los campos clave.
3. Incluir en cada card acciones primarias y secundarias sin overflow.
4. Conservar jerarquia de datos y estados (vacios, loading, error).

Decision:
- Si la tabla requiere scroll horizontal para ser usable en movil, la vista de cards es obligatoria.

Criterio de salida:
- En movil no hay tabla pesada ilegible ni necesidad de zoom/scroll lateral para operar.

### 5. Prevenir decoloracion y aplastamiento visual
1. Revisar contrastes y tonos para evitar percepcion de decolorado por compresion.
2. Permitir crecimiento vertical del componente (`h-auto`, `min-h-*`, wrapping) en lugar de reducir ancho forzadamente.
3. Validar densidad de contenido: fuentes, line-height, gaps y padding.

Criterio de salida:
- Componentes conservan legibilidad y presencia visual sin verse comprimidos.

### 6. Verificacion final obligatoria
Checklist de cumplimiento:
1. Todos los grupos de 3+ botones usan `flex-col gap-2` + `sm:flex-row sm:gap-4`.
2. Botones en stack movil usan `w-full`.
3. Sin margenes negativos agresivos para encajar UI.
4. Texto largo separado en bloque con margen vertical y UI con `flex-wrap`.
5. Tablas pesadas tienen vista de cards apiladas en movil.
6. Sin overflow horizontal involuntario en <640px.
7. Sin componentes decolorados o aplastados; crecimiento vertical priorizado.

Pruebas minimas recomendadas:
1. Probar en 360x640, 390x844 y 412x915.
2. Verificar interaccion tactil de botones en grupos de acciones.
3. Validar vista cards en movil y tabla en breakpoints mayores.
4. Revisar headers/bloques descriptivos con textos largos reales.

## Anti-patrones bloqueados
- Acciones con 3+ botones en fila unica en movil.
- Uso de margenes negativos para "arreglar" solapamientos.
- Texto largo y controles forzados en una misma fila sin wrap.
- Tabla desktop reutilizada en movil sin alternativa card.
- Reducir ancho de componentes al punto de comprometer legibilidad.

## Definicion de terminado
La tarea se considera terminada solo cuando la vista funciona correctamente por debajo de 640px con acciones apiladas segun regla, sin hacks de margenes negativos, con separacion correcta de texto/UI, con cards para tablas pesadas y sin compresion visual de componentes.
