using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tabang.Models;
using TabangService.DAL.Migrations;
using TabangService.DAL.Models;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Repository
{
    public class ReportRepository
    {
        private readonly TabangContext _context;
        private readonly TimeZoneInfo _manilaTimeZone;
        private readonly DateTime CurrentDateTime;
        public ReportRepository()
        {
            _context = new TabangContext();
            _manilaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Taipei Standard Time");
            CurrentDateTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _manilaTimeZone);
        }
        public async Task<ReportQueryResult> GetReports(ReportQuery query)
        {

            var user = await _context.Users.FindAsync(query.UserId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            var ticketsQuery = _context.Tickets
                .AsQueryable();

            var startDate = query.DateFrom.AddHours(8);
            var endDate = query.DateTo.AddHours(8);

            ticketsQuery = ticketsQuery
                .Where(t => t.CalledIn >= startDate && t.CalledIn <= endDate);

            //status
            if (query.Status?.Any() == true)
            {
                if (!query.Status.Contains(TicketStatus.All))
                {
                    ticketsQuery = ticketsQuery.Where(t => query.Status.Contains(t.Status));
                }
            }
            //users
            if (query.UserOption?.Any() == true)
            {
                if (!query.UserOption.Contains(0))
                {
                    ticketsQuery = ticketsQuery.Where(t => t.AssigneeId.HasValue &&
                                                        query.UserOption.Contains(t.AssigneeId.Value));
                }
            }
            //branches
            if (query.Branches?.Any() == true)
            {
                if (!query.Branches.Contains(0))
                {
                    ticketsQuery = ticketsQuery.Where(t => t.BranchId.HasValue && query.Branches.Contains(t.BranchId.Value));
                }
            }
            //department
            if (query.DepartmentBase?.Any() == true)
            {
                if (!query.DepartmentBase.Contains(0))
                {
                    ticketsQuery = ticketsQuery.Where(t => query.DepartmentBase.Contains(t.DepartmentBase));
                }
            }


            int totalRecords = await ticketsQuery.CountAsync();

            var allUser = await _context.Users.ToListAsync();
            var allBranch = await _context.Branches.ToListAsync();

            var tickets = await ticketsQuery
             .OrderBy(q => q.CalledIn)
            .AsNoTracking()
            .ToListAsync();

            foreach (var ticket in tickets)
            {
                ticket.AssigneeText = ticket.AssigneeId != null ? allUser.FirstOrDefault(q => q.Id == ticket.AssigneeId).FullName : "Unassigned";
                ticket.ReporterText = ticket.ReporterId != null ? allUser.FirstOrDefault(q => q.Id == ticket.ReporterId).FullName : "Unassigned";
                ticket.BranchName = ticket.BranchId != null ? allBranch.FirstOrDefault(q => q.Id == ticket.BranchId).Name : "Unassigned";
            }

            return new ReportQueryResult
            {
                Tickets = tickets,
                PageNumber = 0,
                PageSize = 0,
                TotalRecords = totalRecords
            };
        }
        public async Task<AverageResponseTimeQueryResult> GetAverageReports(AverageResponseTimeReportQuery query)
        {
            var ticketsQuery = _context.Tickets.Include(q => q.TicketHistories)
            .AsQueryable();

            var startDate = query.DateFrom.AddHours(8);
            var endDate = query.DateTo.AddHours(8);

            ticketsQuery = ticketsQuery
                .Where(t => t.CalledIn >= startDate && t.CalledIn <= endDate);

            if (query.AssigneeId != 0)
            {
                ticketsQuery = ticketsQuery.Where(q => q.AssigneeId == query.AssigneeId);
            }

            ticketsQuery = ticketsQuery
                .Where(t => t.TicketHistories.Any(q => q.PropName == "Status" && q.NewData == "In Progress" && q.OldData == "Open"));


            var allUser = await _context.Users.ToListAsync();

            var tickets = await ticketsQuery
             .AsNoTracking()
            .ToListAsync();

            var responseTimes = new List<TimeSpan>();
            List<AverageResponseTimeDTO> dto = new List<AverageResponseTimeDTO>();
            foreach (var ticket in tickets)
            {
                var createdTime = ticket.TicketHistories
                 .FirstOrDefault(h => h.PropName == "Created")?.Created;

                var inProgressTime = ticket.TicketHistories
                    .FirstOrDefault(h =>
                        h.PropName == "Status" &&
                        h.NewData == "In Progress" &&
                        h.OldData == "Open")?.Created;

                TimeSpan? responseTime = null;
                if (createdTime.HasValue && inProgressTime.HasValue)
                {
                    responseTime = inProgressTime.Value - createdTime.Value;
                    responseTimes.Add(responseTime.Value);
                }

                dto.Add(new AverageResponseTimeDTO
                {
                    TicketNumber = ticket.TicketNumber,
                    Title = ticket.Title,
                    AssigneeName = ticket.AssigneeId != null
                        ? allUser.FirstOrDefault(u => u.Id == ticket.AssigneeId)?.FullName ?? "Unassigned"
                        : "Unassigned",
                    ResponseTime = responseTime.HasValue ? FormatTimeSpan(responseTime.Value) : "N/A"
                });
            }

            string averageResponse = "N/A";
            if (responseTimes.Any())
            {
                var avgTicks = (long)responseTimes.Average(ts => ts.Ticks);
                var avgTimeSpan = new TimeSpan(avgTicks);
                averageResponse = FormatTimeSpan(avgTimeSpan);
            }

            return new AverageResponseTimeQueryResult
            {
                dtoList = dto,
                AverageResponseTime = averageResponse
            };
        }
        public async Task<AverageResponseTimeQueryResult> GetAverageResolutionReports(AverageResponseTimeReportQuery query)
        {
            var ticketsQuery = _context.Tickets.Include(q => q.TicketHistories)
            .AsQueryable();

            var startDate = query.DateFrom.AddHours(8);
            var endDate = query.DateTo.AddHours(8);

            ticketsQuery = ticketsQuery
                .Where(t => t.CalledIn >= startDate && t.CalledIn <= endDate);

            if (query.AssigneeId != 0)
            {
                ticketsQuery = ticketsQuery.Where(q => q.AssigneeId == query.AssigneeId);
            }

            ticketsQuery = ticketsQuery
                .Where(t => t.TicketHistories.Any(q => q.PropName == "Status" && q.NewData == "Done"));


            var allUser = await _context.Users.ToListAsync();

            var tickets = await ticketsQuery
             .AsNoTracking()
            .ToListAsync();

            var responseTimes = new List<TimeSpan>();
            List<AverageResponseTimeDTO> dto = new List<AverageResponseTimeDTO>();
            foreach (var ticket in tickets)
            {
                var createdTime = ticket.TicketHistories
                 .FirstOrDefault(h => h.PropName == "Created")?.Created;

                var inProgressTime = ticket.TicketHistories
                    .FirstOrDefault(h =>
                        h.PropName == "Status" &&
                        h.NewData == "Done")?.Created;

                TimeSpan? responseTime = null;
                if (createdTime.HasValue && inProgressTime.HasValue)
                {
                    responseTime = inProgressTime.Value - createdTime.Value;
                    responseTimes.Add(responseTime.Value);
                }

                dto.Add(new AverageResponseTimeDTO
                {
                    TicketNumber = ticket.TicketNumber,
                    Title = ticket.Title,
                    AssigneeName = ticket.AssigneeId != null
                        ? allUser.FirstOrDefault(u => u.Id == ticket.AssigneeId)?.FullName ?? "Unassigned"
                        : "Unassigned",
                    ResponseTime = responseTime.HasValue ? FormatTimeSpan(responseTime.Value) : "N/A"
                });
            }

            string averageResponse = "N/A";
            if (responseTimes.Any())
            {
                var avgTicks = (long)responseTimes.Average(ts => ts.Ticks);
                var avgTimeSpan = new TimeSpan(avgTicks);
                averageResponse = FormatTimeSpan(avgTimeSpan);
            }

            return new AverageResponseTimeQueryResult
            {
                dtoList = dto,
                AverageResponseTime = averageResponse
            };
        }
        public async Task<List<ItemStockHistoryDTO>> GetSuppliesHistory(SuppliesReportQuery suppliesReport)
        {
            var startDate = suppliesReport.DateFrom.AddHours(8);
            var endDate = suppliesReport.DateTo.AddHours(8);
            var histories = await _context.StockHistories
                .Where(q => q.Date >= startDate && q.Date <= endDate)
                .Include(q => q.ItemStock).ThenInclude(q => q.Category)
                .Include(q => q.User)
                .OrderByDescending(q => q.Date)
                .AsNoTracking()
                .ToListAsync();

            return histories.Select(q => new ItemStockHistoryDTO
            {
                Id = q.Id,
                ItemStockId = q.ItemStockId,
                ItemName = q.ItemName,
                CategoryName = q.ItemStock?.Category?.Name ?? string.Empty,
                UserId = q.UserId,
                UserName = q.UserName,
                RefNo = q.RefNo,
                Quantity = q.Quantity,
                PreviousQuantity = q.PreviousQuantity,
                CurrentQuantity = q.CurrentQuantity,
                StockType = q.StockType,
                Date = q.Date,
            }).ToList();
        }
        public static string FormatTimeSpan(TimeSpan timeSpan)
        {
            int hours = (int)timeSpan.TotalHours;
            int minutes = timeSpan.Minutes;

            if (hours > 0 && minutes > 0)
                return $"{hours} hrs and {minutes} mins";
            else if (hours > 0)
                return $"{hours} hrs";
            else
                return $"{minutes} mins";
        }

        public static string CalculateResponseTime(List<TicketHistory> histories)
        {
            var createdTime = histories
                .FirstOrDefault(q => q.PropName == "Created")?.Created;

            var inProgressTime = histories
                .FirstOrDefault(q => q.PropName == "Status" && q.NewData == "In Progress" && q.OldData == "Open")?.Created;

            if (createdTime.HasValue && inProgressTime.HasValue)
            {
                var diff = inProgressTime.Value - createdTime.Value;

                int hours = (int)diff.TotalHours;
                int minutes = diff.Minutes;

                if (hours > 0 && minutes > 0)
                    return $"{hours} hrs and {minutes} mins";
                else if (hours > 0)
                    return $"{hours} hrs";
                else
                    return $"{minutes} mins";
            }

            return "N/A";
        }


    }
}
