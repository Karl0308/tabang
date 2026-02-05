using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TabangService.DAL.Migrations
{
    /// <inheritdoc />
    public partial class addDepartmentBase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DepartmentBase",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DepartmentBase",
                table: "Tickets",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DepartmentBase",
                table: "Branches",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DepartmentBase",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DepartmentBase",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "DepartmentBase",
                table: "Branches");
        }
    }
}
