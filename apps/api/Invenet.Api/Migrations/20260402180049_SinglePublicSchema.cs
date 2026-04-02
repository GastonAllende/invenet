using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Invenet.Api.Migrations
{
    /// <inheritdoc />
    public partial class SinglePublicSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "trades",
                schema: "trades",
                newName: "trades",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "strategy_versions",
                schema: "strategies",
                newName: "strategy_versions",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "strategies",
                schema: "strategies",
                newName: "strategies",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "RefreshTokens",
                schema: "auth",
                newName: "RefreshTokens",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "accounts",
                schema: "accounts",
                newName: "accounts",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "account_risk_settings",
                schema: "accounts",
                newName: "account_risk_settings",
                newSchema: "public");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "accounts");

            migrationBuilder.EnsureSchema(
                name: "auth");

            migrationBuilder.EnsureSchema(
                name: "strategies");

            migrationBuilder.EnsureSchema(
                name: "trades");

            migrationBuilder.RenameTable(
                name: "trades",
                newName: "trades",
                newSchema: "trades");

            migrationBuilder.RenameTable(
                name: "strategy_versions",
                newName: "strategy_versions",
                newSchema: "strategies");

            migrationBuilder.RenameTable(
                name: "strategies",
                newName: "strategies",
                newSchema: "strategies");

            migrationBuilder.RenameTable(
                name: "RefreshTokens",
                newName: "RefreshTokens",
                newSchema: "auth");

            migrationBuilder.RenameTable(
                name: "accounts",
                newName: "accounts",
                newSchema: "accounts");

            migrationBuilder.RenameTable(
                name: "account_risk_settings",
                newName: "account_risk_settings",
                newSchema: "accounts");
        }
    }
}
