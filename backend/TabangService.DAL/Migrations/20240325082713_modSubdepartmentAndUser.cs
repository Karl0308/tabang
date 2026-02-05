using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TabangService.DAL.Migrations
{
    /// <inheritdoc />
    public partial class modSubdepartmentAndUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Members_SubDepartments_SubDepartmentId",
                table: "Members");

            migrationBuilder.DropForeignKey(
                name: "FK_Overtimes_Users_UserId",
                table: "Overtimes");

            migrationBuilder.DropIndex(
                name: "IX_Departments_HeadId",
                table: "Departments");

            migrationBuilder.AddColumn<int>(
                name: "SubDepartmentId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "isHead",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "isSupervisor",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "Members",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_Users_SubDepartmentId",
                table: "Users",
                column: "SubDepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_HeadId",
                table: "Departments",
                column: "HeadId");

            migrationBuilder.AddForeignKey(
                name: "FK_Members_SubDepartments_SubDepartmentId",
                table: "Members",
                column: "SubDepartmentId",
                principalTable: "SubDepartments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Overtimes_Users_UserId",
                table: "Overtimes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_SubDepartments_SubDepartmentId",
                table: "Users",
                column: "SubDepartmentId",
                principalTable: "SubDepartments",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Members_SubDepartments_SubDepartmentId",
                table: "Members");

            migrationBuilder.DropForeignKey(
                name: "FK_Overtimes_Users_UserId",
                table: "Overtimes");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_SubDepartments_SubDepartmentId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_SubDepartmentId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Departments_HeadId",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "SubDepartmentId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "isHead",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "isSupervisor",
                table: "Users");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "Members",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Departments_HeadId",
                table: "Departments",
                column: "HeadId",
                unique: true,
                filter: "[HeadId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Members_SubDepartments_SubDepartmentId",
                table: "Members",
                column: "SubDepartmentId",
                principalTable: "SubDepartments",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Overtimes_Users_UserId",
                table: "Overtimes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
