using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TabangService.DAL.Models
{
    public class SubDepartment
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public int DepartmentId { get; set; }
        public Department Department { get; set; }
        public List<User> Users { get; set; }
        //public List<Member> Members { get; } = new List<Member>();
    }
}
