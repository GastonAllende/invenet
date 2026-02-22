using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Invenet.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStrategyUserForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "FK_strategies_AspNetUsers_UserId",
                schema: "strategies",
                table: "strategies",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_strategies_AspNetUsers_UserId",
                schema: "strategies",
                table: "strategies");
        }
    }
}
