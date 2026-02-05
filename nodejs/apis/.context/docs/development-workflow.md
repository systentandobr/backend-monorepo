---
type: doc
name: development-workflow
description: Day-to-day engineering processes, branching, and contribution guidelines
category: workflow
generated: 2026-02-05
status: filled
scaffoldVersion: "2.0.0"
---

## Development Workflow

The development process focuses on maintaining a clean monorepo structure. Developers work on domain-specific modules within `apps/` or shared logic in `libs/`.

## Branching & Releases

We follow a **Trunk-based development** model with feature branches.
- **Main**: Stable branch for production-ready code.
- **Features**: Short-lived branches for specific tasks (e.g., `feat/gamification-fix`).
- **Releases**: Tagged versions following semantic versioning.

## Local Development

- **Install Dependencies**: `pnpm install`
- **Run Application**: `pnpm start:dev apis-monorepo`
- **Build**: `pnpm build`
- **Test**: `pnpm test`

## Code Review Expectations

- All PRs must pass linting and unit tests.
- Code should follow the established NestJS style guide.
- At least one approval is required before merging.
- Ensure new features are documented in `.context/docs`.

## Onboarding Tasks

1. Clone the repository.
2. Run `pnpm install`.
3. Set up the local environment variables.
4. Pick up a "good first issue" from the backlog relating to `apis-monorepo`.
