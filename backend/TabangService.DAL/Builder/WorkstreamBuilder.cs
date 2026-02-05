using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TabangService.DAL.Builder
{
    public class WorkstreamBuilder
    {
        public static string GetDurationAgo(DateTime dateTime)
        {
            var now = DateTime.UtcNow;
            var span = now - dateTime;

            if (span.TotalDays >= 1)
            {
                int days = (int)span.TotalDays;
                int hours = span.Hours;
                int minutes = span.Minutes;
                return $"{days}d{(hours > 0 ? $" {hours}h" : "")}{(minutes > 0 ? $" {minutes}m" : "")} ago";
            }
            else if (span.TotalHours >= 1)
            {
                int hours = (int)span.TotalHours;
                int minutes = span.Minutes;
                return $"{hours}h{(minutes > 0 ? $" {minutes}m" : "")} ago";
            }
            else
            {
                int minutes = (int)span.TotalMinutes;
                return $"{minutes}m ago";
            }
        }

    }
}
