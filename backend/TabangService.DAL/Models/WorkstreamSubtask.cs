using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models
{
    public class WorkstreamSubtask
    {
        public int Id { get; set; }

        // Relationship
        public int WorkstreamId { get; set; }
        public Workstream Workstream { get; set; } = null!;

        // Core Fields
        public string Title { get; set; } = null!;
        public string? Description { get; set; }

        // Ownership
        public int? AssigneeId { get; set; }   // Nullable (can be unassigned)
        public User? Assignee { get; set; } = null;
        public int? BranchId { get; set; }   // Nullable (can be unassigned)
        public Branch? Branch { get; set; } = null;

        // Status
        public SubtaskStatus Status { get; set; } = SubtaskStatus.NotStarted;

        // Dates
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }

        // Optional but useful
        public int? EstimatedEffortHours { get; set; } // For progress calc
        public bool IsBlocking { get; set; } = false;  // Affects health

        // Audit
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
