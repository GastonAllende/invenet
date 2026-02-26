using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Invenet.Api.Migrations
{
    /// <inheritdoc />
    public partial class RefactorTradeLoggingModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_trades_strategies_StrategyId",
                schema: "trades",
                table: "trades");

            migrationBuilder.RenameColumn(
                name: "StrategyId",
                schema: "trades",
                table: "trades",
                newName: "StrategyVersionId");

            migrationBuilder.RenameColumn(
                name: "PositionSize",
                schema: "trades",
                table: "trades",
                newName: "Quantity");

            migrationBuilder.RenameColumn(
                name: "Date",
                schema: "trades",
                table: "trades",
                newName: "OpenedAt");

            migrationBuilder.RenameIndex(
                name: "ix_trades_strategy_id",
                schema: "trades",
                table: "trades",
                newName: "ix_trades_strategy_version_id");

            migrationBuilder.RenameIndex(
                name: "ix_trades_date",
                schema: "trades",
                table: "trades",
                newName: "ix_trades_opened_at");

            migrationBuilder.RenameIndex(
                name: "ix_trades_account_strategy",
                schema: "trades",
                table: "trades",
                newName: "ix_trades_account_strategy_version");

            migrationBuilder.RenameIndex(
                name: "ix_trades_account_date",
                schema: "trades",
                table: "trades",
                newName: "ix_trades_account_opened_at");

            migrationBuilder.AddColumn<string>(
                name: "Direction",
                schema: "trades",
                table: "trades",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "Long");

            migrationBuilder.Sql(@"
                UPDATE trades.trades
                SET ""Direction"" = CASE WHEN ""Type"" = 'SELL' THEN 'Short' ELSE 'Long' END;
            ");

            migrationBuilder.Sql(@"
                UPDATE trades.trades
                SET ""Status"" = 'Closed'
                WHERE ""Status"" IN ('Win', 'Loss');
            ");

            migrationBuilder.Sql(@"
                UPDATE trades.trades t
                SET ""StrategyVersionId"" = (
                    SELECT sv.""Id""
                    FROM strategies.strategy_versions sv
                    WHERE sv.""StrategyId"" = t.""StrategyVersionId""
                    ORDER BY sv.""VersionNumber"" DESC
                    LIMIT 1
                )
                WHERE t.""StrategyVersionId"" IS NOT NULL;
            ");

            migrationBuilder.DropColumn(
                name: "Commission",
                schema: "trades",
                table: "trades");

            migrationBuilder.DropColumn(
                name: "InvestedAmount",
                schema: "trades",
                table: "trades");

            migrationBuilder.DropColumn(
                name: "ProfitLoss",
                schema: "trades",
                table: "trades");

            migrationBuilder.DropColumn(
                name: "Type",
                schema: "trades",
                table: "trades");

            migrationBuilder.AddColumn<DateTime>(
                name: "ClosedAt",
                schema: "trades",
                table: "trades",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                schema: "trades",
                table: "trades",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                schema: "trades",
                table: "trades",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Pnl",
                schema: "trades",
                table: "trades",
                type: "numeric(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RMultiple",
                schema: "trades",
                table: "trades",
                type: "numeric(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string[]>(
                name: "Tags",
                schema: "trades",
                table: "trades",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_trades_strategy_versions_StrategyVersionId",
                schema: "trades",
                table: "trades",
                column: "StrategyVersionId",
                principalSchema: "strategies",
                principalTable: "strategy_versions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_trades_strategy_versions_StrategyVersionId",
                schema: "trades",
                table: "trades");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                schema: "trades",
                table: "trades",
                type: "character varying(4)",
                maxLength: 4,
                nullable: false,
                defaultValue: "BUY");

            migrationBuilder.Sql(@"
                UPDATE trades.trades
                SET ""Type"" = CASE WHEN ""Direction"" = 'Short' THEN 'SELL' ELSE 'BUY' END;
            ");

            migrationBuilder.Sql(@"
                UPDATE trades.trades t
                SET ""StrategyVersionId"" = sv.""StrategyId""
                FROM strategies.strategy_versions sv
                WHERE t.""StrategyVersionId"" = sv.""Id"";
            ");

            migrationBuilder.Sql(@"
                UPDATE trades.trades
                SET ""Status"" = 'Win'
                WHERE ""Status"" = 'Closed';
            ");

            migrationBuilder.DropColumn(
                name: "ClosedAt",
                schema: "trades",
                table: "trades");

            migrationBuilder.DropColumn(
                name: "Direction",
                schema: "trades",
                table: "trades");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                schema: "trades",
                table: "trades");

            migrationBuilder.DropColumn(
                name: "Notes",
                schema: "trades",
                table: "trades");

            migrationBuilder.DropColumn(
                name: "Pnl",
                schema: "trades",
                table: "trades");

            migrationBuilder.DropColumn(
                name: "RMultiple",
                schema: "trades",
                table: "trades");

            migrationBuilder.DropColumn(
                name: "Tags",
                schema: "trades",
                table: "trades");

            migrationBuilder.RenameColumn(
                name: "StrategyVersionId",
                schema: "trades",
                table: "trades",
                newName: "StrategyId");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                schema: "trades",
                table: "trades",
                newName: "PositionSize");

            migrationBuilder.RenameColumn(
                name: "OpenedAt",
                schema: "trades",
                table: "trades",
                newName: "Date");

            migrationBuilder.RenameIndex(
                name: "ix_trades_strategy_version_id",
                schema: "trades",
                table: "trades",
                newName: "ix_trades_strategy_id");

            migrationBuilder.RenameIndex(
                name: "ix_trades_opened_at",
                schema: "trades",
                table: "trades",
                newName: "ix_trades_date");

            migrationBuilder.RenameIndex(
                name: "ix_trades_account_strategy_version",
                schema: "trades",
                table: "trades",
                newName: "ix_trades_account_strategy");

            migrationBuilder.RenameIndex(
                name: "ix_trades_account_opened_at",
                schema: "trades",
                table: "trades",
                newName: "ix_trades_account_date");

            migrationBuilder.AddColumn<decimal>(
                name: "Commission",
                schema: "trades",
                table: "trades",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "InvestedAmount",
                schema: "trades",
                table: "trades",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ProfitLoss",
                schema: "trades",
                table: "trades",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddForeignKey(
                name: "FK_trades_strategies_StrategyId",
                schema: "trades",
                table: "trades",
                column: "StrategyId",
                principalSchema: "strategies",
                principalTable: "strategies",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
