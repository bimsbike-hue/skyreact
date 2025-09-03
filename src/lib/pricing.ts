export const PRICE_IDR = {
  hour: 15000,         // Rp per print hour
  filamentPerGram: 50, // Rp per gram
};

export function calcTopupTotalIDR(hours: number, grams: number) {
  const h = Math.max(0, Number(hours) || 0);
  const g = Math.max(0, Number(grams) || 0);
  return Math.round(h * PRICE_IDR.hour + g * PRICE_IDR.filamentPerGram);
}
