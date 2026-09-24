import { CURRENCIES, type Currency, type ExchangeRates } from '../api/exchangeRates.ts';

const formatters = Object.fromEntries(CURRENCIES.map((currency) => [
  currency,
  new Intl.NumberFormat('en-PH', {
    style: 'currency', currency, minimumFractionDigits: 0,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }),
])) as Record<Currency, Intl.NumberFormat>;

export function formatPrice(phpPrice: number, currency: Currency = 'PHP', rates?: ExchangeRates): string {
  const selected = currency !== 'PHP' && rates?.[currency] ? currency : 'PHP';
  return formatters[selected].format(phpPrice * (selected === 'PHP' ? 1 : rates![selected]));
}
