# 🌋 Itza-Tepua IoT Dashboard

![Itza-Tepua Dashboard](https://via.placeholder.com/1200x600?text=Dashboard+Preview)

Este proyecto es el **Front-end en Vue 3** para el sistema Itza-Tepua, una plataforma de monitoreo en tiempo real de variables ambientales y geológicas (humedad, inclinación y aceleración), diseñado para prevenir desastres naturales informando de manera temprana sobre alteraciones del terreno.

## 🚀 Características Principales

*   **⚡ Monitoreo en Tiempo Real**: Recepción y visualización fluida de datos de sensores distribuidos, actualizados dinámicamente mediante *polling* sin sobrecargar el servidor.
*   **⚠️ Sistema de Alertas Inteligentes**: Umbrales condicionales por zona (en lugar de fijos globales), notificaciones emergentes visuales y opciones auditivas / Push Notifications integradas.
*   **📊 Analítica Gráfica**:
    *   **Tablas de Estado**: Vistas detalladas por zonas con indicadores dinámicos.
    *   **Comparativa de Barras/Líneas**: Uso de Chart.js para correlacionar diferentes métricas con sus respectivos umbrales marcados en los ejes.
    *   **Series de Tiempo**: Visualización histórica del comportamiento para análisis profundo.
*   **📱 Progressive Web App (PWA)**: Soporte offline e instalable nativamente mediante `vite-plugin-pwa`.
*   **🧪 Código Testeado**: Integración con **Vitest**.

## 🛠️ Tecnologías Utilizadas

*   **Framework**: [Vue 3](https://vuejs.org/) (Composition API)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Gráficos**: [Chart.js](https://www.chartjs.org/) vía `vue-chartjs`
*   **Testing**: [Vitest](https://vitest.dev/) con `@vue/test-utils`
*   **PWA**: `vite-plugin-pwa`
*   **Estilos**: CSS puro (Responsive & Modern)

## 🏗️ Arquitectura por Componentes

El proyecto sigue una estructura limpia promoviendo modularidad:

```text
src/
├── components/          # Fragmentos UI reutilizables
│   ├── cards/           # Indicadores estadísticos (StatCard, RiskCard)
│   ├── charts/          # Módulos Chart.js (Comparison, TimeSeries)
│   ├── layout/          # Cabeceras, footers y banners UI
│   └── tables/          # Tabla principal
├── composables/         # Lógica de Negocio y Estado Global
│   ├── useAlerts.js     # Gestión de umbrales dinámicos y sonido.
│   ├── useSensorData.js # Origen de la verdad de los datos IoT
│   └── ...              # Comparación, Históricos
├── utils/
│   ├── api.js           # Capa de fetch con AbortControllers
│   └── constants.js     # Tokens de diseño y defaults
└── views/               # Montaje final del Dashboard
```

## ⚙️ Configuración e Instalación Local

1.  **Clonar el Repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/itza-tepua-dashboard.git
    cd itza-tepua-dashboard
    ```

2.  **Instalar Dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Copia el archivo base y ajusta la URL del backend donde se encuentre la API:
    ```bash
    cp .env.example .env
    ```

4.  **Ejecutar Servidor de Desarrollo:**
    ```bash
    npm run dev
    ```

5.  **Ejecutar Tests Unitarios:**
    ```bash
    npm run test
    ```
