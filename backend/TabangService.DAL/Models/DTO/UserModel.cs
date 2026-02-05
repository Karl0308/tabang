using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models.DTO
{
    public class UserModel
    {
        public int Id { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? OldUserName { get; set; }
        public string? Password { get; set; }
        public string? repassword { get; set; }
        public string? FullName { get; set; }
        public UserRole Role { get; set; }
        public bool Active { get; set; }
        public int BranchId { get; set; }
        public DepartmentBase DepartmentBase { get; set; } = DepartmentBase.All;
        public List<int> DepartmentIds { get; set; }


    }
}
