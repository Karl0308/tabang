using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models.DTO
{
   public class WorkstreamSubtaskDTO
    {
        public int Id { get; set; }

        public int WorkstreamId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }

        public int? AssigneeId { get; set; } 
        public int? BranchId { get; set; } 

        public SubtaskStatus Status { get; set; } = SubtaskStatus.NotStarted;

   
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }

        public int? EstimatedEffortHours { get; set; } 
        public bool IsBlocking { get; set; } = false; 

     
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
