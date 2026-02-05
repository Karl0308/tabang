using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TabangService.DAL.Migrations
{
    /// <inheritdoc />
    public partial class addStarRate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StarRate",
                table: "Tickets",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StarRate",
                table: "Tickets");
        }
    }
}
