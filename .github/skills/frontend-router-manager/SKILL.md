---
name: frontend-router-manager
description: "Controla la navegación con react-router-dom: rutas privadas envueltas con RequireAuth, rutas públicas sin wrapper, y redirecciones programáticas con useNavigate. Usar al crear o refactorizar routing, auth-flow y guards."
argument-hint: "Ruta, módulo o flujo de navegación a estandarizar (ej: login/reset/dashboard)"
user-invocable: true
---

# Frontend Router Manager

## Resultado esperado
Mantener un sistema de navegación consistente y seguro en React, separando claramente rutas públicas y privadas, y estandarizando redirecciones programáticas.

Reglas obligatorias:
1. Toda ruta privada/protegida debe estar envuelta en RequireAuth.
2. Las rutas públicas (como /login, /forgot-password, /reset-password) no usan RequireAuth.
3. Para redirecciones programáticas (ej. post-login o reset exitoso), usar useNavigate.

## Cuándo usar
- Al crear nuevas rutas o reorganizar el árbol de navegación.
- Al implementar flujos de autenticación y recuperación de cuenta.
- Al corregir accesos no autorizados o bucles de redirección.
- Al refactorizar lógica de navegación después de acciones exitosas.

## Procedimiento

### 1. Auditoría inicial de rutas
1. Inventariar rutas existentes y clasificarlas como públicas o privadas.
2. Detectar rutas privadas sin guardia y rutas públicas con guardia mal aplicada.
3. Detectar redirecciones programáticas implementadas con patrones no estándar.

Criterio de salida:
- Existe mapa claro de rutas con su nivel de acceso y acciones a corregir.

### 2. Enforzar guardias de autenticación
1. Para cada ruta privada, envolver el elemento con RequireAuth.
2. Mantener rutas públicas sin wrapper de autenticación.
3. Evitar guardias duplicadas o mezcladas en varios niveles sin necesidad.

Decisión:
- Si la vista requiere sesión o datos sensibles, marcarla privada y usar RequireAuth.
- Si la vista debe ser accesible sin sesión (login/recuperación/onboarding público), mantenerla pública sin wrapper.

Criterio de salida:
- Todas las rutas privadas quedan protegidas y todas las públicas quedan libres de RequireAuth.

### 3. Estandarizar redirecciones programáticas
1. Reemplazar patrones ad-hoc por useNavigate en flujos de acción.
2. Aplicar useNavigate tras eventos exitosos (login, reset-password, logout, etc.).
3. Mantener redirecciones explícitas y previsibles para evitar estados inconsistentes.

Decisión:
- Si la navegación depende de una acción del usuario o resultado async, usar useNavigate.
- Si la navegación es declarativa de guardia, resolverla en la configuración de rutas/guards según arquitectura actual.

Criterio de salida:
- No quedan redirecciones programáticas fuera del patrón useNavigate.

### 4. Validación de comportamiento
1. Verificar acceso denegado a rutas privadas sin sesión.
2. Verificar acceso correcto a rutas públicas sin sesión.
3. Verificar redirecciones exitosas tras login y reset-password.
4. Verificar ausencia de loops de navegación.

Criterio de salida:
- El flujo de navegación cumple seguridad, UX esperada y no presenta bucles.

### 5. Verificación final
Checklist de cumplimiento:
1. Rutas privadas envueltas con RequireAuth.
2. Rutas públicas sin RequireAuth.
3. Redirecciones programáticas con useNavigate.
4. Estructura de rutas consistente y sin duplicidad de guards.
5. Flujos críticos (login/forgot-password/reset-password) validados extremo a extremo.

Pruebas mínimas recomendadas:
1. Usuario no autenticado intenta entrar a ruta privada.
2. Usuario no autenticado entra a /login, /forgot-password y /reset-password.
3. Login exitoso redirige con useNavigate al destino esperado.
4. Reset de password exitoso redirige con useNavigate al destino definido.

## Anti-patrones bloqueados
- Ruta privada renderizada sin RequireAuth.
- Ruta pública envuelta con RequireAuth.
- Redirecciones programáticas mediante hacks o patrones no estándar cuando aplica useNavigate.
- Configuración de rutas que produce loops al autenticar/desautenticar.

## Definición de terminado
La implementación termina cuando el checklist está completo, las rutas públicas/privadas están correctamente separadas y los flujos de redirección programática usan useNavigate sin regresiones.
