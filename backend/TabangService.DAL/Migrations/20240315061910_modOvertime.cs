using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TabangService.DAL.Migrations
{
    /// <inheritdoc />
    public partial class modOvertime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsHeadApproved",
                table: "Overtimes");

            migrationBuilder.DropColumn(
                name: "IsSupervisorApproved",
                table: "Overtimes");

            migrationBuilder.AddColumn<int>(
                name: "HeadApproval",
                table: "Overtimes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SupervisorApproval",
                table: "Overtimes",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HeadApproval",
                table: "Overtimes");

            migrationBuilder.DropColumn(
                name: "SupervisorApproval",
                table: "Overtimes");

            migrationBuilder.AddColumn<bool>(
                name: "IsHeadApproved",
                table: "Overtimes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSupervisorApproved",
                table: "Overtimes",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
