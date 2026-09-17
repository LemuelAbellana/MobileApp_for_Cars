# /goal — MotorDesk Expo SDK 57 Cars CRUD App

/goal

Build a **simple, elegant, business-ready-in-UX Expo SDK 57 mobile car inventory app** that showcases and manages records from the existing PHP/MySQL Cars API.

The app must demonstrate real end-to-end CRUD connectivity, not mocked data:

```text
API: http://lemzy.duckdns.org/cars.php
Auth: Bearer token supplied locally by the user
Database behind API: MySQL
```

The mobile app communicates with the REST API only. It must never connect directly to MySQL.

## Data contract

```text
id             auto-increment, read-only in app
brand
model
year
color
price
fuel_type
transmission
picture
```

CRUD contract:

```text
GET    cars.php
GET    cars.php?id={id}
GET    cars.php?brand={brand}
GET    cars.php?model={model}
POST   cars.php
PUT    cars.php?id={id}
DELETE cars.php?id={id}
```

## Product outcome

A user can:

1. open the app and see the car inventory;
2. see real remote car pictures from the API;
3. search/browse the inventory;
4. open a car and inspect its details;
5. add a car;
6. edit a car;
7. delete a car after confirmation;
8. immediately see fresh server state after each mutation;
9. recover gracefully from loading, authorization, network, empty-data, and image failures.

## UX goal

The product should look like a restrained small-business automotive inventory app rather than a generic generated dashboard.

Target qualities:

- simple;
- premium but not flashy;
- readable;
- photography-led;
- fast to scan;
- clear hierarchy;
- coherent spacing;
- obvious actions;
- no dead controls;
- no gratuitous gradients/glassmorphism;
- no visual clutter;
- no "AI slop".

Use the official Expo SDK 57 default/Router approach as the technical foundation and inspect the open-source BookCars mobile experience for automotive information-hierarchy inspiration only.

## Technical goal

Use:

```text
Expo SDK 57
React Native
TypeScript
Expo Router
expo-image
built-in fetch
local React state / small hooks
```

Avoid unnecessary state or networking libraries.

Normalize PHP/MySQL numeric strings at the API boundary.

Keep all HTTP logic in a dedicated API module.

Use a reusable Car form for Create and Update.

Use an image fallback for failed URLs.

## Secret/config goal

Gitignore local environment files and never commit the real Bearer token.

Important security truth:

```text
A gitignored .env protects the token from accidental Git commits.
It does NOT make a token embedded into an Expo client bundle secret.
```

`EXPO_PUBLIC_*` values must be considered public.

For a local/demo build, a development token may be supplied locally so the CRUD app can function.

For a production business release, the app must not ship a permanent shared Bearer secret. Require a proper runtime auth/token flow or a server-side gateway. Store runtime user/session tokens with SecureStore when such a flow exists.

Because the supplied API URL is HTTP, production readiness also requires HTTPS. Test HTTPS first; if it is unavailable, record transport security as an external blocker rather than weakening security silently.

## Loop engineering goal

Use this engineering loop until all feasible gates pass:

```text
OBSERVE
  ↓
PLAN
  ↓
BUILD A SMALL VERTICAL SLICE
  ↓
VERIFY
  ↓
CRITIQUE IN PARALLEL
  ↓
FIX
  ↓
RE-VERIFY
  └───────────────> repeat only when evidence requires it
```

Maximum normal remediation cycles: 3.

Every loop must use evidence from code, commands, API responses, or an actual running app. No "looks correct" completion.

## Parallel agent goal

Use multiple super subagents concurrently for independent work.

Preferred Wave 1:

```text
Architecture + Expo SDK review      -> GPT 6 Astra High
UI/UX + template analysis           -> GPT 6 Astra High
API/security review                 -> GPT 5.6 Sol High
Test strategy                       -> GPT 5.6 Luna Extra High
```

Preferred final verification:

```text
E2E/API verifier                    -> GPT 5.6 Sol High
Code-quality/security critic        -> GPT 5.6 Sol High
Fast regression/checks              -> GPT 5.6 Luna Extra High
Rendered UI/UX critic               -> GPT 6 Astra High
```

Read and apply installed Codex skills:

```text
ponytail
superpowers
caveman
ui ux promax
```

Use each according to its real installed documentation. Do not invent skill behavior.

Parallel writing is allowed only with non-overlapping file ownership or isolated worktrees. Parallel read-only research/review is preferred.

## Definition of done

### Functional

- [ ] Inventory loads from the real API.
- [ ] Detail view loads a real record.
- [ ] Add creates a record in MySQL through the API.
- [ ] Edit persists changed values through the API.
- [ ] Delete removes the record after confirmation.
- [ ] Inventory refreshes after Create/Update/Delete.
- [ ] Duplicate submission is prevented.
- [ ] Search/browse behavior works.
- [ ] Back navigation is correct.
- [ ] No button is decorative or disconnected.

### Images

- [ ] `picture` URLs from real API records render.
- [ ] Images have a stable card/detail layout.
- [ ] Failed images fall back cleanly.
- [ ] App does not crash on a bad URL.

### Error handling

- [ ] Loading state exists.
- [ ] Empty state exists.
- [ ] Network failure state exists.
- [ ] Retry exists.
- [ ] 401 is handled explicitly.
- [ ] Empty/non-JSON API error bodies do not crash parsing.

### Code quality

- [ ] `npx tsc --noEmit` passes.
- [ ] lint passes.
- [ ] `npx expo-doctor` passes or only reports documented external/non-task issues.
- [ ] no new task-caused warnings are ignored.
- [ ] networking is centralized.
- [ ] types are explicit.
- [ ] no broad `any`.
- [ ] no unnecessary global state.
- [ ] no unnecessary dependency.

### API smoke

Use an isolated E2E test record, never an existing real car.

Suggested lifecycle:

```text
GET all
-> POST CODEX_E2E_<timestamp>
-> find it by model
-> GET by returned/found id
-> PUT a known change
-> GET and assert persisted change
-> DELETE
-> GET and confirm it is gone
```

Cleanup must run even if a middle assertion fails.

- [ ] authenticated GET verified.
- [ ] POST verified.
- [ ] PUT verified.
- [ ] DELETE verified.
- [ ] cleanup verified.
- [ ] token never printed.

### Runtime E2E

At minimum on Android when tooling is available:

- [ ] launch;
- [ ] inventory;
- [ ] image rendering;
- [ ] detail navigation;
- [ ] add;
- [ ] edit;
- [ ] delete;
- [ ] pull-to-refresh;
- [ ] validation error;
- [ ] network/auth error presentation;
- [ ] no crash.

### UX

- [ ] design is coherent and restrained.
- [ ] touch targets are practical.
- [ ] small-screen layout is usable.
- [ ] text has readable contrast.
- [ ] form keyboard types make sense.
- [ ] destructive action is clearly destructive.
- [ ] no excessive gradients, glass cards, pills, shadows, or decorative clutter.

### Security/hygiene

- [ ] `.env`, `.env.local`, `.env.*.local` ignored.
- [ ] `.env.example` committed with placeholders only.
- [ ] real token absent from Git diff.
- [ ] token absent from logs.
- [ ] HTTP/HTTPS status documented.
- [ ] static-client-token limitation documented honestly.
- [ ] no direct database credentials in mobile source.

## Stop condition

Stop when all feasible checks are green.

If a remaining failure depends on a missing Bearer token, DNS, API downtime, HTTPS/server configuration, unavailable emulator/device, or another external dependency:

1. mark it `BLOCKED`;
2. show concise evidence without exposing secrets;
3. provide the exact next action;
4. do not claim full completion.

Do not add unrelated features to compensate for a blocker.
