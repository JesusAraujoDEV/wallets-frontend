---
name: frontend-mobile-first
description: "Fuerza diseño Mobile-First con Tailwind CSS: base <640px, breakpoints solo para escalar (md/lg/xl), sin anchos fijos y navegación móvil con menú hamburguesa en pantallas pequeñas. Usar al crear o refactorizar UI/layouts responsivos."
argument-hint: "Vista, layout o componente a adaptar a Mobile-First (ej: dashboard, navbar, formulario)"
user-invocable: true
---

# Frontend Mobile First

## Resultado esperado
Implementar interfaces responsivas bajo un enfoque Mobile-First estricto, priorizando experiencia en pantallas pequenas y escalando progresivamente hacia tablets y desktop.

Reglas OBLIGATORIAS:
1. Los estilos base de Tailwind (sin prefijo) deben disenar primero para movil (<640px).
2. Los prefijos `md:`, `lg:` y `xl:` se usan unicamente para adaptar y expandir el layout al crecer la pantalla.
3. Prohibido usar anchos fijos (por ejemplo `w-[800px]`, `w-[1024px]`). Usar `w-full`, `%`, `max-w-*` o combinaciones fluidas.
4. La navegacion en pantallas pequenas debe seguir patron movil (por ejemplo menu hamburguesa desplegable).

## Cuando usar
- Al crear una pagina nueva en frontend.
- Al refactorizar layouts existentes que rompen en movil.
- Al construir barras de navegacion, sidebars, tablas o formularios complejos.
- Al corregir desbordes horizontales y problemas de legibilidad en telefonos.

## Procedimiento

### 1. Disenar base movil (sin breakpoints)
1. Construir estructura con clases base orientadas a telefono.
2. Favorecer stacks verticales y espaciado compacto (`flex-col`, `gap-*`, `p-*`).
3. Verificar que no exista overflow horizontal.

Criterio de salida:
- La UI se ve y funciona correctamente en ancho movil sin depender de `md:`.

### 2. Escalar layout con breakpoints
1. Introducir `md:`, `lg:` y `xl:` solo para ampliar/complementar layout.
2. Ejemplos validos:
   - `flex-col md:flex-row`
   - `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
   - `text-sm md:text-base lg:text-lg`
3. Evitar redefinir toda la UI en desktop; solo ajustar lo necesario.

Criterio de salida:
- Cada breakpoint agrega mejoras progresivas sin romper la base movil.

### 3. Enforzar dimensionamiento fluido
1. Reemplazar anchos fijos por patrones fluidos:
   - `w-full`
   - `max-w-md`, `max-w-lg`, `max-w-2xl`
   - `min-w-0` en contenedores flex para prevenir overflow por contenido largo
2. Para contenedores principales, usar combinaciones como:
   - `w-full max-w-6xl mx-auto px-4 md:px-6`

Criterio de salida:
- Ningun bloque depende de ancho fijo en pixeles que degrade movil.

### 4. Navegacion movil obligatoria
1. En pantallas pequenas, mostrar boton hamburguesa para abrir/cerrar menu.
2. Mostrar navegacion expandida en `md:` o superior segun necesidad.
3. Mantener estados accesibles (focus/keyboard) y cierre claro del menu.

Decision:
- Si hay pocos enlaces, usar menu desplegable simple.
- Si hay muchos enlaces o acciones, usar drawer/sheet en movil.

Criterio de salida:
- La navegacion principal es usable en telefono sin colisiones visuales.

### 5. Validacion final
Checklist obligatorio:
1. Base sin prefijos pensada para movil (<640px).
2. `md:`, `lg:`, `xl:` solo amplian comportamiento/layout.
3. Sin clases de ancho fijo tipo `w-[Npx]`.
4. Sin scroll horizontal no intencional.
5. Navbar/menu en movil con patron hamburguesa/desplegable.
6. Componentes criticos (forms, cards, tablas/listas) legibles y accionables en telefono.

## Decisiones y ramas
- Si un componente requiere 2 columnas en desktop: empezar en 1 columna base y subir a 2 en `md:` o `lg:`.
- Si una tabla no cabe en movil: priorizar vista de tarjetas/lista en base y tabla completa en breakpoints mayores.
- Si el contenido es denso: priorizar jerarquia tipografica y bloques apilados antes que reducir fuente excesivamente.

## Anti-patrones bloqueados
- Empezar diseno en desktop y luego "parchar" movil.
- Uso de `w-[...]` fijo en pixeles para contenedores principales.
- Menus horizontales completos sin alternativa movil.
- Uso de breakpoints para corregir una base mal construida en lugar de escalarla.

## Definicion de terminado
La tarea se considera terminada cuando el layout funciona primero en movil con clases base, escala correctamente con `md/lg/xl`, no usa anchos fijos y la navegacion en pantallas pequenas sigue patron hamburguesa o equivalente movil.
