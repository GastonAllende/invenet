using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Invenet.Api.Migrations
{
  /// <inheritdoc />
  public partial class AddStrategiesAndTradeStrategyRelation : Migration
  {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.DropForeignKey(
          name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
          table: "AspNetRoleClaims");

      migrationBuilder.DropForeignKey(
          name: "FK_AspNetUserClaims_AspNetUsers_UserId",
          table: "AspNetUserClaims");

      migrationBuilder.DropForeignKey(
          name: "FK_AspNetUserLogins_AspNetUsers_UserId",
          table: "AspNetUserLogins");

      migrationBuilder.DropForeignKey(
          name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
          table: "AspNetUserRoles");

      migrationBuilder.DropForeignKey(
          name: "FK_AspNetUserRoles_AspNetUsers_UserId",
          table: "AspNetUserRoles");

      migrationBuilder.DropForeignKey(
          name: "FK_AspNetUserTokens_AspNetUsers_UserId",
          table: "AspNetUserTokens");

      migrationBuilder.DropTable(
          name: "refresh_tokens");

      migrationBuilder.DropIndex(
          name: "EmailIndex",
          table: "AspNetUsers");

      migrationBuilder.DropIndex(
          name: "UserNameIndex",
          table: "AspNetUsers");

      migrationBuilder.DropIndex(
          name: "IX_AspNetUserRoles_RoleId",
          table: "AspNetUserRoles");

      migrationBuilder.DropIndex(
          name: "IX_AspNetUserLogins_UserId",
          table: "AspNetUserLogins");

      migrationBuilder.DropIndex(
          name: "IX_AspNetUserClaims_UserId",
          table: "AspNetUserClaims");

      migrationBuilder.DropIndex(
          name: "RoleNameIndex",
          table: "AspNetRoles");

      migrationBuilder.DropIndex(
          name: "IX_AspNetRoleClaims_RoleId",
          table: "AspNetRoleClaims");

      migrationBuilder.EnsureSchema(
          name: "auth");

      migrationBuilder.EnsureSchema(
          name: "strategies");

      migrationBuilder.EnsureSchema(
          name: "trades");

      migrationBuilder.AlterColumn<string>(
          name: "UserName",
          table: "AspNetUsers",
          type: "text",
          nullable: true,
          oldClrType: typeof(string),
          oldType: "character varying(256)",
          oldMaxLength: 256,
          oldNullable: true);

      migrationBuilder.AlterColumn<DateTimeOffset>(
          name: "UpdatedAt",
          table: "AspNetUsers",
          type: "timestamp with time zone",
          nullable: false,
          oldClrType: typeof(DateTimeOffset),
          oldType: "timestamp with time zone",
          oldDefaultValueSql: "now()");

      migrationBuilder.AlterColumn<string>(
          name: "NormalizedUserName",
          table: "AspNetUsers",
          type: "text",
          nullable: true,
          oldClrType: typeof(string),
          oldType: "character varying(256)",
          oldMaxLength: 256,
          oldNullable: true);

      migrationBuilder.AlterColumn<string>(
          name: "NormalizedEmail",
          table: "AspNetUsers",
          type: "text",
          nullable: true,
          oldClrType: typeof(string),
          oldType: "character varying(256)",
          oldMaxLength: 256,
          oldNullable: true);

      migrationBuilder.AlterColumn<string>(
          name: "Email",
          table: "AspNetUsers",
          type: "text",
          nullable: true,
          oldClrType: typeof(string),
          oldType: "character varying(256)",
          oldMaxLength: 256,
          oldNullable: true);

      migrationBuilder.AlterColumn<DateTimeOffset>(
          name: "CreatedAt",
          table: "AspNetUsers",
          type: "timestamp with time zone",
          nullable: false,
          oldClrType: typeof(DateTimeOffset),
          oldType: "timestamp with time zone",
          oldDefaultValueSql: "now()");

      migrationBuilder.AlterColumn<string>(
          name: "NormalizedName",
          table: "AspNetRoles",
          type: "text",
          nullable: true,
          oldClrType: typeof(string),
          oldType: "character varying(256)",
          oldMaxLength: 256,
          oldNullable: true);

      migrationBuilder.AlterColumn<string>(
          name: "Name",
          table: "AspNetRoles",
          type: "text",
          nullable: true,
          oldClrType: typeof(string),
          oldType: "character varying(256)",
          oldMaxLength: 256,
          oldNullable: true);

      migrationBuilder.CreateTable(
          name: "RefreshTokens",
          schema: "auth",
          columns: table => new
          {
            Id = table.Column<Guid>(type: "uuid", nullable: false),
            Token = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
            UserId = table.Column<Guid>(type: "uuid", nullable: false),
            ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
            IsRevoked = table.Column<bool>(type: "boolean", nullable: false),
            RevokedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
            TokenFamily = table.Column<Guid>(type: "uuid", nullable: true),
            CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
            UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
          },
          constraints: table =>
          {
            table.PrimaryKey("PK_RefreshTokens", x => x.Id);
            table.ForeignKey(
                      name: "FK_RefreshTokens_AspNetUsers_UserId",
                      column: x => x.UserId,
                      principalTable: "AspNetUsers",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
          });

      migrationBuilder.CreateTable(
          name: "strategies",
          schema: "strategies",
          columns: table => new
          {
            Id = table.Column<Guid>(type: "uuid", nullable: false),
            AccountId = table.Column<Guid>(type: "uuid", nullable: false),
            Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
            Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
            IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
            CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
            UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
          },
          constraints: table =>
          {
            table.PrimaryKey("PK_strategies", x => x.Id);
          });

      migrationBuilder.CreateTable(
          name: "trades",
          schema: "trades",
          columns: table => new
          {
            Id = table.Column<Guid>(type: "uuid", nullable: false),
            AccountId = table.Column<Guid>(type: "uuid", nullable: false),
            Symbol = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
            EntryPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
            ExitPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
            StrategyId = table.Column<Guid>(type: "uuid", nullable: true),
            CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
            UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
          },
          constraints: table =>
          {
            table.PrimaryKey("PK_trades", x => x.Id);
            table.ForeignKey(
                      name: "FK_trades_strategies_StrategyId",
                      column: x => x.StrategyId,
                      principalSchema: "strategies",
                      principalTable: "strategies",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.SetNull);
          });

      migrationBuilder.CreateIndex(
          name: "IX_RefreshTokens_Token",
          schema: "auth",
          table: "RefreshTokens",
          column: "Token",
          unique: true);

      migrationBuilder.CreateIndex(
          name: "IX_RefreshTokens_UserId",
          schema: "auth",
          table: "RefreshTokens",
          column: "UserId");

      migrationBuilder.CreateIndex(
          name: "ix_strategies_account_active",
          schema: "strategies",
          table: "strategies",
          columns: new[] { "AccountId", "IsDeleted" });

      migrationBuilder.CreateIndex(
          name: "ix_strategies_account_id",
          schema: "strategies",
          table: "strategies",
          column: "AccountId");

      migrationBuilder.CreateIndex(
          name: "ix_strategies_account_name_unique",
          schema: "strategies",
          table: "strategies",
          columns: new[] { "AccountId", "Name" },
          unique: true,
          filter: "\"IsDeleted\" = FALSE");

      migrationBuilder.CreateIndex(
          name: "ix_trades_account_id",
          schema: "trades",
          table: "trades",
          column: "AccountId");

      migrationBuilder.CreateIndex(
          name: "ix_trades_account_strategy",
          schema: "trades",
          table: "trades",
          columns: new[] { "AccountId", "StrategyId" });

      migrationBuilder.CreateIndex(
          name: "ix_trades_strategy_id",
          schema: "trades",
          table: "trades",
          column: "StrategyId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.DropTable(
          name: "RefreshTokens",
          schema: "auth");

      migrationBuilder.DropTable(
          name: "trades",
          schema: "trades");

      migrationBuilder.DropTable(
          name: "strategies",
          schema: "strategies");

      migrationBuilder.AlterColumn<string>(
          name: "UserName",
          table: "AspNetUsers",
          type: "character varying(256)",
          maxLength: 256,
          nullable: true,
          oldClrType: typeof(string),
          oldType: "text",
          oldNullable: true);

      migrationBuilder.AlterColumn<DateTimeOffset>(
          name: "UpdatedAt",
          table: "AspNetUsers",
          type: "timestamp with time zone",
          nullable: false,
          defaultValueSql: "now()",
          oldClrType: typeof(DateTimeOffset),
          oldType: "timestamp with time zone");

      migrationBuilder.AlterColumn<string>(
          name: "NormalizedUserName",
          table: "AspNetUsers",
          type: "character varying(256)",
          maxLength: 256,
          nullable: true,
          oldClrType: typeof(string),
          oldType: "text",
          oldNullable: true);

      migrationBuilder.AlterColumn<string>(
          name: "NormalizedEmail",
          table: "AspNetUsers",
          type: "character varying(256)",
          maxLength: 256,
          nullable: true,
          oldClrType: typeof(string),
          oldType: "text",
          oldNullable: true);

      migrationBuilder.AlterColumn<string>(
          name: "Email",
          table: "AspNetUsers",
          type: "character varying(256)",
          maxLength: 256,
          nullable: true,
          oldClrType: typeof(string),
          oldType: "text",
          oldNullable: true);

      migrationBuilder.AlterColumn<DateTimeOffset>(
          name: "CreatedAt",
          table: "AspNetUsers",
          type: "timestamp with time zone",
          nullable: false,
          defaultValueSql: "now()",
          oldClrType: typeof(DateTimeOffset),
          oldType: "timestamp with time zone");

      migrationBuilder.AlterColumn<string>(
          name: "NormalizedName",
          table: "AspNetRoles",
          type: "character varying(256)",
          maxLength: 256,
          nullable: true,
          oldClrType: typeof(string),
          oldType: "text",
          oldNullable: true);

      migrationBuilder.AlterColumn<string>(
          name: "Name",
          table: "AspNetRoles",
          type: "character varying(256)",
          maxLength: 256,
          nullable: true,
          oldClrType: typeof(string),
          oldType: "text",
          oldNullable: true);

      migrationBuilder.CreateTable(
          name: "refresh_tokens",
          columns: table => new
          {
            Id = table.Column<Guid>(type: "uuid", nullable: false),
            UserId = table.Column<Guid>(type: "uuid", nullable: false),
            CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
            CreatedByIp = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
            ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
            RevokedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
            RevokedByIp = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
            TokenFamily = table.Column<Guid>(type: "uuid", nullable: false),
            TokenHash = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false)
          },
          constraints: table =>
          {
            table.PrimaryKey("PK_refresh_tokens", x => x.Id);
            table.ForeignKey(
                      name: "FK_refresh_tokens_AspNetUsers_UserId",
                      column: x => x.UserId,
                      principalTable: "AspNetUsers",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
          });

      migrationBuilder.CreateIndex(
          name: "EmailIndex",
          table: "AspNetUsers",
          column: "NormalizedEmail");

      migrationBuilder.CreateIndex(
          name: "UserNameIndex",
          table: "AspNetUsers",
          column: "NormalizedUserName",
          unique: true);

      migrationBuilder.CreateIndex(
          name: "IX_AspNetUserRoles_RoleId",
          table: "AspNetUserRoles",
          column: "RoleId");

      migrationBuilder.CreateIndex(
          name: "IX_AspNetUserLogins_UserId",
          table: "AspNetUserLogins",
          column: "UserId");

      migrationBuilder.CreateIndex(
          name: "IX_AspNetUserClaims_UserId",
          table: "AspNetUserClaims",
          column: "UserId");

      migrationBuilder.CreateIndex(
          name: "RoleNameIndex",
          table: "AspNetRoles",
          column: "NormalizedName",
          unique: true);

      migrationBuilder.CreateIndex(
          name: "IX_AspNetRoleClaims_RoleId",
          table: "AspNetRoleClaims",
          column: "RoleId");

      migrationBuilder.CreateIndex(
          name: "IX_refresh_tokens_TokenFamily",
          table: "refresh_tokens",
          column: "TokenFamily");

      migrationBuilder.CreateIndex(
          name: "IX_refresh_tokens_TokenHash",
          table: "refresh_tokens",
          column: "TokenHash",
          unique: true);

      migrationBuilder.CreateIndex(
          name: "IX_refresh_tokens_UserId",
          table: "refresh_tokens",
          column: "UserId");

      migrationBuilder.AddForeignKey(
          name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
          table: "AspNetRoleClaims",
          column: "RoleId",
          principalTable: "AspNetRoles",
          principalColumn: "Id",
          onDelete: ReferentialAction.Cascade);

      migrationBuilder.AddForeignKey(
          name: "FK_AspNetUserClaims_AspNetUsers_UserId",
          table: "AspNetUserClaims",
          column: "UserId",
          principalTable: "AspNetUsers",
          principalColumn: "Id",
          onDelete: ReferentialAction.Cascade);

      migrationBuilder.AddForeignKey(
          name: "FK_AspNetUserLogins_AspNetUsers_UserId",
          table: "AspNetUserLogins",
          column: "UserId",
          principalTable: "AspNetUsers",
          principalColumn: "Id",
          onDelete: ReferentialAction.Cascade);

      migrationBuilder.AddForeignKey(
          name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
          table: "AspNetUserRoles",
          column: "RoleId",
          principalTable: "AspNetRoles",
          principalColumn: "Id",
          onDelete: ReferentialAction.Cascade);

      migrationBuilder.AddForeignKey(
          name: "FK_AspNetUserRoles_AspNetUsers_UserId",
          table: "AspNetUserRoles",
          column: "UserId",
          principalTable: "AspNetUsers",
          principalColumn: "Id",
          onDelete: ReferentialAction.Cascade);

      migrationBuilder.AddForeignKey(
          name: "FK_AspNetUserTokens_AspNetUsers_UserId",
          table: "AspNetUserTokens",
          column: "UserId",
          principalTable: "AspNetUsers",
          principalColumn: "Id",
          onDelete: ReferentialAction.Cascade);
    }
  }
}
