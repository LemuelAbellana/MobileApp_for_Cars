# Cardesk verification — 2026-09-17

Implementation is present directly in `D:\CarsMobile`. This is a development/demo app;
full authenticated acceptance and production release remain blocked as listed below.

## Built and changed files

```text
CarsMobile/
  .env.example                 Placeholder-only configuration
  .gitignore                  Local environments, dependencies, tools and exports ignored
  .npmrc                      Dependency lifecycle scripts disabled
  package.json, package-lock.json
  app.json, tsconfig.json, eslint.config.js
  IMPLEMENTATION_PLAN.md, README.md, VERIFICATION.md
  app/
    _layout.tsx               Expo Router Stack
    index.tsx                 Inventory, search and refresh
    cars/new.tsx              Create
    cars/[id]/index.tsx        Detail and confirmed delete
    cars/[id]/edit.tsx         Fetch and edit
  src/
    api/cars.ts               Typed fetch client, normalization and safe errors
    config/env.ts             Call-time local demo config
    config/theme.ts           Shared native styles
    types/car.ts              Car and CarInput
    hooks/useResource.ts      Focus refresh and stale-response protection
    components/CarForm.tsx     Shared validated Add/Edit form
    components/CarImage.tsx    Expo Image and stable fallback
    components/Feedback.tsx    Actions, loading, errors and success messages
    utils/validation.ts       Form validation and trimming
    utils/format.ts           PHP currency formatting
  scripts/api-smoke.mjs        Isolated real CRUD lifecycle and cleanup
  tests/api.test.mjs           API/config/error regression checks
  tests/validation.test.mjs    Validation regression checks
  evidence/                   Android screenshots
```

Original `GOAL.md` and `CARS_EXPO_SDK57_MASTER_PROMPT.md` were preserved. Ignored local
helpers live in `.tools/`; the emulator configuration is in `.tools/avd/`. No sibling
checkout or nested project was created. A local Git repository was initialized.

## Commands and static evidence

The machine had Node 22.15.0 and npm 12.0.1, an unsupported pairing. Verification uses
project-local Node 24.21.0. npm's CLI was invoked with that runtime; `.tools/npm.cmd`
provides the same compatible runtime for Expo's npm child processes.

| Check | Executed command/equivalent | Result |
|---|---|---|
| Published SDK | `npm view expo dist-tags --json`, template metadata | Expo 57.0.23; template 57.0.25 |
| SDK packages | `expo install expo-router expo-image expo-linking expo-constants expo-status-bar react-native-screens react-native-safe-area-context react-dom react-native-web expo-font expo-system-ui` | Installed through SDK resolver |
| Unit checks | `.tools/node.exe --test tests/*.test.mjs` | 15 passed, 0 failed |
| TypeScript | `.tools/node.exe node_modules/typescript/bin/tsc --noEmit` | Exit 0 |
| Lint | `.tools/node.exe node_modules/eslint/bin/eslint.js .` | Exit 0 |
| Expo Doctor | `npx expo-doctor` via portable Node/npm CLI | 21/21 passed |
| Export | `expo export --platform all` | Android, iOS and web exported |
| Native versions | `npm ls react-native-reanimated react-native-worklets uuid --depth=3` | SDK-matched 4.5.1 / 0.10.1; UUID 11.1.1 |
| Xcode override | Execute `xcode.project(...).generateUuid()` with an empty parsed project | Valid 24-character Xcode UUID |
| Audit | `npm audit --json` | 0 critical, 0 high, 3 moderate |
| Ignore rules | `git check-ignore .env.local .tools/node.exe node_modules/expo/package.json` | All ignored |
| Staged hygiene | `git diff --cached --check` and token/environment-file scan | Passed; only placeholder `.env.example` staged |
| Live smoke | `.tools/node.exe --env-file-if-exists=.env.local scripts/api-smoke.mjs` | Exit 1: missing development token; no authenticated requests or mutations |

API tests cover numeric-string normalization, invalid numerics and IDs, null picture
fallback, encoded queries, Bearer header construction, call-time config, invalid URLs,
empty/HTML/JSON 401 responses, token redaction, bounded errors, malformed successful
responses, network vs timeout failures, mutation verbs/payloads, ID-less POST, empty
mutation responses and error objects returned with HTTP 200. Form tests cover trimmed
payloads, numeric conversion, zero price, invalid required fields/year/price/URLs.

Dependency remediation aligned automatically installed native peers to Expo's bundled
versions and updated Xcode's UUID dependency. Remaining audit entries all arise from
`decode-uri-component` through `query-string` and `expo-router`. The fixed decoder has
an incompatible module shape; a blind override would break Router. This upstream issue
is documented rather than suppressed. ESLint 9's deprecation remains because current
Expo lint plugins exclude ESLint 10. Metro workers also emit a NO_COLOR/FORCE_COLOR
conflict from the terminal environment, even after removing the parent's FORCE_COLOR;
it affects output coloring, not app behavior, and is not suppressed in app code.

## API evidence and blockers

- DNS resolved `lemzy.duckdns.org` to `162.210.102.233`.
- HTTPS TCP/443 connections timed out twice (10s and 15s), before a TLS handshake.
- HTTP unauthenticated GET returned **400**, with JSON error `Authorization header is missing`.
  The server labels that body `text/html`; the client therefore does not depend on content type.
- The local token is absent/placeholder. Authenticated list/detail, POST, PUT, DELETE,
  cleanup verification and real API image inspection are **BLOCKED**, not passed.
- GET-one currently follows the documented single-object contract; actual authenticated
  response shape must be checked when the token is available.
- No real vehicle was modified, no E2E record was created, and no real token was printed.

Next action: save a development token privately in `.env.local`, restart Expo, run
`npm run api-smoke`, then exercise the native CRUD lifecycle and several real pictures.
If smoke cleanup fails, recover only the exact printed `CODEX_E2E_*` marker.

## Runtime evidence

Android 16 / API 36 emulator `emulator-5554` runs with WHPX and SDK 57-compatible Expo Go.
It booted successfully; Cardesk's real Android bundle launched. No mock inventory or
fake token was injected. The expected missing-token state is visible.

Native checks and screenshots cover inventory/config failure, Retry, Add navigation,
empty-submit inline validation, form scrolling and keyboard types, Cancel/back, and
small-screen/large-text/landscape layouts. Android testing found the shared form's picture
URL field hidden by the keyboard; keyboard avoidance was corrected for both Add and Edit.
Retest passed: at approximately 375dp width and 1.3x font scale, the picture field was
fully visible at y822–965 above the keyboard starting at y965. Numeric keyboard focus
also passed. Cancel and Android Back returned to inventory. No app crash was observed.
The emulator was restored to 1080x1920, font scale 1.0, portrait, on inventory.

Screenshots: [inventory/config](evidence/android-inventory-config.png),
[Add form](evidence/android-add-form.png), [validation](evidence/android-validation.png),
[numeric keyboard](evidence/android-year-keyboard.png),
[URL keyboard after fix](evidence/android-picture-keyboard.png),
[375dp/larger text](evidence/android-small-large-text.png),
[landscape](evidence/android-landscape.png). The floating gear is Expo Go's developer
control, not an app feature. Photos/cards and authenticated screens are not represented
as verified by these screenshots.

Full native authenticated CRUD, real card/detail imagery, successful mutation notices,
post-mutation refresh and remote-image recovery remain blocked by the missing token.
Their wiring was reviewed and API behavior unit-tested; that is not live E2E evidence.
iOS was exported but not run: no iOS simulator is available on this Windows host. Web
was exported but no browser interaction pass is claimed. No standalone APK/IPA was built.

## Parallel agents and skills

Three native subagents were used concurrently and reused for later work:

- `architecture`: **GPT-6 Astra, High** — SDK/reference research, test strategy,
  dependency analysis and final source review.
- `design`: **GPT-6 Astra, High** — ui-ux-pro-max, BookCars visual research,
  design tokens, Android emulator setup and rendered UI/runtime critique.
- `api_security`: **GPT-5.6 Sol, High** — API/TLS/security research, isolated API/test/smoke
  implementation, regression checks and mutation/refresh review.

A fourth agent request was rejected with `agent thread limit reached`. The preferred
GPT-5.6 Luna Extra High test/regression role was handled by the existing Astra agent and
the orchestrator. No Luna invocation or four-way concurrent run is claimed. Final code
critique also reused Astra rather than spawning another Sol thread.

Installed skills actually read/applied: `ponytail`, `using-superpowers`,
`using-agent-skills`, `caveman`, `ui-ux-pro-max`, `brainstorming`, `writing-plans`,
`dispatching-parallel-agents`, `git-workflow-and-versioning`,
`incremental-implementation`, `test-driven-development`, `frontend-ui-engineering`,
`security-and-hardening`, `systematic-debugging`, `code-review-and-quality`, and
`verification-before-completion`. The supplied documents already specified the design
and authorized implementation. Agent writes used non-overlapping ownership.

## Production gates

Enable working HTTPS; replace the permanent client token with runtime scoped auth or an
authenticated gateway; resolve the upstream decoder advisory; verify authenticated API
shapes/CRUD/images; run standalone Android and iOS acceptance. A gitignored environment
file does not make EXPO_PUBLIC values secret. No production-readiness claim is made.
