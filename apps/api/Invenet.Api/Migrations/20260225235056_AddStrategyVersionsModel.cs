using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Invenet.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStrategyVersionsModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_strategies_user_name_unique",
                schema: "strategies",
                table: "strategies");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                schema: "strategies",
                table: "strategies",
                newName: "IsArchived");

            migrationBuilder.AddColumn<string>(
                name: "DefaultTimeframe",
                schema: "strategies",
                table: "strategies",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Market",
                schema: "strategies",
                table: "strategies",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "strategy_versions",
                schema: "strategies",
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
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_strategy_versions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_strategy_versions_strategies_StrategyId",
                        column: x => x.StrategyId,
                        principalSchema: "strategies",
                        principalTable: "strategies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_strategies_user_name_unique",
                schema: "strategies",
                table: "strategies",
                columns: new[] { "UserId", "Name" },
                unique: true,
                filter: "\"IsArchived\" = FALSE");

            migrationBuilder.CreateIndex(
                name: "ix_strategy_versions_strategy_version_desc",
                schema: "strategies",
                table: "strategy_versions",
                columns: new[] { "StrategyId", "VersionNumber" },
                unique: true,
                descending: new[] { false, true });

            migrationBuilder.Sql(@"
                INSERT INTO strategies.strategy_versions (
                    ""Id"", ""StrategyId"", ""VersionNumber"", ""Timeframe"", ""EntryRules"", ""ExitRules"", ""RiskRules"", ""Notes"", ""CreatedAt"", ""CreatedByUserId""
                )
                SELECT
                    (md5(s.""Id""::text || '-v1'))::uuid,
                    s.""Id"",
                    1,
                    NULL,
                    'Legacy strategy entry rules migrated from pre-versioned model.',
                    'Legacy strategy exit rules migrated from pre-versioned model.',
                    'Legacy strategy risk rules migrated from pre-versioned model.',
                    s.""Description"",
                    s.""CreatedAt"",
                    s.""UserId""
                FROM strategies.strategies s
                WHERE NOT EXISTS (
                    SELECT 1 FROM strategies.strategy_versions sv WHERE sv.""StrategyId"" = s.""Id""
                );
            ");

            migrationBuilder.DropColumn(
                name: "Description",
                schema: "strategies",
                table: "strategies");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "strategy_versions",
                schema: "strategies");

            migrationBuilder.DropIndex(
                name: "ix_strategies_user_name_unique",
                schema: "strategies",
                table: "strategies");

            migrationBuilder.DropColumn(
                name: "DefaultTimeframe",
                schema: "strategies",
                table: "strategies");

            migrationBuilder.DropColumn(
                name: "Market",
                schema: "strategies",
                table: "strategies");

            migrationBuilder.RenameColumn(
                name: "IsArchived",
                schema: "strategies",
                table: "strategies",
                newName: "IsDeleted");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                schema: "strategies",
                table: "strategies",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_strategies_user_name_unique",
                schema: "strategies",
                table: "strategies",
                columns: new[] { "UserId", "Name" },
                unique: true,
                filter: "\"IsDeleted\" = FALSE");
        }
    }
}
