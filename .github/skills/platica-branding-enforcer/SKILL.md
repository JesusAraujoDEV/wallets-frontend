---
name: platica-branding-enforcer
description: "Protege la identidad de marca del proyecto: la app frontend debe llamarse solo Platica, las funciones AI deben llamarse PlataAi, y se prohíbe Pastel/Pastel Wallet salvo textos dinámicos con nombre de usuario que deben mantenerse intactos."
argument-hint: "Archivo, feature o alcance a auditar/refactorizar (ej: src/pages/Index.tsx, metadata global, flujo completo)"
user-invocable: true
---

# Platica Branding Enforcer

## Resultado esperado
Garantizar consistencia total de marca en código, UI y metadatos, evitando regresiones de naming y respetando la excepción crítica de textos dinámicos con nombre de usuario.

Reglas obligatorias:
1. El nombre oficial de la aplicación frontend es exclusivamente Platica.
2. Toda referencia al asistente de inteligencia artificial o funciones smart debe llamarse PlataAi.
3. Está totalmente prohibido usar los términos Pastel Wallet o Pastel en código, textos de UI o metadatos.
4. Excepción crítica: los textos dinámicos o títulos que incluyen el nombre del usuario (por ejemplo, "JesuAura's Financial Dashboard" o "{userName}'s Dashboard") deben mantenerse intactos.
5. Nunca reemplazar el nombre del usuario por la marca.

## Cuándo usar
- Cuando crees o refactorices copys de UI, títulos, headers, metadata SEO o textos de onboarding.
- Cuando migres branding legacy en componentes, páginas o utilidades.
- Cuando implementes funcionalidades AI/smart para asegurar naming uniforme como PlataAi.
- Antes de cerrar PRs que toquen textos visibles o constantes de marca.

## Procedimiento

### 1. Descubrimiento y auditoría de branding
1. Inventariar referencias de marca en el alcance:
   - textos visibles al usuario
   - constantes y enums
   - metadatos (title, description, Open Graph, manifest)
   - mensajes de error/empty states/notificaciones
2. Buscar ocurrencias bloqueadas:
   - Pastel Wallet
   - Pastel
3. Detectar referencias a funciones AI/smart que no usen PlataAi.
4. Detectar textos dinámicos con nombre de usuario para protegerlos de reemplazos masivos.

Criterio de salida:
- Existe una lista clara de ocurrencias a corregir y una lista protegida de textos dinámicos que no deben alterarse.

### 2. Aplicar reemplazos obligatorios con reglas de decisión
1. Reemplazar branding de aplicación por Platica donde corresponda.
2. Reemplazar nombres de asistente AI/smart por PlataAi.
3. Eliminar por completo Pastel Wallet y Pastel del alcance permitido.
4. Excluir expresamente textos dinámicos con identidad de usuario de cualquier reemplazo automático.

Decisiones:
- Si el texto representa marca de la app: usar Platica.
- Si el texto describe asistente AI, smart insights, helper conversacional o feature inteligente: usar PlataAi.
- Si el texto contiene variable de usuario o posesivo dinámico (por ejemplo, {userName}, "{userName}'s ..."): preservar exactamente el texto dinámico.

Criterio de salida:
- Todas las referencias de marca quedan normalizadas sin romper títulos personalizados por usuario.

### 3. Proteger excepciones críticas de personalización
1. Verificar que títulos tipo "{userName}'s Dashboard" sigan usando el nombre del usuario.
2. Validar que no se haya aplicado un reemplazo ciego que sustituya el nombre del usuario por Platica o PlataAi.
3. Mantener placeholders dinámicos y gramática original cuando representen identidad de usuario.

Señales de incumplimiento:
- Se reemplazó "JesuAura's ..." por "Platica ...".
- Se alteró "{userName}" por un valor de marca estático.
- Se degradó personalización de dashboard, perfil o saludo.

Criterio de salida:
- Toda personalización basada en usuario permanece intacta.

### 4. Verificación integral previa al cierre
Checklist obligatorio:
1. Cero ocurrencias de Pastel Wallet.
2. Cero ocurrencias de Pastel en código/UI/metadatos dentro del alcance.
3. Nombre de app consistente como Platica.
4. Naming AI/smart consistente como PlataAi.
5. Textos dinámicos con nombre de usuario preservados sin cambios indebidos.
6. Sin regresiones de UX por reemplazos de texto (labels, headers, rutas visibles, metadata).

Pruebas mínimas recomendadas:
1. Revisar una pantalla principal con branding global.
2. Revisar una pantalla o feature AI/smart que muestre PlataAi.
3. Revisar un caso con dashboard/título dinámico por usuario.
4. Revisar title/description de metadatos en runtime o build preview.

### 5. Definición de terminado
La tarea se considera terminada solo cuando la marca queda unificada con Platica y PlataAi, no hay rastro de Pastel/Pastel Wallet en el alcance intervenido y la personalización con nombre de usuario sigue funcionando intacta.

## Anti-patrones bloqueados
- Mezclar Platica con nombres legacy en la misma vista.
- Llamar al asistente AI con nombres genéricos distintos de PlataAi.
- Hacer find/replace global sin lista de exclusiones dinámicas.
- Reemplazar títulos personalizados de usuario por textos de marca estáticos.
- Cerrar tarea sin ejecutar checklist de branding y excepción dinámica.
