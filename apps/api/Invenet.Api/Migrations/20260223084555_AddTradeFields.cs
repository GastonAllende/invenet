using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Invenet.Api.Migrations
{
  /// <inheritdoc />
  public partial class AddTradeFields : Migration
  {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.AddColumn<decimal>(
          name: "Commission",
          schema: "trades",
          table: "trades",
          type: "numeric(18,2)",
          nullable: false,
          defaultValue: 0m);

      migrationBuilder.AddColumn<DateTime>(
          name: "Date",
          schema: "trades",
          table: "trades",
          type: "timestamp with time zone",
          nullable: false,
          defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

      migrationBuilder.AddColumn<decimal>(
          name: "InvestedAmount",
          schema: "trades",
          table: "trades",
          type: "numeric(18,2)",
          nullable: false,
          defaultValue: 0m);

      migrationBuilder.AddColumn<decimal>(
          name: "PositionSize",
          schema: "trades",
          table: "trades",
          type: "numeric(18,4)",
          nullable: false,
          defaultValue: 0m);

      migrationBuilder.AddColumn<decimal>(
          name: "ProfitLoss",
          schema: "trades",
          table: "trades",
          type: "numeric(18,2)",
          nullable: false,
          defaultValue: 0m);

      migrationBuilder.AddColumn<string>(
          name: "Status",
          schema: "trades",
          table: "trades",
          type: "character varying(10)",
          maxLength: 10,
          nullable: false,
          defaultValue: "");

      migrationBuilder.AddColumn<string>(
          name: "Type",
          schema: "trades",
          table: "trades",
          type: "character varying(4)",
          maxLength: 4,
          nullable: false,
          defaultValue: "");

      migrationBuilder.CreateIndex(
          name: "ix_trades_account_date",
          schema: "trades",
          table: "trades",
          columns: new[] { "AccountId", "Date" });

      migrationBuilder.CreateIndex(
          name: "ix_trades_date",
          schema: "trades",
          table: "trades",
          column: "Date");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.DropIndex(
          name: "ix_trades_account_date",
          schema: "trades",
          table: "trades");

      migrationBuilder.DropIndex(
          name: "ix_trades_date",
          schema: "trades",
          table: "trades");

      migrationBuilder.DropColumn(
          name: "Commission",
          schema: "trades",
          table: "trades");

      migrationBuilder.DropColumn(
          name: "Date",
          schema: "trades",
          table: "trades");

      migrationBuilder.DropColumn(
          name: "InvestedAmount",
          schema: "trades",
          table: "trades");

      migrationBuilder.DropColumn(
          name: "PositionSize",
          schema: "trades",
          table: "trades");

      migrationBuilder.DropColumn(
          name: "ProfitLoss",
          schema: "trades",
          table: "trades");

      migrationBuilder.DropColumn(
          name: "Status",
          schema: "trades",
          table: "trades");

      migrationBuilder.DropColumn(
          name: "Type",
          schema: "trades",
          table: "trades");
    }
  }
}
