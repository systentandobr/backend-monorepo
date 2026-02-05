---
type: doc
name: glossary
description: Project terminology, type definitions, domain entities, and business rules
category: glossary
generated: 2026-02-05
status: filled
scaffoldVersion: "2.0.0"
---

## Glossary & Domain Concepts

- **Unit**: A specific branch or location in the franchise system.
- **Achievement**: A gamified reward given to students for completing tasks.
- **Lead**: A potential customer or student profile.
- **Gamification Profile**: Persistence layer for user's game state and points.

## Type Definitions

- `Achievement` (exported) @ `apps/life-tracker/src/modules/types/index.ts`
- `AchievementDocument` @ `apps/apis-monorepo/src/modules/gamification/schemas/achievement.schema.ts`
- `ApiResponse` @ `apps/life-tracker/src/types/index.ts`

## Enumerations

- `IngredientUnit`: Units of measure for product ingredients.
- `LeadStatus`: Lifecycle stages of a lead (e.g., New, Contacted).
- `GroqModel`: AI model identifiers for Groq integration.

## Core Terms

- **Tenant Context**: The scoping of data based on `unitId` or `domain`.
- **Nano Banana**: Internal name for a specific service or integration point.
- **Franchise Task**: A delegated task within the business hierarchy.
