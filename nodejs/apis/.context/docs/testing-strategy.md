---
type: doc
name: testing-strategy
description: Test frameworks, patterns, coverage requirements, and quality gates
category: testing
generated: 2026-02-05
status: filled
scaffoldVersion: "2.0.0"
---

## Testing Strategy

Quality is maintained through a multi-layered testing approach, ensuring that both individual units and complex flows work as expected.

## Test Types

- **Unit**: Powered by **Jest**. Tests are located alongside source files (e.g., `*.spec.ts`). Focus on services and logic.
- **Integration**: Conducted using **Supertest** for testing HTTP endpoints within the NestJS testing module.
- **E2E**: End-to-end tests located in `test/` directories of each application, covering full request/response cycles.

## Running Tests

- **Run all tests**: `pnpm test`
- **Watch mode**: `pnpm test:watch`
- **Coverage report**: `pnpm test:cov`
- **E2E tests**: `pnpm test:e2e`

## Quality Gates

- **Linting**: Rules enforced by ESLint to maintain code consistency.
- **Formatting**: Prettier configuration ensures uniform code style.
- **CI Verification**: Tests and linting must pass on every pull request.
