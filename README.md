# Cardesk

A small Expo SDK 57 car inventory app connected only to the existing PHP REST API.
The project lives directly in `D:\CarsMobile`; there is no nested app project.

## Run locally

Use Node **24.15+** (Node 24 LTS recommended). Then:

```powershell
npm ci
Copy-Item .env.example .env.local # only if .env.local does not already exist
# Edit .env.local locally and replace the placeholder token. Never paste it into chat.
npm start
```

Press `a` for the Android emulator or scan the QR code with SDK 57-compatible Expo Go.
`npm run web` also starts the web target; the API must permit browser CORS.

This workspace has a portable Node 24.21.0 in ignored `.tools/` because the machine's
Node 22.15.0 conflicts with its npm 12.0.1. For this machine without changing global tools:

```powershell
$env:Path = "$PWD\.tools;$env:Path"
& .\.tools\npm.cmd start
```

The portable helper is machine-local and is not part of the repository. Other machines
should install a compatible Node version normally. Restart Expo after changing `.env.local`.

## Behavior

- Inventory uses a FlatList, local brand/model/year search, pull-to-refresh and focus refresh.
- Details load independently by ID. Create and edit share one validated form.
- Delete requires native confirmation. Saves and deletes prevent duplicate in-flight requests.
- Successful mutations navigate back and refetch server state. POST does not need to return an ID.
- Pictures use `expo-image`, fixed aspect ratio and a local text fallback. Refresh retries failed pictures.
- Loading, empty, missing-config, authorization, network and malformed-response states are explicit.
- PHP numeric strings are normalized in the API module. Prices display in PHP.

No backend, direct MySQL connection, global state library, offline store or image upload is included.

## Verification

```powershell
npm test
npm run typecheck
npm run lint
npx expo-doctor
npx expo export --platform all
npm run api-smoke
```

Tests use Node's built-in runner. Unit tests substitute HTTP responses only at the fetch
boundary; the app itself always uses the real API and has no mock-data mode.

The smoke script requires the token in `.env.local`, creates an isolated `CODEX_E2E_*`
record, reads it, changes its color, verifies persistence, deletes it and verifies cleanup.
It never modifies an existing vehicle. Cleanup searches the exact unique marker even if
POST times out; a cleanup failure prints that marker for manual recovery. Do not rerun a
failed smoke blindly when cleanup could not be confirmed.

See [VERIFICATION.md](VERIFICATION.md) for actual checks, screenshots and remaining blockers.

## Transport and credentials

HTTPS at `https://lemzy.duckdns.org/cars.php` timed out before a TLS handshake on this network.
The configured HTTP endpoint is **for explicitly acknowledged local/demo testing only**.
There is no automatic HTTPS-to-HTTP fallback and no global Android cleartext exception.

`.env.local` is ignored to prevent accidental Git commits. **It does not protect a token
embedded in an Expo bundle. Every `EXPO_PUBLIC_*` value is extractable.** Do not distribute
this app with a permanent shared Bearer secret. Production requires HTTPS plus either real
user authentication with scoped/short-lived tokens (stored at runtime in SecureStore) or
an authenticated server gateway that owns the upstream secret.

Expo Go is the verified development runtime. Standalone Android builds may reject this
HTTP endpoint. Prefer enabling HTTPS on the server. If a temporary standalone demo must
use HTTP, scope Android Network Security Config to `lemzy.duckdns.org` alone, keep
`base-config cleartextTrafficPermitted="false"`, and attach the domain config only to the
development build. Do not enable global `usesCleartextTraffic` or ship that exception.
No such exception was necessary or added here; native standalone builds are unverified.

## Dependency decisions

SDK-compatible Expo packages were selected with `expo install`. Router brings Reanimated
and Worklets transitively; overrides hold them to SDK 57's bundled versions, 4.5.1 and
0.10.1. The Xcode config dependency's UUID override to 11.1.1 removes its advisory and was
checked against its `generateUuid()` usage. Install scripts are disabled in `.npmrc`.

Three remaining **moderate** audit entries share one upstream `decode-uri-component`
advisory through Router/query-string. The fixed decoder changes CommonJS interoperability;
blind overrides break Router. Track an upstream SDK 57-compatible fix before production.
ESLint 9's deprecation is also upstream: current Expo lint plugins do not yet accept ESLint 10.
Neither issue is hidden with audit exclusions or forced downgrades.

## References

- [Expo SDK matrix](https://docs.expo.dev/versions/v57.0.0/)
- [Default template](https://docs.expo.dev/more/create-expo/), [first-app tutorial](https://docs.expo.dev/tutorial/create-your-first-app/), [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo Image](https://docs.expo.dev/versions/latest/sdk/image/)
- [Expo environment variables](https://docs.expo.dev/guides/environment-variables/), [EAS environment variables](https://docs.expo.dev/eas/environment-variables/)
- [BookCars](https://github.com/aelassas/bookcars), [Overview](https://github.com/aelassas/bookcars/wiki/Overview): MIT project used for automotive information hierarchy only; no code or images copied.
- [Android network security](https://developer.android.com/privacy-and-security/security-config)
- [Decoder advisory](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr)
