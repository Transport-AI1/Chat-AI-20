export const fmt = (n: number): string => new Intl.NumberFormat("es-ES").format(n);
export const pct = (a: number, b: number): number => Math.min(100, (a / b) * 100);