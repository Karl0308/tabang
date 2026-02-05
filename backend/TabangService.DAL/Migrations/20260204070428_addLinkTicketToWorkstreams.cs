using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TabangService.DAL.Migrations
{
    /// <inheritdoc />
    public partial class addLinkTicketToWorkstreams : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WorkstreamId",
                table: "Tickets",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_WorkstreamId",
                table: "Tickets",
                column: "WorkstreamId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Workstreams_WorkstreamId",
                table: "Tickets",
                column: "WorkstreamId",
                principalTable: "Workstreams",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Workstreams_WorkstreamId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_WorkstreamId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "WorkstreamId",
                table: "Tickets");
        }
    }
}
