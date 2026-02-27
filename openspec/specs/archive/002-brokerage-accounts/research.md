# Research: Brokerage Account Management (MVP)

**Feature**: Brokerage Account CRUD  
**Branch**: `002-brokerage-accounts`  
**Date**: 2026-02-19  
**Plan**: [plan.md](./plan.md)

## Purpose

This document captures technology decisions, best practices research, and alternatives considered for implementing the brokerage account management feature. All NEEDS CLARIFICATION items from the Technical Context have been resolved.

---

## Research Areas

### 1. Database Schema Design

**Question**: How should we model the 1:1 relationship between Account and AccountRiskSettings?

**Research Findings**:

- **Option A**: Single table with nullable risk columns
  - Pros: Simpler queries, fewer joins
  - Cons: Violates normalization, nullable columns in Account table
- **Option B**: Separate tables with 1:1 relationship (CHOSEN)
  - Pros: Clear separation of concerns, better normalization, future-proof if risk settings become more complex
  - Cons: Requires join for every account query

**Decision**: **Option B - Separate tables**

**Rationale**:

- Risk settings are a distinct concept that may evolve independently
- EF Core handles 1:1 relationships efficiently
- Mirrors the separation in the spec (two distinct entities)
- Better for future extensibility (e.g., adding risk history, multiple risk profiles)

**Implementation Details**:

- AccountRiskSettings has FK to Account with cascade delete
- Unique constraint on account_id ensures 1:1
- Always eager-load risk settings with accounts (`.Include(a => a.RiskSettings)`)

---

### 2. PostgreSQL Decimal Precision

**Question**: What precision should we use for monetary values and percentages?

**Research Findings**:

- **Monetary values (starting_balance)**:
  - Use `decimal(18,2)` for currency amounts
  - Supports values up to 9,999,999,999,999,999.99
  - Standard precision for financial applications
- **Percentage values (risk settings)**:
  - Use `decimal(5,2)` for percentages (0.00 - 100.00)
  - Allows 2 decimal precision (e.g., 1.50% for risk per trade)
  - Range: 0.00 to 999.99 (validates to 0-100 in application layer)

**Decision**:

- `decimal(18,2)` for starting_balance
- `decimal(5,2)` for all percentage fields

**Rationale**: Industry standard precision, prevents rounding errors, matches existing database patterns in the project.

---

### 3. Index Strategy

**Question**: What indexes are needed for optimal query performance?

**Research Findings**:

| Index | Columns                    | Purpose                | Justification             |
| ----- | -------------------------- | ---------------------- | ------------------------- |
| PK    | id                         | Unique identifier      | Default EF Core           |
| IDX_1 | (user_id, is_active)       | Filter active accounts | Most common query pattern |
| IDX_2 | (user_id, created_at DESC) | Chronological listing  | Secondary listing option  |

**Decision**: Create both composite indexes (IDX_1 and IDX_2)

**Rationale**:

- `(user_id, is_active)`: Supports "show me my active accounts" - the primary use case
- `(user_id, created_at DESC)`: Supports "show newest first" without full table scan
- No single-column index on user_id needed (covered by composites)
- No index on name (not used for filtering in MVP)

**Performance Impact**: With 20 accounts per user (MVP scope), indexes provide minimal overhead with significant query speedup.

---

### 4. EF Core Configuration Patterns

**Question**: Should we follow the Strategy team's patterns orestablish new ones?

**Research Findings**:

From reviewing `apps/Invenet.Api/Modules/Strategies/`:

- Entity configuration in `Infrastructure/Data/` folder
- Separate `Configuration.cs` file per entity
- Implements `IEntityTypeConfiguration<T>`
- Uses Fluent API for relationships, constraints, indexes

**Decision**: **Mirror the Strategies module patterns exactly**

**Rationale**:

- Consistency across codebase
- Proven pattern (working in production)
- Easier for developers to navigate between modules
- No need to invent new patterns

**Key Patterns to Follow**:

```csharp
// Account.cs in Domain/
public sealed class Account : BaseEntity
public sealed class AccountRiskSettings : BaseEntity

// AccountConfiguration.cs in Infrastructure/Data/
public sealed class AccountConfiguration : IEntityTypeConfiguration<Account>
public sealed class AccountRiskSettingsConfiguration : IEntityTypeConfiguration<AccountRiskSettings>

// Features/ folder structure
Features/CreateAccount/CreateAccountRequest.cs
Features/CreateAccount/CreateAccountResponse.cs
```

---

### 5. Frontend State Management

**Question**: How should we structure the NgRx SignalStore for accounts?

**Research Findings**:

From reviewing `libs/strategies/src/lib/strategies/data-access/strategies.store.ts`:

- Uses `withEntities<T>()` for entity management
- Uses `rxMethod` for async operations
- Computed signals for derived state (e.g., `activeAccounts`, `archivedAccounts`)
- Error handling with `catch Error` in rxMethod
- Auto-loads entities on init with `withHooks`

**Decision**: **Mirror the strategies store pattern**

**Rationale**:

- Same state management needs (CRUD + list + filter)
- Proven pattern with good performance
- Developers already familiar with the pattern

**Store Structure**:

```typescript
export const AccountsStore = signalStore(
  { providedIn: 'root' },
  withState({ isLoading: false, error: null, selectedAccountId: null }),
  withEntities<GetAccountResponse>(),
  withComputed(({ entities, selectedAccountId }) => ({
    selectedAccount: computed(() => ...),
    activeAccounts: computed(() => entities().filter(a => a.isActive)),
    archivedAccounts: computed(() => entities().filter(a => !a.isActive)),
  })),
  withMethods((store, apiService) => ({
    loadAccounts: rxMethod(...),
    createAccount: rxMethod(...),
    updateAccount: rxMethod(...),
    archiveAccount: rxMethod(...),
  })),
  withHooks({ onInit: (store) => store.loadAccounts(...) })
);
```

---

### 6. API Design - Nested vs Separate Resources

**Question**: Should risk settings be a separate REST resource or nested?

**Options Compared**:

**Option A: Nested** (CHOSEN)

```
POST /api/accounts { account + riskSettings }
PUT  /api/accounts/{id} { account + riskSettings }
GET  /api/accounts/{id} → returns account with riskSettings embedded
```

**Option B: Separate Resources**

```
POST /api/accounts
POST /api/accounts/{id}/risk-settings
PUT  /api/accounts/{id}/risk-settings
```

**Decision**: **Option A - Nested/Embedded**

**Rationale**:

- 1:1 relationship means they're always created/updated together
- Simpler client code (single API call)
- Matches user mental model (account + its settings)
- Risk settings have no independent lifecycle
- Fewer API calls = better performance

**DTO Structure**:

```csharp
public record CreateAccountRequest(
    string Name,
    string Broker,
    string AccountType,
    string BaseCurrency,
    DateTimeOffset StartDate,
    decimal StartingBalance,
    string? Timezone,
    string? Notes,
    bool? IsActive,
    RiskSettingsDto? RiskSettings  // Embedded
);

public record RiskSettingsDto(
    decimal RiskPerTradePct,
    decimal MaxDailyLossPct,
    decimal MaxWeeklyLossPct,
    bool EnforceLimits
);
```

---

### 7. Broker List - Predefined vs Free Text

**Question**: Should broker selection be a fixed dropdown or allow custom entry?

**Research Findings**:

- Most common brokers: Interactive Brokers (IBKR), TD Ameritrade, Schwab, Fidelity, FTMO, Topstep, Apex, Earn2Trade
- Proprietary firms vary widely (100+ firms)
- Users may have niche or regional brokers

**Decision**: **Predefined list + "Other" option with free text**

**Rationale**:

- Guided input for 90% of users (common brokers)
- Flexibility for edge cases (proprietary/regional firms)
- Validates common inputs while allowing customization
- Data quality: consistent naming for common brokers

**Implementation**:

```typescript
const COMMON_BROKERS = ['Interactive Brokers (IBKR)', 'TD Ameritrade', 'Charles Schwab', 'Fidelity', 'FTMO', 'Topstep', 'Apex Trader Funding', 'Earn2Trade', 'Other'];

// When "Other" selected, show text input for custom broker name
```

---

### 8. Timezone Selection

**Question**: Full timezone list or common subset?

**Research Findings**:

- IANA timezone database has 500+ zones
- Most traders operate in: Europe (Stockholm, London), US (Eastern, Central, Pacific), Asia (Tokyo, Singapore, Hong Kong)
- Spec defaults to Europe/Stockholm (Swedish trader focus)

**Decision**: **Common timezones list (15-20 zones)**

**Rationale**:

- MVP scope - avoid choice overload
- Can expand list based on user feedback
- Covers 95% of use cases
- Easier UX than searching 500+ options

**Recommended List**:

```typescript
const COMMON_TIMEZONES = [
  { value: 'Europe/Stockholm', label: 'Europe/Stockholm (CET/CEST)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New York (Eastern)' },
  { value: 'America/Chicago', label: 'America/Chicago (Central)' },
  { value: 'America/Los_Angeles', label: 'America/Los Angeles (Pacific)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong Kong (HKT)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEDT/AEST)' },
];
```

---

### 9. Form Validation - Real-time vs On-Submit

**Question**: When should risk percentage warnings appear?

**Options**:

- **Option A**: Real-time (as user types/changes)
- **Option B**: On blur (when leaving field)
- **Option C**: On submit only

**Decision**: **Option A - Real-time with debounce**

**Rationale**:

- Immediate feedback improves UX
- 300ms debounce prevents flickering
- Warnings are informational (non-blocking)
- Follows modern form UX patterns (PrimeNG supports this)

**Implementation**:

```typescript
// In component
private checkRiskLogic() {
  const risk = this.form.value.riskPerTradePct;
  const daily = this.form.value.maxDailyLossPct;
  const weekly = this.form.value.maxWeeklyLossPct;

  if (risk > daily) {
    this.warnings.push('Risk per trade should be ≤ max daily loss');
  }
  if (daily > weekly) {
    this.warnings.push('Max daily loss should be ≤ max weekly loss');
  }
}

// Debounced via RxJS
this.form.valueChanges
  .pipe(debounceTime(300))
  .subscribe(() => this.checkRiskLogic());
```

---

### 10. Currency List

**Question**: Which currencies to support in MVP?

**Research Findings**:

- Spec requires minimum: USD, EUR, SEK
- Common trading currencies: USD, EUR, GBP, JPY, CHF, CAD, AUD
- Cryptocurrency not in scope for MVP

**Decision**: **Support 10 major fiat currencies**

**Rationale**:

- Covers 95%+ of retail/prop traders
- Keeps dropdown manageable
- Can expand based on demand

**Recommended List**:

```typescript
const BASE_CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
];
```

---

## Summary of Decisions

| Topic                   | Decision                                            | Rationale                                             |
| ----------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| **Data Model**          | Separate Account + AccountRiskSettings tables (1:1) | Normalization, future extensibility, clear separation |
| **Decimal Precision**   | decimal(18,2) for money, decimal(5,2) for %         | Industry standard, prevents rounding errors           |
| **Indexes**             | (user_id, is_active), (user_id, created_at DESC)    | Optimizes primary query patterns                      |
| **EF Core Pattern**     | Mirror Strategies module exactly                    | Consistency, proven patterns                          |
| **State Management**    | NgRx SignalStore with entities + computed signals   | Same as Strategies, proven performance                |
| **API Design**          | Nested/embedded risk settings in account endpoints  | 1:1 relationship, simpler client code                 |
| **Broker Input**        | Predefined list + "Other" with free text            | 90% guided, 10% flexible                              |
| **Timezone**            | 12 common timezones                                 | MVP scope, covers 95% of users                        |
| **Validation Feedback** | Real-time warnings (debounced 300ms)                | Modern UX, immediate feedback                         |
| **Currencies**          | 10 major fiat currencies (USD, EUR, SEK, etc.)      | Covers 95%+ of traders                                |

---

## Alternatives Considered & Rejected

### 1. Single Table for Account + Risk Settings

**Rejected**: Would violate normalization and make future schema changes harder. The separate table approach gives us flexibility.

### 2. Separate API Resource for Risk Settings

**Rejected**: Creates unnecessary complexity. The 1:1 relationship means they should be managed together.

### 3. Full IANA Timezone List (500+ zones)

**Rejected**: Choice overload for MVP. We can add more timezones based on user feedback without schema changes.

### 4. Free-text Broker Field

**Rejected**: Would lead to data quality issues (inconsistent naming). The hybrid approach (dropdown + Other) balances usability and data quality.

### 5. Validation Only on Submit

**Rejected**: Modern UX expects real-time feedback. Our warnings are informational (non-blocking), so real-time display improves UX without frustrating users.

---

## Dependencies & Prerequisites

**Backend**:

- ✅ PostgreSQL running and accessible
- ✅ EF Core migrations tooling installed (`dotnet tool restore`)
- ✅ ASP.NET Core Identity authentication (existing)
- ✅ ModularDbContext configured (existing)

**Frontend**:

- ✅ Angular 21.1 installed
- ✅ PrimeNG 21.1.1 available
- ✅ NgRx SignalStore available (`@ngrx/signals`)
- ✅ RxJS for reactive forms
- ✅ Nx workspace structure (existing)

**No new dependencies required** - all technology choices use existing stack.

---

## Best Practices to Follow

1. **Backend**:
   - Use record types for DTOs (immutable)
   - Use required properties with init accessors
   - Validate at controller level (model validation attributes)
   - Return appropriate HTTP status codes (200/201/400/401/404)
   - Use async/await for all database operations
   - Include timestamps (created_at, updated_at) via BaseEntity

2. **Frontend**:
   - Use reactive forms with typed FormGroup
   - Implement OnPush change detection
   - Use PrimeNG components (p-inputText, p-dropdown, p-calendar, etc.)
   - Debounce user input (300ms)
   - Show loading states during API calls
   - Handle errors gracefully with toast messages
   - Use standalone components (Angular 21 standard)

3. **Testing**:
   - Backend: Unit test controller methods, validation logic
   - Frontend: Component tests for form validation, store tests for state management
   - E2E: Full CRUD flow (create → list → edit → archive)

---

## Risks & Mitigations

| Risk                                | Impact | Mitigation                                                                  |
| ----------------------------------- | ------ | --------------------------------------------------------------------------- |
| User enters invalid percentages     | Medium | Client + server validation, clear error messages                            |
| 1:1 relationship not enforced       | High   | Unique constraint on account_id, enforce in EF Core config                  |
| Archive instead of delete confusion | Low    | Clear UI labels ("Archive" not "Delete"), reversible operation              |
| Decimal precision mismatch          | Medium | Use decimal(18,2) and decimal(5,2) consistently, validate ranges            |
| Timezone confusion                  | Low    | Clear labels in dropdown (zone + abbreviation), default to Europe/Stockholm |

---

## Next Steps

1. ✅ Phase 0 complete - All research questions answered
2. → Phase 1: Create data-model.md with detailed entity specifications
3. → Phase 1: Create contracts/AccountsOpenAPI.yaml with API specification
4. → Phase 1: Create quickstart.md with developer setup guide
5. → Phase 1: Update agent context files
6. → Phase 2: Run `/speckit.tasks` to generate implementation tasks
