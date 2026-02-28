const PALETTE = [
  "#D9464A",
  "#2463EB",
  "#0D9F6E",
  "#F29B05",
  "#8A3FFC",
  "#EA4B8B",
  "#1D7A86",
  "#C26D00",
] as const;

function hash(seed: string): number {
  let value = 0;
  for (let index = 0; index < seed.length; index += 1) {
    value = (value << 5) - value + seed.charCodeAt(index);
    value |= 0;
  }
  return Math.abs(value);
}

export function getStableColor(seed: string): string {
  return PALETTE[hash(seed) % PALETTE.length];
}
