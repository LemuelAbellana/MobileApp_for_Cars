export const CURRENCIES = ['PHP', 'USD', 'EUR', 'JPY', 'GBP'] as const;
export type Currency = typeof CURRENCIES[number];
export type ExchangeRates = Record<Currency, number>;

const URL = 'https://api.frankfurter.dev/v2/rates?base=PHP&quotes=USD,EUR,JPY,GBP';

export async function getExchangeRates(): Promise<ExchangeRates> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let receivedResponse = false;

  try {
    const response = await fetch(URL, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    receivedResponse = true;
    if (!response.ok) throw new Error();

    const body: unknown = await response.json();
    if (!Array.isArray(body)) throw new Error();

    const rates: Partial<ExchangeRates> = { PHP: 1 };
    for (const row of body) {
      if (
        typeof row !== 'object' || row === null || Array.isArray(row) ||
        row.base !== 'PHP' || typeof row.quote !== 'string' ||
        row.quote === 'PHP' || !CURRENCIES.includes(row.quote as Currency) ||
        typeof row.rate !== 'number' || !Number.isFinite(row.rate) || row.rate <= 0 ||
        row.quote in rates
      ) throw new Error();
      rates[row.quote as Currency] = row.rate;
    }
    if (CURRENCIES.some((currency) => !(currency in rates))) throw new Error();
    return rates as ExchangeRates;
  } catch {
    if (controller.signal.aborted) throw new Error('The exchange-rate request timed out.');
    throw new Error(receivedResponse ? 'Exchange rates are unavailable.' : 'Unable to load exchange rates.');
  } finally {
    clearTimeout(timeout);
  }
}
