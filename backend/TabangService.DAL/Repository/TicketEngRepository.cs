using AutoMapper;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Net.Sockets;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Xml.Linq;
using Tabang.Models;
using TabangService.DAL.Builder;
using TabangService.DAL.Model;
using TabangService.DAL.Models;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Repository
{
    public class TicketEngRepository
    {
        private readonly TabangContextEng _context;
        private readonly TabangAttachmentContextEng _attachmentContext;
        private readonly TimeZoneInfo _manilaTimeZone;
        private readonly DateTime CurrentDateTime;
        private readonly IMapper _mapp;
        public TicketEngRepository(IMapper mapper)
        {
            _mapp = mapper;
            _context = new TabangContextEng();
            _attachmentContext = new TabangAttachmentContextEng();
            _manilaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Taipei Standard Time");
            CurrentDateTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _manilaTimeZone);
        }
        public async Task<TicketDTOQueryResult> GetTickets(TicketQuery query)
        {
            try
            {
                using var connection = _context.Database.GetDbConnection();

                if (connection.State != ConnectionState.Open)
                    await connection.OpenAsync();

                var sql = "SELECT TOP 100000 * FROM Tickets";

                var tickets = (await connection.QueryAsync<TicketDTO>(sql)).ToList();



                var sqlUsers = "SELECT * FROM Users";

                var users = (await connection.QueryAsync<UserDTO>(sqlUsers)).ToList();


                var sqlBranch = "SELECT * FROM Branches";

                var branches = (await connection.QueryAsync<BranchDTO>(sqlBranch)).ToList();


                foreach (var ticket in tickets)
                {
                    ticket.AssigneeText = ticket.AssigneeId != null ? users.FirstOrDefault(q => q.Id == ticket.AssigneeId).FullName : "Unassigned";
                    ticket.ReporterText = ticket.ReporterId != null ? users.FirstOrDefault(q => q.Id == ticket.ReporterId).FullName : "Unassigned";
                    ticket.BranchName = ticket.BranchId != null ? branches.FirstOrDefault(q => q.Id == ticket.BranchId).Name : "Unassigned";
                }
                return new TicketDTOQueryResult
                {
                    Tickets = tickets,
                    PageNumber = query.PageNumber,
                    PageSize = query.PageSize,
                    TotalRecords = tickets.Count
                };

                //if (user == null)
                //{
                //    throw new Exception("User not found");
                //}

                //var ticketsQuery = _context.Tickets
                //    .AsQueryable();

                //if (user.Role == UserRole.Assignee)
                //{
                //    ticketsQuery = ticketsQuery.Where(t => t.AssigneeId == user.Id);
                //}
                //else if (user.Role == UserRole.Reporter)
                //{
                //    ticketsQuery = ticketsQuery.Where(t => t.ReporterId == user.Id);
                //}

                //if (user.Role == UserRole.Admin)
                //{
                //    if (query.DepartmentBase?.Any() == true)
                //    {
                //        if (!query.DepartmentBase.Contains(DepartmentBase.All))
                //        {
                //            ticketsQuery = ticketsQuery.Where(t => query.DepartmentBase.Contains(t.DepartmentBase));
                //        }

                //    }
                //}
                //else
                //{
                //    if (query.DepartmentBase?.Any() == true)
                //    {
                //        if (!query.DepartmentBase.Contains(DepartmentBase.All))
                //        {
                //            ticketsQuery = ticketsQuery.Where(t => query.DepartmentBase.Contains(t.DepartmentBase));
                //        }

                //    }
                //    else
                //    {
                //        ticketsQuery = ticketsQuery.Where(t => t.AssigneeId == user.Id || t.DepartmentBase == user.DepartmentBase);
                //    }
                //}


                ////search
                //if (!string.IsNullOrEmpty(query.Search))
                //{
                //    ticketsQuery = ticketsQuery.Where(t =>
                //        t.TicketNumber.Contains(query.Search) ||
                //        t.Title.Contains(query.Search) ||
                //        t.Description.Contains(query.Search)
                //    );
                //}

                ////status
                //if (query.Status?.Any() == true)
                //{
                //    if (!query.Status.Contains(TicketStatus.All))
                //    {
                //        ticketsQuery = ticketsQuery.Where(t => query.Status.Contains(t.Status));
                //    }
                //}
                ////users
                //if (query.UserOption?.Any() == true)
                //{
                //    ticketsQuery = ticketsQuery.Where(t => t.AssigneeId.HasValue &&
                //                                           query.UserOption.Contains(t.AssigneeId.Value));
                //}
                ////branches
                //if (query.Branches?.Any() == true)
                //{
                //    if (query.Branches.Contains(0))
                //    {
                //        ticketsQuery = ticketsQuery.Where(t => !t.BranchId.HasValue || query.Branches.Contains(t.BranchId.Value));
                //    }
                //    else
                //    {
                //        ticketsQuery = ticketsQuery.Where(t => t.BranchId.HasValue && query.Branches.Contains(t.BranchId.Value));
                //    }
                //}

                ////priority
                //if (query.Priority?.Any() == true)
                //{
                //    ticketsQuery = ticketsQuery.Where(t => query.Priority.Contains(t.Priority));
                //}


                ////query
                //ticketsQuery = ticketsQuery
                //    .OrderByDescending(x => x.Priority)
                //    .ThenByDescending(x => x.TimeStamp)
                //    .ThenByDescending(x => x.Id);

                //int totalRecords = await ticketsQuery.CountAsync();

                //var allUser = await _context.Users.ToListAsync();
                //var allBranch = await _context.Branches.ToListAsync();

                //var tickets = await ticketsQuery
                //.AsNoTracking()
                //.Skip((query.PageNumber - 1) * query.PageSize)
                //.Take(query.PageSize)
                //.ToListAsync();

                //foreach (var ticket in tickets)
                //{
                //    ticket.AssigneeText = ticket.AssigneeId != null ? allUser.FirstOrDefault(q => q.Id == ticket.AssigneeId).FullName : "Unassigned";
                //    ticket.ReporterText = ticket.ReporterId != null ? allUser.FirstOrDefault(q => q.Id == ticket.ReporterId).FullName : "Unassigned";
                //    ticket.BranchName = ticket.BranchId != null ? allBranch.FirstOrDefault(q => q.Id == ticket.BranchId).Name : "Unassigned";
                //}

                //return new TicketQueryResult
                //{
                //    Tickets = tickets,
                //    PageNumber = query.PageNumber,
                //    PageSize = query.PageSize,
                //    TotalRecords = totalRecords
                //};
            }
            catch (Exception x)
            {

                throw;
            }
}

        public async Task<List<Ticket>> GetTickets(DateTime? _timeStamp = null, string search = null)
        {
            //if (_timeStamp != null)
            //{
            //    DateTime? LastTimeStamp = _context.Tickets
            //        .OrderByDescending(t => t.TimeStamp)
            //        .FirstOrDefault()?.TimeStamp;

            //    if (LastTimeStamp.HasValue)
            //    {
            //        DateTime lastTimeStampConvert = new DateTime(
            //            LastTimeStamp.Value.Year, LastTimeStamp.Value.Month, LastTimeStamp.Value.Day,
            //            LastTimeStamp.Value.Hour, LastTimeStamp.Value.Minute, LastTimeStamp.Value.Second);

            //        DateTime paramTimeStampConvert = new DateTime(
            //            _timeStamp.Value.Year, _timeStamp.Value.Month, _timeStamp.Value.Day,
            //            _timeStamp.Value.Hour, _timeStamp.Value.Minute, _timeStamp.Value.Second);

            //        if (lastTimeStampConvert <= paramTimeStampConvert)
            //        {
            //            return new List<Ticket>();
            //        }
            //    }
            //}

            //var allUser = await _context.Users.AsNoTracking().ToListAsync();
            //var allBranch = await _context.Branches.AsNoTracking().ToListAsync();


            //var data = await _context.Tickets
            //    .AsNoTracking()
            //    .OrderByDescending(x => x.Priority)
            //    .ThenByDescending(x => x.Id)
            //    .Take(1000)
            //    .ToListAsync();



            //data.ForEach(x =>
            //{
            //    x.OvertimeDTO = _mapp.Map<List<OvertimeDTO>>(x.Overtime);
            //    x.ReporterText = x.ReporterId != null ? allUser.FirstOrDefault(q => q.Id == x.ReporterId).FullName : "Unassigned";
            //    x.AssigneeText = x.AssigneeId != null ? allUser.FirstOrDefault(q => q.Id == x.AssigneeId).FullName : "Unassigned";
            //    x.BranchName = x.BranchId != null ? allBranch.FirstOrDefault(q => q.Id == x.BranchId).Name : "Unassigned";
            //    x.Reporter = null;
            //    x.Assignee = null;
            //    x.Branch = null;
            //    x.Overtime = null;
            //});

            //return data;
            return new List<Ticket>();
        }

        public async Task<List<Ticket>> GetTicketSearch(string search)
        {
            //var query = await _context.Tickets
            //.Include(x => x.Assignee)
            //.Include(x => x.Branch)
            //.Include(x => x.Reporter)
            //.Include(x => x.TicketComments)
            //.Where(x => x.TicketNumber.ToLower().Contains(search.ToLower())
            //|| x.Title.ToLower().Contains(search.ToLower())
            //|| x.Description.ToLower().Contains(search.ToLower())
            //|| x.Branch.Name.ToLower().Contains(search.ToLower())
            //|| x.Reporter.FullName.ToLower().Contains(search.ToLower())
            //|| x.TicketComments.Any(q => q.Comment.ToLower().Contains(search.ToLower()))
            //).OrderByDescending(x => x.Id).Take(500).ToListAsync();

            //query.ForEach(x =>
            //{
            //    x.ReporterText = x.Reporter != null ? x.Reporter.FullName : "Unassigned";
            //    x.AssigneeText = x.Assignee != null ? x.Assignee.FullName : "Unassigned";
            //    x.BranchName = x.Branch != null ? x.Branch.Name : "Unassigned";
            //    x.Reporter = null;
            //    x.Assignee = null;
            //    x.Branch = null;
            //});
            //return query;

            return new List<Ticket>();

        }
        public async Task<Ticket> GetTicketNum(string ticketNum)
        {

            //Ticket ticket = _context.Tickets
            //    .Include(x => x.TicketCatchups)
            //    .Include(x => x.TicketHistories)
            //    .Include(q => q.TicketAssets).ThenInclude(q => q.Asset)
            //    .Include(x => x.TicketComments.Where(q => q.isDeleted == false))
            //    .ThenInclude(t => t.User)
            //    .Include(x => x.Overtime).ThenInclude(z => z.User).FirstOrDefault(x => x.TicketNumber == ticketNum);

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

            ////Clear repetition
            //ticket.TicketComments.ForEach(x =>
            //{
            //    x.Ticket = null;
            //    x.TicketAttachments = ticketAttachments.Where(z => z.TicketCommentId == x.Id).ToList();
            //});

            //ticket.TicketHistories.ForEach(x => x.Ticket = null);

            //ticket.OvertimeDTO = _mapp.Map<List<OvertimeDTO>>(ticket.Overtime);

            //if (ticket.Assignee != null) ticket.Assignee.Tickets = null;
            //if (ticket.Reporter != null) ticket.Reporter.Tickets = null;
            ////if (ticket.Reporter != null) ticket.Reporter.Overtime = null;
            //if (ticket.Assignee != null) ticket.Assignee.ReporterTickets = null;
            //if (ticket.Reporter != null) ticket.Reporter.ReporterTickets = null;
            //if (ticket.Overtime != null) ticket.Overtime = null;

            //return ticket;
            return new Ticket();
        }
        public Ticket PostTicket(TicketModel ticketModel, IFormFileCollection files)
        {
            //Ticket lastticket = _context.Tickets.OrderByDescending(x => x.Id).FirstOrDefault();
            //Ticket ticket = new Ticket() { Title = ticketModel.Title, Description = ticketModel.Description, ReporterId = ticketModel.ReporterId };
            //User user = _context.Users.FirstOrDefault(x => x.Id == ticket.ReporterId);

            //ticket.BranchId = user.BranchId == null ? null : user.BranchId;
            //ticket.CalledIn = CurrentDateTime;
            //ticket.Status = Models.Enums.TicketStatus.Open;
            //ticket.TicketNumber = new GenerateID().HashAndEncode(lastticket == null ? "000000" : lastticket.TicketId);
            //ticket.TimeStamp = CurrentDateTime;
            //ticket.DepartmentBase = user.DepartmentBase;


            //ticket.TicketAttachments = new List<TicketAttachment>();
            //ticket.TicketHistories = new List<TicketHistory>();


            //ticket.TicketHistories.Add(new Models.TicketHistory() { FromStatus = TicketStatus.Open, ToStatus = TicketStatus.Open, Created = CurrentDateTime, UserId = ticket.ReporterId.Value, TicketId = ticket.Id, PropName = "Created", OldData = "Created", NewData = "Created", });

            //foreach (var file in files)
            //{
            //    var ticketAttachment = new TicketAttachment
            //    {
            //        //TicketId = ticket.Id,
            //        FileName = file.FileName,
            //        ContentType = file.ContentType,
            //        //Content = ReadFileContent(file)
            //        Content = new byte[0]
            //    };
            //    ticket.TicketAttachments.Add(ticketAttachment);
            //}

            //_context.Tickets.Add(ticket);
            //_context.SaveChanges();


            ////seperate DB
            //List<TabangAttachmentContext.TicketAttachment> tattachment = new List<TabangAttachmentContext.TicketAttachment>();
            //int count = 0;
            //foreach (var file in files)
            //{
            //    var ticketAttachment = new TabangAttachmentContext.TicketAttachment
            //    {
            //        AttachmentId = ticket.TicketAttachments[count].Id,
            //        TicketId = ticket.Id,
            //        FileName = file.FileName,
            //        ContentType = file.ContentType,
            //        Content = ReadFileContent(file)
            //    };
            //    tattachment.Add(ticketAttachment);

            //    count += 1;
            //}
            //_attachmentContext.AddRange(tattachment);
            //_attachmentContext.SaveChanges();


            //ticket.TicketHistories = new List<Models.TicketHistory>();
            //ticket.TicketAttachments = new List<Models.TicketAttachment>();
            //ticket.Branch = null;
            //ticket.Assignee = null;
            //ticket.Reporter = null;
            //return ticket;
            return new Ticket();
        }

        //private byte[] ReadFileContent(IFormFile file)
        //{
        //    using (var memoryStream = new MemoryStream())
        //    {
        //        file.CopyTo(memoryStream);
        //        return memoryStream.ToArray();
        //    }
        //}
        public Ticket UpdateTicket(TicketModel _ticketModel)
        {
            //Ticket ticket = new Ticket()
            //{
            //    Id = _ticketModel.Id,
            //    Title = _ticketModel.Title,
            //    Description = _ticketModel.Description,
            //    TicketNumber = _ticketModel.TicketNumber,
            //    CalledIn = _ticketModel.CalledIn,
            //    Status = _ticketModel.Status,
            //    AssigneeId = _ticketModel.AssigneeId == 0 ? null : _ticketModel.AssigneeId,
            //    ReporterId = _ticketModel.ReporterId,
            //    BranchId = _ticketModel.BranchId == 0 ? null : _ticketModel.BranchId,
            //    TimeStamp = CurrentDateTime,
            //    LinkTickets = _ticketModel.LinkTickets
            //};


            //if (ticket.Status != _ticketModel.OldStatus)
            //{

            //    _context.TicketHistories.Add(new Models.TicketHistory() { FromStatus = _ticketModel.OldStatus, ToStatus = ticket.Status, Created = CurrentDateTime, UserId = _ticketModel.CurrentUserId.Value, TicketId = ticket.Id, PropName = "Status", OldData = _ticketModel.OldStatus.ToString().Replace("_", " "), NewData = "Done", });

            //}
            //if (!string.IsNullOrEmpty(_ticketModel.Resolution))
            //{
            //    TicketComment ticketComment = new TicketComment();
            //    ticketComment.Created = CurrentDateTime;
            //    ticketComment.Comment = _ticketModel.Resolution;
            //    ticketComment.UserId = _ticketModel.CurrentUserId.Value;
            //    ticketComment.TicketId = ticket.Id;

            //    _context.TicketComments.Add(ticketComment);

            //}

            //if (_ticketModel.Id > 0)
            //{
            //    _context.TicketAssets.Where(q => q.TicketFK == _ticketModel.Id).ExecuteDelete();
            //    if (_ticketModel.ticketAssets != null && _ticketModel.ticketAssets.Count > 0)
            //    {
            //        foreach (var ticketAsset in _ticketModel.ticketAssets)
            //        {
            //            _context.TicketAssets.Add(new TicketAsset()
            //            {
            //                AssetFK = ticketAsset.Value,
            //                TicketFK = _ticketModel.Id
            //            });
            //        }
            //    }
            //}

            //_context.Tickets.Update(ticket);
            //_context.SaveChanges();
            //ticket.TicketHistories = new List<TicketHistory>();
            //ticket.TicketComments = new List<TicketComment>();
            //return ticket;

            return new Ticket();
        }
        public async Task<List<TicketHistory>> GetTicketHistoriesById(int _ticketId)
        {
            //return await _context.TicketHistories.Include(x => x.User).Where(x => x.TicketId == _ticketId).OrderBy(x => x.Id).ToListAsync();

            return new List<TicketHistory>();
        }
        public async Task<List<TicketAttachment>> GetTicketAttachmentById(int _ticketId)
        {
            //List<TicketAttachment> attachments = await _context.TicketAttachments.Where(x => x.TicketId == _ticketId).ToListAsync();

            //return attachments;
            return new List<TicketAttachment>();
        }


        public async Task<object> GetAttachmentById(int _attachmentId)
        {
            //try
            //{
            //    var attachment = await _context.TicketAttachments.Where(x => x.Id == _attachmentId).FirstOrDefaultAsync();

            //    if (attachment.Content.Length > 0)
            //    {
            //        return attachment;
            //    }
            //    //TicketAttachment attachment = await _context.TicketAttachments.Where(x => x.Id == _attachmentId).FirstOrDefaultAsync();
            //    var attachmentNew = await _attachmentContext.TicketAttachments.Where(x => x.AttachmentId == _attachmentId).FirstOrDefaultAsync();

            //    return attachmentNew;
            //}
            //catch (Exception ex)
            //{

            //    throw;
            //}
            return null;
        }



        public TicketComment PostTicketComment(TicketCommentModel _ticketComment, IFormFileCollection files)
        {
            //Ticket ticket = _context.Tickets.FirstOrDefault(x => x.Id == _ticketComment.TicketId);
            //User currentUser = _context.Users.FirstOrDefault(x => x.Id == _ticketComment.UserId);

            ////Notifications
            //string mentionPattern = @"@\[([^\]]+)\]\((\d+)\)";
            //Regex regex = new Regex(mentionPattern);

            //List<User> mentions = new List<User>();
            //List<Notification> notifications = new List<Notification>();

            //MatchCollection matches = regex.Matches(_ticketComment.Comment);

            //foreach (Match match in matches)
            //{
            //    string fullname = match.Groups[1].Value;
            //    int userId = int.Parse(match.Groups[2].Value);
            //    if (currentUser.Id != userId)
            //    {
            //        if (mentions.FirstOrDefault(x => x.Id == userId) == null)
            //        {
            //            mentions.Add(new User { FullName = fullname, Id = userId });
            //        }
            //    }
            //}

            //foreach (User user in mentions)
            //{
            //    notifications.Add(new Notification() { FromUserId = currentUser.Id, ToUserId = user.Id, TicketId = ticket.Id, PropName = "Comment", Message = "mentioned you", Date = CurrentDateTime });
            //}

            //ticket.Notifications.AddRange(notifications);

            ////Ticket Comments and Attachment
            //TicketComment ticketComment = new TicketComment();
            //ticketComment.Created = CurrentDateTime;
            //ticketComment.Comment = _ticketComment.Comment;
            //ticketComment.UserId = _ticketComment.UserId;
            //ticketComment.TicketId = _ticketComment.TicketId;

            //foreach (var file in files)
            //{
            //    var ticketAttachment = new TicketAttachment
            //    {
            //        TicketId = _ticketComment.TicketId,
            //        FileName = file.FileName,
            //        ContentType = file.ContentType,
            //        Content = new byte[0]
            //    };
            //    ticketComment.TicketAttachments.Add(ticketAttachment);
            //}

            //ticket.TicketComments.Add(ticketComment);
            //_context.Tickets.Update(ticket);
            ////_context.TicketComments.Add(ticketComment);
            //_context.SaveChanges();
            //ticketComment.TicketAttachments.ForEach(x =>
            //{
            //    x.TicketComment = new TicketComment();
            //    x.Ticket = new Ticket();
            //    x.Content = null;

            //});

            ////seperate DB for Attachment
            //List<TabangAttachmentContext.TicketAttachment> tattachment = new List<TabangAttachmentContext.TicketAttachment>();
            //int count = 0;
            //foreach (var file in files)
            //{
            //    var ticketAttachment = new TabangAttachmentContext.TicketAttachment
            //    {
            //        AttachmentId = ticketComment.TicketAttachments[count].Id,
            //        TicketId = ticketComment.TicketId,
            //        TicketCommentId = ticketComment.Id,
            //        FileName = file.FileName,
            //        ContentType = file.ContentType,
            //        Content = ReadFileContent(file)
            //    };
            //    tattachment.Add(ticketAttachment);
            //    count += 1;
            //}
            //_attachmentContext.AddRange(tattachment);
            //_attachmentContext.SaveChanges();
            //ticketComment.Ticket = null;
            //ticketComment.User = null;
            //return ticketComment
            return new TicketComment();
        }

        public async Task<List<TicketComment>> GetTicketCommentsById(int _ticketId)
        {
            //var ticketComments = await _context.TicketComments.Include(x => x.User).Include(x => x.TicketAttachments).Where(x => x.TicketId == _ticketId && x.isDeleted == false).OrderBy(x => x.Id).ToListAsync();

            //foreach (var ticketComment in ticketComments)
            //{
            //    foreach (var item in ticketComment.TicketAttachments)
            //    {
            //        item.Ticket = new Ticket();
            //        item.TicketComment = new TicketComment();
            //    }
            //}
            //return ticketComments;
            return new List<TicketComment>();
        }

        public async Task<string> GetTicketRelatedIssuesById(int _ticketId)
        {
            //var ticket = await _context.Tickets.AsNoTracking().FirstOrDefaultAsync(q => q.Id == _ticketId);

            //return ticket.LinkTickets;
            return "";
        }


        public void SaveStarRating(int ticketId, int star)
        {
            //Ticket ticket = _context.Tickets.FirstOrDefault(x => x.Id == ticketId);
            ////ticket.TimeStamp = DateTime.Now.AddHours(8);
            //ticket.StarRate = star;
            //_context.Tickets.Update(ticket);
            //_context.SaveChanges();
        }



        public string AddLinkToTicket(TicketLinkDTO ticketLinkDTO)
        {
            //if (ticketLinkDTO.LinkTicketNumber.EndsWith("/"))
            //{
            //    ticketLinkDTO.LinkTicketNumber = ticketLinkDTO.LinkTicketNumber.Substring(0, ticketLinkDTO.LinkTicketNumber.Length - 1);
            //}

            //ticketLinkDTO.LinkTicketNumber = ticketLinkDTO.LinkTicketNumber.Substring(ticketLinkDTO.LinkTicketNumber.Length - 7).ToUpper();

            //Ticket checkExistingTicket = _context.Tickets.AsNoTracking().FirstOrDefault(x => x.TicketNumber == ticketLinkDTO.LinkTicketNumber);
            //if (checkExistingTicket == null)
            //{
            //    throw new Exception("Invalid Ticket link or TicketNumber");
            //}

            //Ticket ticket = _context.Tickets.AsNoTracking().FirstOrDefault(x => x.Id == ticketLinkDTO.TicketId);
            //if (ticket.TicketNumber == ticketLinkDTO.LinkTicketNumber)
            //{
            //    throw new Exception("Cannot link to same ticket");
            //}

            //if (ticket.LinkTickets.Contains(ticketLinkDTO.LinkTicketNumber))
            //{
            //    throw new Exception("Already linked");
            //}
            //if (string.IsNullOrEmpty(ticket.LinkTickets))
            //{ ticket.LinkTickets = checkExistingTicket.Title + " - " + ticketLinkDTO.LinkTicketNumber; }
            //else
            //{ ticket.LinkTickets += ".,." + checkExistingTicket.Title + " - " + ticketLinkDTO.LinkTicketNumber; }


            //_context.Tickets.Update(ticket);
            //_context.SaveChanges();

            //return ticket.LinkTickets;
            return "";
        }


        public void SaveTicketProp(int userId, int ticketId, string name, string value)
        {
            //Ticket ticket = _context.Tickets.FirstOrDefault(x => x.Id == ticketId);

            //switch (name)
            //{
            //    case "title":
            //        string oldTitle = ticket.Title;
            //        ticket.Title = value;
            //        if (oldTitle == ticket.Title)
            //        {
            //            break;
            //        }
            //        ticket.TicketHistories.Add(new Models.TicketHistory() { FromStatus = ticket.Status, ToStatus = ticket.Status, Created = CurrentDateTime, UserId = userId, TicketId = ticket.Id, PropName = "Title", OldData = oldTitle, NewData = value });
            //        break;
            //    case "description":
            //        string oldDescription = ticket.Description;
            //        ticket.Description = value;
            //        if (oldDescription == ticket.Description)
            //        {
            //            break;
            //        }
            //        ticket.TicketHistories.Add(new Models.TicketHistory() { FromStatus = ticket.Status, ToStatus = ticket.Status, Created = CurrentDateTime, UserId = userId, TicketId = ticket.Id, PropName = "Description", OldData = oldDescription, NewData = value });
            //        break;
            //    case "dueDate":
            //        string oldDue = ticket.DueDate == null ? "No Due Date" : ticket.DueDate.Value.ToShortDateString();
            //        string format = "ddd MMM dd yyyy HH:mm:ss 'GMT'zzz";

            //        int index = value.IndexOf(" (");
            //        if (index > 0)
            //        {
            //            value = value.Substring(0, index);
            //        }
            //        DateTime dueDate = DateTime.ParseExact(value, format, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal);
            //        ticket.DueDate = dueDate;
            //        ticket.TicketHistories.Add(new Models.TicketHistory() { FromStatus = ticket.Status, ToStatus = ticket.Status, Created = CurrentDateTime, UserId = userId, TicketId = ticket.Id, PropName = "Due Date", OldData = oldDue, NewData = dueDate.ToShortDateString() });

            //        break;
            //    case "status":
            //        TicketStatus oldStatus = ticket.Status;
            //        ticket.Status = (TicketStatus)Enum.Parse(typeof(TicketStatus), value);
            //        ticket.TicketHistories.Add(new Models.TicketHistory() { FromStatus = ticket.Status, ToStatus = ticket.Status, Created = CurrentDateTime, UserId = userId, TicketId = ticket.Id, PropName = "Status", OldData = oldStatus.ToString().Replace("_", " "), NewData = ticket.Status.ToString().Replace("_", " ") });
            //        break;
            //    case "priority":

            //        string oldPriority = ticket.Priority.ToString();
            //        ticket.Priority = (Priority)Enum.Parse(typeof(Priority), value);
            //        ticket.TicketHistories.Add(new Models.TicketHistory() { FromStatus = ticket.Status, ToStatus = ticket.Status, Created = CurrentDateTime, UserId = userId, TicketId = ticket.Id, PropName = "Priority", OldData = oldPriority, NewData = ticket.Priority.ToString() });

            //        break;
            //    case "departmentBase":

            //        string oldDepartment = ticket.DepartmentBase.ToString();
            //        ticket.DepartmentBase = (DepartmentBase)Enum.Parse(typeof(DepartmentBase), value);
            //        ticket.TicketHistories.Add(new Models.TicketHistory() { FromStatus = ticket.Status, ToStatus = ticket.Status, Created = CurrentDateTime, UserId = userId, TicketId = ticket.Id, PropName = "Department", OldData = oldDepartment, NewData = ticket.DepartmentBase.ToString() });

            //        break;
            //    case "branchId":
            //        List<Branch> branches = _context.Branches.ToList();
            //        Branch oldBranch = branches.FirstOrDefault(x => x.Id == ticket.BranchId);
            //        ticket.BranchId = int.Parse(value) == 0 ? null : int.Parse(value);
            //        Branch newBranch = branches.FirstOrDefault(x => x.Id == ticket.BranchId);

            //        ticket.TicketHistories.Add(new Models.TicketHistory() { FromStatus = ticket.Status, ToStatus = ticket.Status, Created = CurrentDateTime, UserId = userId, TicketId = ticket.Id, PropName = "Branch", OldData = oldBranch == null ? "Unassigned" : oldBranch.Name, NewData = newBranch == null ? "Unassigned" : newBranch.Name });
            //        break;
            //    case "assigneeId":
            //        List<User> users = _context.Users.ToList();
            //        User oldUser = users.FirstOrDefault(x => x.Id == ticket.AssigneeId);
            //        ticket.AssigneeId = int.Parse(value) == 0 ? null : int.Parse(value);
            //        User newUser = users.FirstOrDefault(x => x.Id == ticket.AssigneeId);

            //        ticket.TicketHistories.Add(new Models.TicketHistory() { FromStatus = ticket.Status, ToStatus = ticket.Status, Created = CurrentDateTime, UserId = userId, TicketId = ticket.Id, PropName = "Assignee", OldData = oldUser == null ? "Unassigned" : oldUser.FullName, NewData = newUser == null ? "Unassigned" : newUser.FullName });
            //        break;
            //    case "ticketAssets":
            //        if (!string.IsNullOrEmpty(value) && ticket != null)
            //        {
            //            _context.TicketAssets.Add(new TicketAsset()
            //            {
            //                AssetFK = int.Parse(value),
            //                TicketFK = ticket.Id
            //            });
            //        }
            //        break;
            //    case "ticketAssetsRemove":
            //        if (!string.IsNullOrEmpty(value) && ticket != null)
            //        {
            //            IEnumerable<TicketAssetUpdateDto> ticketAssets = JsonConvert.DeserializeObject<IEnumerable<TicketAssetUpdateDto>>(value);
            //            if (ticketAssets != null && ticketAssets.Count() > 0)
            //            {
            //                foreach (var ticketAsset in ticketAssets)
            //                {
            //                    _context.TicketAssets.Where(q => q.Id == ticketAsset.Value).ExecuteDelete();
            //                }
            //            }
            //        }
            //        break;
            //    default:

            //        break;

            //        //case "ticketAssets":
            //        //    if(!string.IsNullOrEmpty(value) && ticket != null)
            //        //    {
            //        //        IEnumerable<TicketAssetUpdateDto> ticketAssets = JsonConvert.DeserializeObject<IEnumerable<TicketAssetUpdateDto>>(value);
            //        //        _context.TicketAssets.Where(q => q.TicketFK == ticket.Id).ExecuteDelete();
            //        //        if (ticketAssets != null && ticketAssets.Count() > 0)
            //        //        {
            //        //            foreach (var ticketAsset in ticketAssets)
            //        //            {
            //        //                _context.TicketAssets.Add(new TicketAsset()
            //        //                {
            //        //                    AssetFK = ticketAsset.Value,
            //        //                    TicketFK = ticket.Id
            //        //                });
            //        //            }
            //        //        }
            //        //    }
            //        //    break;
            //        //default:

            //        //    break;
            //}

            //ticket.TimeStamp = CurrentDateTime;
            //_context.Tickets.Update(ticket);
            //_context.SaveChanges();
        }
        public void EditComment(int ticketCommentId, string newcomment)
        {
            //TicketComment commment = _context.TicketComments.FirstOrDefault(x => x.Id == ticketCommentId);
            //commment.Comment = newcomment;
            //_context.TicketComments.Update(commment);
            //_context.SaveChanges();
        }
        public void DeleteComment(int ticketCommentId)
        {
            //TicketComment commment = _context.TicketComments.FirstOrDefault(x => x.Id == ticketCommentId);
            //commment.isDeleted = true;
            //_context.TicketComments.Update(commment);
            //_context.SaveChanges();
        }

        public void SaveCatchUp(int ticketId, int userId)
        {

            //Ticket ticket = _context.Tickets.FirstOrDefault(x => x.Id == ticketId);
            //ticket.TimeStamp = CurrentDateTime;


            //TicketCatchup ticketCatchup = new TicketCatchup();
            //ticketCatchup.Date = DateTime.Now;
            //ticketCatchup.UserId = userId;
            //ticketCatchup.TicketId = ticketId;

            //_context.Tickets.Update(ticket);
            //_context.TicketCatchups.Add(ticketCatchup);
            //_context.SaveChanges();
        }
        public async Task<List<TicketCatchup>> GetTicketCatchup(int ticketId)
        {
            //return await _context.TicketCatchups.AsNoTracking().Include(q => q.Ticket).Include(q => q.User).Where(q => q.TicketId == ticketId).ToListAsync();
            return new List<TicketCatchup>();
        }



    }
}
