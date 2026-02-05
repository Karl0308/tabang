using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models
{
    public class Branch
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public List<User> Users { get; set; }
        public List<Ticket> Tickets { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DepartmentBase DepartmentBase { get; set; } = DepartmentBase.All;

        public List<Workstream> Workstreams { get; set; }
    }
}
