using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models
{
    public class TicketCatchup
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public User? User { get; set; }
        public string UserFullName => User?.FullName ?? string.Empty;
        public int? TicketId { get; set; }
        public Ticket? Ticket { get; set; }
        public DateTime Date { get; set; }
        public string DateText => Date.ToString("dd MMMM yyyy hh:mm tt");

    }
}
