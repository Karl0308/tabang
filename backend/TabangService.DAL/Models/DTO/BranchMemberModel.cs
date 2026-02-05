using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models.DTO
{
    public class BranchMemberModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int BranchId { get; set; }
        public DepartmentBase DepartmentBase { get; set; } = DepartmentBase.All;
    }
}
