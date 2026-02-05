using Microsoft.AspNetCore.Mvc;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Models;
using TabangService.DAL.Repository;
using Microsoft.EntityFrameworkCore;

namespace TabangService.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ItemStockController : ControllerBase
    {

        [HttpPost]
        public async Task<ActionResult<ItemStockQueryResult>> GetItemStocks([FromBody] ItemStockQuery filter)
        {
            if (filter == null) return BadRequest("Invalid query parameters.");

            return Ok(await new ItemStockRepository().GetItemStocks(filter));
        }

        [HttpPost]
        public async Task<IActionResult> SaveItemStock([FromBody] ItemStockDTO itemStock)
        {

            var saved = await new ItemStockRepository().AddItemStock(itemStock);

            return Ok(new ItemStockDTO(){Id = saved.Id, CategoryId = saved.CategoryId, Name = saved.Name, QuantityOnHand = saved.QuantityOnHand, CategoryName = saved.Category.Name });
        }
        
        [HttpPost]
        public async Task<IActionResult> UpdateItemStockSupply([FromBody] AdjustItemStockDTO dto)
        {
            var saved = await new ItemStockRepository().UpdateItemStockSupply(dto);
            return Ok(saved);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItemStock(int id)
        {
            await new ItemStockRepository().DeleteItemStock(id);
            return Ok();
        }

        [HttpGet("search/{ticketNum}")]
        public async Task<ActionResult<ItemStockHistoryDTO>> GetItemStocksByTicket(string ticketNum)
        {
            return Ok(await new ItemStockRepository().GetItemStocksByTicket(ticketNum));
        }

        [HttpGet("search/{ticketNum}")]
        public async Task<ActionResult<ItemStockDTO>> SearchItemStocks(string ticketNum)
        {
            return Ok(await new ItemStockRepository().SearchItemStocks(ticketNum));
        }


    }
}
