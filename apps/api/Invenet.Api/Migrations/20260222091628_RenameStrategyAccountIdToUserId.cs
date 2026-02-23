using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Invenet.Api.Migrations
{
  /// <inheritdoc />
  public partial class RenameStrategyAccountIdToUserId : Migration
  {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.RenameColumn(
          name: "AccountId",
          schema: "strategies",
          table: "strategies",
          newName: "UserId");

      migrationBuilder.RenameIndex(
          name: "ix_strategies_account_name_unique",
          schema: "strategies",
          table: "strategies",
          newName: "ix_strategies_user_name_unique");

      migrationBuilder.RenameIndex(
          name: "ix_strategies_account_id",
          schema: "strategies",
          table: "strategies",
          newName: "ix_strategies_user_id");

      migrationBuilder.RenameIndex(
          name: "ix_strategies_account_active",
          schema: "strategies",
          table: "strategies",
          newName: "ix_strategies_user_active");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.RenameColumn(
          name: "UserId",
          schema: "strategies",
          table: "strategies",
          newName: "AccountId");

      migrationBuilder.RenameIndex(
          name: "ix_strategies_user_name_unique",
          schema: "strategies",
          table: "strategies",
          newName: "ix_strategies_account_name_unique");

      migrationBuilder.RenameIndex(
          name: "ix_strategies_user_id",
          schema: "strategies",
          table: "strategies",
          newName: "ix_strategies_account_id");

      migrationBuilder.RenameIndex(
          name: "ix_strategies_user_active",
          schema: "strategies",
          table: "strategies",
          newName: "ix_strategies_account_active");
    }
  }
}
