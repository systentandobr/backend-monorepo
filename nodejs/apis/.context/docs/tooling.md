---
type: doc
name: tooling
description: Scripts, IDE settings, automation, and developer productivity tips
category: tooling
generated: 2026-02-05
status: filled
scaffoldVersion: "2.0.0"
---

## Tooling & Productivity Guide

We leverage modern automation and standardized tooling to maintain high engineering velocity.

## Required Tooling

- **pnpm**: Fast, disk space efficient package manager.
- **Nest CLI**: Essential for scaffolding and managing applications.
- **Docker**: Used for local infrastructure (MongoDB services).
- **WSL (optional)**: Recommended for Windows users to maintain a Linux-consistent environment.

## Recommended Automation

- **Pre-commit Hooks**: Enforce linting and formatting before commits are finalized.
- **Stoplight Elements**: Used for API documentation generation and preview in `main.ts`.
- **Custom Scripts**: `import-data.js` and `simple-import.js` for data seeding and integration testing.

## IDE / Editor Setup

- **VS Code** (Recommended): Use the ESLint and Prettier extensions.
- **NestJS Extension Pack**: For better autocompletion and module visualization.
- **Mongoose Helper**: Extensions for schema navigation and query testing.

## Productivity Tips

- Use `pnpm start:dev [app-name]` to start individual services with hot-reloading.
- Alias common pnpm commands for faster terminal interaction.
