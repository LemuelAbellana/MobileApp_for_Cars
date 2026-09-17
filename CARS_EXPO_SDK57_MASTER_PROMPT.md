# Master Prompt — Expo SDK 57 Cars Business CRUD App

> Paste this prompt into Codex from the root of the mobile-app repository.

## Role and operating mode

Act as a senior software engineer and senior Expo/React Native mobile engineer. Build a small, production-minded car inventory/showcase app around the existing REST API without overengineering it.

Use **Expo SDK 57**, **React Native**, **TypeScript**, and **Expo Router**. The backend already uses **PHP + MySQL**; the mobile app must **never connect directly to MySQL**. It communicates only with the REST API.

Before editing code:

1. Read this file and `GOAL.md` completely.
2. Inspect the repository before assuming its structure.
3. Read the installed Codex skill documentation for `ponytail`, `superpowers`, `caveman`, and `ui ux promax`.
4. Apply those skills according to their actual documented behavior. Do not invent capabilities for a skill.
5. Use the native super-subagent mechanism available in Codex. Do not simulate subagents with role-play.
6. Preserve existing working code unless a change is necessary for this goal.

If a requested model name is not available in the current Codex environment, use the nearest suitable available model and explicitly record the fallback in the final report. Never silently pretend that a model was used.

---

## Existing backend contract

### API endpoint

Development endpoint:

```text
http://lemzy.duckdns.org/cars.php
```

The API requires:

```http
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

The Bearer token is private and will **not** be pasted into chat. Never ask the user to expose it in a prompt, source file, screenshot, issue, commit, log, or test output.

### MySQL `cars` data model

The existing API and MySQL table use these fields:

```text
id
brand
model
year
color
price
fuel_type
transmission
picture
```

`id` is auto-incremented and must not be user-editable.

Treat values received from PHP/MySQL defensively: `id`, `year`, and `price` may arrive as JSON strings depending on the server serialization. Normalize them in one API mapping function before they reach UI components.

Use this application-side type:

```ts
export type Car = {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  price: number;
  fuel_type: string;
  transmission: string;
  picture: string;
};

export type CarInput = Omit<Car, 'id'>;
```

### CRUD routes

Use the API exactly as implemented:

```text
GET    /cars.php                 -> all cars
GET    /cars.php?id={id}         -> one car
GET    /cars.php?brand={brand}   -> search by brand
GET    /cars.php?model={model}   -> search by model
POST   /cars.php                 -> create car
PUT    /cars.php?id={id}         -> update car
DELETE /cars.php?id={id}         -> delete car
```

POST and PUT JSON body:

```json
{
  "brand": "Toyota",
  "model": "Vios",
  "year": 2024,
  "color": "White",
  "price": 732000,
  "fuel_type": "Gasoline",
  "transmission": "CVT",
  "picture": "https://example.com/car.jpg"
}
```

Do not assume POST returns the new `id`; the current PHP API may only return a status message. After a successful create, return to inventory and refetch.

Handle empty/non-JSON error bodies safely. A 401 response must never cause a JSON parsing crash.

---

## Security rules — do not fake secrecy

`.env` being gitignored prevents accidental Git commits, but it **does not make a static secret safe inside a compiled mobile app**. Expo variables prefixed with `EXPO_PUBLIC_` are bundled into client code and must be treated as public.

Follow this split:

### Safe client configuration

Create `.env.example`:

```dotenv
EXPO_PUBLIC_CARS_API_URL=http://lemzy.duckdns.org/cars.php

# LOCAL DEMO ONLY.
# A value exposed to client JavaScript is extractable from a built app.
EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN=replace_me_locally
```

Create/use `.env.local` for local development and ensure these are ignored:

```gitignore
.env
.env.local
.env.*.local
!.env.example
```

The actual token must never be committed.

For the **current local/demo build only**, the app may read:

```ts
process.env.EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN
```

but the source code, README, and final report must clearly state that this is **development-only** and is not secure for production distribution.

### Production security gate

Do **not** claim that a static Bearer token in an Expo `.env` is protected.

Before calling this app production-ready, require one of these:

- user login that returns a scoped/short-lived token, then store that runtime token with `expo-secure-store`; or
- a server-side gateway/proxy that owns the static upstream secret and exposes only appropriate authenticated operations to the app.

Do not build a new authentication platform unless the repository already contains the necessary backend scope. Keep this task focused. If only the static token exists, finish the app as a functional development/demo build and mark production secret handling as an explicit blocker.

### HTTPS gate

The current URL is `http://`. A Bearer token must not be considered safe when sent over cleartext HTTP.

1. Test whether `https://lemzy.duckdns.org/cars.php` is actually available.
2. If HTTPS works, use the HTTPS URL.
3. If it does not, keep HTTP only for explicitly acknowledged development/testing and mark HTTPS as a production blocker.
4. Do not broadly weaken Android network security merely to hide the issue.
5. If an Android development build truly requires cleartext traffic, document the smallest temporary SDK-57-compatible configuration and ensure it is not presented as the production configuration.

Never log the Authorization header or token.

---

## Internet/template research requirement

Do not blindly invent the UI.

Before implementation, inspect these references:

1. **Expo official default template / Expo Router**
   - https://docs.expo.dev/more/create-expo/
   - https://docs.expo.dev/tutorial/create-your-first-app/
   - https://docs.expo.dev/router/introduction/

2. **BookCars** — open-source car rental platform with a React Native/Expo mobile application. Use it only as a reference for information hierarchy and automotive browsing patterns, not as code to copy wholesale.
   - https://github.com/aelassas/bookcars
   - https://github.com/aelassas/bookcars/wiki/Overview
   - MIT license is documented in its repository.

3. **Expo environment-variable security**
   - https://docs.expo.dev/guides/environment-variables/
   - https://docs.expo.dev/eas/environment-variables/

4. **Expo Image**
   - https://docs.expo.dev/versions/latest/sdk/image/

Use the references to inform a current SDK 57 implementation. Do not copy outdated dependency stacks, visual assets, credentials, or backend architecture from template projects.

---

## Product concept

Working title: **MotorDesk**.

Purpose: a polished small-business vehicle inventory/showcase app where staff can browse, create, inspect, edit, and delete car listings backed by the existing API.

The design should feel like an intentional automotive inventory tool, not a generic generated dashboard.

### Visual direction

Use a restrained automotive/editorial style:

- warm off-white or very light neutral page background;
- near-black primary text;
- white surfaces;
- one muted accent such as bronze, deep olive, or desaturated blue;
- strong car photography;
- clear typographic hierarchy;
- thin borders and restrained shadows;
- medium corner radii, not excessive pills;
- comfortable spacing and consistent rhythm;
- no gratuitous gradients;
- no glassmorphism;
- no oversized floating blobs;
- no emoji as interface icons;
- no excessive animations;
- no giant hero section that wastes mobile space;
- no random cards that do not support a task.

Use platform-native interaction patterns. Buttons must look tappable and important actions must be visually distinct.

The UI/UX subagent may adjust exact tokens after reviewing the references, but it must keep the design minimal and business-appropriate.

---

## Required screens and behavior

Keep navigation simple. Prefer a Stack rather than unnecessary bottom tabs.

### 1. Inventory screen

Route:

```text
/
```

Must include:

- compact business header/title;
- total inventory count;
- search field;
- optional simple brand/model search mode if useful;
- `FlatList` of car cards;
- pull-to-refresh;
- loading skeleton or restrained loading state;
- useful empty state;
- retryable error state;
- visible Add Car action.

Each car card shows:

- remote car image;
- brand + model;
- year;
- formatted price;
- fuel type;
- transmission.

Tapping a card opens its detail screen.

Search can be local against the loaded inventory for simplicity, or use the existing `brand` / `model` query routes if the implementation remains straightforward. Do not add a search library.

### 2. Car details screen

Route:

```text
/cars/[id]
```

Show:

- large image;
- brand/model;
- price;
- year;
- color;
- fuel type;
- transmission;
- Edit action;
- Delete action;
- clear back navigation.

Delete must require native confirmation with `Alert.alert`.

On successful delete:

1. navigate back;
2. refresh inventory;
3. show a concise success message.

### 3. Add car screen

Route:

```text
/cars/new
```

Fields:

- brand
- model
- year
- color
- price
- fuel type
- transmission
- picture URL

Requirements:

- no `id` field;
- keyboard-appropriate inputs;
- numeric keyboard for year and price;
- basic validation;
- disable duplicate submission while request is in flight;
- display API errors cleanly;
- on success, return to inventory and refetch.

### 4. Edit car screen

Route:

```text
/cars/[id]/edit
```

Requirements:

- fetch/load existing data or use already-loaded detail state safely;
- prefill every editable field;
- same validation as Add;
- PUT to `?id={id}`;
- prevent duplicate submission;
- on success, return to detail/inventory and show fresh server data.

---

## Image handling

Install SDK-compatible Expo packages with `npx expo install`, not arbitrary version pins.

Use `expo-image` for remote vehicle images.

Requirements:

- `contentFit="cover"`;
- memory/disk caching where appropriate;
- stable aspect ratio to prevent layout jumping;
- accessible `alt` / accessibility label;
- local fallback presentation if the remote `picture` URL fails;
- no broken-image icon left as the final UI;
- retry when reasonable;
- never treat a failed image as a fatal screen error.

Do not implement image upload. The database stores a URL string, so Add/Edit uses a picture URL input.

---

## API client implementation

Keep all networking out of screens.

Suggested structure:

```text
app/
  _layout.tsx
  index.tsx
  cars/
    new.tsx
    [id].tsx
    [id]/
      edit.tsx

src/
  api/
    cars.ts
  components/
    CarCard.tsx
    CarForm.tsx
    EmptyState.tsx
    ErrorState.tsx
  config/
    env.ts
    theme.ts
  types/
    car.ts
  utils/
    format.ts
    validation.ts

assets/
  images/
    car-placeholder.png   # or a simple local fallback built from existing legal assets

scripts/
  api-smoke.mjs           # optional but preferred for deterministic CRUD verification
```

Do not force this exact tree if the existing repository has a clean convention. Follow the existing project when reasonable.

### `src/config/env.ts`

Centralize environment reads and fail fast with a useful developer error when required development config is missing.

Never print the token.

### `src/api/cars.ts`

Create a tiny typed client with functions similar to:

```ts
getCars()
getCar(id)
searchCarsByBrand(brand)
searchCarsByModel(model)
createCar(input)
updateCar(id, input)
deleteCar(id)
```

Use the built-in `fetch`. Do not add Axios just for this task.

Every request should:

- add the Bearer header in one place;
- add JSON content type when needed;
- check `response.ok`;
- handle 401 explicitly;
- parse response bodies defensively;
- URL-encode query values;
- use a reasonable request timeout with `AbortController`;
- normalize MySQL/PHP string numerics once;
- throw a typed/useful error for UI consumption.

Do not duplicate fetch logic across screens.

---

## State and refresh strategy

Do not add Redux, Zustand, MobX, or another global state library.

For this app size:

- use local React state;
- create a small reusable hook only when duplication becomes real;
- refetch inventory on screen focus with the current Expo Router/React Native approach;
- refetch detail after edit;
- keep mutation loading state local to the form/action;
- use `RefreshControl` for manual refresh.

Do not implement offline sync, background queues, websockets, pagination, or caching infrastructure unless the API/repo already requires them.

---

## Validation

Use small explicit validation utilities rather than adding a full form framework unless the existing app already uses one.

Minimum validation:

- `brand`: required;
- `model`: required;
- `year`: integer and sensible;
- `color`: required;
- `price`: finite number, `>= 0`;
- `fuel_type`: required;
- `transmission`: required;
- `picture`: valid `http://` or `https://` URL for development, with HTTPS preferred.

Trim string values before sending.

Server errors still remain authoritative.

---

## Formatting and accessibility

- Centralize price formatting.
- Default display currency to PHP unless existing product requirements say otherwise.
- Use readable contrast.
- Respect safe areas.
- Touch targets should be comfortably tappable.
- Provide accessibility labels for icon-only controls.
- Avoid hiding important actions behind gestures.
- Handle small phones without clipped text or buttons.
- Test both Android and iOS layouts where tooling is available.

---

# Parallel super-subagent plan

Use parallelism for independent analysis and verification. Avoid multiple agents concurrently editing the same files unless Codex provides isolated worktrees/branches and ownership is explicit.

## Wave 0 — repository and skill intake

The orchestrator:

1. reads `GOAL.md`;
2. inspects package.json and current Expo setup;
3. reads the actual installed skill instructions for `ponytail`, `superpowers`, `caveman`, and `ui ux promax`;
4. checks Expo SDK version;
5. creates a short implementation plan;
6. then launches Wave 1 in parallel.

## Wave 1 — parallel read-only analysis

Launch these super subagents concurrently.

### Agent A — architecture and SDK plan

Preferred model:

```text
GPT 6 Astra High
```

Responsibilities:

- verify SDK 57 assumptions against current Expo docs;
- inspect repository structure;
- propose the smallest maintainable architecture;
- identify dependency compatibility;
- review API contract and numeric normalization;
- identify HTTP/HTTPS constraints;
- return a concise implementation plan and risks.

### Agent B — UI/UX reference and design system

Preferred model:

```text
GPT 6 Astra High
```

Must use the `ui ux promax` skill according to its real instructions.

Responsibilities:

- inspect the referenced automotive template(s);
- create a small visual system;
- define layout, spacing, typography hierarchy, card anatomy, states, and form behavior;
- explicitly critique AI-slop patterns and prevent them;
- return design guidance only; do not rewrite unrelated architecture.

### Agent C — API/security reviewer

Preferred model:

```text
GPT 5.6 Sol High
```

Responsibilities:

- review Bearer-auth flow;
- review Expo environment-variable exposure;
- verify that secrets are not falsely described as protected;
- review HTTP transport risk;
- review CRUD request/response handling;
- produce a focused security/integration checklist.

### Agent D — test strategy reviewer

Preferred model:

```text
GPT 5.6 Luna Extra High
```

Responsibilities:

- design the fastest useful verification ladder;
- define deterministic API CRUD smoke steps;
- define UI button/navigation/image checks;
- identify likely edge cases;
- avoid adding a heavyweight test stack.

The orchestrator waits for all four and synthesizes one implementation plan before coding.

---

## Wave 2 — implementation

The orchestrator implements the approved plan.

It may delegate isolated implementation tasks to parallel super subagents only when file ownership does not overlap. Prefer parallel read/review over risky concurrent edits.

Implementation order:

1. environment/config;
2. types + API client;
3. theme + shared components;
4. inventory screen;
5. detail screen;
6. add/edit form;
7. mutation refresh behavior;
8. image fallback/error states;
9. README/setup instructions;
10. test/smoke script.

Keep each step runnable.

After every meaningful slice, run the cheapest relevant checks rather than waiting until the end.

---

# Loop engineering protocol

Use a closed loop:

```text
OBSERVE -> PLAN -> BUILD -> VERIFY -> CRITIQUE -> FIX -> RE-VERIFY
```

Do not declare completion after "code generated".

## Loop 1 — static correctness

Run at minimum:

```bash
npx expo-doctor
npx tsc --noEmit
npm run lint
```

Use the repository's equivalent commands if scripts differ.

Fix all errors introduced by this task. Do not suppress errors with `any`, `@ts-ignore`, disabled lint rules, or swallowed promises unless there is a documented technical reason.

## Loop 2 — API connectivity

With the Bearer token already stored locally by the user, verify:

1. unauthenticated request receives expected authorization failure;
2. authenticated GET all works;
3. GET one works;
4. remote image URLs from returned records are usable;
5. POST works;
6. locate the created E2E record;
7. PUT works and persisted values can be read back;
8. DELETE works;
9. deleted record no longer resolves.

Never mutate an existing real car record for testing.

Create an isolated test car with a unique model value such as:

```text
CODEX_E2E_<timestamp>
```

Because POST may not return an ID, locate the test record using the API's model search endpoint, extract its ID, then continue the test.

Always delete the E2E record in cleanup/finally even when an intermediate assertion fails.

Never print the token.

If the API is unreachable, DNS fails, HTTPS fails, or the token is absent, record the exact external blocker. Do not fake a green test.

## Loop 3 — runtime E2E

Run the app with an SDK 57-compatible Expo environment.

Exercise, on an Android emulator/device at minimum when available:

```text
launch
-> inventory loads
-> images render/fallback correctly
-> open car detail
-> back
-> add test car
-> confirm list refresh
-> open created car
-> edit it
-> confirm persisted edit
-> delete it
-> confirm it disappears
-> pull to refresh
-> trigger one validation error
-> trigger/inspect one network or auth error path safely
```

If an iOS simulator/device is available, repeat the core path there.

Use an existing lightweight E2E capability if the repo already has one. Maestro is acceptable if already available or trivial to run, but do not introduce Detox or a large test framework just for this task.

## Loop 4 — parallel verification and critique

After the first complete implementation, launch these in parallel:

### Verifier 1 — E2E/API

Model:

```text
GPT 5.6 Sol High
```

Read-only first. Verify the API contract, mutation lifecycle, navigation refresh, auth handling, and pictures. Return reproducible failures with file/line references when possible.

### Verifier 2 — code critique

Model:

```text
GPT 5.6 Sol High
```

Review for:

- logic bugs;
- stale state;
- race conditions;
- unsafe env usage;
- duplicated networking;
- bad loading/error handling;
- TypeScript weakness;
- React anti-patterns;
- unnecessary dependencies;
- accidental overengineering.

Do not rewrite for stylistic preference alone.

### Verifier 3 — fast regression pass

Model:

```text
GPT 5.6 Luna Extra High
```

Run/check:

- lint;
- typecheck;
- Expo Doctor;
- route integrity;
- obvious UI wiring;
- image fallback;
- missing loading guards;
- dependency health.

### Verifier 4 — UI/UX critique

Model:

```text
GPT 6 Astra High
```

Use `ui ux promax`.

Critique the actual rendered result against the brief:

- simple;
- elegant;
- business appropriate;
- automotive;
- coherent spacing;
- readable;
- no AI-slop visual patterns;
- useful states;
- buttons obviously connected to the intended action.

Return only actionable findings.

## Loop 5 — fix and re-verify

The orchestrator:

1. deduplicates verifier findings;
2. ranks by correctness/security/user impact;
3. fixes real issues;
4. reruns static checks;
5. reruns API smoke;
6. reruns the affected runtime path;
7. asks verifiers for one final targeted pass if significant changes were made.

Maximum normal remediation cycles: **3**.

Do not loop forever. If something remains blocked by an external system, clearly mark it as blocked with evidence and a next action.

---

# Acceptance gates

Do not say "done" until every non-external gate is satisfied.

## Build quality

- Expo SDK 57 confirmed.
- TypeScript passes.
- Lint passes.
- Expo Doctor has no task-caused critical failure.
- No unnecessary major library added.
- No direct MySQL connection from the app.

## CRUD

- GET list works.
- GET detail works.
- POST works.
- PUT works.
- DELETE works.
- list/detail refresh after mutations.
- loading state prevents duplicate mutations.
- delete has confirmation.

## Images

- remote `picture` URLs render through `expo-image`;
- card layout does not jump excessively while loading;
- failed URL has a clean local fallback;
- at least several real API images are visually checked during E2E.

## Networking

- Authorization header is added centrally.
- 401 is handled.
- non-JSON/empty error response does not crash.
- timeout/offline error has retry behavior.
- token is never logged.
- transport security status is truthfully reported.

## UX

- inventory is scannable;
- car cards have clear hierarchy;
- Add/Edit form is practical on a phone;
- detail screen exposes Edit/Delete clearly;
- no dead buttons;
- no placeholder navigation;
- no decorative controls that do nothing;
- no AI-slop styling.

## Git/security hygiene

- `.env` / `.env.local` ignored;
- `.env.example` contains placeholders only;
- no actual token in Git diff/history created by this task;
- no secret in screenshots or logs;
- production static-token limitation documented.

---

# Required final report from Codex

At completion, return a concise engineering report with:

1. what was built;
2. exact file structure changed;
3. commands run;
4. static verification results;
5. API CRUD smoke-test results;
6. runtime E2E results;
7. screenshots or emulator evidence if tooling supports them;
8. any blocker;
9. HTTP/HTTPS status;
10. token-handling status;
11. which super subagents/models were actually used;
12. which installed skills were actually used;
13. model fallbacks, if any;
14. any remaining production hardening item.

Never claim a test passed if it was not executed.

---

# Scope guardrails

Do not overengineer.

Do **not** add:

- Redux/Zustand/MobX;
- GraphQL;
- a new backend framework;
- local SQLite;
- offline synchronization;
- push notifications;
- payments;
- user accounts unless required to solve the production-token issue and explicitly in scope;
- analytics;
- animations libraries;
- design-system frameworks;
- image upload;
- Docker;
- CI/CD;
- complex dependency injection;
- generated mock APIs.

Focus on a polished, reliable CRUD inventory app using the existing PHP/MySQL API.
