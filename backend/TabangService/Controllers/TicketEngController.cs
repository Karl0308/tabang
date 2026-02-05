using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tabang.Models;
using TabangService.DAL;
using TabangService.DAL.Model;
using TabangService.DAL.Models;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Models.Enums;
using TabangService.DAL.Repository;

namespace TabangService.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class TicketEngController : ControllerBase
    {
        private readonly IMapper _mapper;
        public TicketEngController(IMapper mapper)
        {
            _mapper = mapper;
        }

        [HttpPost]
        public async Task<ActionResult<TicketQueryResult>> GetTickets([FromBody] TicketQuery filter)
        {
            if (filter == null) return BadRequest("Invalid query parameters.");

            return Ok(await new TicketEngRepository(_mapper).GetTickets(filter));

        }

        [HttpGet]
        public async Task<ActionResult<List<Ticket>>> GetTickets(DateTime? _timeStamp = null, string search = null)
        {
            return Ok(await new TicketEngRepository(_mapper).GetTickets(_timeStamp, search));
        }

        [HttpGet]
        public async Task<ActionResult<List<Ticket>>> GetTicketSearch(string search)
        {
            return Ok(await new TicketEngRepository(_mapper).GetTicketSearch(search));
        }

        [HttpGet]
        public async Task<ActionResult<Ticket>> GetTicketNum(string ticketNum)
        {
            return Ok(await new TicketEngRepository(_mapper).GetTicketNum(ticketNum));
        }


        [HttpPost]
        public IActionResult SaveTicket()
        {
            try
            {
                var ticketModel = new TicketModel
                {
                    Title = Request.Form["title"],
                    Description = Request.Form["description"],
                    Status = (TicketStatus)Enum.Parse(typeof(TicketStatus), Request.Form["status"]),
                    OldStatus = (TicketStatus)Enum.Parse(typeof(TicketStatus), Request.Form["oldStatus"]),
                    Resolution = Request.Form["resolution"],
                    AssigneeId = Convert.ToInt32(Request.Form["assigneeId"]),
                    CurrentUserId = Convert.ToInt32(Request.Form["currentUserId"]),
                    ReporterId = Convert.ToInt32(Request.Form["reporterId"]),
                    BranchId = Convert.ToInt32(Request.Form["branchId"]),
                };

                var files = Request.Form.Files;

                // Process the form data (title, files) as needed
                return Ok(new TicketEngRepository(_mapper).PostTicket(ticketModel, files));
            }
            catch (Exception ex)
            {
                return BadRequest("Error saving ticket: " + ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult<TicketAttachment>> GetTicketAttachmentById(int _ticketId)
        {
            return Ok(await new TicketEngRepository(_mapper).GetTicketAttachmentById(_ticketId));
        }

        [HttpGet]
        public async Task<ActionResult<TicketAttachment>> GetAttachmentById(int _attachmentId)
        {
            return Ok(await new TicketEngRepository(_mapper).GetAttachmentById(_attachmentId));
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketAsset>>> GetTicketAssetsByTicketId(int ticketId)
        {
            //using TabangContextEng db = new TabangContextEng();
            //return Ok(await db.TicketAssets.Include(q => q.Asset).Where(q => q.TicketFK == ticketId).AsNoTracking().ToListAsync());
            return Ok();
        }


        [HttpGet("")]
        public async Task<ActionResult<IEnumerable<Asset>>> GetAssets([FromQuery] string? searchTerm)
        {
            //string searchStr = searchTerm ?? string.Empty;
            //using TabangContextEng db = new TabangContextEng();
            //IQueryable<Asset> qblAsset = db.Assets;
            //if (!string.IsNullOrEmpty(searchStr))
            //{
            //    searchStr = searchStr.ToLower().Trim();
            //    qblAsset = qblAsset.Where(q => q.Code.Contains(searchStr)
            //                                || q.Name.ToLower().Contains(searchStr.ToLower())
            //                                || q.Branch.ToLower().Contains(searchStr.ToLower())
            //                                || q.Equipment.ToLower().Contains(searchStr.ToLower()));
            //}

            //var result = await qblAsset.AsNoTracking().OrderBy(q => q.Code).Take(10).ToListAsync();

            //return Ok(result);
            return Ok();
        }

        [HttpPost]
        public IActionResult UpdateTicket([FromBody] TicketModel ticketModel)
        {
            try
            {

                return Ok(new TicketEngRepository(_mapper).UpdateTicket(ticketModel));
            }
            catch (Exception ex)
            {
                return Ok();
            }
        }
        [HttpGet]
        public async Task<ActionResult<TicketHistory>> GetTicketHistoriesById(int _ticketId)
        {
            return Ok(await new TicketEngRepository(_mapper).GetTicketHistoriesById(_ticketId));
        }

        [HttpGet]
        public async Task<ActionResult<TicketComment>> GetTicketCommentsById(int _ticketId)
        {
            return Ok(await new TicketEngRepository(_mapper).GetTicketCommentsById(_ticketId));
        }
        [HttpGet]
        public async Task<ActionResult<string>> GetTicketRelatedIssuesById(int _ticketId)
        {
            return Ok(await new TicketEngRepository(_mapper).GetTicketRelatedIssuesById(_ticketId));
        }


        [HttpPost]
        //public IActionResult SaveTicketComment([FromBody] TicketCommentModel ticketComment)
        public IActionResult SaveTicketComment()
        {
            //return Ok(new TicketRepository().PostTicketComment(ticketComment));
            try
            {
                var ticketCommentModel = new TicketCommentModel
                {
                    Comment = Request.Form["comment"],
                    Created = DateTime.Now,
                    TicketId = Convert.ToInt32(Request.Form["ticketId"]),
                    UserId = Convert.ToInt32(Request.Form["userId"]),
                };

                var files = Request.Form.Files;

                return Ok(new TicketEngRepository(_mapper).PostTicketComment(ticketCommentModel, files));
            }
            catch (Exception ex)
            {
                return BadRequest("Error saving ticket: " + ex.Message);
            }
        }

        [HttpPost]
        public IActionResult SaveStarRating(int ticketId, int star)
        {
            try
            {
                new TicketEngRepository(_mapper).SaveStarRating(ticketId, star);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest("Error saving ticket: " + ex.Message);
            }
        }

        [HttpPost]
        public IActionResult AddLinkTicket(TicketLinkDTO ticketLinkDTO)
        {
            try
            {

                return Ok(new TicketEngRepository(_mapper).AddLinkToTicket(ticketLinkDTO));
            }
            catch (Exception ex)
            {
                return BadRequest("Error saving ticket: " + ex.Message);
            }
        }

        [HttpPost]
        public IActionResult SaveTicketProp(int userId, int ticketId, string name, string value)
        {
            try
            {
                new TicketEngRepository(_mapper).SaveTicketProp(userId, ticketId, name, value);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest("Error saving ticket: " + ex.Message);
            }
        }
        [HttpPost]
        public IActionResult EditComment(int commentId, string newcomment)
        {
            try
            {
                new TicketEngRepository(_mapper).EditComment(commentId, newcomment);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest("Error saving ticket: " + ex.Message);
            }
        }
        [HttpPost]
        public IActionResult DeleteComment(int commentId)
        {
            try
            {
                new TicketEngRepository(_mapper).DeleteComment(commentId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest("Error saving ticket: " + ex.Message);
            }
        }
        [HttpPost]
        public IActionResult CatchUp(int ticketId, int userId)
        {
            try
            {
                new TicketEngRepository(_mapper).SaveCatchUp(ticketId, userId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest("Error saving ticket: " + ex.Message);
            }
        }
        [HttpGet]
        public async Task<ActionResult<TicketCatchup>> GetTicketCatchup(int ticketId)
        {
            return Ok(await new TicketEngRepository(_mapper).GetTicketCatchup(ticketId));
        }
        [HttpDelete("{assetId}/{ticketId}")]
        public async Task<IActionResult> DeleteTicketAsset(int assetId, int ticketId)
        {

            //using TabangContextEng db = new TabangContextEng();
            //await db.TicketAssets.Where(q => q.AssetFK == assetId && q.TicketFK == ticketId).ExecuteDeleteAsync();
            return Ok();
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetTicketAsset(int id)
        {

            //using TabangContextEng db = new TabangContextEng();
            //var data = await db.TicketAssets.Include(q => q.Ticket).AsNoTracking().Where(q => q.AssetFK == id).ToListAsync();

            //List<Ticket> tickets = new List<Ticket>();
            //foreach (var item in data)
            //{
            //    tickets.Add(item.Ticket);
            //}
            //return Ok(tickets);
            return Ok();
        }


    }


 
}
