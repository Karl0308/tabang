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
    public class BranchEngController : ControllerBase
    {

        [HttpGet]
        public async Task<ActionResult<List<BranchDTO>>> GetBranches()
        {
            try
            {

                return Ok(await new BranchEngRepository().GeBranches());
            }
            catch (Exception ex)
            {

                return NotFound();
            }
        }
    }
}
