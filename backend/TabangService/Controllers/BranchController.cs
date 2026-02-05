using Microsoft.AspNetCore.Mvc;
using TabangService.DAL.Model;
using TabangService.DAL.Models;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Models.Enums;
using TabangService.DAL.Repository;

namespace TabangService.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class BranchController : ControllerBase
    {

        [HttpGet]
        public async Task<ActionResult<List<Branch>>> GetBranches()
        {
            try
            {

                return Ok(await new BranchRepository().GetBranches());
            }
            catch (Exception ex)
            {

                return NotFound();
            }
        }
        [HttpPost]
        public async Task<ActionResult<BranchQueryResult>> GetBranches([FromBody] BranchQuery filter)
        {
            if (filter == null) return BadRequest("Invalid query parameters.");

            return Ok(await new BranchRepository().GetBranches(filter));
        }
        [HttpPost]
        public IActionResult SaveBranch([FromBody] BranchModel branchModel)
        {
            return Ok(new BranchRepository().SaveBranch(branchModel));
        }
  
    }
}
