using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TabangService.DAL.Migrations
{
    /// <inheritdoc />
    public partial class modOvertimeAddUpdated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                table: "Overtimes",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Overtimes_UpdatedById",
                table: "Overtimes",
                column: "UpdatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Overtimes_Users_UpdatedById",
                table: "Overtimes",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Overtimes_Users_UpdatedById",
                table: "Overtimes");

            migrationBuilder.DropIndex(
                name: "IX_Overtimes_UpdatedById",
                table: "Overtimes");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "Overtimes");
        }
    }
}
