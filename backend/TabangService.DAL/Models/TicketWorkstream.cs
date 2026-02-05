using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;

namespace TabangService.DAL.Models
{
    public class TicketWorkstream
    {
        public int Id { get; set; }
        public int TicketsId { get; set; }
        public Ticket Ticket { get; set; }
        public int WorkstreamsId { get; set; }
        public Workstream Workstream { get; set; }
    }
}
