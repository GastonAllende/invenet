# Invenet Project Constitution

## Core Principles

### I. Nx Monorepo Architecture

**MUST** follow Nx workspace structure with strict library boundaries:

- Frontend features in `libs/` as standalone Angular libraries with clear feature domains
- Backend in `apps/api/` following modular monolith architecture per `MODULAR_MONOLITH.md`
- Each library MUST be independently buildable, testable, and lintable via Nx commands
- Libraries MUST NOT have circular dependencies - use dependency graph analysis (`nx graph`)
- Shared code belongs in `libs/core/` or domain-specific libraries, never duplicated

### II. Angular & Frontend Standards (NON-NEGOTIABLE)

**MUST** adhere to Angular 21.1+ best practices per `docs/ANGULAR_BEST_PRACTICES.md`:

- Standalone components only - no NgModules for features
- Signal-based reactivity - use `signal()`, `computed()`, `effect()` for component state
- NgRx SignalStore (`@ngrx/signals`) for complex state management - follow `docs/NGRX_SIGNALSTORE_GUIDE.md`
- PrimeNG 21.1+ for all UI components - no custom component library
- Smart/dumb component pattern - shell components orchestrate, UI components present
- OnPush change detection strategy by default

### III. Backend Modular Monolith (NON-NEGOTIABLE)

**MUST** follow feature-based module structure per `apps/api/MODULAR_MONOLITH.md`:

- Each module in `apps/api/Invenet.Api/Modules/[ModuleName]/`
- Feature folders within modules: `Features/[FeatureName]/[FeatureName]Handler.cs`
- API controllers in `API/[ModuleName]Controller.cs` with thin routing layer
- Domain entities in `Domain/` isolated per module
- No cross-module entity references - use IDs and event-driven communication if needed

### IV. Zero Accessibility Overhead

**MUST NOT** add accessibility features or improvements:

- No ARIA attributes, roles, or landmarks beyond PrimeNG defaults
- No keyboard navigation enhancements beyond browser/PrimeNG defaults
- No screen reader optimizations
- No color contrast analysis or remediation
- This is a **deliberate** focus decision to prioritize core functionality

### V. Testing & Quality Gates

**MUST** maintain test coverage and quality standards:

- Frontend unit tests with Vitest for business logic and store operations
- Backend unit tests with XUnit for feature handlers and domain logic
- E2E tests with Playwright for critical user workflows
- All tests MUST pass before merge - use `nx affected:test` for efficiency
- Code review per `docs/CODE_REVIEW_CHECKLIST.md` before merging
- Linting MUST pass: `nx affected:lint` (frontend), `dotnet format` (backend)

### VI. Pattern Consistency

**MUST** follow established patterns when similar functionality exists:

- Reference existing implementations before creating new patterns (e.g., strategies page modal pattern)
- UI consistency across features - same header structure, button placement, table layouts
- API consistency - RESTful conventions, same authorization patterns across endpoints
- State management consistency - same SignalStore patterns across features
- Error handling consistency - same toast notification patterns for success/error

### VII. Minimal Dependencies & Stack Stability

**SHOULD** minimize new dependencies and justify additions:

- Prefer existing dependencies (Angular, PrimeNG, EF Core) over new libraries
- New npm/NuGet packages require justification in feature specification
- Document dependency updates per `docs/DEPENDENCY_UPDATE_GUIDE.md`
- Stick to established stack: Angular 21.1, PrimeNG 21.1, .NET 10, PostgreSQL
- Avoid framework churn - update for security/critical fixes only

## Technical Standards

### Code Organization

- **File naming**: kebab-case for files (`account-list.component.ts`), PascalCase for classes (`AccountListComponent`)
- **Folder structure**: Feature-based grouping, not technical role grouping
- **Import order**: Angular core → third-party → local imports, alphabetized within groups
- **Component size**: <300 lines per component; extract child components or services if larger
- **Method size**: <50 lines per method; extract helper methods if larger

### Performance Requirements

- **Frontend bundle**: Keep main bundle <500KB gzipped via lazy loading and tree shaking
- **API response time**: <2 seconds for CRUD operations, <5 seconds for complex queries
- **Modal interactions**: <200ms to open/close dialogs
- **Database queries**: Use proper indexes, no N+1 queries, analyze with `EXPLAIN ANALYZE`

### Security Standards

- **Authentication**: JWT-based auth via ASP.NET Core Identity
- **Authorization**: UserId-based filtering on all queries - verify `GetCurrentUserId()` in controllers
- **Data validation**: Validate all inputs server-side, use Data Annotations or FluentValidation
- **SQL injection**: Use parameterized queries (EF Core does this by default)
- **CORS**: Explicit origin allowlist in `Program.cs`, no wildcard in production

## Development Workflow

### Feature Development Process

1. **Specification**: Create feature spec in `specs/[###-feature-name]/spec.md` using `/speckit.specify`
2. **Planning**: Generate plan with `/speckit.plan` including research, data model, contracts, quickstart
3. **Task Breakdown**: Create tasks with `/speckit.tasks` for implementation tracking
4. **Implementation**: Follow tasks sequentially or in parallel per dependencies
5. **Testing**: Unit tests, integration tests, manual validation per quickstart guide
6. **Code Review**: Self-review against `docs/CODE_REVIEW_CHECKLIST.md` before PR
7. **Merge**: Squash or rebase merge to main after CI passes

### Quality Gates (Pre-Merge)

- ✅ All tests passing (`nx affected:test`, `dotnet test`)
- ✅ Linting passing (`nx affected:lint`, `dotnet format --verify-no-changes`)
- ✅ No new build errors (`nx affected:build`)
- ✅ Manual testing completed per feature quickstart guide
- ✅ Code review checklist completed
- ✅ No regressions in existing functionality

### Agent Collaboration

- **Primary Instructions**: `AGENTS.md` at repo root for all agents
- **Frontend Context**: `apps/invenet/AGENT.md` for Angular-specific work
- **Backend Context**: `apps/api/Invenet.Api/AGENT.md` for .NET-specific work
- **Agent Playbook**: `docs/AGENT_PLAYBOOK.md` for best practices and workflows
- Agents MUST consult these files before implementing features to understand project structure and patterns

## Governance

### Constitution Authority

- This constitution supersedes conflicting guidance in README files or inline comments
- When constitution conflicts with existing code, constitution wins - refactor code to comply
- Changes to this constitution require explicit user approval and versioning

### Amendments

- Constitution changes MUST be versioned (MAJOR.MINOR.PATCH)
- Breaking changes (new non-negotiable principles) require MAJOR version bump
- New principles or clarifications require MINOR version bump
- Typos or formatting fixes require PATCH version bump
- All amendments MUST document rationale and affected areas

### Compliance Verification

- Feature specifications MUST include "Constitution Check" section (automated by `/speckit.plan`)
- Code reviews MUST verify no constitution violations
- CI/CD SHOULD eventually include automated constitution checks (future enhancement)

### Exceptions

- Constitution exceptions MUST be documented in feature plan with justification
- Exceptions MUST be time-bound (temporary) or scope-bound (specific feature)
- Systematic exceptions indicate need for constitution amendment, not repeated violations

**Version**: 1.0.0 | **Ratified**: 2026-02-20 | **Last Amended**: 2026-02-20
