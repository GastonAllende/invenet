using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Invenet.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixSchemaMove : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // The SinglePublicSchema migration called RenameTable without newSchema,
            // so tables were only renamed in-place and never moved to the public schema.
            // These ALTER TABLE ... SET SCHEMA statements do the actual move.
            migrationBuilder.Sql(@"ALTER TABLE auth.""RefreshTokens"" SET SCHEMA public;");
            migrationBuilder.Sql(@"ALTER TABLE accounts.accounts SET SCHEMA public;");
            migrationBuilder.Sql(@"ALTER TABLE accounts.account_risk_settings SET SCHEMA public;");
            migrationBuilder.Sql(@"ALTER TABLE strategies.strategies SET SCHEMA public;");
            migrationBuilder.Sql(@"ALTER TABLE strategies.strategy_versions SET SCHEMA public;");
            migrationBuilder.Sql(@"ALTER TABLE trades.trades SET SCHEMA public;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema("auth");
            migrationBuilder.EnsureSchema("accounts");
            migrationBuilder.EnsureSchema("strategies");
            migrationBuilder.EnsureSchema("trades");

            migrationBuilder.Sql(@"ALTER TABLE public.""RefreshTokens"" SET SCHEMA auth;");
            migrationBuilder.Sql(@"ALTER TABLE public.accounts SET SCHEMA accounts;");
            migrationBuilder.Sql(@"ALTER TABLE public.account_risk_settings SET SCHEMA accounts;");
            migrationBuilder.Sql(@"ALTER TABLE public.strategies SET SCHEMA strategies;");
            migrationBuilder.Sql(@"ALTER TABLE public.strategy_versions SET SCHEMA strategies;");
            migrationBuilder.Sql(@"ALTER TABLE public.trades SET SCHEMA trades;");
        }
    }
}
