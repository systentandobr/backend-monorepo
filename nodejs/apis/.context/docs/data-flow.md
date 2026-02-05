---
type: doc
name: data-flow
description: How data moves through the system and external integrations
category: data-flow
generated: 2026-02-05
status: filled
scaffoldVersion: "2.0.0"
---

## Data Flow & Integrations

Data enters the system primarily through REST API endpoints managed by NestJS controllers. It then flows through guards (for auth) and interceptors (for context, like `unitId`) before reaching the service layer where business logic is applied. Data is persisted to MongoDB via Mongoose schemas.

## Module Dependencies

- **apps/apis-monorepo** → `libs/utils`, `libs/infra`.
- **apps/notifications** → `libs/utils`.
- **apps/life-tracker** → `libs/utils`.
- **apps/sys-produtos** → `libs/utils`.

## Service Layer

- [AchievementService](file:///\\wsl.localhost\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\nodejs\apis\apps\life-tracker\src\modules\gamification\achievement.service.ts)
- [GamificationService](file:///\\wsl.localhost\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\nodejs\apis\apps\apis-monorepo\src\modules\gamification\gamification.service.ts)
- [NotificationsService](file:///\\wsl.localhost\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\nodejs\apis\apps\notifications\src\notifications.service.ts)
- [BioimpedanceService](file:///\\wsl.localhost\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\nodejs\apis\apps\apis-monorepo\src\modules\bioimpedance\bioimpedance.service.ts)

## High-level Flow

1. **Request**: Client sends a request to a controller.
2. **Context**: `UnitIdInterceptor` or `DomainInterceptor` attaches relevant tenant context.
3. **Logic**: Service processes the request, often calling external APIs (e.g., Groq for AI features).
4. **Persistence**: Service saves or retrieves data from MongoDB.
5. **Response**: Formatted DTO is returned to the client.

## External Integrations

- **Google Maps API**: Used for location-based services (migrating to backend).
- **Groq API**: Used for AI-powered features and chat instructions.
- **MongoDB**: Primary data store.
