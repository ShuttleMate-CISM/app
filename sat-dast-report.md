# Code Review Action Plan (SAST/DAST)

**Project:** Shuttlemate  
**Date:** 2026-02-16  
**Scope:** Latest SonarQube SAST + latest ZAP DAST reports in `zap/reports/` (**auth-related findings only**)

## 1) Branch and Baseline Context

- Baseline branch created and pushed from commit:
  - `initial/madhura-baseline-04d6d59`
  - `04d6d59e8b2d4ef3834d9b7f3f7f8f2b1c726ebf`
- Comparison branch:
  - `fixes/madhura`
- Commits in `fixes/madhura` since baseline:
  1. `0e026d8` — Enhanced authentication features and security logging
  2. `afb24e4` — Port update `5000 -> 5001` in env and API calls
- Changed scope across branches: **29 files** (backend + frontend + root config)

## 2) Security Findings Summary (Latest, Auth-Only)

### SAST (SonarQube, Code-level)

From the provided SonarQube issue list, auth-related open findings are:

- `Shuttlemate-Backend/controllers/authController.js` = **2 Blocker vulnerabilities** (`jssecurity:S5147`, NoSQL query construction from user-controlled data)

Non-auth files/issues are intentionally out of scope for this report.

Auth-scoped SAST count:

| File                                                | Open Blocker Findings |
| --------------------------------------------------- | --------------------: |
| `Shuttlemate-Backend/controllers/authController.js` |                     2 |
| **Auth-only Total**                                 |                 **2** |

### DAST (ZAP, Runtime/API-level)

Latest report artifacts used:

- `zap/reports/shuttlemate-backend-report.html`
- `zap/reports/shuttlemate-backend-report.json`
- `zap/reports/shuttlemate-frontend-report-20260216_144044.html`
- `zap/reports/shuttlemate-frontend-report-20260216_144044.json`
- `zap/reports/backend-scan-log-20260216_144044.txt`
- `zap/reports/frontend-scan-log-20260216_144044.txt`

#### Backend DAST (`shuttlemate-backend-report.json`) — Auth endpoints only

Observed auth-endpoint alerts:

- Medium:
  - `CSP: Failure to Define Directive with No Fallback` (count: 2, seen on auth GET endpoints)
- Low:
  - `Server Leaks Information via "X-Powered-By"` (count: 2, seen on auth GET endpoints)

Auth endpoints observed in backend scan:

- `GET /api/auth/login` -> `404`
- `GET /api/auth/register` -> `404`

Coverage profile:

- Endpoint count (full backend scan): `17`
- Method mix (full backend scan): `GET = 100%`
- Response distribution: `2xx = 30%`, `4xx = 69%`
- Result (auth scope): backend DAST run still does **not** validate auth JSON `POST` injection paths.

#### Frontend DAST (`shuttlemate-frontend-report-20260216_144044.json`) — Auth-related signal only

Observed auth-related alert evidence:

- `POST /api/auth/login` tested against backend `5001`
- `HTTP Only Site` (count: 1, auth login POST context)
- `Server Leaks Information via "X-Powered-By"` (count: 1, auth login POST context)

Auth coverage signal:

- Includes `POST /api/auth/login` request testing (backend `5001`), but response observed was `429 Too Many Requests` (rate-limited), reducing exploit-validation quality.
- No equivalent validated `POST /api/auth/register` injection result in this run.

## 3) What Was Fixed (Already in `fixes/madhura`)

### Backend security improvements already committed

1. `Shuttlemate-Backend/controllers/authController.js`
   - Added auth event logging integration (`logAuthEvent`).
   - Added password minimum length check on register.
   - Switched to generic login failure responses (`401` with unified message).
   - Added lockout flow after repeated failed attempts.
   - Reset lockout counters on successful login.

2. `Shuttlemate-Backend/models/userModel.js`
   - Added `failedLoginAttempts` and `accountLockedUntil` fields to support lockout policy.

3. `Shuttlemate-Backend/middlewares/authMiddleware.js`
   - Improved token validation and response consistency.
   - Added JWT payload claim checks (`id`, `role`).

4. `Shuttlemate-Backend/routes/authRoutes.js`
   - Applied rate limiter for login endpoint.

5. `Shuttlemate-Backend/utils/authLogger.js`
   - Added authentication event logging utility and persistent log file output.

6. `Shuttlemate-Backend/server.js`
   - Added explicit CORS options and standardized route formatting.

### Environment and integration alignment committed

- Port standardized to `5001` across env files and frontend/backend API usage.
- Root `package.json` script adjusted to `setup` workflow for workspace installation.

## 4) Additional Local Hardening Note (Auth)

Local `authController.js` changes already include NoSQL-focused string normalization (`toSafeString`) on auth inputs; however, Sonar still reports **2 open auth-related blocker findings** in `authController.js` that need closure verification.

## 5) Issues Matrix: Auth Scope (Current vs Next Fix)

| Area                                  | Current status                                                                               | Next fix                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| NoSQL injection (`S5147` style, auth) | 2 open Blocker issues in `authController.js`                                                 | Harden/verify auth query input guards and re-run Sonar for auth controller closure                                   |
| Auth brute-force / lockout            | Implemented                                                                                  | Add automated tests for lockout threshold, duration, and reset flow                                                  |
| User enumeration controls             | Implemented in login                                                                         | Extend consistent generic errors to all auth-adjacent endpoints                                                      |
| JWT validation                        | Improved claim validation                                                                    | Enforce explicit JWT options (`algorithms`, expiration policy), secret rotation plan                                 |
| Auth logging                          | Implemented                                                                                  | Add retention policy and secure file permissions                                                                     |
| DAST auth injection coverage          | Partial (`POST /api/auth/login` hit but rate-limited; backend auth endpoints still GET-only) | Add dedicated ZAP script scenarios for unauth/auth `POST` login/register payload tests, including injection payloads |
| HTTP/TLS posture (auth traffic)       | `HTTP Only Site` appears in auth login test context                                          | Enable TLS in runtime/proxy and rerun auth-focused DAST                                                              |
| Security headers (auth responses)     | `X-Powered-By` and CSP directive gap appear on auth paths                                    | Harden auth response headers in Express and rerun auth-focused DAST                                                  |

## 6) Auth Findings Resolution Plan (Per `SM-POL-S1-001`)

| Finding (Auth)                                                                         | Resolution Action                                                                                                                                | Policy Clause   | Owner          | Closure Evidence                                                                               |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| Sonar SAST: 2 Blocker NoSQL query-construction issues in `authController.js`           | Validate `username/password` as primitive strings only, reject object/operator payloads before query execution, keep query values sanitized-only | 3.2.3, 3.4      | S1             | Sonar rerun: 0 open auth Blockers + test cases for `{"username":{"$ne":""}}`                   |
| DAST auth POST coverage incomplete (`/register` missing, `/login` mostly rate-limited) | Update ZAP auth plan to run explicit `POST /api/auth/login` and `POST /api/auth/register` injection payloads                                     | 2, 5.2          | S1             | ZAP report shows both POST auth endpoints exercised with JSON payload evidence                 |
| DAST auth tests skewed by `429 Too Many Requests`                                      | Run scans in controlled window/profile so both non-throttled and throttled responses are captured                                                | 3.2.1, 3.2.2, 6 | S1 + Reviewers | Report includes successful endpoint execution + expected `429` at threshold with `Retry-After` |
| Auth response fingerprinting (`X-Powered-By`)                                          | Disable framework signature header for auth responses including error responses                                                                  | 3.3             | S1             | ZAP rerun: no `X-Powered-By` on auth endpoints                                                 |
| CSP directive gap on auth endpoint responses                                           | Set complete CSP including `frame-ancestors` and `form-action` across auth responses and error paths                                             | 3.2.3, 3.3      | S1 + S6        | ZAP rerun: no auth-path CSP directive gap alert                                                |
| HTTP-only risk for auth traffic                                                        | Enforce TLS 1.2+ for auth endpoints; block plaintext credential transit                                                                          | 3.1.2           | S5             | Auth scans run over HTTPS without HTTP-only auth transport finding                             |

## 7) Auth Lead Execution Sequence (S1)

1. **Code hardening for SAST closure**
   - Implement/verify strict input schema on auth payloads.
   - Ensure Mongo query sinks in auth path cannot consume object operators.
   - Keep login/recovery failures generic (`Invalid username or password.`).

2. **Policy control validation**
   - Confirm rate-limiter = 5 failed attempts / 15 minutes with HTTP `429` + `Retry-After`.
   - Confirm temporary account lockout = 15 minutes.
   - Confirm no user-enumeration message differences.

3. **JWT and credential policy checks**
   - Verify bcrypt cost factor >= 10 for password storage.
   - Enforce token TTL <= 1 hour and claim set includes `sub`, `role`, `exp`.
   - Enforce JWT algorithm allowlist (`HS256` or stronger; `none` disallowed).

4. **Auth logging compliance**
   - Log timestamp, IP, username (if provided), and outcome (success/fail/lockout).
   - Verify logs never contain plaintext password values.

5. **Auth-focused DAST rerun and evidence capture**
   - Execute POST login/register injection payloads.
   - Capture both normal and threshold (`429`) auth outcomes.
   - Archive timestamped reports under `zap/reports/`.

## 8) Verification Checklist (Current Status)

- [x] Baseline branch created from requested commit and pushed.
- [x] Branch comparison (`initial/madhura-baseline-04d6d59` -> `fixes/madhura`) documented.
- [x] Committed backend security improvements summarized.
- [x] Latest backend/frontend ZAP findings summarized from `2026-02-16` artifacts (auth scope only).
- [x] SonarQube SAST update captured for auth scope (`authController.js`: 2 open Blocker issues).
- [x] DAST coverage gap updated (backend GET-only; frontend auth POST partially exercised with 429 response).
- [ ] Implement and commit policy-aligned auth query hardening updates (S1).
- [ ] Validate rate-limit, lockout, and generic-error behavior against policy thresholds (S1 + Reviewers).
- [ ] Re-run SonarQube and confirm closure of 2 auth-related Blocker findings.
- [ ] Re-run auth-focused ZAP with POST login/register injection cases and both pre-throttle/throttle evidence.
- [ ] Confirm auth-related header and TLS findings are reduced/closed in refreshed DAST reports (S1 + S5).

## 9) Exit Criteria

- SonarQube auth-related Blocker security issues in `authController.js` are resolved (or formally reviewed/accepted with rationale).
- DAST validates non-exploitability for auth NoSQL injection payloads on both `/api/auth/login` and `/api/auth/register`.
- DAST reruns demonstrate meaningful POST JSON auth coverage (not GET-only, not rate-limit-only outcomes).
- Auth-related Medium/Low configuration findings are fixed or risk-accepted with documented rationale.
- Evidence demonstrates compliance with `SM-POL-S1-001` controls for credential handling, auth protection, session management, and auth logging.
