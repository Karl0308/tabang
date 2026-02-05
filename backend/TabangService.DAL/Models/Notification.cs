using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;

namespace TabangService.DAL.Models
{
    public  class Notification
    {
        public int Id { get; set; }
        public string? PropName { get; set; }
        public string? Message { get; set; }
        public int FromUserId { get; set; }
        public User FromUser { get; set; }
        [NotMapped]
        public string FromUserFullName { get; set; }
        public int ToUserId { get; set; }
        public User ToUser { get; set; }
        [NotMapped]
        public string ToUserFullName { get; set; }
        public int TicketId { get; set; }
        public Ticket Ticket { get; set; }
        [NotMapped]
        public string TicketNumber { get; set; }
        public bool isRead { get; set; } = false;
        public DateTime Date { get; set; }
        public string DateText { get { return Date.ToString("MM/dd/yyyy h:mm tt"); } }

    }
}
