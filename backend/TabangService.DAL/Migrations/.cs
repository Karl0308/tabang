using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TabangService.DAL.Migrations
{
    /// <inheritdoc />
    public partial class modTicketHistories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.RenameColumn(
            //    name: "Status",
            //    table: "TicketHistories",
            //    newName: "ToStatus");

            //migrationBuilder.AddColumn<int>(
            //    name: "FromStatus",
            //    table: "TicketHistories",
            //    type: "int",
            //    nullable: false,
            //    defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.DropColumn(
            //    name: "FromStatus",
            //    table: "TicketHistories");

            //migrationBuilder.RenameColumn(
            //    name: "ToStatus",
            //    table: "TicketHistories",
            //    newName: "Status");
        }
    }
}
