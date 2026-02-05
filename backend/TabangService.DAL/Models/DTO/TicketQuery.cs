using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models.DTO
{
    public class TicketQuery
    {
        public string Search { get; set; } = "";
        public List<TicketStatus> Status { get; set; } = new();
        public List<int?> UserOption { get; set; } = new();
        public List<int> Branches { get; set; } = new();
        public List<Priority> Priority { get; set; } = new();
        //public List<DepartmentBase> DepartmentBase { get; set; } = new();
        public List<int> DepartmentBase { get; set; } = new();
        public int UserId { get; set; } = 0;
        public DateTime? TimeStamp { get; set; } = null;
        public int PageNumber { get; set; } = 1;  // Default to page 1
        public int PageSize { get; set; } = 10;   // Default page size (adjust as needed)
        public DateTime? FromDate { get; set; } = null;
        public DateTime? ToDate { get; set; } = null;
        public string OrderBy { get; set; } = string.Empty;
        public string Sort { get; set; } = "asc";
    }
    public class TicketQueryResult
    {
        public List<Ticket> Tickets { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalRecords { get; set; }

        public int TotalTicket { get; set; }
        public int TotalOpen { get; set; }
        public int TotalOnHold { get; set; }
        public int TotalInProgress { get; set; }
        public int TotalDone { get; set; }

    }
    public class TicketDTOQueryResult
    {
        public List<TicketDTO> Tickets { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalRecords { get; set; }
    }

    public class WorkstreamQuery
    {
        public string Search { get; set; } = "";
        public List<WorkstreamStatus> Status { get; set; } = new();
        public List<int?> Owners { get; set; } = new();
        public List<int> Branches { get; set; } = new();
        public List<Priority> Priority { get; set; } = new();
        public int UserId { get; set; } = 0;
        public int PageNumber { get; set; } = 1;  // Default to page 1
        public int PageSize { get; set; } = 10;   // Default page size (adjust as needed)
        public DateTime? FromDate { get; set; } = null;
        public DateTime? ToDate { get; set; } = null;
    }
    public class WorkstreamQueryResult
    {
        public List<Workstream> Workstreams { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalRecords { get; set; }

        public int Total { get; set; }
        public int TotalActive { get; set; }
        public int TotalPlanning { get; set; }
        public int TotalOnHold { get; set; }
        public int TotalCompleted { get; set; }
        public int TotalCancelled { get; set; }

    }
   
}
