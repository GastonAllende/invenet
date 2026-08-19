using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Invenet.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "accounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Broker = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AccountType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    BaseCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    StartDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    StartingBalance = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Timezone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Europe/Stockholm"),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_accounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "strategies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Market = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DefaultTimeframe = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_strategies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "account_risk_settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AccountId = table.Column<Guid>(type: "uuid", nullable: false),
                    RiskPerTradePct = table.Column<decimal>(type: "numeric(5,2)", nullable: false, defaultValue: 0.00m),
                    MaxDailyLossPct = table.Column<decimal>(type: "numeric(5,2)", nullable: false, defaultValue: 0.00m),
                    MaxWeeklyLossPct = table.Column<decimal>(type: "numeric(5,2)", nullable: false, defaultValue: 0.00m),
                    EnforceLimits = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_account_risk_settings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_account_risk_settings_accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "strategy_versions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StrategyId = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    Timeframe = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    EntryRules = table.Column<string>(type: "text", nullable: false),
                    ExitRules = table.Column<string>(type: "text", nullable: false),
                    RiskRules = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_strategy_versions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_strategy_versions_strategies_StrategyId",
                        column: x => x.StrategyId,
                        principalTable: "strategies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "trades",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AccountId = table.Column<Guid>(type: "uuid", nullable: false),
                    StrategyVersionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Direction = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    OpenedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ClosedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Symbol = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EntryPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ExitPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    Pnl = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    RMultiple = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    Tags = table.Column<string[]>(type: "text[]", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    Status = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trades", x => x.Id);
                    table.ForeignKey(
                        name: "FK_trades_strategy_versions_StrategyVersionId",
                        column: x => x.StrategyVersionId,
                        principalTable: "strategy_versions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "ix_account_risk_settings_account_id",
                table: "account_risk_settings",
                column: "AccountId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_accounts_user_active",
                table: "accounts",
                columns: new[] { "UserId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "ix_accounts_user_created",
                table: "accounts",
                columns: new[] { "UserId", "CreatedAt" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "ix_strategies_user_active",
                table: "strategies",
                columns: new[] { "UserId", "IsArchived" });

            migrationBuilder.CreateIndex(
                name: "ix_strategies_user_id",
                table: "strategies",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "ix_strategies_user_name_unique",
                table: "strategies",
                columns: new[] { "UserId", "Name" },
                unique: true,
                filter: "\"IsArchived\" = FALSE");

            migrationBuilder.CreateIndex(
                name: "ix_strategy_versions_strategy_version_desc",
                table: "strategy_versions",
                columns: new[] { "StrategyId", "VersionNumber" },
                unique: true,
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "ix_trades_account_archived",
                table: "trades",
                columns: new[] { "AccountId", "IsArchived" });

            migrationBuilder.CreateIndex(
                name: "ix_trades_account_id",
                table: "trades",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "ix_trades_account_opened_at",
                table: "trades",
                columns: new[] { "AccountId", "OpenedAt" });

            migrationBuilder.CreateIndex(
                name: "ix_trades_account_status",
                table: "trades",
                columns: new[] { "AccountId", "Status" });

            migrationBuilder.CreateIndex(
                name: "ix_trades_account_strategy_version",
                table: "trades",
                columns: new[] { "AccountId", "StrategyVersionId" });

            migrationBuilder.CreateIndex(
                name: "ix_trades_opened_at",
                table: "trades",
                column: "OpenedAt");

            migrationBuilder.CreateIndex(
                name: "ix_trades_strategy_version_id",
                table: "trades",
                column: "StrategyVersionId");

            // App-owned tables reference Supabase Auth's auth.users directly.
            // EF doesn't model auth.users, so these FKs are added via raw SQL.
            migrationBuilder.Sql(
                "ALTER TABLE accounts ADD CONSTRAINT \"FK_accounts_auth_users_UserId\" " +
                "FOREIGN KEY (\"UserId\") REFERENCES auth.users(id) ON DELETE CASCADE;");

            migrationBuilder.Sql(
                "ALTER TABLE strategies ADD CONSTRAINT \"FK_strategies_auth_users_UserId\" " +
                "FOREIGN KEY (\"UserId\") REFERENCES auth.users(id) ON DELETE CASCADE;");

            // Block the anon/authenticated Postgres roles (used by Supabase's auto-generated
            // Data API) from touching these tables entirely. No policies are added on purpose —
            // all access to app data goes through the .NET API, whose Postgres connection owns
            // these tables and therefore bypasses RLS regardless.
            migrationBuilder.Sql("ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE account_risk_settings ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE strategy_versions ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE trades ENABLE ROW LEVEL SECURITY;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "ALTER TABLE accounts DROP CONSTRAINT \"FK_accounts_auth_users_UserId\";");

            migrationBuilder.Sql(
                "ALTER TABLE strategies DROP CONSTRAINT \"FK_strategies_auth_users_UserId\";");

            migrationBuilder.DropTable(
                name: "account_risk_settings");

            migrationBuilder.DropTable(
                name: "trades");

            migrationBuilder.DropTable(
                name: "accounts");

            migrationBuilder.DropTable(
                name: "strategy_versions");

            migrationBuilder.DropTable(
                name: "strategies");
        }
    }
}
