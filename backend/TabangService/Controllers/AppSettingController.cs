using Microsoft.AspNetCore.Mvc;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Models;
using TabangService.DAL.Repository;

namespace TabangService.Controllers
{

    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AppSettingController : Controller
    {

        [HttpGet]
        public async Task<ActionResult<AppSetting>> GetAppSettings()
        {
            return Ok(await new AppSettingRepository().GetAppSettings());
        }
        [HttpPost]
        public IActionResult SaveAppSetting([FromBody] AppSetting appSetting)
        {
            try
            {

                return Ok(new AppSettingRepository().SaveAppSetting(appSetting));
            }
            catch (Exception ex)
            {
                return BadRequest("Error saving App Settings: " + ex.Message);
            }
        }

    }
}
