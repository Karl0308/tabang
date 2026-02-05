using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TabangService.DAL.Migrations
{
    /// <inheritdoc />
    public partial class modWorkstreamSubtask : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_WorkstreamSubtasks",
                table: "WorkstreamSubtasks");

            migrationBuilder.AddColumn<int>(
                name: "BranchId",
                table: "WorkstreamSubtasks",
                type: "int",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_dbo.WorkstreamSubtasks",
                table: "WorkstreamSubtasks",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_WorkstreamSubtasks_AssigneeId",
                table: "WorkstreamSubtasks",
                column: "AssigneeId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkstreamSubtasks_BranchId",
                table: "WorkstreamSubtasks",
                column: "BranchId");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkstreamSubtasks_Branches_BranchId",
                table: "WorkstreamSubtasks",
                column: "BranchId",
                principalTable: "Branches",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkstreamSubtasks_Users_AssigneeId",
                table: "WorkstreamSubtasks",
                column: "AssigneeId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkstreamSubtasks_Branches_BranchId",
                table: "WorkstreamSubtasks");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkstreamSubtasks_Users_AssigneeId",
                table: "WorkstreamSubtasks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_dbo.WorkstreamSubtasks",
                table: "WorkstreamSubtasks");

            migrationBuilder.DropIndex(
                name: "IX_WorkstreamSubtasks_AssigneeId",
                table: "WorkstreamSubtasks");

            migrationBuilder.DropIndex(
                name: "IX_WorkstreamSubtasks_BranchId",
                table: "WorkstreamSubtasks");

            migrationBuilder.DropColumn(
                name: "BranchId",
                table: "WorkstreamSubtasks");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkstreamSubtasks",
                table: "WorkstreamSubtasks",
                column: "Id");
        }
    }
}
