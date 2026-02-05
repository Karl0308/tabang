using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;
using TabangService.DAL.Models.Enums;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace TabangService.DAL.Models.DTO
{

    public class OvertimeDTO
    {
        //public OvertimeDTO(Overtime overtime)
        //{
        //    Id = overtime.Id;
        //    UserId = overtime.UserId;
        //    UserFullName = overtime.User?.FullName; 
        //    TicketId = overtime.TicketId;
        //    TicketNumber = overtime.Ticket?.TicketNumber; 
        //    DateApplied = overtime.DateApplied;
        //    DateFrom = overtime.DateFrom;
        //    DateTo = overtime.DateTo;
        //    Reason = overtime.Reason;
        //    IsSupervisorApproved = overtime.IsSupervisorApproved;
        //    IsHeadApproved = overtime.IsHeadApproved;
        //}
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? UserFullName { get; set; }
        public int TicketId { get; set; }
        public string? TicketNumber { get; set; }
        public DateTime DateApplied { get; set; }
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
        public string Days { get; set; }
        public string Time { get; set; }

        public string? Reason { get; set; }
        public Approval SupervisorApproval { get; set; } = Approval.Pending;
        public Approval HeadApproval { get; set; } = Approval.Pending;
        public string SupervisorApprovalText { get { return SupervisorApproval.ToString(); } } 
        public string HeadApprovalText { get { return HeadApproval.ToString(); } }
        public int? UpdatedById { get; set; } = null;
        public string? UpdatedByFullName { get; set; }

    }
}
