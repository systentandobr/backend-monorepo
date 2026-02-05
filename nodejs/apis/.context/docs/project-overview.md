---
type: doc
name: project-overview
description: High-level overview of the project, its purpose, and key components
category: overview
generated: 2026-02-05
status: filled
scaffoldVersion: "2.0.0"
---

## Project Overview

This project is a comprehensive backend monorepo designed to power a multi-tenant ecosystem focused on gamification, life tracking, and business management. It provides a robust set of APIs for managing users, franchise tasks, student rewards, and notifications, solving the problem of fragmented systems by consolidating domain logic into a unified, scalable architecture.

> **Detailed Analysis**: For complete symbol counts, architecture layers, and dependency graphs, see [`codebase-map.json`](./codebase-map.json).

## Quick Facts

- **Root**: `\\wsl.localhost\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\nodejs\apis`
- **Primary Languages**: TypeScript (NestJS), JavaScript.
- **Entry**: `apps/apis-monorepo/src/main.ts`
- **Full analysis**: [`codebase-map.json`](./codebase-map.json)

## Entry Points

- [APIs Monorepo](file:///\\wsl.localhost\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\nodejs\apis\apps\apis-monorepo\src\main.ts)
- [Notifications Service](file:///\\wsl.localhost\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\nodejs\apis\apps\notifications\src\main.ts)
- [Life Tracker](file:///\\wsl.localhost\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\nodejs\apis\apps\life-tracker\src\main.ts)

## File Structure & Code Organization

- `apps/` — Individual backend applications and services.
- `libs/` — Shared libraries, utilities, and infrastructure logic.
- `temp-gamification/` — Standalone gamification module logic.
- `libs/shared/data/dtos` — Common data transfer objects.

## Technology Stack Summary

The project utilizes a **NestJS** framework built on **TypeScript**, leveraging **MongoDB** for persistent storage via Mongoose. Build tooling is managed through `pnpm` and `nest-cli`, with architectural patterns like dependency injection and modular components enforced by the framework.

## Getting Started Checklist

1. Install dependencies with `pnpm install`.
2. Configure environment variables in `.env` files for each app.
3. Start the development server using `pnpm start:dev apis-monorepo`.
4. Run tests with `pnpm test`.

## Next Steps

- Explore [Architecture Notes](./architecture.md) for deep dives into system design.
- Review [Development Workflow](./development-workflow.md) for contribution guidelines.
