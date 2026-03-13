---
name: frontend-http-enforcer
description: "Estandariza consumo HTTP en React con apiFetch/lib/http.ts, token JWT en localStorage (pwi_token o token), feedback con use-toast y respeto de GlobalLoadingBar. Usar cuando crees o refactorices llamadas a API, auth, mutaciones y manejo de errores en frontend."
argument-hint: "Ruta o feature a estandarizar (ej: src/components/TransactionForm.tsx)"
user-invocable: true
---

# Frontend HTTP Enforcer

## Resultado esperado
Aplicar una política uniforme de consumo de APIs en React para evitar inconsistencias de auth, UX y manejo de errores.

Reglas obligatorias:
1. Prohibido usar o instalar Axios.
2. Toda petición al backend debe pasar por apiFetch o por la capa definida en lib/http.ts.
3. El token JWT se maneja en localStorage con clave pwi_token (compatibilidad de lectura con token permitida).
4. El feedback al usuario debe usar use-toast y debe respetar GlobalLoadingBar.
5. Cero uso de alert nativo.

## Cuándo usar
- Cuando agregues una nueva integración con endpoints del backend.
- Cuando refactorices código con fetch directo, Axios o patrones mezclados.
- Cuando implementes login/logout/refresh de token.
- Cuando agregues mutaciones que requieren estados de carga y notificaciones.

## Procedimiento

### 1. Descubrimiento y auditoría rápida
1. Buscar anti-patrones en el alcance:
   - imports de axios
   - fetch directo contra endpoints internos del backend
   - alert nativo
   - manejo ad-hoc de token JWT
2. Inventariar qué capa existente ya resuelve HTTP y auth:
   - lib/http.ts (apiFetch, getToken, setToken, buildApiUrl)
   - flujos que incrementan actividad de red para GlobalLoadingBar

Criterio de salida:
- Queda lista una lista corta de archivos a corregir y de utilidades reutilizables ya disponibles.

### 2. Enforzar capa HTTP única
1. Para backend interno:
   - Reemplazar fetch/Axios por apiFetch o funciones que llamen apiFetch.
   - Centralizar headers, auth y manejo de errores en la capa HTTP.
2. Evitar clientes paralelos por feature.
3. Si hace falta nueva función de servicio, crearla sobre apiFetch en lib o módulo de dominio.

Decisión:
- Si la URL apunta al backend de la app, usar obligatoriamente apiFetch.
- Si la URL es de tercero externo (no backend de la app), puede usarse fetch nativo aislado en lib, sin introducir Axios.

Criterio de salida:
- No quedan llamadas de backend fuera de la capa HTTP estándar.

### 3. Enforzar manejo JWT en localStorage
1. Leer token con prioridad pwi_token y fallback token cuando exista legado.
2. Escribir token en pwi_token como fuente principal.
3. Limpiar token al cerrar sesión o ante credenciales inválidas.
4. Evitar duplicar lógica de localStorage en componentes; usar helpers centralizados.

Decisión:
- Si hay código legacy que usa token, mantener compatibilidad de lectura mientras se migra.
- Si es código nuevo, escribir únicamente por la ruta estándar de helpers.

Criterio de salida:
- El ciclo set/get/remove de token queda centralizado y consistente.

### 4. Enforzar feedback de UX
1. Reemplazar alert nativo por use-toast.
2. Definir toasts consistentes:
   - éxito para operaciones completadas
   - error para fallos de red/validación
3. Garantizar que las operaciones de red del backend participen en el flujo que activa GlobalLoadingBar.
4. No duplicar spinners globales incompatibles con la barra de carga existente.

Decisión:
- Si una operación ya está encapsulada en store/capa que emite actividad de red, reutilizarla.
- Si no lo está, encaminarla por la capa que contabiliza in-flight requests.

Criterio de salida:
- No hay alert nativo y el usuario recibe feedback uniforme con toast + loading bar global.

### 5. Verificación final
Checklist de cumplimiento:
1. Sin Axios en dependencias ni imports.
2. Sin alert nativo.
3. Llamadas al backend solo por apiFetch/lib/http.ts.
4. Token JWT gestionado por helpers y localStorage con clave principal pwi_token.
5. Errores y éxitos visibles con use-toast.
6. Flujo de red integrado con GlobalLoadingBar.

Pruebas mínimas recomendadas:
1. Caso feliz de lectura de datos.
2. Caso de error 4xx/5xx con toast de error.
3. Login/logout con persistencia y limpieza de token.
4. Mutación larga mostrando actividad en la barra global.

## Anti-patrones bloqueados
- Instalar o importar Axios.
- fetch directo al backend desde componentes.
- alert nativo para errores o confirmaciones.
- Escritura de token JWT dispersa en múltiples archivos.
- Manejo de carga no integrado con el mecanismo global de actividad de red.

## Definición de terminado
La implementación se considera terminada cuando todos los puntos del checklist están en verde y no quedan anti-patrones detectables en el alcance trabajado.
