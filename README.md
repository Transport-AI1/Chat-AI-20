# Transport AI Chat

Asistente de inteligencia artificial en Next.js con respuestas en streaming, adjuntos de imágenes, generación de imágenes, markdown y conversaciones guardadas localmente.

## Requisitos

- Node.js 20+
- Una clave API de un proveedor de IA compatible con la API de chat de OpenAI

## Configuración\n\nDefine `API_KEY` y `API_BASE_URL` en las variables de entorno del proyecto. El proveedor configurado procesa las solicitudes de texto e imágenes.\n\n## Instalación

```bash
npm install
cp .env.example .env.local
