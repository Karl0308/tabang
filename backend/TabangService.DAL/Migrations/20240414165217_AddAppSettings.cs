using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TabangService.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddAppSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NewFrom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NewTo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WarningFrom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WarningTo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SevereFrom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SevereTo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NewColor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WarningColor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SevereColor = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dbo.AppSettings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppSettings");
        }
    }
}
