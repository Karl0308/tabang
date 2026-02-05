using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tabang.Models;
using TabangService.DAL.Model;
using TabangService.DAL.Models;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Models.Enums;
using TabangService.DAL.Repository;

namespace TabangService.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class WorkstreamController : ControllerBase
    {
        private readonly IMapper _mapper;
        public WorkstreamController(IMapper mapper)
        {
            _mapper = mapper;
        }

        [HttpPost]
        public async Task<ActionResult<TicketQueryResult>> GetWorkstreams([FromBody] WorkstreamQuery filter)
        {
            if (filter == null) return BadRequest("Invalid query parameters.");

            return Ok(await new WorkstreamRepository().GetWorkstreams(filter));

        }

        //[HttpGet]
        //public async Task<ActionResult<List<Ticket>>> GetTickets(DateTime? _timeStamp = null, string search = null)
        //{
        //    return Ok(await new TicketRepository(_mapper).GetTickets(_timeStamp, search));
        //}

        //[HttpGet]
        //public async Task<ActionResult<List<Ticket>>> GetTicketSearch(string search)
        //{
        //    return Ok(await new TicketRepository(_mapper).GetTicketSearch(search));
        //}

        [HttpGet]
        public async Task<ActionResult<Workstream>> GetWorkstreamNum(string workstreamNum)
        {
            return Ok(await new WorkstreamRepository().GetWorkstreamNum(workstreamNum));
        }

        [HttpPost]
        public IActionResult SaveWorkstream()
        {
            try
            {
                // Map form data to WorkstreamDTO
                var workstreamModel = new WorkstreamDTO
                {
                    Title = Request.Form["title"],
                    Objective = Request.Form["objective"],
                    OwnerId = Convert.ToInt32(Request.Form["ownerId"]),

                };


                return Ok(new WorkstreamRepository().SaveWorkStream(workstreamModel));
            }
            catch (Exception ex)
            {
                return BadRequest("Error saving workstream: " + ex.Message);
            }
        }

        [HttpPost]
        public IActionResult AddSubtask(WorkstreamSubtaskDTO subtask)
        {
            try
            {

                return Ok(new WorkstreamRepository().AddWorkstreamSubtask(subtask));
            }
            catch (Exception ex)
            {
                return BadRequest("Error saving subtask: " + ex.Message);
            }
        }
        [HttpPost]
        public IActionResult AddLinkTicket(LinkTicketWorkstreamDTO dto)
        {
            try
            {
                new WorkstreamRepository().AddLinkTicket(dto);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest("Error saving subtask: " + ex.Message);
            }
        }
        [HttpPost]
        public IActionResult RemoveLinkTicket(LinkTicketWorkstreamDTO dto)
        {
            try
            {
                new WorkstreamRepository().RemoveLinkTicket(dto);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest("Error saving subtask: " + ex.Message);
            }
        }
        [HttpGet]
        public async Task<ActionResult<WorkstreamSubtask>> GetWorkstreamSubtaskByWorkstreamId(int workstreamId)
        {
            return Ok(await new WorkstreamRepository().GetWorkstreamSubtaskByWorkstreamId(workstreamId));
        }

        [HttpGet]
        public async Task<ActionResult<Ticket>> GetWorkstreamTicketByWorkstreamId(int workstreamId)
        {
            return Ok(await new WorkstreamRepository().GetWorkstreamTicketByWorkstreamId(workstreamId));
        }


        //[HttpGet]
        //public async Task<ActionResult<TicketAttachment>> GetTicketAttachmentById(int _ticketId)
        //{
        //    return Ok(await new TicketRepository(_mapper).GetTicketAttachmentById(_ticketId));
        //}

        //[HttpGet]
        //public async Task<ActionResult<TicketAttachment>> GetAttachmentById(int _attachmentId)
        //{
        //    return Ok(await new TicketRepository(_mapper).GetAttachmentById(_attachmentId));
        //}


        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<TicketAsset>>> GetTicketAssetsByTicketId(int ticketId)
        //{
        //    using TabangContext db = new TabangContext();
        //    return Ok(await db.TicketAssets.Include(q => q.Asset).Where(q => q.TicketFK == ticketId).AsNoTracking().ToListAsync());
        //}

        //[HttpPost]
        //public async Task<IActionResult> AddTicketAssets(AddTicketAssetRequest addTicketAssetRequest)
        //{
        //    try
        //    {
        //        using TabangContext db = new TabangContext();
        //        List<TicketAsset> ticketAssets = new List<TicketAsset>();
        //        if (addTicketAssetRequest != null && addTicketAssetRequest.TicketId > 0 && addTicketAssetRequest.AssetIds.Any())
        //        {
        //            var existingTicketAssets = await db.TicketAssets.Where(q => q.TicketFK == addTicketAssetRequest.TicketId).AsNoTracking().ToListAsync();
        //            foreach (var assetId in addTicketAssetRequest.AssetIds)
        //            {
        //                if (existingTicketAssets.Any(q => q.AssetFK == assetId) == false)
        //                    ticketAssets.Add(new TicketAsset() { AssetFK = assetId, TicketFK = addTicketAssetRequest.TicketId });
        //            }

        //            if (ticketAssets.Any())
        //            {
        //                db.TicketAssets.AddRange(ticketAssets);
        //                await db.SaveChangesAsync();
        //            }
        //        }
        //    }
        //    catch (Exception ex) { return BadRequest(ex.Message); }
        //    return Ok();
        //}

        //[HttpPost]
        //public async Task<IActionResult> RemoveTicketAssets(RemoveTicketAssetRequest removeTicketAssetRequest)
        //{
        //    try
        //    {
        //        using TabangContext db = new TabangContext();
        //        List<TicketAsset> ticketAssets = new List<TicketAsset>();
        //        if (removeTicketAssetRequest != null && removeTicketAssetRequest.TicketId > 0 && removeTicketAssetRequest.AssetIds.Any())
        //        {
        //            var existingTicketAssets = await db.TicketAssets.Where(q => q.TicketFK == removeTicketAssetRequest.TicketId).AsNoTracking().ToListAsync();
        //            foreach (var assetId in removeTicketAssetRequest.AssetIds)
        //            {
        //                if (existingTicketAssets.Any(q => q.AssetFK == assetId))
        //                    ticketAssets.Add(existingTicketAssets.First(q => q.AssetFK == assetId));
        //            }

        //            if (ticketAssets.Any())
        //            {
        //                db.TicketAssets.RemoveRange(ticketAssets);
        //                await db.SaveChangesAsync();
        //            }
        //        }
        //    }
        //    catch (Exception ex) { return BadRequest(ex.Message); }
        //    return Ok();
        //}

        //[HttpGet("")]
        //public async Task<ActionResult<IEnumerable<Asset>>> GetAssets([FromQuery] string? searchTerm)
        //{
        //    string searchStr = searchTerm ?? string.Empty;
        //    using TabangContext db = new TabangContext();
        //    IQueryable<Asset> qblAsset = db.Assets;
        //    if (!string.IsNullOrEmpty(searchStr))
        //    {
        //        searchStr = searchStr.ToLower().Trim();
        //        qblAsset = qblAsset.Where(q => q.Code.Contains(searchStr)
        //                                    || q.Name.ToLower().Contains(searchStr.ToLower())
        //                                    || q.Branch.ToLower().Contains(searchStr.ToLower())
        //                                    || q.Equipment.ToLower().Contains(searchStr.ToLower()));
        //    }

        //    var result = await qblAsset.AsNoTracking().OrderBy(q => q.Code).Take(10).ToListAsync();

        //    return Ok(result);
        //}

        //[HttpPost]
        //public IActionResult UpdateTicket([FromBody] TicketModel ticketModel)
        //{
        //    try
        //    {

        //        return Ok(new TicketRepository(_mapper).UpdateTicket(ticketModel));
        //    }
        //    catch (Exception ex)
        //    {
        //        return Ok();
        //    }
        //}
        [HttpGet]
        public async Task<ActionResult<WorkstreamHistory>> GetWorkstreamHistoriesById(int _workstreamId)
        {
            return Ok(await new WorkstreamRepository().GetWorkstreamHistoriesById(_workstreamId));
        }


        //[HttpGet]
        //public async Task<ActionResult<TicketComment>> GetTicketCommentsById(int _ticketId)
        //{
        //    return Ok(await new TicketRepository(_mapper).GetTicketCommentsById(_ticketId));
        //}
        //[HttpGet]
        //public async Task<ActionResult<string>> GetTicketRelatedIssuesById(int _ticketId)
        //{
        //    return Ok(await new TicketRepository(_mapper).GetTicketRelatedIssuesById(_ticketId));
        //}


        //[HttpPost]
        ////public IActionResult SaveTicketComment([FromBody] TicketCommentModel ticketComment)
        //public IActionResult SaveTicketComment()
        //{
        //    //return Ok(new TicketRepository().PostTicketComment(ticketComment));
        //    try
        //    {
        //        var ticketCommentModel = new TicketCommentModel
        //        {
        //            Comment = Request.Form["comment"],
        //            Created = DateTime.Now,
        //            TicketId = Convert.ToInt32(Request.Form["ticketId"]),
        //            UserId = Convert.ToInt32(Request.Form["userId"]),
        //        };

        //        var files = Request.Form.Files;

        //        return Ok(new TicketRepository(_mapper).PostTicketComment(ticketCommentModel, files));
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest("Error saving ticket: " + ex.Message);
        //    }
        //}

        //[HttpPost]
        //public IActionResult SaveStarRating(int ticketId, int star)
        //{
        //    try
        //    {
        //        new TicketRepository(_mapper).SaveStarRating(ticketId, star);
        //        return Ok();
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest("Error saving ticket: " + ex.Message);
        //    }
        //}

        //[HttpPost]
        //public IActionResult AddLinkTicket(TicketLinkDTO ticketLinkDTO)
        //{
        //    try
        //    {

        //        return Ok(new TicketRepository(_mapper).AddLinkToTicket(ticketLinkDTO));
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest("Error saving ticket: " + ex.Message);
        //    }
        //}

        [HttpPost]
        public IActionResult SaveWorkstreamProp(int userId, int workstreamId, string name, string value)
        {
            try
            {
                new WorkstreamRepository().SaveWorkstreamProp(userId, workstreamId, name, value);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest("Error saving ticket: " + ex.Message);
            }
        }
        //[HttpPost]
        //public IActionResult EditComment(int commentId, string newcomment)
        //{
        //    try
        //    {
        //        new TicketRepository(_mapper).EditComment(commentId, newcomment);
        //        return Ok();
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest("Error saving ticket: " + ex.Message);
        //    }
        //}
        //[HttpPost]
        //public IActionResult DeleteComment(int commentId)
        //{
        //    try
        //    {
        //        new TicketRepository(_mapper).DeleteComment(commentId);
        //        return Ok();
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest("Error saving ticket: " + ex.Message);
        //    }
        //}
        //[HttpPost]
        //public IActionResult CatchUp(int ticketId, int userId)
        //{
        //    try
        //    {
        //        new TicketRepository(_mapper).SaveCatchUp(ticketId, userId);
        //        return Ok();
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest("Error saving ticket: " + ex.Message);
        //    }
        //}
        //[HttpGet]
        //public async Task<ActionResult<TicketCatchup>> GetTicketCatchup(int ticketId)
        //{
        //    return Ok(await new TicketRepository(_mapper).GetTicketCatchup(ticketId));
        //}
        //[HttpDelete("{assetId}/{ticketId}")]
        //public async Task<IActionResult> DeleteTicketAsset(int assetId, int ticketId)
        //{

        //    using TabangContext db = new TabangContext();
        //    await db.TicketAssets.Where(q => q.AssetFK == assetId && q.TicketFK == ticketId).ExecuteDeleteAsync();
        //    return Ok();
        //}
        //[HttpGet("{id}")]
        //public async Task<ActionResult<Ticket>> GetTicketAsset(int id)
        //{

        //    using TabangContext db = new TabangContext();
        //   var data = await db.TicketAssets.Include(q=>q.Ticket).AsNoTracking().Where(q => q.AssetFK == id).ToListAsync();

        //    List<Ticket> tickets = new List<Ticket>();
        //    foreach (var item in data)
        //    {
        //        tickets.Add(item.Ticket);
        //    }
        //    return Ok(tickets);
        //}


    }

}
