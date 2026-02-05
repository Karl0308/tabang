using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models.DTO
{
    public class TicketDTO
    {
        public int Id { get; set; }
        public string TicketId
        {
            get
            {
                return new string('0', (6 - (Id.ToString().Length))) + Id.ToString();
            }
        }
        public string? TicketNumber { get; set; }
        public DateTime CalledIn { get; set; }
        public string CalledInText { get { return CalledIn.ToString("MM/dd/yyyy h:mm tt"); } }
        public DateTime? DueDate { get; set; } = null;
        public string DueDateText { get { return CalledIn.ToString("MM/dd/yyyy h:mm tt"); } }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public Priority Priority { get; set; } = Priority.Low;
        public string PriorityName { get { return Priority.ToString(); } }
        public TicketStatus Status { get; set; }
        public string StatusName
        {
            get
            {
                string x = string.Empty;
                switch (Status)
                {
                    case TicketStatus.Done:
                        x = "Done";
                        break;
                    case TicketStatus.Open:
                        x = "Open";
                        break;
                    case TicketStatus.On_Hold:
                        x = "On Hold";
                        break;
                    case TicketStatus.In_Progress:
                        x = "In Progress";
                        break;
                    default:
                        x = "Open";
                        break;
                }
                return x;
            }
        }

        public int? AssigneeId { get; set; }
        public string? AssigneeText { get; set; }

        public int? ReporterId { get; set; }
        public string? ReporterText { get; set; }
        public int? BranchId { get; set; }
        public string? BranchName { get; set; }
        public DateTime? TimeStamp { get; set; }
        public int StarRate { get; set; }
        public string LinkTickets { get; set; } = "";
        public DepartmentBase DepartmentBase = DepartmentBase.Engineering;
        public int TicketAttachmentCount { get; set; }
    }
}
