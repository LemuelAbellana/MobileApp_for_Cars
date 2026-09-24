# Cardesk

Cardesk is an Expo SDK 57 React Native/TypeScript app for managing a car inventory.
It loads live car records, supports local search, remote vehicle pictures, details,
validated add/edit forms, confirmed deletion, refresh, and retryable error states.

Prices are stored and sent to the Cars API in PHP. The app converts displayed prices
to PHP, USD, EUR, JPY, or GBP using live Frankfurter exchange rates.

## APIs

- Cars API: `http://lemzy.duckdns.org/cars.php`
  - Bearer-authenticated GET, POST, PUT, and DELETE requests.
  - Car data stays behind this API; the app does not connect directly to MySQL.
- Exchange-rate API: `https://api.frankfurter.dev/v2/rates?base=PHP&quotes=USD,EUR,JPY,GBP`
  - Used for display-only conversion from PHP.

## Run locally

Requires Node.js `>=24.15.0`.

```powershell
npm ci
Copy-Item .env.example .env.local # only if .env.local is absent
# Edit .env.local and set the local bearer token.
npm start
```

Press `a` for Android, or use:

```powershell
npm run android
npm run web
```

Restart Expo after changing `.env.local`.

## Environment

```env
EXPO_PUBLIC_CARS_API_URL=http://lemzy.duckdns.org/cars.php
EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN=replace_me_locally
```

The Cars API URL defaults to the endpoint above when the variable is omitted.

## Verification

```powershell
npm test
npm run typecheck
npm run lint
npx expo-doctor
npx expo export --platform all
npm run api-smoke
```

`api-smoke` requires a valid local token and uses an isolated `CODEX_E2E_*` record
that it cleans up. It does not modify an existing vehicle.

## Security

The HTTP Cars endpoint and the `EXPO_PUBLIC_*` bearer token are for local/demo use
only. Expo public environment values are bundled into the client and are not secrets.
Do not ship a permanent shared token; production needs HTTPS plus runtime
authentication or an authenticated server gateway.
