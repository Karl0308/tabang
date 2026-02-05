using Microsoft.AspNetCore.Mvc;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Repository;

namespace TabangService.Controllers
{

    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult<ReportQueryResult>> GetReports([FromBody] ReportQuery filter)
        {
            if (filter == null) return BadRequest("Invalid query parameters.");

            return Ok(await new ReportRepository().GetReports(filter));

        }
        [HttpPost]
        public async Task<ActionResult<AverageResponseTimeQueryResult>> GetAverageReports([FromBody] AverageResponseTimeReportQuery filter)
        {
            if (filter == null) return BadRequest("Invalid query parameters.");

            return Ok(await new ReportRepository().GetAverageReports(filter));

        }
        [HttpPost]
        public async Task<ActionResult<AverageResponseTimeQueryResult>> GetAverageResolutionReports([FromBody] AverageResponseTimeReportQuery filter)
        {
            if (filter == null) return BadRequest("Invalid query parameters.");

            return Ok(await new ReportRepository().GetAverageResolutionReports(filter));

        }  
        [HttpPost]
        public async Task<ActionResult<List<ItemStockHistoryDTO>>> GetSuppliesHistory(SuppliesReportQuery filter)
        {
            if (filter == null) return BadRequest("Invalid query parameters.");

            return Ok(await new ReportRepository().GetSuppliesHistory(filter));

        }
    }
}
