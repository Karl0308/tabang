using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;

namespace TabangService.DAL.Models
{
    public class TicketDepartment
    {
        public int Id { get; set; }

        public int TicketId { get; set; }
        public Ticket Ticket { get; set; }

        public int DepartmentId { get; set; }
        public Department Department { get; set; }
    }

}
