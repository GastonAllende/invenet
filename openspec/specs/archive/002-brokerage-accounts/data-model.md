# Data Model: Brokerage Account Management

**Feature**: Brokerage Account CRUD  
**Branch**: `002-brokerage-accounts`  
**Date**: 2026-02-19  
**Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

## Purpose

This document defines the data model for the brokerage account management feature, including entities, fields, relationships, constraints, and indexes. This serves as the blueprint for database schema creation and EF Core configuration.

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│  ApplicationUser    │
│  (existing)         │
└──────────┬──────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────┐           ┌──────────────────────────┐
│     Account         │◄──────────┤  AccountRiskSettings     │
│                     │   1:1     │                          │
└─────────────────────┘           └──────────────────────────┘
```

---

## Entities

### 1. Account

**Purpose**: Represents a brokerage account belonging to a user (trader). Contains identifying information, financial baseline, and operational metadata.

#### Fields

| Field             | Type           | Nullable | Default          | Description                                            |
| ----------------- | -------------- | -------- | ---------------- | ------------------------------------------------------ |
| `Id`              | Guid           | No       | Auto             | Primary key (from BaseEntity)                          |
| `UserId`          | Guid           | No       | -                | FK to ApplicationUser (existing ASP.NET Identity user) |
| `Name`            | string(200)    | No       | -                | Account display name (e.g., "IBKR Main", "FTMO 100K")  |
| `Broker`          | string(100)    | No       | -                | Broker/firm name (predefined list or custom)           |
| `AccountType`     | string(20)     | No       | -                | Type: Cash, Margin, Prop, Demo                         |
| `BaseCurrency`    | string(3)      | No       | -                | ISO 4217 code (USD, EUR, SEK, etc.)                    |
| `StartDate`       | DateTimeOffset | No       | -                | When tracking starts (sets baseline)                   |
| `StartingBalance` | decimal(18,2)  | No       | -                | Initial account balance (immutable, must be > 0)       |
| `Timezone`        | string(50)     | No       | Europe/Stockholm | IANA timezone (e.g., Europe/Stockholm, UTC)            |
| `Notes`           | string         | Yes      | null             | Free-text notes (unlimited length)                     |
| `IsActive`        | bool           | No       | true             | Soft archive flag (true = active, false = archived)    |
| `CreatedAt`       | DateTimeOffset | No       | Auto             | Record creation timestamp (from BaseEntity)            |
| `UpdatedAt`       | DateTimeOffset | No       | Auto             | Last update timestamp (from BaseEntity)                |

#### Relationships

```csharp
// Navigation properties
public ApplicationUser User { get; set; } = null!;
public AccountRiskSettings RiskSettings { get; set; } = null!;
```

- **User**: N:1 relationship with ApplicationUser (many accounts per user)
- **RiskSettings**: 1:1 relationship with AccountRiskSettings (cascade delete)

#### Constraints

```csharp
// Validation
- Name: Required, MaxLength(200)
- Broker: Required, MaxLength(100)
- AccountType: Required, OneOf("Cash", "Margin", "Prop", "Demo")
- BaseCurrency: Required, Length(3), ISO 4217 code
- StartDate: Required
- StartingBalance: Required, > 0, Precision(18,2)
- Timezone: Required, MaxLength(50), valid IANA timezone
- Notes: Optional, unlimited length
- IsActive: Required, default = true
```

#### Indexes

```sql
CREATE INDEX ix_accounts_user_active ON accounts (user_id, is_active);
CREATE INDEX ix_accounts_user_created ON accounts (user_id, created_at DESC);
```

**Rationale**:

- `(user_id, is_active)`: Optimizes "show active accounts" query (most common)
- `(user_id, created_at DESC)`: Optimizes "show newest first" query

#### EF Core Configuration

```csharp
public sealed class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable("accounts", schema: "accounts");

        builder.Property(a => a.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.Broker)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.AccountType)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(a => a.BaseCurrency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(a => a.StartingBalance)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(a => a.Timezone)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("Europe/Stockholm");

        builder.Property(a => a.Notes)
            .IsRequired(false);

        builder.Property(a => a.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        // Relationships
        builder.HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.RiskSettings)
            .WithOne(r => r.Account)
            .HasForeignKey<AccountRiskSettings>(r => r.AccountId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(a => new { a.UserId, a.IsActive })
            .HasDatabaseName("ix_accounts_user_active");

        builder.HasIndex(a => new { a.UserId, a.CreatedAt })
            .HasDatabaseName("ix_accounts_user_created");
            .IsDescending(false, true); // CreatedAt DESC
    }
}
```

---

### 2. AccountRiskSettings

**Purpose**: Represents default risk management rules for an account. These are percentage-based guidelines that define the trader's risk tolerance.

#### Fields

| Field              | Type           | Nullable | Default | Description                                            |
| ------------------ | -------------- | -------- | ------- | ------------------------------------------------------ |
| `Id`               | Guid           | No       | Auto    | Primary key (from BaseEntity)                          |
| `AccountId`        | Guid           | No       | -       | FK to Account (unique, 1:1 relationship)               |
| `RiskPerTradePct`  | decimal(5,2)   | No       | 0.00    | Default risk per trade as percentage (0.00-100.00)     |
| `MaxDailyLossPct`  | decimal(5,2)   | No       | 0.00    | Maximum daily loss as percentage (0.00-100.00)         |
| `MaxWeeklyLossPct` | decimal(5,2)   | No       | 0.00    | Maximum weekly loss as percentage (0.00-100.00)        |
| `EnforceLimits`    | bool           | No       | false   | Whether limits are advisory (false) or enforced (true) |
| `CreatedAt`        | DateTimeOffset | No       | Auto    | Record creation timestamp (from BaseEntity)            |
| `UpdatedAt`        | DateTimeOffset | No       | Auto    | Last update timestamp (from BaseEntity)                |

#### Relationships

```csharp
// Navigation properties
public Account Account { get; set; } = null!;
```

- **Account**: 1:1 relationship with Account (cascade delete when account is deleted)

#### Constraints

```csharp
// Validation
- AccountId: Required, Unique (enforces 1:1)
- RiskPerTradePct: Required, Range(0, 100), Precision(5,2)
- MaxDailyLossPct: Required, Range(0, 100), Precision(5,2)
- MaxWeeklyLossPct: Required, Range(0, 100), Precision(5,2)
- EnforceLimits: Required, default = false

// Business rules (informational warnings, not enforced)
- Recommended: MaxDailyLossPct >= RiskPerTradePct
- Recommended: MaxWeeklyLossPct >= MaxDailyLossPct
```

#### Indexes

```sql
CREATE UNIQUE INDEX ix_account_risk_settings_account_id ON account_risk_settings (account_id);
```

**Rationale**: Enforces 1:1 relationship at database level.

#### EF Core Configuration

```csharp
public sealed class AccountRiskSettingsConfiguration : IEntityTypeConfiguration<AccountRiskSettings>
{
    public void Configure(EntityTypeBuilder<AccountRiskSettings> builder)
    {
        builder.ToTable("account_risk_settings", schema: "accounts");

        builder.Property(r => r.RiskPerTradePct)
            .IsRequired()
            .HasColumnType("decimal(5,2)")
            .HasDefaultValue(0.00m);

        builder.Property(r => r.MaxDailyLossPct)
            .IsRequired()
            .HasColumnType("decimal(5,2)")
            .HasDefaultValue(0.00m);

        builder.Property(r => r.MaxWeeklyLossPct)
            .IsRequired()
            .HasColumnType("decimal(5,2)")
            .HasDefaultValue(0.00m);

        builder.Property(r => r.EnforceLimits)
            .IsRequired()
            .HasDefaultValue(false);

        // Unique constraint (enforces 1:1)
        builder.HasIndex(r => r.AccountId)
            .IsUnique()
            .HasDatabaseName("ix_account_risk_settings_account_id");
    }
}
```

---

## Domain Models (C#)

### Account.cs

```csharp
using Invenet.Api.Modules.Shared.Domain;

namespace Invenet.Api.Modules.Accounts.Domain;

/// <summary>
/// Represents a brokerage account belonging to a user.
/// </summary>
public sealed class Account : BaseEntity
{
    public required Guid UserId { get; set; }
    public required string Name { get; set; }
    public required string Broker { get; set; }
    public required string AccountType { get; set; }
    public required string BaseCurrency { get; set; }
    public required DateTimeOffset StartDate { get; set; }
    public required decimal StartingBalance { get; set; }
    public string Timezone { get; set; } = "Europe/Stockholm";
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public AccountRiskSettings RiskSettings { get; set; } = null!;
}
```

### AccountRiskSettings.cs

```csharp
using Invenet.Api.Modules.Shared.Domain;

namespace Invenet.Api.Modules.Accounts.Domain;

/// <summary>
/// Represents default risk management rules for an account.
/// </summary>
public sealed class AccountRiskSettings : BaseEntity
{
    public required Guid AccountId { get; set; }
    public decimal RiskPerTradePct { get; set; } = 0.00m;
    public decimal MaxDailyLossPct { get; set; } = 0.00m;
    public decimal MaxWeeklyLossPct { get; set; } = 0.00m;
    public bool EnforceLimits { get; set; } = false;

    // Navigation properties
    public Account Account { get; set; } = null!;
}
```

---

## TypeScript Models (Frontend)

### account.model.ts

```typescript
/**
 * Brokerage account model
 */
export interface Account {
  id: string;
  userId: string;
  name: string;
  broker: string;
  accountType: 'Cash' | 'Margin' | 'Prop' | 'Demo';
  baseCurrency: string;
  startDate: string; // ISO 8601 date string
  startingBalance: number;
  timezone: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
  riskSettings: AccountRiskSettings;
}

/**
 * Account risk settings model
 */
export interface AccountRiskSettings {
  id: string;
  accountId: string;
  riskPerTradePct: number;
  maxDailyLossPct: number;
  maxWeeklyLossPct: number;
  enforceLimits: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request to create a new account
 */
export interface CreateAccountRequest {
  name: string;
  broker: string;
  accountType: 'Cash' | 'Margin' | 'Prop' | 'Demo';
  baseCurrency: string;
  startDate: string; // ISO 8601 date
  startingBalance: number;
  timezone?: string;
  notes?: string;
  isActive?: boolean;
  riskSettings?: CreateAccountRiskSettingsRequest;
}

/**
 * Risk settings for create request
 */
export interface CreateAccountRiskSettingsRequest {
  riskPerTradePct: number;
  maxDailyLossPct: number;
  maxWeeklyLossPct: number;
  enforceLimits: boolean;
}

/**
 * Request to update an existing account
 */
export interface UpdateAccountRequest {
  name: string;
  broker: string;
  accountType: 'Cash' | 'Margin' | 'Prop' | 'Demo';
  baseCurrency: string;
  timezone?: string;
  notes?: string;
  isActive?: boolean;
  riskSettings?: UpdateAccountRiskSettingsRequest;
}

/**
 * Risk settings for update request
 */
export interface UpdateAccountRiskSettingsRequest {
  riskPerTradePct: number;
  maxDailyLossPct: number;
  maxWeeklyLossPct: number;
  enforceLimits: boolean;
}

/**
 * Response for a single account
 */
export interface GetAccountResponse {
  id: string;
  name: string;
  broker: string;
  accountType: string;
  baseCurrency: string;
  startDate: string;
  startingBalance: number;
  timezone: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  riskSettings: AccountRiskSettingsResponse;
}

/**
 * Risk settings in response
 */
export interface AccountRiskSettingsResponse {
  id: string;
  accountId: string;
  riskPerTradePct: number;
  maxDailyLossPct: number;
  maxWeeklyLossPct: number;
  enforceLimits: boolean;
}

/**
 * Response for listing accounts
 */
export interface ListAccountsResponse {
  accounts: GetAccountResponse[];
  total: number;
}

/**
 * Response after creating an account
 */
export interface CreateAccountResponse {
  id: string;
  name: string;
  broker: string;
  accountType: string;
  baseCurrency: string;
  startDate: string;
  startingBalance: number;
  timezone: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  riskSettings: AccountRiskSettingsResponse;
}

/**
 * Response after updating an account
 */
export interface UpdateAccountResponse {
  id: string;
  name: string;
  broker: string;
  accountType: string;
  baseCurrency: string;
  timezone: string;
  notes: string | null;
  isActive: boolean;
  updatedAt: string;
  riskSettings: AccountRiskSettingsResponse;
}
```

---

## Migration Script (Reference)

**Note**: Actual migration will be generated by EF Core. Table and index names will use lowercase with underscores to match PostgreSQL conventions and the Strategies module pattern.

```csharp
public partial class AddAccountsModule : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.EnsureSchema(
            name: "accounts");

        migrationBuilder.CreateTable(
            name: "accounts",
            schema: "accounts",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                broker = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                account_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                base_currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                starting_balance = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                timezone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Europe/Stockholm"),
                notes = table.Column<string>(type: "text", nullable: true),
                is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_accounts", x => x.id);
                table.ForeignKey(
                    name: "fk_accounts_users_user_id",
                    column: x => x.user_id,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "account_risk_settings",
            schema: "accounts",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                account_id = table.Column<Guid>(type: "uuid", nullable: false),
                risk_per_trade_pct = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                max_daily_loss_pct = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                max_weekly_loss_pct = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                enforce_limits = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_account_risk_settings", x => x.id);
                table.ForeignKey(
                    name: "fk_account_risk_settings_accounts_account_id",
                    column: x => x.account_id,
                    principalSchema: "accounts",
                    principalTable: "accounts",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "ix_accounts_user_created",
            schema: "accounts",
            table: "accounts",
            columns: new[] { "user_id", "created_at" },
            descending: new[] { false, true });

        migrationBuilder.CreateIndex(
            name: "ix_accounts_user_active",
            schema: "accounts",
            table: "accounts",
            columns: new[] { "user_id", "is_active" });

        migrationBuilder.CreateIndex(
            name: "ix_account_risk_settings_account_id",
            schema: "accounts",
            table: "account_risk_settings",
            column: "account_id",
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "account_risk_settings",
            schema: "accounts");

        migrationBuilder.DropTable(
            name: "accounts",
            schema: "accounts");
    }
}
```

---

## Data Validation Rules

### Backend (ASP.NET Core)

```csharp
// In CreateAccountRequest.cs
public record CreateAccountRequest(
    [Required, MaxLength(200)] string Name,
    [Required, MaxLength(100)] string Broker,
    [Required, RegularExpression("^(Cash|Margin|Prop|Demo)$")] string AccountType,
    [Required, MaxLength(3)] string BaseCurrency,
    [Required] DateTimeOffset StartDate,
    [Required, Range(0.01, double.MaxValue)] decimal StartingBalance,
    [MaxLength(50)] string? Timezone,
    string? Notes,
    bool? IsActive,
    RiskSettingsDto? RiskSettings
);

public record RiskSettingsDto(
    [Range(0, 100)] decimal RiskPerTradePct,
    [Range(0, 100)] decimal MaxDailyLossPct,
    [Range(0, 100)] decimal MaxWeeklyLossPct,
    bool EnforceLimits
);
```

### Frontend (Angular Reactive Forms)

```typescript
this.accountForm = this.formBuilder.group({
  name: ['', [Validators.required, Validators.maxLength(200)]],
  broker: ['', [Validators.required, Validators.maxLength(100)]],
  accountType: ['', Validators.required],
  baseCurrency: ['', Validators.required],
  startDate: ['', Validators.required],
  startingBalance: [0, [Validators.required, Validators.min(0.01)]],
  timezone: ['Europe/Stockholm'],
  notes: [''],
  isActive: [true],
  riskSettings: this.formBuilder.group({
    riskPerTradePct: [0, [Validators.min(0), Validators.max(100)]],
    maxDailyLossPct: [0, [Validators.min(0), Validators.max(100)]],
    maxWeeklyLossPct: [0, [Validators.min(0), Validators.max(100)]],
    enforceLimits: [false],
  }),
});
```

---

## Summary

### Tables Created

1. **Accounts**: 11 fields, 2 indexes, FK to ApplicationUser
2. **AccountRiskSettings**: 7 fields, 1 unique index, FK to Account

### Key Decisions

- 1:1 relationship between Account and AccountRiskSettings
- Soft archive via `IsActive` flag (no hard delete)
- `StartingBalance` is immutable (set at creation only)
- Risk percentages are stored as decimals (not integers)
- All timestamps use DateTimeOffset (timezone-aware)
- Cascade delete: deleting Account also deletes RiskSettings

### Technology Alignment

- ✅ Uses existing BaseEntity pattern (Id, CreatedAt, UpdatedAt)
- ✅ FK to existing ApplicationUser (ASP.NET Identity)
- ✅ Follows Strategies module patterns
- ✅ No new database technologies required

---

**Next Steps**: Create API contracts in `contracts/` directory
