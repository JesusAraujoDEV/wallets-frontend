# Propuesta: llevar Platica a móvil

**Estado**: idea para el futuro, sin dueño ni fecha. Documento de planificación únicamente — nada de esto se instaló ni se implementó.

## Qué se observó

Platica hoy es una SPA React (Vite + shadcn/Radix + Tailwind) que consume una API REST propia (`wallets-backend`, Express). No hay nada nativo, ni PWA, ni wrapper móvil. El caso de uso — finanzas personales, registro rápido de transacciones — es exactamente el tipo de app que la gente quiere en el bolsillo, no abriendo un navegador.

## Por qué podría importar

- Registrar un gasto es una tarea de "lo hago en 10 segundos desde el bolsillo", no de sentarse frente a una laptop. Una app instalada reduce esa fricción a un toque.
- Notificaciones push (recordatorio de pago de deuda, alerta de presupuesto excedido, tasa BCV del día) solo existen de verdad en móvil — un navegador no las sostiene de forma confiable.
- Biometría (huella/Face ID) para abrir la app es un estándar de facto en apps financieras; hoy Platica solo tiene login por contraseña/Google.

## Opciones consideradas

### Opción A — PWA (Progressive Web App)
Convertir la SPA actual en instalable: `manifest.json` + service worker + ícono. El usuario la agrega a su pantalla de inicio desde el navegador.

- **Reutiliza**: ~100% del código actual, cero cambios de arquitectura.
- **Esfuerzo**: bajo (días, no semanas).
- **Limitaciones**: no aparece en App Store/Play Store (solo Android permite "instalar" de forma fluida; iOS es más limitado y no soporta push notifications de PWA de forma confiable hasta versiones recientes de Safari, con soporte parcial). Sin acceso a biometría nativa real ni almacenamiento seguro tipo Keychain.
- **Cuándo tiene sentido**: como primer paso barato para validar demanda antes de invertir en algo más grande.

### Opción B — Capacitor (empaquetar la app web en un shell nativo)
Capacitor (del equipo de Ionic) toma la SPA existente y la corre dentro de un WebView nativo, empaquetado como app real de iOS/Android, publicable en las tiendas.

- **Reutiliza**: ~90-95% del código actual (toda la UI, toda la lógica). Se agregan plugins nativos puntuales (push notifications, biometría, almacenamiento seguro) vía la API de Capacitor.
- **Esfuerzo**: medio (semanas). El grueso del trabajo es configurar los plugins nativos y ajustar detalles de UX táctil (safe areas, back button de Android, teclado tapando inputs) que hoy no importan en web.
- **Limitaciones**: sigue siendo un WebView por dentro — la sensación "nativa" (animaciones de transición entre pantallas, scroll) nunca es 100% idéntica a una app nativa real, aunque para una app de formularios y listas como Platica la diferencia es poco perceptible.
- **Cuándo tiene sentido**: es el punto medio correcto — presencia real en tiendas de apps sin reescribir la UI.

### Opción C — React Native / Expo (app nativa real)
Reescribir la capa de UI en React Native, manteniendo el backend y toda la lógica de negocio sin cambios.

- **Reutiliza**: la API, los tipos, la lógica de negocio pura (`src/lib/*.ts` no-UI) — pero **ningún componente de UI**. shadcn/Radix son específicamente componentes web (DOM/CSS), no existen en React Native. Cada pantalla, cada formulario, cada gráfica (recharts tampoco corre en RN — hay que migrar a `react-native-svg`/`victory-native` o similar) se reconstruye desde cero con primitivas de React Native.
- **Esfuerzo**: alto (meses). Es, en la práctica, un segundo frontend completo.
- **Beneficio**: la mejor experiencia nativa posible — animaciones, gestos, rendimiento de listas largas, integración profunda con el sistema operativo.
- **Cuándo tiene sentido**: solo si la app ya tiene tracción real y el "casi nativo" de Capacitor deja de ser suficiente. No es un punto de partida razonable para una app en esta etapa.

## Recomendación

Camino en fases, cada una es un producto usable por sí sola — no hay que comprometerse con la fase 3 para sacar valor de la fase 1:

1. **Fase 1 — PWA.** Validar que la gente realmente quiere usar Platica "instalada" antes de invertir más. Esfuerzo bajo, reversible, no requiere tocar el backend.
2. **Fase 2 — Capacitor.** Si la Fase 1 confirma demanda (o si simplemente se quiere estar en las tiendas desde ya), empaquetar con Capacitor. Este es el destino recomendado por defecto — el mejor balance esfuerzo/resultado para el tamaño actual del proyecto.
3. **Fase 3 — React Native (opcional, condicional).** Solo si el volumen de usuarios y el feedback justifican una reescritura nativa completa. No planificar esto en firme hasta que la Fase 2 esté en producción y con datos de uso reales.

## Qué necesitaría cambiar en el backend (`wallets-backend`)

Estos cambios aplican principalmente a partir de la Fase 2, y son incrementales, no un rediseño:

- **CORS**: Capacitor sirve la app desde un origen tipo `capacitor://localhost` (iOS) o `http://localhost` (Android) — hay que agregarlo a `FRONTEND_URLS` en el `.env`, igual que ya se hace hoy para el origen web.
- **Sesión de más larga duración / refresh tokens**: hoy el JWT expira en `JWT_EXPIRES_IN` (7 días) y no hay refresh token — aceptable en web donde re-loguearse cada semana es tolerable, molesto en una app que la gente espera abrir directo con biometría. Vale la pena diseñar un flujo de refresh token antes de la Fase 2.
- **Push notifications**: requiere un servicio nuevo (Firebase Cloud Messaging para Android + APNs para iOS, o un proveedor unificado tipo OneSignal) y un endpoint para registrar el device token del usuario. Es trabajo de backend nuevo, no una simple config.
- **Nada de esto es necesario para la Fase 1 (PWA)** — la PWA usa la misma sesión/API que la web hoy.

## Qué necesitaría cambiar en el frontend (`wallets-frontend`)

- **Fase 1**: `manifest.json`, ícono en varios tamaños, service worker (cacheo básico de assets, no necesariamente offline-first completo dado que la app depende de datos en vivo del servidor), meta tags de viewport para instalación.
- **Fase 2**: instalar Capacitor, configurar `capacitor.config.ts`, ajustar CSS para safe-area-insets (notch/status bar), revisar cada modal/dialog en viewport táctil real (no solo el navegador redimensionado), agregar plugins nativos según se necesiten (`@capacitor/push-notifications`, `@capacitor/biometric-auth` o similar).
- **Fase 3**: proyecto nuevo, no una migración del existente — se comparte `src/lib/*` (tipos, lógica de conversión de moneda, clientes de API) pero se reescribe toda la capa de componentes.

## Riesgos y preguntas abiertas (para cuando se retome esto)

- ¿El objetivo es "tener presencia en las tiendas" o "tener la mejor experiencia móvil posible"? La respuesta cambia si Fase 2 es destino final o escala hacia Fase 3.
- Biometría y almacenamiento seguro del token de sesión: en Capacitor esto se resuelve con `@capacitor/preferences` + un plugin de biometría, pero es una decisión de seguridad que vale la pena revisar con cuidado antes de implementar (dónde vive el token, qué pasa si el dispositivo se pierde).
- ¿Hay presupuesto para cuentas de desarrollador de Apple (US$99/año) y Google Play (pago único ~US$25)? Es un costo real de la Fase 2, no técnico pero sí bloqueante para publicar.
