# MotorDesk implementation plan

Goal: implement the supplied GOAL.md and master prompt directly in this project root.

Architecture: four Expo Router Stack screens, built-in fetch in one typed API module,
local state with focus refresh, one shared form and remote-image component.
The supplied documents define the approved scope and visual direction.

- [x] Verify published SDK 57, official Router/Image documentation and BookCars reference.
- [x] Parallel read-only architecture, UI, API/security and test-strategy reviews (three worker slots; architecture agent reused after fourth thread was rejected).
- [x] Configure the root project, ignored local environment and compatible dependencies.
- [x] Implement and check API normalization, safe errors, timeout and form validation.
- [x] Implement inventory, detail, create/edit, confirmation and refresh flows.
- [x] Run unit checks, TypeScript, lint, Expo Doctor and export.
- [ ] BLOCKED: isolated real API CRUD smoke needs the user's local development token; script exits before network when missing.
- [x] Exercise available runtime, obtain parallel critique, fix evidenced issues (two remediation cycles).
- [x] Document actual results, external blockers and exact next actions in README and verification report.

Constraints: no nested project root; no state/network/form framework; no backend;
no shared permanent token in a production release; test HTTPS before HTTP;
never print tokens; no mutation of existing cars for testing.

Verified design: warm off-white #F5F3EF, white surfaces, ink #242621, olive #4F5D43,
system typography, 16px page gutters, 12px cards, 48px controls. BookCars informed
photo/name/specification order only. No dashboard, extra navigation or copied assets.

Implementation boundaries: app/ owns routes; src/api/cars.ts owns all API HTTP;
src/config/env.ts owns configuration; src/components/CarForm.tsx owns Add/Edit;
src/hooks/useResource.ts owns focus refresh and obsolete-response guards.
Node built-in tests cover API/validation; Android emulator covers available native paths.

Remediation: SDK-aligned native transitive versions; Xcode UUID update; direct Edit error
navigation; retry failed pictures on refresh; Android shared-form keyboard avoidance.
Remaining upstream issues and external gates are recorded in VERIFICATION.md.
