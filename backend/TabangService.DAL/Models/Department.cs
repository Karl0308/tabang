using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;

namespace TabangService.DAL.Models
{
    public class Department
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public User Head { get; set; }
        public int? HeadId { get; set; }
        public List<SubDepartment> SubDepartments { get; set; }

    }
}
