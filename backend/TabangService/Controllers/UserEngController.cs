using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
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
    public class UserEngController : ControllerBase
    {

        public UserEngController()
        {
        }
        [HttpGet]
        public async Task<ActionResult<List<UserDTO>>> GetUsers()
        {
            return Ok(await new UserEngRepository().GetUsers());
        }

    }
}
