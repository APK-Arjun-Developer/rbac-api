# RBAC API Review

This document summarizes architecture, code quality, security, performance, API design, error handling, logging/monitoring, and dependency health findings for the current Node.js/Fastify RBAC API.

## Critical

1. **Controller actions are never executed** because `controllerAction(...)` returns a function that is not invoked in controller methods.
2. **Authentication middleware exists but is not attached to routes**, leaving user APIs unprotected.
3. **Passwords are persisted directly from request payloads** in user creation flows (no hashing in service layer).
4. **Company context is hardcoded to `temp-company-id`**, which breaks tenancy/security boundaries.
5. **API contract mismatch** between validation schema and service payload (`addressId` expected by schema vs nested `address` expected by service types).

## Improvements

- Add centralized Fastify `setErrorHandler` and `setNotFoundHandler` for consistent error envelopes.
- Add pagination/filtering/sorting for list endpoints.
- Add request ID/correlation ID propagation and structured JSON logging.
- Move environment validation to a schema validator (e.g., Zod/envalid) and fix malformed Codespaces URL generation.
- Revisit Prisma logging defaults to avoid query-level logs in production.

## Good practices

- Layered architecture is in place (route/controller/service/repository).
- Transaction wrapper exists in `BaseService`.
- Prisma schema has useful relational and uniqueness constraints.
- JSON schema validation is configured for endpoints.

## Recommended features

- Proper auth module: login/refresh/revoke/logout, rotation for refresh tokens.
- RBAC policy enforcement middleware/guards per route.
- Rate limiting, CORS, Helmet-like hardening, and secure headers.
- Health/readiness endpoints and metrics (`/health`, `/ready`, Prometheus metrics).
- Automated tests: unit + integration + contract tests.
- CI quality gates: lint, tests, SAST/dependency audit.

## Suggested libraries

- `@fastify/jwt` and `@fastify/auth` for native Fastify auth composition.
- `argon2` (or bcrypt properly integrated) for password hashing.
- `zod` + `@fastify/type-provider-zod` (or `envalid`) for typed env/config validation.
- `@fastify/rate-limit`, `@fastify/helmet`, `@fastify/cors` for API hardening.
- `pino` and `pino-pretty` (or stick to one logger strategy) + request ID middleware.
- `prom-client` + endpoint exposure for metrics.
- `vitest`/`jest` + `supertest` for API tests.
- `npm-check-updates` + `audit-ci` for dependency hygiene.

## Structure recommendations

- Introduce domain modules (e.g., `src/modules/user`, `src/modules/auth`, `src/modules/role`) containing route/controller/service/repository/schema per domain.
- Add `src/plugins` (auth, swagger, db, error handling) and `src/bootstrap` for startup wiring.
- Add `src/common` for shared errors, logger, constants, utilities.
- Add `src/tests` split into `unit/` and `integration/`.
- Add `docs/` for API conventions and security model.

## Missing backend best practices

- No explicit auth guard usage in route registration.
- No password hashing and comparison strategy implemented end-to-end.
- No refresh token store/revocation strategy.
- No pagination standards (`limit`, `cursor`, metadata).
- No consistent API error format across all failure modes.
- No request/response logging policy with PII redaction.
- No API versioning strategy (`/v1`).
- No automated dependency and security scanning pipeline.
