---
type: doc
name: architecture
description: System architecture, layers, patterns, and design decisions
category: architecture
generated: 2026-02-05
status: filled
scaffoldVersion: "2.0.0"
---

## Architecture Notes

The system is designed as a modular monorepo using NestJS, organized into multiple applications (`apps/`) and shared libraries (`libs/`). This architecture allows for code reuse while maintaining separation of concerns between different domains like gamification, notifications, and core APIs.

## System Architecture Overview

The codebase follows a modular monorepo topology. Each application under `apps/` represents a distinct service or bounded context. Requests typically enter through controllers, which delegate business logic to services. Services interact with repositories and models for data persistence. The system is designed to be deployed as a set of modular services or a unified conglomerate depending on configuration.

## Architectural Layers

- **Controllers**: Handle HTTP requests and routing. Located in `apps/*/src`.
- **Services**: Contain core business logic. Located in `apps/*/src` and modules.
- **Modules**: Domain-specific units of functionality (e.g., `gamification`, `notifications`).
- **Repositories**: Handle data access and abstraction over MongoDB (using Mongoose).
- **Models/Schemas**: Define data structures and persistence layer.
- **Utils/Libs**: Shared utilities and infrastructure abstractions.

> See [`codebase-map.json`](./codebase-map.json) for complete symbol counts and dependency graphs.

## Detected Design Patterns

| Pattern | Confidence | Locations | Description |
|---------|------------|-----------|-------------|
| **Dependency Injection** | 100% | Across all NestJS modules | Core NestJS pattern for service management. |
| **Decorator Pattern** | 100% | `src/decorators` | Extensively used for authentication, metadata, and logging. |
| **Interceptor Pattern** | 90% | `src/interceptors` | Used for request/response transformation (e.g., `UnitIdInterceptor`). |
| **Repository Pattern** | 85% | `src/modules/*/repository` | Abstraction over database operations. |
| **Strategy Pattern** | 80% | `src/auth`, `tax-calculation.service.ts` | Used for authentication strategies and dynamic calculations. |

## Entry Points

- [Main API Entry](file:///\\wsl.localhost\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\nodejs\apis\apps\apis-monorepo\src\main.ts)
- [Notifications Entry](file:///\\wsl.localhost\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\nodejs\apis\apps\notifications\src\main.ts)
- [Life Tracker Entry](file:///\\wsl.localhost\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\nodejs\apis\apps\life-tracker\src\main.ts)

## Public API

| Symbol | Type | Location |
|--------|------|----------|
| `AppModule` | Class | `apps/apis-monorepo/src/app.module.ts` |
| `GamificationModule` | Class | `temp-gamification/gamification.module.ts` |
| `NotificationsService` | Class | `apps/notifications/src/notifications.service.ts` |
| `Achievement` | Schema | `apps/apis-monorepo/src/modules/gamification/schemas/achievement.schema.ts` |

## Top Directories Snapshot

- `apps/` (~500 files) — Application-specific logic.
- `libs/` (~100 files) — Shared code and utilities.
- `temp-gamification/` — Temporary or standalone gamification logic.

## Related Resources

- [Project Overview](./project-overview.md)
- [Data Flow](./data-flow.md)
- [Development Workflow](./development-workflow.md)
