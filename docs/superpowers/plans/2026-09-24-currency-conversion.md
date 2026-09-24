# Currency Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display PHP car prices as PHP, USD, EUR, JPY, or GBP through per-car and detail currency buttons opening a native modal chooser, without changing persisted car data.

**Architecture:** A credentialless API module fetches and validates one PHP-based rate table. Existing price formatting becomes currency-aware, a currency button opens a native modal chooser, and inventory keeps per-car selection with one rate resource while detail keeps its own selection/rate resource. Only PHP prices reach the Cars API.

**Tech Stack:** Expo SDK 57, React 19, React Native 0.86, TypeScript 6, native `fetch`, `Intl.NumberFormat`, and Node's built-in test runner.

## Global Constraints

- Support exactly PHP, USD, EUR, JPY, and GBP.
- Use `https://api.frankfurter.dev/v2/rates?base=PHP&quotes=USD,EUR,JPY,GBP` directly; do not add an environment variable.
- Keep PHP as the only stored and editable price; conversion is display-only.
- Add no dependency, global context, persisted preference, historical-rate UI, or background refresh.
- On rate failure, show PHP and provide a retry control.

---

### Task 1: Rate boundary and currency formatting

**Files:**
- Create: `src/api/exchangeRates.ts`
- Create: `tests/exchangeRates.test.mjs`
- Modify: `src/utils/format.ts`

**Interfaces:**
- Produces: `CURRENCIES`, `Currency`, `ExchangeRates`, and `getExchangeRates(): Promise<ExchangeRates>` from `src/api/exchangeRates.ts`.
- Produces: `formatPrice(phpPrice: number, currency?: Currency, rates?: ExchangeRates): string` from `src/utils/format.ts`.

- [ ] **Step 1: Write failing API tests**

Create `tests/exchangeRates.test.mjs` with mocked `globalThis.fetch` coverage for the exact URL, response-order-independent mapping, `Accept: application/json`, malformed/incomplete payload rejection, non-2xx rejection, network failure, and timeout cleanup. Use this valid unordered body:

```js
[
  { date: '2026-09-24', base: 'PHP', quote: 'GBP', rate: 0.01198 },
  { date: '2026-09-24', base: 'PHP', quote: 'USD', rate: 0.01598 },
  { date: '2026-09-24', base: 'PHP', quote: 'JPY', rate: 2.519 },
  { date: '2026-09-24', base: 'PHP', quote: 'EUR', rate: 0.01396 },
]
```

Assert the normalized result is `{ PHP: 1, USD: 0.01598, EUR: 0.01396, JPY: 2.519, GBP: 0.01198 }`. Restore fetch and timers in `afterEach`.

- [ ] **Step 2: Run the focused tests and confirm red**

Run:

```powershell
.\.tools\node.exe --test .\tests\exchangeRates.test.mjs
```

Expected: FAIL because `src/api/exchangeRates.ts` does not exist.

- [ ] **Step 3: Implement the validated public API boundary**

Create `src/api/exchangeRates.ts` with these public definitions:

```ts
export const CURRENCIES = ['PHP', 'USD', 'EUR', 'JPY', 'GBP'] as const;
export type Currency = typeof CURRENCIES[number];
export type ExchangeRates = Record<Currency, number>;
export async function getExchangeRates(): Promise<ExchangeRates>;
```

Use an `AbortController` with a 10-second timeout. Send only an `Accept: application/json` header. Require a successful response and an array containing every requested quote exactly as a finite positive rate with base `PHP`; map by `quote`, not array position. Throw user-safe errors: `Exchange rates are unavailable.`, `The exchange-rate request timed out.`, or `Unable to load exchange rates.` Always clear the timer.

- [ ] **Step 4: Add failing formatting assertions**

In `tests/exchangeRates.test.mjs`, assert:

```js
assert.equal(formatPrice(1000), '₱1,000');
assert.equal(formatPrice(1000, 'USD', rates), '$15.98');
assert.equal(formatPrice(1000, 'JPY', rates), '¥2,519');
assert.equal(formatPrice(1000, 'USD'), '₱1,000');
```

The last assertion defines the safe PHP fallback when rates are missing.

- [ ] **Step 5: Make formatting currency-aware**

Change `src/utils/format.ts` to cache one `Intl.NumberFormat` per supported currency, multiply the latest PHP price by the selected rate during each call, and fall back to PHP if non-PHP rates are absent. Keep zero to two fraction digits for PHP/USD/EUR/GBP and zero fraction digits for JPY.

- [ ] **Step 6: Run Task 1 checks**

Run:

```powershell
.\.tools\node.exe --test .\tests\exchangeRates.test.mjs
.\.tools\node.exe --test .\tests\api.test.mjs .\tests\validation.test.mjs
```

Expected: all tests pass.

### Task 2: Accessible currency modal chooser

**Files:**
- Create: `src/components/CurrencySelect.tsx`

**Interfaces:**
- Consumes: `CURRENCIES` and `Currency` from `src/api/exchangeRates.ts`.
- Produces: `CurrencySelect({ value, onChange, disabled? })` where `value: Currency`, `onChange: (currency: Currency) => void`, and `disabled?: boolean`.

- [ ] **Step 1: Implement the native modal chooser**

Use one bordered `Pressable` trigger with label `Currency: {value}` and local `open` state. It opens a transparent, fading native `Modal` with a dim backdrop and centered surface panel (90% viewport width, up to 360 pixels). Show `Select currency`, `Choose how this price is displayed.`, and the five `Pressable` currency rows. Each row must have an accessible name, `accessibilityState={{ selected: value === currency }}`, a 48-pixel minimum touch target, and must close the modal after selection. Include a visible `Cancel` action; backdrop press and Android back also close the modal. Mark the panel `accessibilityViewIsModal`. Disabled state must close/prevent opening using an effect and expose `accessibilityState={{ disabled }}` on the trigger.

Use React Native's built-in `Modal`, `View`, `Text`, `Pressable`, `StyleSheet`, the existing `Action`, theme colors/styles, and React state/effect. Do not install a picker package or add icons, persistence, or extra animation.

- [ ] **Step 2: Run static checks**

Run:

```powershell
$env:Path = "$PWD\.tools;$env:Path"
npm run typecheck
npm run lint
```

Expected after Task 1 is present: both commands pass.

### Task 3: Wire both screens without persistence changes

**Files:**
- Modify: `app/index.tsx`
- Modify: `app/cars/[id]/index.tsx`

**Interfaces:**
- Consumes: `Currency` and `getExchangeRates()` from `src/api/exchangeRates.ts`.
- Consumes: `CurrencySelect` from `src/components/CurrencySelect.tsx`.
- Consumes: `formatPrice(phpPrice, currency, rates)` from `src/utils/format.ts`.

- [ ] **Step 1: Add inventory conversion state**

Call `useResource(getExchangeRates)` once in `Inventory`, add `Record<number, Currency>` state keyed by car ID, and compute each card's effective selection as PHP whenever rates are absent. Put a `CurrencySelect` button that opens the modal in each card, separate from its navigation `Pressable`, and pass that card's effective currency and rates to both its visible price and accessibility label. Each card defaults to PHP and changes independently.

Show `Loading exchange rates…` while the first request is pending. On rate failure, render `ErrorState` with its returned message and `retry={() => void refreshRates()}`; continue rendering PHP prices.

- [ ] **Step 2: Add detail conversion state**

Repeat one local rate resource and one local `Currency` state in `CarDetails`. Place the `CurrencySelect` button that opens the modal directly below the displayed price, format with the effective currency/rates, and use the same loading/error/retry behavior. Do not modify `CarForm`, `src/api/cars.ts`, `CarInput`, or any mutation call.

- [ ] **Step 3: Run all automated checks**

Run:

```powershell
$env:Path = "$PWD\.tools;$env:Path"
npm test
npm run typecheck
npm run lint
npx expo-doctor
npx expo export --platform all
```

Expected: every command exits 0.

- [ ] **Step 4: Verify in a real browser**

Start the web app with the portable Node path. On the inventory screen, confirm one Frankfurter request succeeds, each card's currency button opens a modal with all five accessible options, selecting a foreign currency changes only that card's visible price and accessibility label, and PHP restores its original value. Check Cancel and backdrop dismissal. Open a car and repeat on the detail screen. Confirm no Cars API mutation request occurs, the browser console is clean, the modal controls are keyboard-accessible, and the layout works at desktop and narrow mobile widths.

- [ ] **Step 5: Review and commit the implementation**

Review the complete diff against `docs/superpowers/specs/2026-09-24-currency-conversion-design.md`, fix all critical/important findings, then commit only the implementation and tests:

```powershell
git add -- app/index.tsx 'app/cars/[id]/index.tsx' src/api/exchangeRates.ts src/components/CurrencySelect.tsx src/utils/format.ts tests/exchangeRates.test.mjs docs/superpowers/plans/2026-09-24-currency-conversion.md
git commit -m "feat: add display currency conversion"
```
