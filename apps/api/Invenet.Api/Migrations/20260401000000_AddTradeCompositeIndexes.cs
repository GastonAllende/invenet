using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Invenet.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTradeCompositeIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "ix_trades_account_status",
                schema: "trades",
                table: "trades",
                columns: new[] { "AccountId", "Status" });

            migrationBuilder.CreateIndex(
                name: "ix_trades_account_archived",
                schema: "trades",
                table: "trades",
                columns: new[] { "AccountId", "IsArchived" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_trades_account_status",
                schema: "trades",
                table: "trades");

            migrationBuilder.DropIndex(
                name: "ix_trades_account_archived",
                schema: "trades",
                table: "trades");
        }
    }
}
