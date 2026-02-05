using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;

namespace TabangService.DAL.Models
{
    public class TicketComment
    {
        public TicketComment()
        {
                TicketAttachments = new List<TicketAttachment>();
        }
        public int Id { get; set; }
        public string Comment { get; set; }
        public DateTime Created { get; set; }
        public string CreatedText => Created.ToString("dd MMMM yyyy hh:mm tt");

        public int UserId { get; set; }
        public User? User { get; set; }
        public string UserFullName => User?.FullName ?? string.Empty;
        public int TicketId { get; set; }
        public Ticket? Ticket { get; set; }
        public bool isDeleted { get; set; } = false;

        public List<TicketAttachment> TicketAttachments { get; set; } = new List<TicketAttachment>();
    }
}
