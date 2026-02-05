using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models
{
    public class Workstream
    {
        public int Id { get; set; }
        public string WorkStreamNumber { get; set; } = string.Empty;
        public string WorkstreamId
        {
            get
            {
                return new string('0', (6 - (Id.ToString().Length))) + Id.ToString();
            }
        }
        // Core Identity
        public string Title { get; set; } = null!;
        public string Objective { get; set; } = null!;

        // Ownership & Governance (derived / system-managed)
        public int? OwnerId { get; set; }          // Creator
        public User? Owner { get; set; } = null;
        public int? BranchId { get; set; }
        public Branch? Branch { get; set; } = null;

        public Priority Priority { get; set; }          // Optional (default = Medium)
        public string PriorityName { get { return Priority.ToString(); } }
        // Lifecycle
        public WorkstreamStatus Status { get; set; } = WorkstreamStatus.Planning;
        public string StatusName { get { return Status.ToString(); } }

        // Dates
        public DateTime? StartDate { get; set; } = null;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Duration
        {
            get
            {
                var manilaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Taipei Standard Time");

                DateTime now = TimeZoneInfo.ConvertTimeFromUtc(
                    DateTime.UtcNow,
                    manilaTimeZone
                );

                TimeSpan span = now - CreatedAt;

                // Safety: prevent negative values
                if (span.TotalSeconds < 0)
                    span = TimeSpan.Zero;

                int days = span.Days;
                int hours = span.Hours;
                int minutes = span.Minutes;

                if (days > 0)
                    return $"{days}d {hours}h {minutes}m ago";

                if (hours > 0)
                    return $"{hours}h {minutes}m ago";

                return $"{minutes}m ago";
            }
        }


        public DateTime? CompletedAt { get; set; } = null;

        // Derived / Computed (NOT user editable)
        public DateTime? DueDate { get; set; } = null;    // Derived from subtasks
        [NotMapped]
        public WorkstreamHealth Health { get; set; } // Derived
        public string HealthName { get { return Health.ToString(); } }
        [NotMapped]
        public decimal ProgressPercentage { get; set; } // Derived

        // Navigation
        public List<WorkstreamSubtask> Subtasks { get; set; } = new List<WorkstreamSubtask>();
        public List<WorkstreamHistory> WorkstreamHistories { get; set; } = new List<WorkstreamHistory>();
        public List<Ticket> Tickets { get; set; } = new List<Ticket>();

    }

}
