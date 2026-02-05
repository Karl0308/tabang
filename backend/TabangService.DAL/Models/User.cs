using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Hosting;
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
    public class User : IdentityUser
    {
        public int Id { get; set; }
        //public string? Username { get; set; }
        [NotMapped]
        public string? Password { get; set; }
        [NotMapped]
        public string? repassword { get; set; }
        public string? FullName { get; set; }
        public UserRole Role { get; set; }
        public bool Active { get; set; }
        public string RoleText { get { return Role.ToString(); } }
        public string ActiveText { get { return Active ? "ACTIVE" : "INACTIVE"; } }
        [NotMapped]
        public string? Token { get; set; }

        //For Assignee
        public List<Ticket> Tickets { get; set; }
        //For Reporter
        public List<Ticket> ReporterTickets { get; set; }
        public List<Notification> NotificationActions { get; set; } = new List<Notification>();
        public List<Notification> NotificationsTo { get; set; } = new List<Notification>();
        public int? BranchId { get; set; }
        public Branch Branch { get; set; }
        [NotMapped]
        public string? BranchName { get; set; }

        //For Department
        //public Department Department { get; set; }
        //public List<Member> Members { get; set; }
        //public List<Overtime> Overtime { get; set; }
        //public List<Overtime> UpdatedOvertime { get; set; }


        public int? SubDepartmentId { get; set; }
        public SubDepartment SubDepartment { get; set; }


        public bool isSupervisor { get; set; }
        public bool isHead { get; set; }
        public DepartmentBase DepartmentBase { get; set; } = DepartmentBase.All;

        public List<UserDepartment> UserDepartments { get; set; } = new List<UserDepartment>();
        [NotMapped]
        public List<int> DepartmentIds
        {
            get => UserDepartments.Count == 0 ? new List<int>() : UserDepartments.Select(ud => ud.DepartmentId).ToList();
        }


        public List<Workstream> Workstreams { get; set; }
    }
}
