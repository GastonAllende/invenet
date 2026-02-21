# Implementation Plan: Accounts UI Refactoring - Modal Pattern Alignment + Delete

**Branch**: `003-align-accounts-design` | **Date**: 2026-02-20 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/003-align-accounts-design/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Refactor the accounts page UI to align with the strategies page design pattern by moving create/edit forms from inline display to modal dialogs, repositioning the "New Account" button into the list component header, and adding delete functionality with confirmation dialog. This creates a consistent user experience across account and strategy management pages while maintaining all existing functionality.

## Technical Context

**Language/Version**: TypeScript 5.x / Angular 21.1.0, C# / .NET 10  
**Primary Dependencies**: Angular 21.1, PrimeNG 21.1.1, @ngrx/signals 21.0.1, ASP.NET Core, Entity Framework Core  
**Storage**: PostgreSQL (backend persistence for accounts)  
**Testing**: Vitest (frontend unit tests), XUnit (.NET backend tests), Playwright (E2E tests)  
**Target Platform**: Web application (browser-based SPA)  
**Project Type**: Web (Angular frontend + .NET backend monorepo via Nx)  
**Performance Goals**: Modal open/close <200ms, form submission <2s, seamless list updates  
**Constraints**: Zero regression on existing account functionality, maintain PrimeNG accessibility standards  
**Scale/Scope**: Small-scale UI refactoring (~5 components affected), 1 new backend endpoint (DELETE)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Status**: ✅ PASS

Validated against `.specify/memory/constitution.md` (Version 1.0.0, ratified 2026-02-20):

- ✅ **I. Nx Monorepo Architecture**: Feature follows existing library structure in `libs/accounts/`, no circular dependencies, no cross-library violations
- ✅ **II. Angular & Frontend Standards**: Uses standalone components, signal-based reactivity (NgRx SignalStore), PrimeNG components, smart/dumb pattern
- ✅ **III. Backend Modular Monolith**: New DELETE endpoint follows feature-based structure in `apps/api/Invenet.Api/Modules/Accounts/Features/DeleteAccount/`
- ✅ **IV. Zero Accessibility Overhead**: No accessibility features added - leverages PrimeNG defaults only
- ✅ **V. Testing & Quality Gates**: Test plan included in tasks (T052-T061), linting verification tasks present
- ✅ **VI. Pattern Consistency**: Explicitly follows established strategies page modal pattern for UI consistency
- ✅ **VII. Minimal Dependencies**: Zero new dependencies - uses existing Angular 21.1, PrimeNG 21.1, .NET 10 stack

**No violations identified**. This is a straightforward UI refactoring following existing patterns and established constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/003-align-accounts-design/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
├── checklists/          # Quality validation checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Frontend: Nx workspace library structure
libs/accounts/
├── src/
│   ├── index.ts
│   ├── data-access/
│   │   └── src/lib/
│   │       ├── models/account.model.ts
│   │       ├── services/accounts-api.service.ts
│   │       └── store/accounts.store.ts
│   └── lib/
│       ├── accounts/
│       │   └── accounts-shell/         # MODIFY: Add modal state, p-dialog, p-confirmDialog
│       │       ├── accounts-shell.component.ts
│       │       ├── accounts-shell.component.html
│       │       └── accounts-shell.component.css
│       └── ui/
│           ├── account-form/           # REUSE: Form works in modal unchanged
│           │   ├── account-form.component.ts
│           │   ├── account-form.component.html
│           │   └── account-form.component.css
│           └── account-list/           # MODIFY: Add create event, delete button
│               ├── account-list.component.ts
│               ├── account-list.component.html
│               └── account-list.component.css
└── tests/
    └── (existing Vitest test files)

# Backend: Modular monolith structure
apps/api/Invenet.Api/Modules/Accounts/
├── API/
│   └── AccountsController.cs          # ADD: DELETE endpoint
├── Features/
│   └── DeleteAccount/                 # NEW: Delete feature folder
│       ├── DeleteAccountHandler.cs    # Business logic for deletion
│       └── DeleteAccountResponse.cs   # Response DTO
├── Domain/
│   └── Account.cs                     # UNCHANGED: Existing entity
└── Infrastructure/
    └── Data/                          # UNCHANGED: EF configuration
```

**Structure Decision**: This is a web application with Angular frontend in Nx workspace libraries and ASP.NET Core backend following modular monolith architecture. The feature modifies existing `libs/accounts` library components and adds one new backend feature (DeleteAccount) following the established feature-based folder structure in the Accounts module.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
