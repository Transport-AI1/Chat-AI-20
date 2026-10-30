export type Intent = { keys: string[]; build: (prompt: string) => string };

export const INTENTS: Record<string, Intent> = {
  saludo: {
    keys: ["hola", "buenas", "hey", "qué tal"],
    build: () =>
      "Hola. Soy nexo, el motor local de esta app. Funciono sin red.\n\n¿Sobre qué quieres trabajar? Puedo explicar conceptos técnicos, escribir código, armar planes o generar imágenes desde la barra lateral.",
  },
  identidad: {
    keys: ["quién eres", "que eres", "cómo funcionas"],
    build: () =>
      "**nexo.ai** es una demo de chat con IA que corre íntegramente en el cliente.\n\n- **Sin API**: no hay claves ni backend.\n- **Motor de intenciones**: clasifico por palabras clave y compongo la respuesta.\n- **Imágenes**: canvas 2D con semilla derivada del prompt.\n\nLa contrapartida: no razona como un modelo grande.",
  },
  javascript: {
    keys: ["javascript", "event loop", "closure", "promesa"],
    build: () =>
      "## Event loop\n\nJavaScript tiene un hilo único. El bucle toma tareas cuando la pila se vacía.\n\n```js\nconsole.log(\"1\");\nsetTimeout(() => console.log(\"3\"), 0);\nPromise.resolve().then(() => console.log(\"2\"));\nconsole.log(\"4\");\n// 1 4 2 3\n```\n\nLas microtareas se vacían antes que las macrotareas en cada vuelta.\n\n### Consecuencias\n- Bloquear el hilo congela la interfaz.\n- `await` solo cede a microtareas.\n- Un bucle de microtareas deja sin turno al render.",
  },
  react: {
    keys: ["react", "hook", "usestate", "componente"],
    build: () =>
      "Contador con hooks:\n\n```tsx\n\"use client\";\nimport { useState } from \"react\";\n\nexport function Contador({ inicial = 0 }: { inicial?: number }) {\n  const [n, setN] = useState(inicial);\n  return (\n    <div className=\"flex gap-3\">\n      <button onClick={() => setN((v) => v - 1)}>-</button>\n      <output>{n}</output>\n      <button onClick={() => setN((v) => v + 1)}>+</button>\n    </div>\n  );\n}\n```\n\nUsa el updater funcional: lee el valor más reciente y no falla al encadenar llamadas.",
  },
  typescript: {
    keys: ["typescript", "tipos", "generic"],
    build: () =>
      "Los genéricos relacionan entrada y salida:\n\n```ts\ndeclare function primero<T>(xs: readonly T[]): T | undefined;\n```\n\n### Reglas\n- `unknown` antes que `any` en fronteras.\n- Discriminated unions para estados.\n- `noUncheckedIndexedAccess` convierte `arr[0]` en `T | undefined`.",
  },
  nextjs: {
    keys: ["next", "app router", "ssr", "rsc"],
    build: () =>
      "En App Router los componentes son de servidor por defecto.\n\n- Servidor: datos, sin estado.\n- Cliente: `\"use client\"` para hooks y eventos.\n\nBaja el `\"use client\"` lo más abajo posible del árbol o perderás streaming.",
  },
  css: {
    keys: ["css", "flexbox", "grid", "responsive"],
    build: () =>
      "## Grid frente a flex\n\nFlex reparte en un eje; grid define ambos.\n\n```css\n.galeria {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n  gap: 12px;\n}\n```\n\n`auto-fill` con `minmax` da columnas responsivas sin media queries.",
  },
  sql: {
    keys: ["sql", "consulta", "join"],
    build: () =>
      "```sql\nSELECT c.nombre, COUNT(p.id) AS pedidos\nFROM clientes c\nLEFT JOIN pedidos p ON p.cliente_id = c.id\n  AND p.creado > now() - interval '30 days'\nGROUP BY c.id, c.nombre\nHAVING COUNT(p.id) > 2;\n```\n\nEl filtro temporal va en el `ON` para no convertir el join en interno.",
  },
  plan: {
    keys: ["plan", "aprender", "estudiar", "roadmap"],
    build: () =>
      "## Plan en cuatro semanas\n\n**Semana 1** — base y vocabulario, dos ejercicios diarios.\n**Semana 2** — proyecto pequeño cerrado y lectura de código ajeno.\n**Semana 3** — repetir con una restricción dura.\n**Semana 4** — publicar y revisar huecos.\n\n### Métrica\nUna cosa terminada por semana.",
  },
  receta: {
    keys: ["receta", "cocinar", "comida"],
    build: () =>
      "## Pasta con tomate asado\n\n**Ingredientes (2)**\n- 400 g de tomate cherry\n- 200 g de pasta corta\n- Ajo, aceite, sal, albahaca\n\n**Pasos**\n1. Horno a 200 °C, 25 minutos.\n2. Coce la pasta un minuto menos del paquete.\n3. Aplasta el tomate y mezcla fuera del fuego con agua de cocción.\n4. Albahaca al final.",
  },
  negocio: {
    keys: ["negocio", "emprender", "startup", "marca"],
    build: (p) =>
      `## Enfoque para "${p.slice(0, 60)}"\n\n**1. Problema concreto** — una frase, un afectado.\n**2. Alternativa actual** — es tu competencia real.\n**3. Ventaja defendible** — precio, distribución, datos o marca.\n**4. Prueba barata** — landing con lista de espera.\n**5. Números** — adquisición frente a margen.`,
  },
  poema: {
    keys: ["poema", "poesía", "verso"],
    build: () =>
      "### Inventario de lo que queda\n\nQueda la luz que no supimos nombre,\nel ruido de una puerta que se cierra sola,\nlos platos que aún guardan el domingo.\n\nQueda el reloj midiendo lo que falta,\ny este oficio tonto de ordenar\nlo que se fue en cajas que no abro.",
  },
  fallback: {
    keys: [],
    build: (p) => {
      const t = p.slice(0, 90);
      return `## ${t.charAt(0).toUpperCase()}${t.slice(1)}\n\n**Qué hay debajo**\nTodo esto tiene una parte de definición y otra de decisión. La primera se resuelve leyendo.\n\n**Qué haría primero**\n1. Reducirlo a una pregunta de sí o no.\n2. Buscar el caso más pequeño que ya funcione.\n3. Ampliar solo cuando esté cerrado.\n\n**Dónde se rompe**\nSe confunde alcance con entusiasmo.`;
    },
  },
};