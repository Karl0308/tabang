using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Models;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Model
{
    public class Ticket
    {
        public int Id { get; set; }
        public string TicketId { get {
                return new string('0', (6 - (Id.ToString().Length))) + Id.ToString();
            } }
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
        public string StatusName { get {
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
            } }

        public int? AssigneeId { get; set; }
        public User? Assignee { get; set; }
        [NotMapped]
        public string? AssigneeText { get; set; }

        public int? ReporterId { get; set; }
        public User? Reporter { get; set; }
        [NotMapped]
        public string? ReporterText { get; set; }
        public List<TicketHistory> TicketHistories { get; set; } = new List<TicketHistory>();
        public List<TicketComment> TicketComments { get; set; } = new List<TicketComment>();
        public List<TicketAttachment> TicketAttachments { get; set; } = new List<TicketAttachment>();
        [NotMapped]
        public int TicketAttachmentCount
        {
            get
            {
                return TicketAttachments.Count;
            }
        }
        public List<Notification>  Notifications { get; set; } = new List<Notification>();
        public List<TicketAsset> TicketAssets { get; set; } = new List<TicketAsset>();
        public List<Overtime> Overtime { get; set; } = new List<Overtime>();
        public List<OvertimeDTO> OvertimeDTO { get; set; } = new List<OvertimeDTO>();
        public List<TicketCatchup> TicketCatchups { get; set; } = new List<TicketCatchup>();
        public List<TicketDepartment> TicketDepartments { get; set; } = new List<TicketDepartment>();
        [NotMapped]
        public string TicketDepartmentText
        {
            get
            {
                if (TicketDepartments == null || !TicketDepartments.Any())
                    return "Unassigned";

                return string.Join(", ", TicketDepartments
                    .Where(td => td.Department != null)
                    .Select(td => td.Department.Name));
            }
        }
        public int[] DepartmentIds { get { return TicketDepartments.Select(q=>q.DepartmentId).ToArray(); } }
        public int? BranchId { get; set; }
        public Branch? Branch { get; set; }
        [NotMapped]
        public string? BranchName { get; set; }
        //Update on create and update
        public DateTime? TimeStamp { get; set; }
        public int StarRate { get; set; }
        public string LinkTickets { get; set; } = "";
        public DepartmentBase DepartmentBase { get; set; } = DepartmentBase.All;
        //Additional Fields
        public string? ReporterName { get; set; }
        public string? IpAddress { get; set; }
        public string? Location { get; set; }
        public string? AssetTag { get; set; }

        public int? WorkstreamId { get; set; }
        public Workstream? Workstream { get; set; }
        public int WorkstreamCount { get { return Workstream == null ? 0 : 1; } }

        public List<AdditionalAssignee> AdditionalAssignees { get; set; } = new List<AdditionalAssignee>();
    }
}
