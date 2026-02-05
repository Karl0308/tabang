using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models.DTO
{
    public class ReportQuery
    {
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
        public List<TicketStatus> Status { get; set; } = new();
        public List<int> UserOption { get; set; } = new();
        public List<int> Branches { get; set; } = new();
        public List<DepartmentBase> DepartmentBase { get; set; } = new();
        public int UserId { get; set; } = 0;
    }
    public class ReportQueryResult
    {
        public List<Ticket> Tickets { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalRecords { get; set; }
    }
    public class AverageResponseTimeReportQuery
    {
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
        public int? AssigneeId { get; set; }
    }
    public class AverageResponseTimeQueryResult
    {
        public List<AverageResponseTimeDTO> dtoList { get; set; } = new();
        public string AverageResponseTime { get; set; }
    }

    public class SuppliesReportQuery
    {
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
    }

    //DTO
    public class AverageResponseTimeDTO
    {
        public string TicketNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string AssigneeName { get; set; } = string.Empty;
        public string ResponseTime { get; set; } = string.Empty;

    }

}
