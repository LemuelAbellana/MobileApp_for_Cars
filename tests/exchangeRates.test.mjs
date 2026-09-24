import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { getExchangeRates } from '../src/api/exchangeRates.ts';
import { formatPrice } from '../src/utils/format.ts';

const originalFetch = globalThis.fetch;
const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
const body = [
  { date: '2026-09-24', base: 'PHP', quote: 'GBP', rate: 0.01198 },
  { date: '2026-09-24', base: 'PHP', quote: 'USD', rate: 0.01598 },
  { date: '2026-09-24', base: 'PHP', quote: 'JPY', rate: 2.519 },
  { date: '2026-09-24', base: 'PHP', quote: 'EUR', rate: 0.01396 },
];

afterEach(() => {
  globalThis.fetch = originalFetch;
  globalThis.setTimeout = originalSetTimeout;
  globalThis.clearTimeout = originalClearTimeout;
});

test('requests the exact quotes and maps unordered rates by quote', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.frankfurter.dev/v2/rates?base=PHP&quotes=USD,EUR,JPY,GBP');
    assert.deepEqual(options.headers, { Accept: 'application/json' });
    assert.ok(options.signal instanceof AbortSignal);
    return new Response(JSON.stringify(body));
  };

  assert.deepEqual(await getExchangeRates(), {
    PHP: 1, USD: 0.01598, EUR: 0.01396, JPY: 2.519, GBP: 0.01198,
  });
});

test('rejects malformed, incomplete, and invalid rates', async () => {
  for (const payload of [
    {},
    body.slice(1),
    body.map((row) => row.quote === 'USD' ? { ...row, base: 'EUR' } : row),
    body.map((row) => row.quote === 'USD' ? { ...row, rate: 0 } : row),
    body.map((row) => row.quote === 'USD' ? { ...row, rate: Infinity } : row),
    [...body, body[0]],
  ]) {
    globalThis.fetch = async () => new Response(JSON.stringify(payload));
    await assert.rejects(getExchangeRates(), { message: 'Exchange rates are unavailable.' });
  }
  globalThis.fetch = async () => new Response('{broken');
  await assert.rejects(getExchangeRates(), { message: 'Exchange rates are unavailable.' });
});

test('rejects a non-success response without showing the remote body', async () => {
  globalThis.fetch = async () => new Response('secret upstream detail', { status: 503 });
  await assert.rejects(getExchangeRates(), { message: 'Exchange rates are unavailable.' });
});

test('maps network failure to a safe message', async () => {
  globalThis.fetch = async () => { throw new Error('private socket detail'); };
  await assert.rejects(getExchangeRates(), { message: 'Unable to load exchange rates.' });
});

test('aborts after ten seconds and clears the timer', async () => {
  let timeout;
  let cleared;
  globalThis.setTimeout = (callback, milliseconds) => {
    assert.equal(milliseconds, 10_000);
    timeout = callback;
    return 7;
  };
  globalThis.clearTimeout = (id) => { cleared = id; };
  globalThis.fetch = async (_url, { signal }) => {
    timeout();
    assert.equal(signal.aborted, true);
    throw new DOMException('Aborted', 'AbortError');
  };

  await assert.rejects(getExchangeRates(), { message: 'The exchange-rate request timed out.' });
  assert.equal(cleared, 7);
});

test('clears the timer after success', async () => {
  let cleared;
  globalThis.setTimeout = () => 9;
  globalThis.clearTimeout = (id) => { cleared = id; };
  globalThis.fetch = async () => new Response(JSON.stringify(body));

  await getExchangeRates();
  assert.equal(cleared, 9);
});

test('formats each PHP price using the selected currency and latest rates', () => {
  const rates = { PHP: 1, USD: 0.01598, EUR: 0.01396, JPY: 2.519, GBP: 0.01198 };

  assert.equal(formatPrice(1000), '₱1,000');
  assert.equal(formatPrice(1000, 'USD', rates), '$15.98');
  assert.equal(formatPrice(1000, 'JPY', rates), '¥2,519');
  assert.equal(formatPrice(2000, 'USD', rates), '$31.96');
  assert.equal(formatPrice(1000, 'USD'), '₱1,000');
});
