# 🚀 Platica - Frontend Application

[](https://reactjs.org/)
[](https://www.typescriptlang.org/)
[](https://vitejs.dev/)
[]([https://tailwindcss.com/](https://tailwindcss.com/))

**Platica** es una Single Page Application (SPA) de alto rendimiento diseñada para la gestión de finanzas personales. Enfocada en la seguridad y una experiencia de usuario fluida, permite a los usuarios centralizar su salud financiera en una interfaz moderna y robusta.

-----

## ✨ Características Principales

  * **Gestión de Carteras:** Visualización en tiempo real de balances y cuentas.
  * **Seguridad FinTech:** Integración nativa con JWT para sesiones seguidas y protegidas.
  * **UI Adaptativa:** Construida con `shadcn/ui`, garantizando accesibilidad (a11y) y diseño responsivo.
  * **Arquitectura Desacoplada:** Consumo eficiente de microservicios vía REST API.

## 🛠️ Tech Stack

| Herramienta | Propósito |
| :--- | :--- |
| **React 18** | Biblioteca base para la interfaz de usuario. |
| **TypeScript** | Tipado estático para reducir errores en tiempo de ejecución. |
| **TanStack Query** | Manejo de estado asíncrono y caché de API. |
| **Lucide Icons** | Set de iconos vectoriales consistentes. |
| **Shadcn/UI** | Componentes de UI de alta calidad basados en Radix UI. |

-----

## 🔌 Integración con el Backend

El frontend consume la **Wallets API** (OAS 3.0). No requiere persistencia local, ya que todo el estado reside en el servidor.

### Configuración de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# URL base de la API (sin /api al final)
VITE_BACKEND_URL="http://localhost:3001"
```

> [\!IMPORTANT]
> Las peticiones protegidas incluyen automáticamente el encabezado `Authorization: Bearer <token>` tras un login exitoso. El token se gestiona a través de `localStorage`.

-----

## 💻 Guía de Desarrollo

### Requisitos Previos

  * **Node.js** (v18.0 o superior)
  * **npm** o **pnpm**

### Instalación Rápida

1.  **Clonar el proyecto:**
    ```bash
    git clone <YOUR_GIT_URL>
    cd <YOUR_PROJECT_NAME>
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Lanzar entorno de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:8080`.

-----

## 🤖 Flujo de Trabajo con Lovable (AI-Driven)

Este proyecto utiliza **Lovable** para el desarrollo acelerado mediante IA, permitiendo una sincronización bidireccional entre código y diseño visual.

  * **Modo IA:** Realiza cambios mediante lenguaje natural en el [Dashboard de Lovable](https://lovable.dev/projects/09e7e848-5ef8-4fd8-999d-a2e2affcb5ad).
  * **Modo Local:** Haz `git push` desde tu IDE y Lovable integrará tus cambios automáticamente.
  * **Despliegue:** El flujo de CI/CD está integrado. Para publicar cambios a producción, usa la función **Publish** dentro de la plataforma.

-----

## 📂 Estructura del Proyecto

```text
src/
├── components/     # Componentes reutilizables (UI & Business)
├── hooks/          # Hooks personalizados (API calls, lógica)
├── lib/            # Configuraciones (utils, apiClient)
├── pages/          # Vistas principales de la SPA
└── types/          # Definiciones de interfaces TypeScript
```

-----

*Desarrollado con ❤️ para el ecosistema financiero moderno.*

-----
