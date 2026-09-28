# Verification — 2026-09-14

## Passed

- `npm test`: 7 tests for access control, Google identity requirements, safe redirects, host routing, and the management-page generator.
- `npm run lint`: no errors or warnings; route pages obey the shared-component styling rule.
- `npm run build`: Next.js production build and TypeScript check.
- `npm run test:e2e`: 10 cases across desktop Chromium and mobile Chromium emulation. Public demo switching, responsive overflow checks, accessibility scans, login, unauthorized session denial, authorized navigation, Redis preview/search/empty/error/pagination flows, sign-out and OAuth initiation.
- `npm audit --omit=dev`: no reported production dependency vulnerabilities at verification time.

Browser test identities and data are synthetic. Tests create encrypted sessions with a test-only secret inside the test harness; production has no bypass. The Google initiation test verifies the authorization origin, callback URL, scope and state without completing consent or exchanging credentials.

Screenshots are in the ignored `artifacts/` directory: `home-desktop.png`, `home-mobile.png`, `admin-desktop.png`, and `design-system-mobile.png`.

## Not yet verified live

The actual Google consent/callback exchange, production admin hostname/TLS, and production Core HTTPS route have not been exercised. Complete `docs/deployment.md` with owner-provided credentials and the intended superuser email. No source was pushed and no production deployment was performed.
