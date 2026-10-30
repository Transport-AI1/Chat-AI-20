# nexo.ai

Chat con IA que corre entero en el navegador. Sin API, sin claves, sin backend.

## Arranque

```bash
npm install
npm run dev
```

## Qué hay

- Chat con motor local de intenciones, streaming simulado y Markdown.
- Generador de imágenes por canvas procedural, seis estilos, descarga PNG.
- Cuatro planes con límites en cliente y cobro simulado.
- Anuncios solo en el plan gratuito.
- Ajustes, exportación e importación en localStorage.

## Motor

`lib/engine.ts` clasifica por palabras clave contra `lib/knowledge.ts`. Cada intención
devuelve Markdown con plantillas. Sin coincidencia, cae en un generador genérico.

No es un modelo de lenguaje: es recuperación más plantillas.

## Imágenes

`lib/imagen.ts` deriva una semilla del hash del prompt y dibuja con canvas 2D. Mismo
prompt y estilo, misma imagen.

## Límites honestos

- Sin red no hay conocimiento actualizado.
- Los planes no cobran de verdad.
- El contador de uso es manipulable desde devtools.