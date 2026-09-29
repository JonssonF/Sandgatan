using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sandgatan.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLoanBalanceAndRate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "InterestRatePercent",
                table: "Expenses",
                type: "decimal(6,3)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LoanBalance",
                table: "Expenses",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InterestRatePercent",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "LoanBalance",
                table: "Expenses");
        }
    }
}
