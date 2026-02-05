using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models
{
     public class WorkstreamHistory
    {
        public int Id { get; set; }
        public string? PropName { get; set; }
        public string? OldData { get; set; }
        public string? NewData { get; set; }
        public WorkstreamStatus FromStatus { get; set; }
        public string FromStatusText => FromStatus.ToString().Replace("_", " ");
        public WorkstreamStatus ToStatus { get; set; }
        public string ToStatusText => ToStatus.ToString().Replace("_", " ");
        public DateTime Created { get; set; }
        public string CreatedText => Created.ToString("dd MMMM yyyy hh:mm tt");
        public int UserId { get; set; }
        public User? User { get; set; }
        public string UserFullName => User?.FullName ?? string.Empty;
        public int WorkstreamId { get; set; }
        public Workstream? Workstream { get; set; }
    }
}
