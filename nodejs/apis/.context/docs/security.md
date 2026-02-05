---
type: doc
name: security
description: Security policies, authentication, secrets management, and compliance requirements
category: security
generated: 2026-02-05
status: filled
scaffoldVersion: "2.0.0"
---

## Security & Compliance Notes

Security is a core pillar of the systentando platform. We implement defense-in-depth strategies to protect user data and ensure system integrity.

## Authentication & Authorization

- **JWT (JSON Web Tokens)**: Primary mechanism for identity assertion.
- **Passport.js**: Utilized with `JwtStrategy` for session-less authentication.
- **Custom Guards**: `JwtAuthGuard` and `UnitScopeGuard` ensure that users only access resources they are authorized for within their specific `unitId`.
- **Role-Based Access Control (RBAC)**: Managed through decorators and metadata attached to controllers and routes.

## Secrets & Sensitive Data

- **Environment Variables**: Managed via `.env` files (locally) and platform-specific secret stores (production).
- **Mongoose Encryption**: Sensitive fields in schemas are encrypted or hashed (e.g., passwords using bcrypt).
- **Sensitive Data Handling**: PI (Personal Information) like `bioimpedance` data is protected by strict access controls.

## Compliance & Policies

- **GDPR**: Alignment with European data protection standards for user privacy.
- **API Security**: Rate limiting and CORS policies (configured in `main.ts`) prevent common web attacks.
