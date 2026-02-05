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
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;

        public UserController(
            UserManager<User> userManager)
        {
            _userManager = userManager;
        }
        [HttpGet]
        public async Task<ActionResult<List<User>>> GetUsers(bool getAll = false)
        {
            return Ok(await new UserRepository().GetUsers(getAll));
        }
        [HttpPost]
        public async Task<ActionResult<UserQueryResult>> GetUsers([FromBody] UserQuery filter)
        {
            if (filter == null) return BadRequest("Invalid query parameters.");

            return Ok(await new UserRepository().GetUsers(filter));
        }
        [HttpGet]
        public async Task<ActionResult<User>> GetUserId(int id)
        {
            return Ok(await new UserRepository().GetUserId(id));
        }

        [HttpGet]
        public async Task<ActionResult<User>> GetAllUserAssignees()
        {
            return Ok(await new UserRepository().GetUserAssignees());
        }
        [HttpPost]
        public async Task<ActionResult> SaveUser([FromBody] UserModel user)
        {
            return Ok(await new UserRepository().PostUser(_userManager, user));
        }
        [HttpPost]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPassword reset)
        {
            await new UserRepository(_userManager).ResetPassword(reset);
            return Ok();
        }
        [HttpPost]
        public async Task<IActionResult> ResetUserPassword([FromBody] ResetPassword reset)
        {
            try
            {
                await new UserRepository(_userManager).ResetUserPassword(reset);
                return Ok();
            }
            catch (Exception ex)
            {

                throw;
            }
         
        }
        [HttpGet]
        public async Task<ActionResult> GetUserSignatureById(int _userId)
        {
            return Ok(await new UserRepository().GetUserSignatureById(_userId));
        }
        [HttpGet]
        public async Task<ActionResult> GetUsersSignatureOvertime(int id)
        {
            return Ok(await new UserRepository().GetUsersSignatureOvertime(id));
        }




    }
}
