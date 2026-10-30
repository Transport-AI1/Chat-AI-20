import { hash, rngFrom } from "./rng";

export type Style = "malla" | "ruido" | "fractal" | "geo" | "cosmos" | "agua";

export const STYLES: { id: Style; label: string }[] = [
  { id: "malla", label: "Malla de color" },
  { id: "ruido", label: "Ruido fino" },
  { id: "fractal", label: "Fractal" },
  { id: "geo", label: "Geométrico" },
  { id: "cosmos", label: "Cosmos" },
  { id: "agua", label: "Acuarela" },
];

export function render(prompt: string, style: Style, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const seed = hash(prompt + style);
  const R = rngFrom(seed);
  const hue = seed % 360;
  const palette = [0, 40, 80, 150, 210].map((o) => `hsl(${(hue + o) % 360} 70% ${35 + R() * 30}%)`);

  ctx.fillStyle = `hsl(${hue} 45% 8%)`;
  ctx.fillRect(0, 0, width, height);

  if (style === "ruido") {
    const data = ctx.createImageData(width, height);
    for (let i = 0; i < data.data.length; i += 4) {
      const c = palette[Math.floor(R() * palette.length)]!;
      const m = c.match(/\d+/g)!.map(Number);
      data.data[i] = (m[0] ?? 0) * 0.4 + R() * 40;
      data.data[i + 1] = (m[1] ?? 0) * 0.4 + R() * 40;
      data.data[i + 2] = (m[2] ?? 0) * 0.4 + R() * 40;
      data.data[i + 3] = 255;
    }
    ctx.putImageData(data, 0, 0);
  } else if (style === "fractal") {
    const data = ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let zr = 0;
        let zi = 0;
        let it = 0;
        const cr = (x / width) * 3.4 - 2.2;
        const ci = (y / height) * 2.6 - 1.3;
        while (it < 90 && zr * zr + zi * zi < 4) {
          const t = zr * zr - zi * zi + cr;
          zi = 2 * zr * zi + ci;
          zr = t;
          it++;
        }
        const p = it / 90;
        const k = (y * width + x) * 4;
        data.data[k] = p * 255;
        data.data[k + 1] = p * 180 + 20;
        data.data[k + 2] = p * 90 + 60;
        data.data[k + 3] = 255;
      }
    }
    ctx.putImageData(data, 0, 0);
  } else if (style === "geo") {
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = palette[Math.floor(R() * palette.length)]!;
      ctx.globalAlpha = 0.5 + R() * 0.5;
      const x = R() * width;
      const y = R() * height;
      const s = 20 + R() * 140;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + s, y + R() * s);
      ctx.lineTo(x + R() * s, y + s);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (style === "cosmos") {
    for (let i = 0; i < 420; i++) {
      ctx.fillStyle = `hsl(${hue} 20% ${70 + R() * 30}%)`;
      ctx.globalAlpha = R();
      ctx.beginPath();
      ctx.arc(R() * width, R() * height, R() * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 7; i++) {
      const gx = R() * width;
      const gy = R() * height;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 180 + R() * 160);
      g.addColorStop(0, `${palette[Math.floor(R() * palette.length)]}cc`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (style === "agua") {
    ctx.filter = "blur(26px)";
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = palette[Math.floor(R() * palette.length)]!;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(R() * width, R() * height, 60 + R() * 150, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.filter = "none";
    ctx.globalAlpha = 1;
  } else {
    for (let i = 0; i < 12; i++) {
      const gx = R() * width;
      const gy = R() * height;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 120 + R() * 260);
      g.addColorStop(0, palette[Math.floor(R() * palette.length)]!);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    }
  }

  return canvas;
}