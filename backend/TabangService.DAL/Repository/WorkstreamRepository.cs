using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Builder;
using TabangService.DAL.Model;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Models.Enums;
using TabangService.DAL.Models;
using AutoMapper;
using Tabang.Models;
using System.Net.Sockets;
using Newtonsoft.Json;
using System.Globalization;

namespace TabangService.DAL.Repository
{
    public class WorkstreamRepository
    {

        private readonly TabangContext _context;
        private readonly TabangAttachmentContext _attachmentContext;
        private readonly TimeZoneInfo _manilaTimeZone;
        private readonly DateTime CurrentDateTime;

        public WorkstreamRepository()
        {
            _context = new TabangContext();
            _attachmentContext = new TabangAttachmentContext();
            _manilaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Taipei Standard Time");
            CurrentDateTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _manilaTimeZone);
        }
        public async Task<WorkstreamQueryResult> GetWorkstreams(WorkstreamQuery query)
        {
            var user = await _context.Users
                .Include(u => u.UserDepartments)
                .FirstOrDefaultAsync(u => u.Id == query.UserId);

            if (user == null)
                throw new Exception("User not found");


            IQueryable<Workstream> workstreamsQuery = _context.Workstreams.AsQueryable();

          
            //if (user.Role == UserRole.Reporter)
            //{
            //    workstreamsQuery = ticketsQuery.Where(t => t.ReporterId == user.Id);
            //}
            //else if (user.Role == UserRole.Assignee)
            //{
            //    ticketsQuery = ticketsQuery.Where(t =>
            //        t.AssigneeId == user.Id ||
            //        t.TicketDepartments.Any(td => userDeptIds.Contains(td.DepartmentId))
            //    );
            //}
            //else if (user.Role == UserRole.Admin || user.Role == UserRole.SysAdmin)
            //{
            //    ticketsQuery = ticketsQuery.Where(t =>
            //        t.TicketDepartments.Any(td => userDeptIds.Contains(td.DepartmentId))
            //    );
            //}

            

            // =========================
            // SEARCH
            // =========================
            if (!string.IsNullOrEmpty(query.Search))
            {
                workstreamsQuery = workstreamsQuery.Where(t =>
                    t.WorkStreamNumber.Contains(query.Search) ||
                    t.Title.Contains(query.Search) ||
                    t.Objective.Contains(query.Search));
            }

            // =========================
            // STATUS
            // =========================
            if (query.Status?.Any() == true && !query.Status.Contains(WorkstreamStatus.All))
            {
                workstreamsQuery = workstreamsQuery.Where(t => query.Status.Contains(t.Status));
            }

            // =========================
            // ASSIGNEE FILTER
            // =========================
            if (query.Owners?.Any() == true)
            {
                var nonNullUserIds = query.Owners
                    .Where(id => id.HasValue)
                    .Select(id => id.Value)
                    .ToList();

                var includesNull = query.Owners.Any(id => !id.HasValue);

                workstreamsQuery = workstreamsQuery.Where(t =>
                    (t.OwnerId.HasValue && nonNullUserIds.Contains(t.OwnerId.Value)) ||
                    (includesNull && !t.OwnerId.HasValue));
            }

            // =========================
            // BRANCH
            // =========================
            if (query.Branches?.Any() == true)
            {
                if (query.Branches.Contains(0))
                    workstreamsQuery = workstreamsQuery.Where(t =>
                        !t.BranchId.HasValue || query.Branches.Contains(t.BranchId.Value));
                else
                    workstreamsQuery = workstreamsQuery.Where(t =>
                        t.BranchId.HasValue && query.Branches.Contains(t.BranchId.Value));
            }

            // =========================
            // PRIORITY
            // =========================
            if (query.Priority?.Any() == true)
            {
                workstreamsQuery = workstreamsQuery.Where(t => query.Priority.Contains(t.Priority));
            }

            // =========================
            // DATE
            // =========================
            if (query.FromDate != null && query.ToDate != null)
            {
                var from = query.FromDate.Value.Date;
                var to = query.ToDate.Value.Date.AddDays(1).AddTicks(-1);
            }

            // =========================
            // ORDER
            // =========================
            workstreamsQuery = workstreamsQuery
                .OrderByDescending(t => t.Priority)
                .ThenByDescending(t => t.Id);

            int totalRecords = await workstreamsQuery.CountAsync();

            var workstreams = await workstreamsQuery
                .AsNoTracking()
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            // =========================
            // TEXT FIELDS
            // =========================
            var allUsers = await _context.Users.ToListAsync();
            var allBranches = await _context.Branches.ToListAsync();


            // =========================
            // STATUS COUNTS (GLOBAL)
            // =========================
            var workstreamCountQuery = _context.Workstreams.AsQueryable();

            if (query.FromDate != null && query.ToDate != null)
            {
                var from = query.FromDate.Value.Date;
                var to = query.ToDate.Value.Date.AddDays(1).AddTicks(-1);
       
            }

            return new WorkstreamQueryResult
            {
                Workstreams = workstreams,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalRecords = totalRecords,
                TotalPlanning = await workstreamCountQuery.CountAsync(t => t.Status == WorkstreamStatus.Planning),
                TotalActive = await workstreamCountQuery.CountAsync(t => t.Status == WorkstreamStatus.Active),
                TotalOnHold = await workstreamCountQuery.CountAsync(t => t.Status == WorkstreamStatus.OnHold),
                TotalCompleted = await workstreamCountQuery.CountAsync(t => t.Status == WorkstreamStatus.Completed),
                TotalCancelled = await workstreamCountQuery.CountAsync(t => t.Status == WorkstreamStatus.Cancelled),
                Total = await workstreamCountQuery.CountAsync()
            };
        }
        public async Task<Workstream> GetWorkstreamNum(string workstreamNum)
        {

            Workstream workstream = _context.Workstreams.FirstOrDefault(x => x.WorkStreamNumber == workstreamNum);

            //List<TicketAttachment> ticketAttachments = _context.TicketAttachments
            //.Where(entity => entity.TicketId == ticket.Id)
            //.Select(entity => new TicketAttachment
            //{
            //    Id = entity.Id,
            //    FileName = entity.FileName,
            //    TicketId = entity.TicketId,
            //    TicketCommentId = entity.TicketCommentId,
            //    ContentType = entity.ContentType
            //})
            //.ToList();

            //ticket.TicketAttachments = ticketAttachments;

            //Clear repetition
            //ticket.TicketComments.ForEach(x =>
            //{
            //    x.Ticket = null;
            //    x.TicketAttachments = ticketAttachments.Where(z => z.TicketCommentId == x.Id).ToList();
            //});

            //ticket.TicketHistories.ForEach(x => x.Ticket = null);

            //ticket.OvertimeDTO = _mapp.Map<List<OvertimeDTO>>(ticket.Overtime);

        

            return workstream;
        }

        public Workstream SaveWorkStream(WorkstreamDTO WorkstreamModel)
        {
            // Get last workstream to generate ID
            Workstream lastWorkstream = _context.Workstreams
                .OrderByDescending(x => x.Id)
                .FirstOrDefault();

            // Get owner
            User user = _context.Users.FirstOrDefault(x => x.Id == WorkstreamModel.OwnerId)
                        ?? throw new Exception("Owner not found");

            // Initialize new Workstream
            Workstream newWorkstream = new Workstream
            {
                Title = WorkstreamModel.Title,
                Objective = WorkstreamModel.Objective,
                WorkStreamNumber = new GenerateID().HashAndEncode(lastWorkstream == null ? "000000" : lastWorkstream.WorkstreamId),
                OwnerId = user.Id,
                BranchId = user.BranchId,
                Priority =  Priority.Low,
                Status = WorkstreamStatus.Planning,
                StartDate = null,
                CreatedAt = CurrentDateTime,
            };
            newWorkstream.WorkstreamHistories.Add(new Models.WorkstreamHistory() { FromStatus = WorkstreamStatus.Planning, ToStatus = WorkstreamStatus.Planning, Created = CurrentDateTime, UserId = user.Id, WorkstreamId = newWorkstream.Id, PropName = "Created", OldData = "Created", NewData = "Created", });

            // Save Workstream first to generate ID
            _context.Workstreams.Add(newWorkstream);
            _context.SaveChanges();


            return newWorkstream;
        }
        public void SaveWorkstreamProp(int userId, int workstreamId, string name, string value)
        {
            Workstream workstream = _context.Workstreams.FirstOrDefault(x => x.Id == workstreamId);

            switch (name)
            {
                case "title":
                    string oldTitle = workstream.Title;
                    workstream.Title = value;
                    if (oldTitle == workstream.Title)
                    {
                        break;
                    }
                    workstream.WorkstreamHistories.Add(new Models.WorkstreamHistory() { FromStatus = workstream.Status, ToStatus = workstream.Status, Created = CurrentDateTime, UserId = userId, WorkstreamId = workstream.Id, PropName = "Title", OldData = oldTitle, NewData = value });
                    break;
                case "objective":
                    string oldDescription = workstream.Objective;
                    workstream.Objective = value;
                    if (oldDescription == workstream.Objective)
                    {
                        break;
                    }
                    workstream.WorkstreamHistories.Add(new Models.WorkstreamHistory() { FromStatus = workstream.Status, ToStatus = workstream.Status, Created = CurrentDateTime, UserId = userId, WorkstreamId = workstream.Id, PropName = "Objective", OldData = oldDescription, NewData = value });
                    break;
                case "ownerId":
                    List<User> users = _context.Users.ToList();
                    User oldUser = users.FirstOrDefault(x => x.Id == workstream.OwnerId);
                    workstream.OwnerId = int.Parse(value) == 0 ? null : int.Parse(value);
                    User newUser = users.FirstOrDefault(x => x.Id == workstream.OwnerId);

                    workstream.WorkstreamHistories.Add(new Models.WorkstreamHistory() { FromStatus = workstream.Status, ToStatus = workstream.Status, Created = CurrentDateTime, UserId = userId, WorkstreamId = workstream.Id, PropName = "Owner", OldData = oldUser == null ? "Unassigned" : oldUser.FullName, NewData = newUser == null ? "Unassigned" : newUser.FullName });
                    break;

                case "status":
                    WorkstreamStatus oldStatus = workstream.Status;
                    workstream.Status = (WorkstreamStatus)Enum.Parse(typeof(WorkstreamStatus), value);
                    workstream.WorkstreamHistories.Add(new Models.WorkstreamHistory() { FromStatus = oldStatus, ToStatus = workstream.Status, Created = CurrentDateTime, UserId = userId, WorkstreamId = workstream.Id, PropName = "Status", OldData = oldStatus.ToString().Replace("_", " "), NewData = workstream.Status.ToString().Replace("_", " ") });
                    break;
                case "priority":

                    string oldPriority = workstream.Priority.ToString();
                    workstream.Priority = (Priority)Enum.Parse(typeof(Priority), value);
                    workstream.WorkstreamHistories.Add(new Models.WorkstreamHistory() { FromStatus = workstream.Status, ToStatus = workstream.Status, Created = CurrentDateTime, UserId = userId, WorkstreamId = workstream.Id, PropName = "Priority", OldData = oldPriority, NewData = workstream.Priority.ToString() });

                    break;
                case "branchId":
                    List<Branch> branches = _context.Branches.ToList();
                    Branch oldBranch = branches.FirstOrDefault(x => x.Id == workstream.BranchId);
                    workstream.BranchId = int.Parse(value) == 0 ? null : int.Parse(value);
                    Branch newBranch = branches.FirstOrDefault(x => x.Id == workstream.BranchId);

                    workstream.WorkstreamHistories.Add(new Models.WorkstreamHistory() { FromStatus = workstream.Status, ToStatus = workstream.Status, Created = CurrentDateTime, UserId = userId, WorkstreamId = workstream.Id, PropName = "Branch", OldData = oldBranch == null ? "Unassigned" : oldBranch.Name, NewData = newBranch == null ? "Unassigned" : newBranch.Name });
                    break;
                case "startDate":
                    string oldStart = workstream.StartDate == null ? "No Start Date" : workstream.StartDate.Value.ToShortDateString();
                    string formatStart = "ddd MMM dd yyyy HH:mm:ss 'GMT'zzz";

                    int indexStart = value.IndexOf(" (");
                    if (indexStart > 0)
                    {
                        value = value.Substring(0, indexStart);
                    }
                    DateTime startDate = DateTime.ParseExact(value, formatStart, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal);
                    workstream.StartDate = startDate;
                    workstream.WorkstreamHistories.Add(new Models.WorkstreamHistory() { FromStatus = workstream.Status, ToStatus = workstream.Status, Created = CurrentDateTime, UserId = userId, WorkstreamId = workstream.Id, PropName = "Start Date", OldData = oldStart, NewData = startDate.ToShortDateString() });

                    break;
                case "dueDate":
                    string oldDue = workstream.DueDate == null ? "No Due Date" : workstream.DueDate.Value.ToShortDateString();
                    string format = "ddd MMM dd yyyy HH:mm:ss 'GMT'zzz";

                    int index = value.IndexOf(" (");
                    if (index > 0)
                    {
                        value = value.Substring(0, index);
                    }
                    DateTime dueDate = DateTime.ParseExact(value, format, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal);
                    workstream.DueDate = dueDate;
                    workstream.WorkstreamHistories.Add(new Models.WorkstreamHistory() { FromStatus = workstream.Status, ToStatus = workstream.Status, Created = CurrentDateTime, UserId = userId, WorkstreamId = workstream.Id, PropName = "Due Date", OldData = oldDue, NewData = dueDate.ToShortDateString() });

                    break;
                default:

                    break;
                    
            }

            _context.Workstreams.Update(workstream);
            _context.SaveChanges();
        }
        public async Task<List<WorkstreamHistory>> GetWorkstreamHistoriesById(int _workstreamId)
        {
            return await _context.WorkstreamHistories.Include(x => x.User).Where(x => x.WorkstreamId == _workstreamId).OrderBy(x => x.Id).ToListAsync();
        }


        public WorkstreamSubtask AddWorkstreamSubtask(WorkstreamSubtaskDTO dto)
        {
            if (dto.Id == 0)
            {
                // CREATE
                var newSubtask = new WorkstreamSubtask
                {
                    WorkstreamId = dto.WorkstreamId,
                    Title = dto.Title,
                    Description = dto.Description,
                    AssigneeId = dto.AssigneeId == 0 ? null : dto.AssigneeId,
                    BranchId = dto.BranchId == 0 ? null : dto.BranchId,
                    Status = dto.Status,
                    StartDate = dto.StartDate,
                    DueDate = dto.DueDate,
                    CompletedAt = dto.CompletedAt,
                    EstimatedEffortHours = dto.EstimatedEffortHours,
                    IsBlocking = dto.IsBlocking,
                    CreatedAt = DateTime.UtcNow
                };

                _context.WorkstreamSubtasks.Add(newSubtask);
                _context.SaveChanges();

                return newSubtask;
            }
            else
            {
                // UPDATE – find first, then map
                var existing = _context.WorkstreamSubtasks
                    .FirstOrDefault(x => x.Id == dto.Id);

                if (existing == null)
                    throw new Exception("Workstream subtask not found.");

                existing.WorkstreamId = dto.WorkstreamId;
                existing.Title = dto.Title;
                existing.Description = dto.Description;
                existing.AssigneeId = dto.AssigneeId == 0 ? null : dto.AssigneeId; 
                existing.BranchId = dto.BranchId == 0 ? null : dto.BranchId;
                existing.Status = dto.Status;
                existing.StartDate = dto.StartDate;
                existing.DueDate = dto.DueDate;
                existing.CompletedAt = dto.CompletedAt;
                existing.EstimatedEffortHours = dto.EstimatedEffortHours;
                existing.IsBlocking = dto.IsBlocking;
                // ❌ Do NOT touch CreatedAt

                _context.SaveChanges();
                return existing;
            }
        }
        public async Task<List<WorkstreamSubtask>> GetWorkstreamSubtaskByWorkstreamId(int workstreamId)
        {
            List<WorkstreamSubtask> subtasks = await _context.WorkstreamSubtasks.Include(q=>q.Branch).Include(q=>q.Assignee).Where(x => x.WorkstreamId == workstreamId).ToListAsync();

            return subtasks;
        }
        public async Task<List<Ticket>> GetWorkstreamTicketByWorkstreamId(int workstreamId)
        {
            List<Ticket> tickets = await _context.Tickets.Where(q=>q.WorkstreamId == workstreamId).ToListAsync();

            return tickets;
        }
        public void AddLinkTicket(LinkTicketWorkstreamDTO dto)
        {
            var workstream = _context.Workstreams.Include(x => x.Tickets).FirstOrDefault(x => x.Id == dto.WorkstreamId);
            if (workstream == null)
                throw new Exception("Workstream not found.");
            var ticket = _context.Tickets.FirstOrDefault(x => x.Id == dto.TicketId);
            if (ticket == null)
                throw new Exception("Ticket not found.");
            if (!workstream.Tickets.Any(x => x.Id == ticket.Id))
            {
                workstream.Tickets.Add(ticket);
                _context.SaveChanges();
            }
        }
        public void RemoveLinkTicket(LinkTicketWorkstreamDTO dto)
        {
            var workstream = _context.Workstreams.Include(x => x.Tickets).FirstOrDefault(x => x.Id == dto.WorkstreamId);
            if (workstream == null)
                throw new Exception("Workstream not found.");
            var ticket = _context.Tickets.FirstOrDefault(x => x.Id == dto.TicketId);
            if (ticket == null)
                throw new Exception("Ticket not found.");
            if (workstream.Tickets.Any(x => x.Id == ticket.Id))
            {
                workstream.Tickets.Remove(ticket);
                _context.SaveChanges();
            }
        }


    }
}
