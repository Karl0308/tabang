using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TabangService.DAL.Models
{
    public class Member
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public User User { get; set; }
        public int SubDepartmentId { get; set; }
        public SubDepartment SubDepartment { get; set; }
        public bool IsSupervisor { get; set; }
    }
}
