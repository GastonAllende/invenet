# Agent Prompt Pack

This folder contains reusable prompts for AI-driven development in this workspace.

## Files

- `orchestrator.md`
- `frontend-agent.md`
- `backend-agent.md`
- `qa-agent.md`
- `reviewer-agent.md`
- `ci-triage-agent.md`
- `handoff-template.md`
- `meta-router.md`

## Spec-Driven Workflow

- Store specs in `docs/specs`.
- Start each feature from `docs/specs/SPEC_TEMPLATE.md`.
- Require explicit spec approval before implementation.
- Require QA and review checks against acceptance criteria in the spec.

## Suggested Usage Order

1. Start with `meta-router.md` for end-to-end orchestration.
2. Draft or validate a spec in `docs/specs/<feature-name>.md`.
3. If running manually, use `orchestrator.md` first.
4. Delegate implementation to `frontend-agent.md` and/or `backend-agent.md`.
5. Use `qa-agent.md` for acceptance-criteria-aligned tests.
6. Run `reviewer-agent.md` before merge (see `../CODE_REVIEW_CHECKLIST.md` for detailed items).
7. If CI fails, use `ci-triage-agent.md`.
