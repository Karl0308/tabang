using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models
{
    public class Overtime
    {
        //public Overtime (OvertimeDTO overtime)
        //{
        //    Id = overtime.Id;
        //    UserId = overtime.UserId;
        //    TicketId = overtime.TicketId;
        //    DateApplied = overtime.DateApplied;
        //    DateFrom = overtime.DateFrom;
        //    DateTo = overtime.DateTo;
        //    Reason = overtime.Reason;
        //    IsSupervisorApproved = overtime.IsSupervisorApproved;
        //    IsHeadApproved = overtime.IsHeadApproved;
        //}
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public int TicketId { get; set; }
        public Ticket Ticket { get; set; }
        public DateTime DateApplied { get; set; }
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
        public string Days { get; set; }
        public string Time { get; set; }
        public string? Reason { get; set; }
        public Approval SupervisorApproval { get; set; } = Approval.Pending;
        public Approval HeadApproval { get; set; } = Approval.Pending;
        public int? UpdatedById { get; set; } = null;
        public User? UpdatedBy { get; set; }


    }
}
