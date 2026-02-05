using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;

namespace TabangService.DAL.Models
{
    public class StarRating
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public Ticket? Ticket { get; set; }
        public int QualityOfWork { get; set; }
        public int AdherenceToBrief { get; set; }
        public int Timeliness { get; set; }
        public int CommunicationAndCollaboration { get; set; }
        public int OverallSatisfaction { get; set; }
        public DateTime Date { get; set; }
        public string Feedback { get; set; }
  
    }
}
