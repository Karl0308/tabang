using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models.DTO
{
    public class TicketModel
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
        public string? Title { get; set; }
        public string? Description { get; set; }
        public TicketStatus Status { get; set; }
        public TicketStatus OldStatus { get; set; }
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
        public int? ReporterId { get; set; }
        public int? AssigneeId { get; set; }
        public int? CurrentUserId { get; set; }
        public int? BranchId { get; set; }
        public string Resolution { get; set; }
        public List<IFormFile>? file { get; set; }
        public string? LinkTickets { get; set; }
        public List<TicketAssetUpdateDto> ticketAssets { get; set; } = new List<TicketAssetUpdateDto>();
        public DepartmentBase DepartmentBase { get; set; } = DepartmentBase.All;

        //Additional Fields
        public string? ReporterName { get; set; }
        public string? IpAddress { get; set; }
        public string? Location { get; set; }
        public string? AssetTag { get; set; }

        //Star Rating
        public int Quality { get; set; }
        public int Timeliness { get; set; }
        public int Communication { get; set; }
        public int Adherence { get; set; }
        public int Overall { get; set; }
        public string FeedBack { get; set; } = string.Empty;

        public class TicketAssetUpdateDto
        {
            public int Value { get; set; }
            public string Label { get; set; } = string.Empty;
        }
    }
}
