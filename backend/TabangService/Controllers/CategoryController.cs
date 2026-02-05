using Microsoft.AspNetCore.Mvc;
using TabangService.DAL.Models;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Repository;

namespace TabangService.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {

        [HttpPost]
        public async Task<ActionResult<CategoryQueryResult>> GetCategories([FromBody] CategoryQuery filter)
        {
            if (filter == null) return BadRequest("Invalid query parameters.");

            return Ok(await new CategoryRepository().GetCategories(filter));
        }

        [HttpPost]
        public IActionResult SaveCategory([FromBody] Category category)
        {
            return Ok(new CategoryRepository().SaveCategory(category));
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            new CategoryRepository().DeleteCategory(id);
            return Ok();
        }

    }
}
