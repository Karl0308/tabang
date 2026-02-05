using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TabangService.DAL.Migrations
{
    /// <inheritdoc />
    public partial class addTicketReporter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ReporterId",
                table: "Tickets",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_ReporterId",
                table: "Tickets",
                column: "ReporterId",
                unique: true,
                filter: "[ReporterId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Users_ReporterId",
                table: "Tickets",
                column: "ReporterId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Users_ReporterId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_ReporterId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ReporterId",
                table: "Tickets");
        }
    }
}
