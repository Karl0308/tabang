using Microsoft.AspNetCore.Mvc;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Models;
using TabangService.DAL.Repository;

namespace TabangService.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<Notification>>> GetNotifications(int userId)
        {
            return Ok(await new NotificationRepository().GetNotifications(userId));
        }
        [HttpPost]
        public IActionResult ReadNotification(int notifId)
        {
            try
            {
                new NotificationRepository().ReadNotification(notifId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest("Error saving Notification: " + ex.Message);
            }
        }
    }
}
