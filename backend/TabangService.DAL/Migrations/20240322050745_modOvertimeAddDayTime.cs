using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TabangService.DAL.Migrations
{
    /// <inheritdoc />
    public partial class modOvertimeAddDayTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Days",
                table: "Overtimes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Time",
                table: "Overtimes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Days",
                table: "Overtimes");

            migrationBuilder.DropColumn(
                name: "Time",
                table: "Overtimes");
        }
    }
}
