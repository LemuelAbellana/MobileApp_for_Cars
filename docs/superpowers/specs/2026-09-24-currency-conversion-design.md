# Currency conversion design

## Goal

Let users display stored Philippine peso car prices as PHP, USD, EUR, JPY, or GBP on both the inventory and car-detail screens. Conversion is display-only: PHP remains the only value read from and written to the Cars API.

## UI

- Add an accessible currency dropdown to each inventory card. Each card's selection updates only that car's price and accessibility label.
- Add the same dropdown below the price on the car-detail screen.
- Default each card and the detail screen to PHP. Inventory selection is keyed by car ID; detail selection is local to that screen and does not persist across navigation.
- While rates are unavailable, continue showing PHP. If loading fails, show a short message and a retry control.

## Data flow

Request rates directly from the public endpoint:

`GET https://api.frankfurter.dev/v2/rates?base=PHP&quotes=USD,EUR,JPY,GBP`

Validate the response as an array of records containing base `PHP`, one expected quote, and a finite positive rate. Index records by quote because response order is not guaranteed. Treat an empty, malformed, or incomplete response as unavailable.

For PHP, format the current `car.price` directly. For another selection, format `car.price * rate` with `Intl.NumberFormat`. Because conversion happens during rendering, refreshed or edited PHP prices automatically produce updated converted values.

No converted price reaches `CarForm`, `createCar`, or `updateCar`, so the database contract is unchanged. The public exchange endpoint is a source constant, not an environment variable.

## Structure

- A small exchange-rate API module owns the endpoint, timeout, response validation, and user-safe errors.
- Existing formatting utilities format supported currencies and perform the multiplication.
- A reusable dropdown component provides the cross-platform selector without adding a dependency.
- Inventory owns one rate request and per-car currency selections; the detail screen owns its own rate request and selection.

## Verification

- Unit-test URL construction, response mapping, malformed/incomplete responses, request failures, and conversion formatting with mocked `fetch`.
- Run the project test suite, TypeScript check, ESLint, Expo Doctor, and Expo export.
- In the web app, verify independent inventory card dropdowns, the detail dropdown, converted prices, accessible labels, one rate request per screen, and a clean console.

## Explicit exclusions

- No database, Cars API payload, form, or environment-file changes.
- No global currency context, persisted preference, historical-rate picker, background refresh, or new package.
