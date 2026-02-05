using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Tabang.Models;
using Microsoft.EntityFrameworkCore;
using TabangService.DAL.Models;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using TabangService.DAL.Model;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Repository;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using TabangService.DAL.Models.Enums;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TabangService.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AssetsController : ControllerBase, IDisposable
    {
        TabangContext db = new TabangContext();
        [HttpGet("")]
        public async Task<ActionResult<AssetQueryResult>> GetAssets([FromQuery] AssetQueryRequest? assetQueryRequest)
        {
            if (assetQueryRequest == null) { assetQueryRequest = new AssetQueryRequest(); }
            string searchStr = assetQueryRequest.SearchTerm ?? string.Empty;
            IQueryable<Asset> qblAsset = db.Assets;
            if(!string.IsNullOrEmpty(searchStr))
            {
                searchStr = searchStr.ToLower().Trim();
                qblAsset = qblAsset.Where(q => q.Code.ToLower().Contains(searchStr)
                                            || q.Name.ToLower().Contains(searchStr)
                                            || q.Branch.ToLower().Contains(searchStr)
                                            || q.Equipment.ToLower().Contains(searchStr));
            }
            if (string.IsNullOrEmpty(assetQueryRequest.SortColumnPath)) { assetQueryRequest.SortColumnPath = "code"; }
            if (string.IsNullOrEmpty(assetQueryRequest.SortColumnOrder)) { assetQueryRequest.SortColumnOrder = "asc"; }
            bool isAsc = assetQueryRequest.SortColumnOrder.ToLower().Trim().Equals("asc");
            qblAsset = assetQueryRequest.SortColumnPath switch
            {
                "code" => isAsc ? qblAsset.OrderBy(q => q.Code) : qblAsset.OrderByDescending(q => q.Code),
                "name" => isAsc ? qblAsset.OrderBy(q => q.Name) : qblAsset.OrderByDescending(q => q.Name),
                "branch" => isAsc ? qblAsset.OrderBy(q => q.Branch) : qblAsset.OrderByDescending(q => q.Branch),
                "equipment" => isAsc ? qblAsset.OrderBy(q => q.Equipment) : qblAsset.OrderByDescending(q => q.Equipment),
                _ => qblAsset.OrderBy(q => q.Code)
            };

            int count = qblAsset.Count();

            var resultList = await PaginatedList<Asset>.CreateAsync(qblAsset, assetQueryRequest.CurrentPage, assetQueryRequest.PageSize);
            AssetQueryResult assetQueryResult = new AssetQueryResult()
            {
                SearchTerm = assetQueryRequest.SearchTerm ?? "",
                CurrentPage = assetQueryRequest.CurrentPage,
                PageSize = assetQueryRequest.PageSize,
                TotalCount = count,
                Assets = resultList.ToList(),
                SortColumnOrder = assetQueryRequest.SortColumnOrder,
                SortColumnPath = assetQueryRequest.SortColumnPath
            };
            return Ok(assetQueryResult);
        }
        [HttpPost]
        public async Task<ActionResult<AssetDataQueryResult>> GetAssetTags([FromBody] DataQuery filter)
        {
            var assetQuery = db.Assets
                .AsQueryable();

            if (!string.IsNullOrEmpty(filter.Search))
            {
                assetQuery = assetQuery.Where(t =>
                t.Branch.Contains(filter.Search) ||
                t.Equipment.Contains(filter.Search) ||
                t.Name.Contains(filter.Search) ||
                t.Code.Contains(filter.Search) 
                );
            }




            int totalRecords = await assetQuery.CountAsync();

            assetQuery = assetQuery
                .OrderByDescending(x => x.Id);

            var assets = await assetQuery
            .AsNoTracking()
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

            return new AssetDataQueryResult
            {
                Assets = assets,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize,
                TotalRecords = totalRecords
            };

        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Asset>> GetAsset(int id)
        {
            var asset = await db.Assets.AsNoTracking().FirstOrDefaultAsync(q => q.Id == id);
            if(asset == null) { return Ok(new Asset()); }
            else {  return Ok(asset); }
        }
        
        [HttpPost]
        public async Task<IActionResult> AddAsset([FromBody] Asset asset)
        {
            if (ModelState.IsValid)
            {
                if (asset.Id > 0)
                {
                    db.Assets.Update(asset);
                    await db.SaveChangesAsync();
                }
                else
                {
                    db.Assets.Add(asset);
                    await db.SaveChangesAsync();
                }
            }
            else { return BadRequest("Invalid data"); }
            return Ok();
        }
        
        [HttpPut("")]
        public async Task<IActionResult> EditAsset([FromBody] Asset asset)
        {
            if (ModelState.IsValid || asset == null || asset.Id <= 0)
            {
                db.Assets.Update(asset);
                await db.SaveChangesAsync();
            }
            else { return BadRequest("Invalid data"); }
            return Ok();
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetTicketAssetTags(int id)
        {
            var ticketAsset = await db.TicketAssets
                       .Include(q => q.Ticket).ThenInclude(q => q.Branch)
                       .AsNoTracking()
                       .Where(q => q.AssetFK == id)
                       .ToListAsync();
            var tickets = ticketAsset.Select(q => q.Ticket)
                       .GroupBy(q => q.Id)
                       .Select(g => g.First())
                       .ToList();

            if (tickets == null || tickets.Count == 0)
            {
                return Ok(new List<Ticket>());
            }
            else
            {
                return Ok(tickets);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<List<Asset>>> GetAssetTagByTicketId(int id)
        {
            var ticketAsset = await db.TicketAssets
                .Include(q => q.Asset)
                       .AsNoTracking()
                       .Where(q => q.TicketFK == id)
                       .ToListAsync();

            return Ok(ticketAsset.Select(q => q.Asset));

        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await db.Assets.Where(q => q.Id == id).ExecuteDeleteAsync();
            return Ok();
        }

        public void Dispose()
        {
            if(db != null) db.Dispose();
        }
    }

    public class AssetQueryRequest
    {
        public string? SearchTerm { get; set; }
        public int TotalCount { get; set; } = 0;
        public int CurrentPage { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortColumnPath { get; set; } = "code";
        public string SortColumnOrder { get; set; } = "asc";
    }

    public class AssetQueryResult : AssetQueryRequest
    {
        public List<Asset> Assets { get; set; } = new List<Asset>();
    }
}
