---
name: frontend-overflow-modals-enforcer
description: "Erradica overflow horizontal global y estandariza modales moviles: layout con overflow-x-hidden, acciones responsivas, Dialog/Sheet fluidos, scroll interno seguro y centrado consistente."
argument-hint: "Vista o feature a corregir (ej: dashboard, transactions, dialogs de formularios)"
user-invocable: true
---

# Frontend Overflow Modals Enforcer

## Resultado esperado
Eliminar el scroll horizontal involuntario en toda la app y asegurar que Dialogs/Sheets sean totalmente usables en moviles, con ancho fluido, scroll interno controlado y posicion centrada consistente.

Reglas OBLIGATORIAS:
1. El contenedor principal o layout (main, body, o wrapper de app) debe tener overflow-x-hidden para eliminar scroll horizontal global.
2. Todo grupo de 3 o mas botones de accion debe usar flex-wrap o apilarse con flex-col en pantallas pequenas. Prohibido forzar flex-row si no caben.
3. Todo DialogContent debe ser fluido y nunca superar el viewport. Usar reglas como w-[95vw] sm:w-full max-w-md sm:max-w-lg.
4. Todo modal debe tener max-h-[85vh] y overflow-y-auto en su contenido interior para permitir scroll seguro, manteniendo visible el cierre (DialogClose o boton X).
5. Los modales deben quedar centrados en pantalla y no aparecer arrinconados abajo a la izquierda.

## Cuando usar
- Al detectar scroll horizontal en movil.
- Al corregir modales largos de formularios, filtros o exportaciones.
- Al refactorizar headers/toolbars con multiples acciones.
- Al revisar regresiones de UX en anchos pequenos (<640px).

## Procedimiento

### 1. Auditoria de overflow y modales
1. Verificar el layout raiz y wrappers principales para confirmar overflow-x-hidden.
2. Identificar grupos de botones (3+) que desbordan en movil.
3. Inventariar DialogContent/SheetContent con anchos fijos o max-width incompatible con viewport.
4. Detectar modales sin limite de altura ni scroll interno.
5. Detectar modales descentrados o con offset visual inesperado.

Criterio de salida:
- Existe un mapa de hallazgos por categoria: overflow global, acciones, ancho modal, altura/scroll, centrado.

### 2. Enforzar overflow horizontal cero
1. Aplicar overflow-x-hidden en el contenedor raiz correspondiente (app wrapper, layout principal o body segun arquitectura).
2. Revisar contenedores con width fijo agresivo y migrar a clases fluidas (w-full, max-w-*, min-w-0).
3. Validar que no existan bloques que empujen el layout fuera del viewport.

Decision:
- Si un solo componente causa overflow, corregir el componente y mantener overflow-x-hidden en layout raiz como defensa global.

Criterio de salida:
- No hay scroll horizontal involuntario en anchos moviles.

### 3. Enforzar grupos de acciones responsivos
1. Para 3+ botones, usar en movil:
   - flex-col gap-2 o flex-wrap gap-2 segun prioridad UX
2. Escalar en sm+ con:
   - sm:flex-row sm:gap-4 cuando la fila sea viable
3. Asignar w-full a botones apilados en movil para tap targets consistentes.

Decision:
- Si acciones son primarias y secundarias mezcladas, preferir apilado para claridad.
- Si son acciones compactas equivalentes, permitir wrap.

Criterio de salida:
- Ningun grupo de acciones desborda horizontalmente en movil.

### 4. Estandarizar DialogContent y SheetContent
1. Definir ancho fluido en modal:
   - w-[95vw] sm:w-full max-w-md sm:max-w-lg (ajustar max-w segun contenido)
2. Evitar width fijo en px para contenido modal principal.
3. Mantener centrado por defecto del primitive y no introducir offsets manuales.
4. En modales complejos, separar header/body/footer para mantener jerarquia y legibilidad.

Decision:
- Si el formulario es extenso, aumentar max-w en breakpoints mayores sin comprometer viewport movil.

Criterio de salida:
- Todo modal cabe en viewport movil sin recortes laterales.

### 5. Enforzar altura segura y scroll interno
1. Aplicar en el cuerpo util del modal:
   - max-h-[85vh] overflow-y-auto
2. Garantizar que cierre (X o DialogClose) permanezca accesible/visible.
3. Evitar que el contenido completo del modal fuerce scroll del documento de fondo.

Decision:
- Si modal tiene header fijo, aplicar scroll interno solo al body.
- Si modal es simple, aplicar scroll al contenedor interno completo.

Criterio de salida:
- Modales largos son totalmente navegables sin perder controles de cierre.

### 6. Verificacion final obligatoria
Checklist de cumplimiento:
1. Layout raiz con overflow-x-hidden aplicado y efectivo.
2. Sin scroll horizontal en movil (<640px).
3. Grupos de 3+ acciones sin flex-row forzado cuando no caben.
4. DialogContent/SheetContent con ancho fluido y sin desborde lateral.
5. Modal con max-h-[85vh] + overflow-y-auto en contenido.
6. Cierre visible y accionable en todo momento.
7. Modales centrados correctamente en viewport.

Pruebas minimas recomendadas:
1. Validar en 360x640, 390x844 y 412x915.
2. Abrir modales cortos y largos, verificar cierre visible.
3. Probar grupos de botones con 3+ acciones en header/toolbars.
4. Confirmar ausencia de scroll horizontal con contenido real y estados de error.

## Anti-patrones bloqueados
- Omitir overflow-x-hidden en layout principal cuando hay overflow recurrente.
- Forzar filas de botones que desbordan en movil.
- DialogContent con anchos fijos que exceden viewport.
- Modales sin limite de altura ni scroll interno.
- Modales descentrados por clases de posicionamiento manual innecesarias.

## Definicion de terminado
La tarea se considera terminada cuando la app no presenta overflow horizontal global en movil y todos los modales/dialogs/sheets cumplen ancho fluido, scroll interno seguro, cierre visible y centrado consistente.
