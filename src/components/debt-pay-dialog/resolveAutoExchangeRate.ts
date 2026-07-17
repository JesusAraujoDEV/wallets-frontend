import { fetchDirectRate, type Currency } from "./types";

export async function resolveAutoExchangeRate(
  fromCurrency: Currency,
  toCurrency: Currency,
  date: string,
): Promise<{ rate: number; sourceDate: string } | { error: string }> {
  try {
    return await fetchDirectRate(fromCurrency, toCurrency, date);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo cargar la tasa BCV automáticamente.",
    };
  }
}
