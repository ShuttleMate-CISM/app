# Code Review Action Plan (SAST/DAST) — All Students

**Project:** ShuttleMate  
**Date:** 2026-02-17  
**Scope:** Full SonarQube SAST (21 Blocker findings) + Latest ZAP DAST reports (backend + frontend) — **All Security Areas (S1–S6)**  
**Report Artifacts:**

- SAST: SonarQube scan (21 open Blocker vulnerabilities, rule `jssecurity:S5147`)
- DAST Backend: `zap/reports/shuttlemate-backend-report-20260217_190645.json`
- DAST Frontend: `zap/reports/shuttlemate-frontend-report-20260217_190645.json`

---

## 1) Student-to-Security-Area Mapping

| Student | Security Area     | Primary Responsibility                                          | Key Files                                                                                                         |
| :------ | :---------------- | :-------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **S1**  | Authentication    | Rate limiting, brute-force protection, JWT, credential handling | `authController.js`, `authRoutes.js`, `authMiddleware.js`                                                         |
| **S2**  | Payment           | Stripe webhook verification, payment integrity                  | `routes/payment.js`                                                                                               |
| **S3**  | Data Privacy      | IDOR protection, ownership checks, PII exposure                 | `BookingController.js`, `userController.js`                                                                       |
| **S4**  | Input Validation  | NoSQL injection prevention, schema validation, sanitization     | `shopController.js`, `CoachersController.js`, `videoController.js`, `MatchesController.js`, `CourtsController.js` |
| **S5**  | Infrastructure    | Security headers, TLS, server hardening                         | `server.js` (Helmet, CORS, CSP)                                                                                   |
| **S6**  | Frontend Security | XSS sanitization, CSP on frontend, safe rendering               | Frontend Vite config, React components                                                                            |

--- 

## 2) SAST Findings Summary (SonarQube — All 21 Blockers)

All 21 findings share the same rule: **`jssecurity:S5147`** — _"Change this code to not construct database queries directly from user-controlled data"_ (NoSQL Injection).

### Findings by File & Student Owner

|  #  | File                                                    |                       Line(s)                       | Count  | Assigned Student | Security Area    |
| :-: | :------------------------------------------------------ | :-------------------------------------------------: | :----: | :--------------: | :--------------- |
|  1  | `Shuttlemate-Backend/controllers/authController.js`     |                      L21, L63                       | **2**  |      **S1**      | Authentication   |
|  2  | `Shuttlemate-Backend/routes/payment.js`                 | L97, L105, L134, L168, L188, L193, L217, L222, L302 | **9**  |      **S2**      | Payment          |
|  3  | `Shuttlemate-Backend/controllers/userController.js`     |                    L7, L35, L55                     | **3**  |      **S3**      | Data Privacy     |
|  4  | `Shuttlemate-Backend/controllers/shopController.js`     |                         L9                          | **1**  |      **S4**      | Input Validation |
|  5  | `Shuttlemate-Backend/controllers/CoachersController.js` |                      L11, L165                      | **2**  |      **S4**      | Input Validation |
|  6  | `Shuttlemate-Backend/controllers/MatchesController.js`  |                         L12                         | **1**  |      **S4**      | Input Validation |
|  7  | `Shuttlemate-Backend/controllers/CourtsController.js`   |                         L21                         | **1**  |      **S4**      | Input Validation |
|  8  | `Shuttlemate-Backend/controllers/videoController.js`    |                      L11, L96                       | **2**  |      **S4**      | Input Validation |
|     |                                                         |                                                     | **21** |                  |                  |

---

## 3) DAST Findings Summary (ZAP — 2026-02-17)

### 3.1 Backend DAST (`shuttlemate-backend-report-20260217_190645.json`)

**Scan Profile:**

- Target: `http://host.docker.internal:5001`
- Endpoints discovered: **161**
- Method mix: GET 63%, POST 14%, PUT 11%, DELETE 8%, PATCH 2%
- Response distribution: 2xx = 24%, 4xx = 70%, 5xx = 5%

| Alert                                              |  Risk  |   CWE   | Count | Affected Endpoints                                                                                                                                          | Assigned Student |
| :------------------------------------------------- | :----: | :-----: | :---: | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------: |
| **PII Disclosure**                                 |  High  | CWE-359 |   2   | `/api/auth/users` (GET), `/api/shops` (GET)                                                                                                                 | **S3** + **S5**  |
| **CSP: Failure to Define Directive (no fallback)** | Medium | CWE-693 |   5   | `/api/shops/search`, `/api/coachers` (POST), `/api/videos` (POST), `/api/coachers/:id/bookings`, `/api/coachers/:id/availability`                           |      **S5**      |
| **Application Error Disclosure**                   |  Low   | CWE-550 |   7   | `/api/coachers/search`, `/api/items/shop/1`, `/api/videos/search`, `/api/coachers` (POST), `/api/matches` (POST), `/api/shops` (POST), `/api/videos` (POST) | **S4** + **S5**  |

**Key Observations:**

1. **PII Disclosure (HIGH):** The `GET /api/auth/users` endpoint returns full user records (emails, roles, MongoDB `_id`s, `failedLoginAttempts`, `accountLockedUntil`) without authentication. ZAP flagged MongoDB ObjectIds as potential credit card numbers (false positive for CC, but **real PII exposure** issue).
2. **CSP Gap on Error Pages:** On 404/500 error responses, the CSP falls back to `default-src 'none'` (Express default error handler) which is missing `frame-ancestors` and `form-action` directives.
3. **Error Disclosure:** Stack traces with file paths (`/Users/madhura/Desktop/cism/node_modules/mongoose/...`) and Mongoose validation errors are leaked to clients. The `$regex has to be a string` error message reveals internal MongoDB query structure.

### 3.2 Frontend DAST (`shuttlemate-frontend-report-20260217_190645.json`)

**Scan Profile:**

- Frontend target: `http://host.docker.internal:5173` (19 endpoints)
- Backend proxy target: `http://host.docker.internal:5001` (10 endpoints)
- Frontend response distribution: 100% 2xx
- Backend proxy response distribution: 2xx = 56%, 4xx = 43%

| Alert                                              |  Risk  |   CWE   | Count | Affected Pages                                                   | Assigned Student  |
| :------------------------------------------------- | :----: | :-----: | :---: | :--------------------------------------------------------------- | :---------------: |
| **CSP: Wildcard Directive**                        | Medium | CWE-693 |   3   | `/home`, `/register`, `/unauthorized`                            |  **S5** + **S6**  |
| **CSP: script-src unsafe-inline**                  | Medium | CWE-693 |   5   | `/Videopage`, `/home`, `/register`, `/timeline`, `/unauthorized` |      **S6**       |
| **CSP: style-src unsafe-inline**                   | Medium | CWE-693 |   5   | `/`, `/Videopage`, `/login`, `/register`, `/unauthorized`        |      **S6**       |
| **CSP: Failure to Define Directive (no fallback)** | Medium | CWE-693 |   3   | Backend: `/api/auth`, `/api/auth/login`, `/api/users`            |      **S5**       |
| **Modern Web Application**                         |  Info  |    —    |   5   | All frontend routes                                              | — (Informational) |

**Key Observations:**

1. **Frontend CSP is overly permissive:** `default-src 'self' http: https: ws: wss: data: blob: 'unsafe-inline' 'unsafe-eval'` effectively allows loading resources from anywhere and permits inline scripts — defeating the purpose of CSP.
2. **`unsafe-inline` + `unsafe-eval`** in the CSP makes XSS mitigation via CSP ineffective.
3. No `X-Powered-By` header leakage was detected in this scan (Helmet is working for that).

---

## 4) Per-Student Action Plans

---

### S1 — Authentication Security Lead

**SAST Findings: 2 Blocker**

| Finding | File                            | Line | Issue                                                                          |
| :------ | :------------------------------ | :--: | :----------------------------------------------------------------------------- |
| SAST-1  | `controllers/authController.js` | L21  | NoSQL injection in `register` — user-controlled data used directly in DB query |
| SAST-2  | `controllers/authController.js` | L63  | NoSQL injection in `login` — user-controlled data used directly in DB query    |

**DAST Findings: 0 direct (but auth endpoints show CSP gap on 404)**

**Resolution Actions:**

|  #  | Action                                                                                                                                                                                                                                                | Priority | Policy Clause              | Evidence Required                                  |
| :-: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :------------------------- | :------------------------------------------------- |
|  1  | **Sanitize auth inputs:** Validate `username` and `password` as primitive strings only. Reject object/array/operator payloads (e.g., `{"$ne":""}`) before passing to `User.findOne()`. Use `mongo-sanitize` or manual `typeof` + `String()` coercion. | Critical | SM-POL-S1-001 §3.2.3, §3.4 | SonarQube rerun: 0 Blockers in `authController.js` |
|  2  | **Add test cases** for NoSQL injection payloads: `{"username":{"$ne":""},"password":{"$ne":""}}` and `{"username":{"$gt":""},"password":{"$gt":""}}` should return 400/401, not bypass auth.                                                          | Critical | SM-POL-S1-001 §3.2.3       | Test results showing rejection                     |
|  3  | **Verify rate limiter** = 5 attempts / 15 min with HTTP 429 + `Retry-After` header.                                                                                                                                                                   |   High   | SM-POL-S1-001 §3.2.1       | Manual test or ZAP evidence                        |
|  4  | **Verify account lockout** = 15 min temporary lock after threshold.                                                                                                                                                                                   |   High   | SM-POL-S1-001 §3.2.2       | Test showing lockout behavior                      |
|  5  | **Verify generic error messages** — no difference between "wrong password" vs "user not found".                                                                                                                                                       |   High   | SM-POL-S1-001 §3.2.3       | Response comparison screenshot                     |
|  6  | **JWT hardening:** Enforce algorithm allowlist (`HS256`), TTL ≤ 1 hour, include `sub`/`role`/`exp` claims.                                                                                                                                            |  Medium  | SM-POL-S1-001 §3.3         | Code review evidence                               |
|  7  | **Auth logging compliance:** Verify logs contain timestamp, IP, username, outcome — never plaintext passwords.                                                                                                                                        |  Medium  | SM-POL-S1-001 §5.1         | Log sample screenshot                              |

**Code Fix Pattern (S1):**

```javascript
// Before (VULNERABLE):
const user = await User.findOne({ username });

// After (SECURE):
const safeUsername = typeof username === "string" ? username : String(username);
const safePassword = typeof password === "string" ? password : String(password);
// Reject if sanitized value differs (operator injection attempt)
if (safeUsername !== username || safePassword !== password) {
  return res.status(400).json({ message: "Invalid input" });
}
const user = await User.findOne({ username: safeUsername });
```

---

### S2 — Payment Security Lead

**SAST Findings: 9 Blocker**

| Finding | File                | Line | Issue                                              |
| :------ | :------------------ | :--: | :------------------------------------------------- |
| SAST-3  | `routes/payment.js` | L97  | NoSQL injection — user-controlled data in DB query |
| SAST-4  | `routes/payment.js` | L105 | NoSQL injection — user-controlled data in DB query |
| SAST-5  | `routes/payment.js` | L134 | NoSQL injection — user-controlled data in DB query |
| SAST-6  | `routes/payment.js` | L168 | NoSQL injection — user-controlled data in DB query |
| SAST-7  | `routes/payment.js` | L188 | NoSQL injection — user-controlled data in DB query |
| SAST-8  | `routes/payment.js` | L193 | NoSQL injection — user-controlled data in DB query |
| SAST-9  | `routes/payment.js` | L217 | NoSQL injection — user-controlled data in DB query |
| SAST-10 | `routes/payment.js` | L222 | NoSQL injection — user-controlled data in DB query |
| SAST-11 | `routes/payment.js` | L302 | NoSQL injection — user-controlled data in DB query |

**DAST Findings: 0 direct**

**Resolution Actions:**

|  #  | Action                                                                                                                                                                                                                                                                   | Priority | Evidence Required                           |
| :-: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :------------------------------------------ |
|  1  | **Sanitize all user-controlled inputs** in `payment.js` at all 9 flagged lines. Every `req.params.id`, `req.body.*`, and `req.query.*` used in MongoDB queries must be validated as strings/ObjectIds before use. Use `mongoose.Types.ObjectId.isValid()` for ID params. | Critical | SonarQube rerun: 0 Blockers in `payment.js` |
|  2  | **Add input validation middleware** using `Joi` or `express-validator` for all payment route parameters.                                                                                                                                                                 | Critical | Code review                                 |
|  3  | **Verify Stripe webhook signature verification** is implemented (`stripe.webhooks.constructEvent`).                                                                                                                                                                      |   High   | Code + test evidence                        |
|  4  | **Ensure payment amount is validated server-side** — never trust client-submitted amounts.                                                                                                                                                                               |   High   | Code review                                 |
|  5  | **Add tests for injection payloads** on payment endpoints: `{"bookingId": {"$ne": ""}}`, etc.                                                                                                                                                                            |   High   | Test results                                |

**Code Fix Pattern (S2):**

```javascript
// Before (VULNERABLE):
const payment = await Payment.findById(req.params.id);

// After (SECURE):
import mongoose from "mongoose";
import sanitize from "mongo-sanitize";

const id = sanitize(req.params.id);
if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({ message: "Invalid payment ID" });
}
const payment = await Payment.findById(id);
```

---

### S3 — Data Privacy Lead

**SAST Findings: 3 Blocker**

| Finding | File                            | Line | Issue                                              |
| :------ | :------------------------------ | :--: | :------------------------------------------------- |
| SAST-12 | `controllers/userController.js` |  L7  | NoSQL injection — user-controlled data in DB query |
| SAST-13 | `controllers/userController.js` | L35  | NoSQL injection — user-controlled data in DB query |
| SAST-14 | `controllers/userController.js` | L55  | NoSQL injection — user-controlled data in DB query |

**DAST Findings: 1 High**

| Alert          |   Risk   | Endpoint                                | Issue                                                                                                                                |
| :------------- | :------: | :-------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| PII Disclosure | **High** | `GET /api/auth/users`, `GET /api/shops` | Full user records returned without authentication — emails, roles, internal IDs, `failedLoginAttempts`, `accountLockedUntil` exposed |

**Resolution Actions:**

|  #  | Action                                                                                                                                                                                                                             | Priority | Evidence Required                                  |
| :-: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :------------------------------------------------- |
|  1  | **Sanitize user inputs** in `userController.js` at L7, L35, L55. All `req.params.*` and `req.body.*` values must be validated before use in MongoDB queries.                                                                       | Critical | SonarQube rerun: 0 Blockers in `userController.js` |
|  2  | **Protect `/api/auth/users` endpoint** — require authentication middleware (`authMiddleware`) and restrict to admin role only.                                                                                                     | Critical | ZAP rerun: no unauthenticated PII access           |
|  3  | **Filter sensitive fields** from user API responses. Never return `failedLoginAttempts`, `accountLockedUntil`, or passwords in list/detail endpoints. Use MongoDB `.select('-failedLoginAttempts -accountLockedUntil -password')`. | Critical | Response body review                               |
|  4  | **Add IDOR protection** to `BookingController.js` — verify `booking.user_id === req.user.id` or `req.user.role === 'admin'` before returning booking data.                                                                         |   High   | Code review + test                                 |
|  5  | **Add tests for IDOR** — attempt to access another user's booking and verify 403 response.                                                                                                                                         |   High   | Test results                                       |

**Code Fix Pattern (S3):**

```javascript
// PII Protection — filter sensitive fields
const users = await User.find({}).select(
  "-password -failedLoginAttempts -accountLockedUntil -__v",
);

// IDOR Protection — ownership check
if (booking.user_id.toString() !== req.user.id && req.user.role !== "admin") {
  return res
    .status(403)
    .json({ message: "Not authorized to view this resource" });
}
```

---

### S4 — Input Validation Lead

**SAST Findings: 7 Blocker**

| Finding | File                                | Line | Issue                                |
| :------ | :---------------------------------- | :--: | :----------------------------------- |
| SAST-15 | `controllers/shopController.js`     |  L9  | NoSQL injection in shop search/query |
| SAST-16 | `controllers/CoachersController.js` | L11  | NoSQL injection in coach search      |
| SAST-17 | `controllers/CoachersController.js` | L165 | NoSQL injection in coach query       |
| SAST-18 | `controllers/MatchesController.js`  | L12  | NoSQL injection in match query       |
| SAST-19 | `controllers/CourtsController.js`   | L21  | NoSQL injection in court query       |
| SAST-20 | `controllers/videoController.js`    | L11  | NoSQL injection in video search      |
| SAST-21 | `controllers/videoController.js`    | L96  | NoSQL injection in video query       |

**DAST Findings: 1 Low (contributing evidence)**

| Alert                        | Risk | Endpoint                                                                             | Issue                                                                                                 |
| :--------------------------- | :--: | :----------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| Application Error Disclosure | Low  | `/api/coachers/search`, `/api/videos/search`, `/api/items/shop/1` + 4 POST endpoints | `500 Internal Server Error` with `"$regex has to be a string"` error and Mongoose stack traces leaked |

**Resolution Actions:**

|  #  | Action                                                                                                                                                                                          | Priority | Evidence Required                          |
| :-: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :----------------------------------------- |
|  1  | **Install and apply `mongo-sanitize`** across all 5 controllers. Strip `$` operators from all user-controlled query parameters before use.                                                      | Critical | SonarQube rerun: 0 Blockers in all 5 files |
|  2  | **Add Joi validation schemas** for search endpoints — enforce `query` param as string, alphanumeric, min 1 / max 100 chars.                                                                     | Critical | Code + test                                |
|  3  | **Fix `/api/coachers/search` and `/api/videos/search`** — these crash with `$regex has to be a string` when query param is missing/empty. Add input presence check before building regex query. |   High   | ZAP rerun: no 500 errors on search         |
|  4  | **Validate ObjectId params** — `/api/items/shop/:id` crashes with `Cast to ObjectId failed`. Validate with `mongoose.Types.ObjectId.isValid()` before use.                                      |   High   | ZAP rerun: 400 instead of 500              |
|  5  | **Implement generic error handler** — never return stack traces or Mongoose internals to clients. Return `{ message: "Internal server error" }` with status 500.                                |   High   | ZAP rerun: no stack traces                 |
|  6  | **Add test cases** for injection payloads on search endpoints: `?q={"$gt":""}`, `?q[$ne]=`, etc.                                                                                                |   High   | Test results                               |

**Code Fix Pattern (S4):**

```javascript
import sanitize from "mongo-sanitize";
import Joi from "joi";

const searchSchema = Joi.object({
  query: Joi.string().min(1).max(100).required(),
});

export const searchCoachers = async (req, res) => {
  try {
    const cleanQuery = sanitize(req.query.q);
    const { error } = searchSchema.validate({ query: cleanQuery });
    if (error) {
      return res.status(400).json({ message: "Invalid search term" });
    }
    const results = await Coach.find({
      CoachName: { $regex: cleanQuery, $options: "i" },
    });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Search failed" }); // Generic message
  }
};
```

---

### S5 — Infrastructure Security Lead

**SAST Findings: 0 direct (but supports all students with server-level fixes)**

**DAST Findings: 3 alerts (shared responsibility)**

| Alert                            |  Risk  | Source                   | Count | Issue                                                                                                           |
| :------------------------------- | :----: | :----------------------- | :---: | :-------------------------------------------------------------------------------------------------------------- |
| PII Disclosure                   |  High  | Backend                  |   2   | Unauthenticated endpoints returning sensitive data — needs access control enforcement at infra/middleware level |
| CSP: Failure to Define Directive | Medium | Backend + Frontend proxy | 5 + 3 | Express default error handler returns `default-src 'none'` CSP missing `frame-ancestors`, `form-action`         |
| Application Error Disclosure     |  Low   | Backend                  |   7   | Stack traces and internal errors leaked to clients; no global error handler                                     |

**Resolution Actions:**

|  #  | Action                                                                                                                                                                                                       | Priority | Evidence Required                               |
| :-: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :---------------------------------------------- |
|  1  | **Verify `helmet()` is active** in `server.js` with proper configuration. Ensure `helmet.hidePoweredBy()` and `helmet.frameguard({ action: 'deny' })` are applied.                                           | Critical | ZAP rerun: no `X-Powered-By` header             |
|  2  | **Fix backend CSP** — update Helmet CSP config to include `frame-ancestors 'none'` and `form-action 'self'` explicitly, matching the current config for success responses but also covering error responses. | Critical | ZAP rerun: no CSP directive gap on any endpoint |
|  3  | **Add global Express error handler** — catch all unhandled errors and return generic JSON response instead of HTML stack traces. This fixes the 7 Application Error Disclosure findings.                     |   High   | ZAP rerun: no stack traces in response bodies   |
|  4  | **Enforce authentication middleware** on sensitive routes — ensure `/api/auth/users` and similar data-listing endpoints require auth.                                                                        |   High   | ZAP rerun: 401 on unauthenticated requests      |
|  5  | **HTTPS enforcement plan** — document TLS 1.2+ requirement for production deployment. All auth and payment traffic must use encrypted channels.                                                              |  Medium  | Deployment config documentation                 |
|  6  | **CORS configuration review** — verify `Access-Control-Allow-Origin` is restricted to expected frontend origins only (not `*`).                                                                              |  Medium  | Response header review                          |

**Code Fix Pattern (S5):**

```javascript
// server.js — Global error handler (add AFTER all routes)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log internally
  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// Helmet CSP config update
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    frameguard: { action: "deny" },
  }),
);
```

---

### S6 — Frontend Security Lead

**SAST Findings: 0 (frontend code not scanned by SonarQube)**

**DAST Findings: 3 Medium alerts**

| Alert                         |  Risk  | Count | Affected Pages                                                   | Issue                                                                                                                               |
| :---------------------------- | :----: | :---: | :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| CSP: Wildcard Directive       | Medium |   3   | `/home`, `/register`, `/unauthorized`                            | CSP `default-src` allows `http:`, `https:`, `ws:`, `wss:`, `data:`, `blob:` — effectively permits loading resources from any origin |
| CSP: script-src unsafe-inline | Medium |   5   | `/Videopage`, `/home`, `/register`, `/timeline`, `/unauthorized` | `'unsafe-inline'` in CSP nullifies XSS protection                                                                                   |
| CSP: style-src unsafe-inline  | Medium |   5   | `/`, `/Videopage`, `/login`, `/register`, `/unauthorized`        | `'unsafe-inline'` for styles weakens CSP                                                                                            |

**Root Cause:** The frontend Vite dev server (or Express proxy for production) sets:

```
Content-Security-Policy: default-src 'self' http: https: ws: wss: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'none'; form-action 'self';
```

This is **far too permissive** and effectively disables CSP protection.

**Resolution Actions:**

|  #  | Action                                                                                                                                                                                                  | Priority | Evidence Required                               |
| :-: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------: | :---------------------------------------------- |
|  1  | **Tighten frontend CSP** — remove `http:`, `ws:`, `data:`, `blob:`, `'unsafe-eval'` from `default-src`. Define specific directives for `script-src`, `style-src`, `img-src`, `connect-src`, `font-src`. | Critical | ZAP rerun: no wildcard/unsafe-inline CSP alerts |
|  2  | **Replace `unsafe-inline`** — use nonces or hashes for inline scripts if needed. For Vite dev mode, accept `unsafe-inline` but ensure production build uses strict CSP.                                 |   High   | Production CSP header review                    |
|  3  | **Implement DOMPurify** for any user-generated content rendering (reviews, comments). Use `DOMPurify.sanitize()` before `dangerouslySetInnerHTML`.                                                      |   High   | Code review                                     |
|  4  | **Remove `unsafe-eval`** if possible — required by some dev tools but should not appear in production CSP.                                                                                              |  Medium  | Production build CSP check                      |
|  5  | **Add CSP `report-uri` or `report-to` directive** to capture CSP violations in production for monitoring.                                                                                               |   Low    | Config documentation                            |

**Code Fix Pattern (S6):**

```javascript
// Production CSP (Vite plugin or Express middleware)
const productionCSP = {
  "default-src": ["'self'"],
  "script-src": ["'self'"],
  "style-src": ["'self'", "'unsafe-inline'"], // May need unsafe-inline for Tailwind
  "img-src": ["'self'", "https:", "data:"],
  "connect-src": ["'self'", "http://localhost:5001"], // Backend API
  "font-src": ["'self'"],
  "frame-ancestors": ["'none'"],
  "form-action": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
};

// DOMPurify for user content
import DOMPurify from "dompurify";
const safeHTML = DOMPurify.sanitize(userContent);
```

---

## 5) Combined Issues Matrix

|  #  | Finding                                               |  Risk   | Type | Student | Current Status | Resolution Action                              |
| :-: | :---------------------------------------------------- | :-----: | :--: | :-----: | :------------- | :--------------------------------------------- |
|  1  | NoSQL Injection in `authController.js` (2 issues)     | Blocker | SAST |   S1    | Open           | Sanitize auth inputs, validate string types    |
|  2  | NoSQL Injection in `payment.js` (9 issues)            | Blocker | SAST |   S2    | Open           | Sanitize + validate all payment query params   |
|  3  | NoSQL Injection in `userController.js` (3 issues)     | Blocker | SAST |   S3    | Open           | Sanitize user query params, validate ObjectIds |
|  4  | NoSQL Injection in `shopController.js` (1 issue)      | Blocker | SAST |   S4    | Open           | Apply `mongo-sanitize` + Joi validation        |
|  5  | NoSQL Injection in `CoachersController.js` (2 issues) | Blocker | SAST |   S4    | Open           | Apply `mongo-sanitize` + Joi validation        |
|  6  | NoSQL Injection in `MatchesController.js` (1 issue)   | Blocker | SAST |   S4    | Open           | Apply `mongo-sanitize` + Joi validation        |
|  7  | NoSQL Injection in `CourtsController.js` (1 issue)    | Blocker | SAST |   S4    | Open           | Apply `mongo-sanitize` + Joi validation        |
|  8  | NoSQL Injection in `videoController.js` (2 issues)    | Blocker | SAST |   S4    | Open           | Apply `mongo-sanitize` + Joi validation        |
|  9  | PII Disclosure on `/api/auth/users` and `/api/shops`  |  High   | DAST | S3 + S5 | Open           | Add auth middleware + field filtering          |
| 10  | CSP directive gap (backend error responses)           | Medium  | DAST |   S5    | Open           | Fix Helmet CSP to cover error handler paths    |
| 11  | CSP wildcard directive (frontend)                     | Medium  | DAST |   S6    | Open           | Tighten frontend CSP directives                |
| 12  | CSP `unsafe-inline` scripts (frontend)                | Medium  | DAST |   S6    | Open           | Remove `unsafe-inline` or use nonces           |
| 13  | CSP `unsafe-inline` styles (frontend)                 | Medium  | DAST |   S6    | Open           | Tighten style-src directive                    |
| 14  | Application Error Disclosure (7 endpoints)            |   Low   | DAST | S4 + S5 | Open           | Add input validation + global error handler    |

---

## 6) Findings Resolution Plan by Student

### S1 — Authentication (2 SAST Blockers)

| Finding                                   | Resolution                                                                          | Policy Clause              | Closure Evidence                                                            |
| :---------------------------------------- | :---------------------------------------------------------------------------------- | :------------------------- | :-------------------------------------------------------------------------- |
| 2x NoSQL injection in `authController.js` | Validate username/password as strings, reject object payloads, use `mongo-sanitize` | SM-POL-S1-001 §3.2.3, §3.4 | SonarQube: 0 Blockers in `authController.js` + injection test cases passing |

### S2 — Payment (9 SAST Blockers)

| Finding                            | Resolution                                                                                                         | Closure Evidence                                                     |
| :--------------------------------- | :----------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| 9x NoSQL injection in `payment.js` | Sanitize all `req.params`, `req.body`, `req.query` values. Validate ObjectIds. Add Joi schemas for payment inputs. | SonarQube: 0 Blockers in `payment.js` + injection test cases passing |

### S3 — Data Privacy (3 SAST Blockers + 1 DAST High)

| Finding                                   | Resolution                                                                       | Closure Evidence                                    |
| :---------------------------------------- | :------------------------------------------------------------------------------- | :-------------------------------------------------- |
| 3x NoSQL injection in `userController.js` | Sanitize user inputs, validate ObjectIds                                         | SonarQube: 0 Blockers in `userController.js`        |
| PII Disclosure on user/shop endpoints     | Add auth middleware to `/api/auth/users`, filter sensitive fields from responses | ZAP rerun: 401 on unauthenticated `/api/auth/users` |

### S4 — Input Validation (7 SAST Blockers + 1 DAST Low)

| Finding                                   | Resolution                                                                                               | Closure Evidence                               |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------- | :--------------------------------------------- |
| 7x NoSQL injection across 5 controllers   | Install `mongo-sanitize` + `joi`. Apply to all search/query functions. Validate query params as strings. | SonarQube: 0 Blockers across all 5 files       |
| Error disclosure on search/POST endpoints | Add input validation before DB operations. Return generic error messages.                                | ZAP rerun: no 500 errors with internal details |

### S5 — Infrastructure (0 SAST + 3 DAST alerts as shared owner)

| Finding                              | Resolution                                                                 | Closure Evidence                                           |
| :----------------------------------- | :------------------------------------------------------------------------- | :--------------------------------------------------------- |
| CSP directive gap on error responses | Update Helmet CSP config, add custom error handler with proper CSP headers | ZAP rerun: consistent CSP on all backend responses         |
| Error disclosure (stack traces)      | Add global Express error handler returning generic JSON                    | ZAP rerun: no stack traces or Mongoose errors in responses |
| PII exposure (shared with S3)        | Enforce auth middleware on data-listing endpoints                          | ZAP rerun: 401 on unauthenticated data endpoints           |

### S6 — Frontend Security (0 SAST + 3 DAST Medium)

| Finding                 | Resolution                                                              | Closure Evidence                         |
| :---------------------- | :---------------------------------------------------------------------- | :--------------------------------------- |
| CSP wildcard directive  | Replace overly permissive CSP with specific source directives           | ZAP rerun: no CSP wildcard alert         |
| `unsafe-inline` scripts | Remove `unsafe-inline` from production CSP, use nonces if needed        | ZAP rerun: no unsafe-inline script alert |
| `unsafe-inline` styles  | Consider removing if possible or risk-accept for Tailwind compatibility | Documented risk acceptance or ZAP rerun  |

---

## 7) Execution Priority & Sequence

### Phase A: Critical (Do First — All Students)

1. **All Students:** Install `mongo-sanitize` and apply to their respective controllers/routes
2. **S4:** Fix search endpoints that crash with missing query params
3. **S5:** Add global error handler to prevent stack trace leakage
4. **S3:** Add auth middleware to `/api/auth/users` endpoint

### Phase B: High Priority

5. **S1:** Verify rate limiter, lockout, and generic error behavior
6. **S2:** Verify Stripe webhook signature verification
7. **S5:** Fix CSP configuration for consistent headers across success/error paths
8. **S6:** Tighten frontend CSP

### Phase C: Verification

9. **All Students:** Re-run SonarQube — target: **0 open Blocker findings**
10. **All Students:** Re-run ZAP DAST — target: **0 High, reduce Medium findings**
11. **All Students:** Archive timestamped reports under `zap/reports/`

---

## 8) Verification Checklist

### SAST Closure (SonarQube)

- [ ] `authController.js` — 0 Blockers (S1)
- [ ] `payment.js` — 0 Blockers (S2)
- [ ] `userController.js` — 0 Blockers (S3)
- [ ] `shopController.js` — 0 Blockers (S4)
- [ ] `CoachersController.js` — 0 Blockers (S4)
- [ ] `MatchesController.js` — 0 Blockers (S4)
- [ ] `CourtsController.js` — 0 Blockers (S4)
- [ ] `videoController.js` — 0 Blockers (S4)

### DAST Closure (ZAP)

- [ ] No PII Disclosure on unauthenticated endpoints (S3 + S5)
- [ ] No CSP directive gap on backend error paths (S5)
- [ ] No CSP wildcard / unsafe-inline on frontend (S6)
- [ ] No Application Error Disclosure / stack traces (S4 + S5)

### Policy Compliance

- [ ] Rate limiter active and tested (S1)
- [ ] Webhook signature verification active (S2)
- [ ] IDOR protection implemented and tested (S3)
- [ ] Input validation schemas in place (S4)
- [ ] Helmet + error handler properly configured (S5)
- [ ] DOMPurify sanitization in place (S6)

---

## 9) Exit Criteria

1. SonarQube scan shows **0 Blocker** security vulnerabilities across all files.
2. ZAP DAST shows **0 High** risk findings and all **Medium** findings are either fixed or risk-accepted with documented rationale.
3. No stack traces, internal errors, or PII are exposed to unauthenticated users.
4. Each student can explain their specific findings, fixes, and policy alignment for Viva defense.
5. Timestamped SAST + DAST re-scan reports are archived as evidence.
