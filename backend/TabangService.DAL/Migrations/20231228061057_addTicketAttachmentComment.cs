using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TabangService.DAL.Migrations
{
    /// <inheritdoc />
    public partial class addTicketAttachmentComment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TicketCommentId",
                table: "TicketAttachments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TicketAttachments_TicketCommentId",
                table: "TicketAttachments",
                column: "TicketCommentId");

            migrationBuilder.AddForeignKey(
                name: "FK_TicketAttachments_TicketComments_TicketCommentId",
                table: "TicketAttachments",
                column: "TicketCommentId",
                principalTable: "TicketComments",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TicketAttachments_TicketComments_TicketCommentId",
                table: "TicketAttachments");

            migrationBuilder.DropIndex(
                name: "IX_TicketAttachments_TicketCommentId",
                table: "TicketAttachments");

            migrationBuilder.DropColumn(
                name: "TicketCommentId",
                table: "TicketAttachments");
        }
    }
}
