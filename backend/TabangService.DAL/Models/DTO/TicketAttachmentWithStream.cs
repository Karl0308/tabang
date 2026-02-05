using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TabangService.DAL.Models.DTO
{
    public class TicketAttachmentWithStream
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public int? TicketCommentId { get; set; }

        public string FileName { get; set; } = null!;
        public string ContentType { get; set; } = null!;
        public Stream ContentStream { get; set; } = null!;
    }

}
