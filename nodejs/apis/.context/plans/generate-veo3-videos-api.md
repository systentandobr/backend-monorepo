---
status: in_progress
generated: 2026-02-05
agents:
  - type: "architect-specialist"
    role: "Design the Veo3 integration pattern and media streaming architecture"
  - type: "feature-developer"
    role: "Implement Veo3Service and update ExercisesService/Controller"
  - type: "backend-specialist"
    role: "Implement streaming logic and pagination for media assets"
  - type: "code-reviewer"
    role: "Ensure high-confidence implementation and adherence to NestJS patterns"
  - type: "test-writer"
    role: "Write unit and integration tests for video generation and media API"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "data-flow.md"
  - "tooling.md"
phases:
  - id: "phase-1"
    name: "Design & Discovery"
    prevc: "P"
    status: "in_progress"
  - id: "phase-2"
    name: "Implementation"
    prevc: "E"
    status: "pending"
  - id: "phase-3"
    name: "Validation"
    prevc: "V"
    status: "pending"
---

# Veo3 Video Generation and Media Streaming API Plan

Implement a specialized service for video generation using the Veo3 model and a robust, paginated API for serving exercise assets (videos and images) via high-performance streams.

## Task Snapshot
- **Primary goal:** Provide automated exercise video generation and a scalable media serving API.
- **Success signal:** Exercice videos successfully generated in `uploads/exercises/` and accessible via paginated streaming endpoints with proper unit scoping.
- **Key references:**
  - [NanoBanana Service](file:///\\wsl.localhost\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\nodejs\apis\apps\apis-monorepo\src\services\nano-banana.service.ts)
  - [Exercises Service](file:///\\wsl.localhost\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\nodejs\apis\apps\apis-monorepo\src\modules\exercises\exercises.service.ts)

## Codebase Context
- **Infrastructure:** NestJS Monorepo using Mongoose for data persistence.
- **Storage:** Local `uploads/` directory structured by exercise ID.
- **Security:** Unit-based multi-tenancy enforced via `unitId`.

### Key Components
**Core Classes:**
- `NanoBananaService` — Reference for Google Generative AI integration.
- `ExercisesService` — Main orchestrator for exercise lifecycle and media generation.
- `ExercisesController` — API surface for exercise management.

## Agent Lineup
| Agent | Role in this plan | Playbook | Focus |
| --- | --- | --- | --- |
| Architect Specialist | Design Veo3 integration | [Architect Specialist](../agents/architect-specialist.md) | blueprint for service separation and media data flow |
| Feature Developer | Coding services | [Feature Developer](../agents/feature-developer.md) | `Veo3Service` creation and `ExercisesService` expansion |
| Backend Specialist | Streaming/API logic | [Backend Specialist](../agents/backend-specialist.md) | implementation of paginated media streams and DTOs |
| Code Reviewer | Quality assurance | [Code Reviewer](../agents/code-reviewer.md) | rigorous review of data scoping and API performance |

## Documentation Touchpoints
| Guide | File | Primary Inputs |
| --- | --- | --- |
| Architecture Notes | [architecture.md](../docs/architecture.md) | Integration of Veo3 as a new gen-AI service provider |
| Data Flow | [data-flow.md](../docs/data-flow.md) | Path from prompt to stored video and streamed output |
| Tooling | [tooling.md](../docs/tooling.md) | Environment variables for Veo3 API access |

## Risk Assessment
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Veo3 API Rate Limits | High | Medium | Implement robust retry logic with exponential backoff | Backend Specialist |
| Large Video File Performance | Medium | High | Use Node.js Streams and Range requests (206 Partial Content) | Backend Specialist |
| Unit Scoping Leaks | Low | High | Strict enforcement of `unitId` in all media discovery logic | Code Reviewer |

## Working Phases

### Phase 1 — Discovery & Alignment
**Steps**
1. **Model Validation**: Confirm `@google/generative-ai` support for Veo3 or identify required alternatives. (Architect)
2. **Endpoint Design**: Define the DTOs and decorators for `GET /exercises/media`. (Architect)

### Phase 2 — Implementation
**Steps**
1. **Veo3Service**: Create `veo3.service.ts` with video generation logic similar to `NanoBananaService`. (Feature Developer)
2. **Expansion**: Add `generateExerciseVideo` to `ExercisesService` with specific prompts for exercise execution phases. (Feature Developer)
3. **Media API**: Implement `findAllMedia` and `streamFile` in `ExercisesService` and `ExercisesController`. (Backend Specialist)

### Phase 3 — Validation
**Steps**
1. **Unit Testing**: Suite for `Veo3Service` and media pagination. (Test Writer)
2. **Integration Audit**: Verify `unitId` isolation for streaming endpoints. (Security Auditor/Code Reviewer)
3. **Walkthrough**: Document the new capability. (Documentation Writer)

## Rollback Plan
- **Triggers**: Critical failures in video generation or unauthorized media access.
- **Action**: Disable Veo3 generation flags and revert Controller/Service changes to previous stable state.
