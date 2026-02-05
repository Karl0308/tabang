using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;

namespace TabangService.DAL.Models.DTO
{
   public class TicketCommentModel
    {
        public int Id { get; set; }
        public string Comment { get; set; }
        public DateTime Created { get; set; }

        public int UserId { get; set; }
        public int TicketId { get; set; }
    }
}
