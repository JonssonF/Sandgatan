using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sandgatan.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLoanInterestAmortization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AmortizationAmount",
                table: "Expenses",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "InterestAmount",
                table: "Expenses",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsLoan",
                table: "Categories",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql("UPDATE \"Categories\" SET \"IsLoan\" = 1 WHERE \"Name\" = 'Lån';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AmortizationAmount",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "InterestAmount",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "IsLoan",
                table: "Categories");
        }
    }
}
