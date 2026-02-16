# Feature Specifications

This directory contains feature specifications for the Invenet project.

## Spec-First Workflow

All new features **must** follow this workflow:

### Phase 0: Spec Gate (Required)

1. **Create Spec**: Copy `SPEC_TEMPLATE.md` to `<feature-name>.md`
2. **Fill Required Sections**:
   - Problem, Goals, Non-goals
   - User/API Behavior
   - Technical Design
   - Affected Projects/Files
   - Numbered Acceptance Criteria
   - Test Plan
   - Risks/Rollback (for backend/data changes)
3. **Get Approval**: Pause implementation until spec is reviewed and approved
4. **Use as Single Source of Truth**: All implementation decisions reference the spec

### Implementation

- QA validates against acceptance criteria
- Reviewer checks spec compliance + code quality
- No implementation without approved spec

## Spec Files

| Spec                                 | Status         | Description                         |
| ------------------------------------ | -------------- | ----------------------------------- |
| [trades-table.md](./trades-table.md) | ✅ Implemented | Trade history table with pagination |

## Why Spec-First?

- **Clarity**: Everyone understands what's being built before coding starts
- **Scope Control**: Prevents feature creep and scope drift
- **Better Testing**: Acceptance criteria map directly to test cases
- **Faster Reviews**: Reviewers validate against documented expectations
- **Alignment**: Reduces back-and-forth during implementation
- **Documentation**: Self-documenting codebase with clear decisions

## Template Structure

Each spec follows this structure:

1. **Problem**: What are we solving?
2. **Goals**: What success looks like
3. **Non-goals**: What we're explicitly not doing
4. **User/API Behavior**: Expected functionality and error states
5. **Technical Design**: Frontend, backend, data changes
6. **Affected Projects/Files**: Change scope
7. **Acceptance Criteria**: Numbered, testable requirements
8. **Test Plan**: Unit, integration, E2E coverage
9. **Risks**: Known issues and mitigations
10. **Rollback Plan**: How to revert if needed

## Tips for Writing Good Specs

### DO

✅ Be specific and concrete  
✅ Include visual examples or mockups when helpful  
✅ List all affected files  
✅ Make acceptance criteria testable and numbered  
✅ Consider error states and edge cases  
✅ Document non-goals to prevent scope creep  
✅ Keep specs updated if design changes during implementation

### DON'T

❌ Skip the spec gate for "small" changes  
❌ Write implementation code in the spec  
❌ Make acceptance criteria vague ("works well", "looks good")  
❌ Ignore rollback planning for data/API changes  
❌ Start coding before spec approval  
❌ Let specs become outdated after implementation

## Examples

See [trades-table.md](./trades-table.md) for a complete, real-world example.

## Questions?

Refer to [meta-router.md](../agent-prompts/meta-router.md) for the full spec gate workflow.
