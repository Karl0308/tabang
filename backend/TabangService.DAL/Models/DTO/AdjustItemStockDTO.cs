using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models.DTO
{
    public class AdjustItemStockDTO
    {
        public int ItemStockId { get; set; }
        public string RefNo { get; set; } = string.Empty;
        public StockType StockType { get; set; }
        public decimal Quantity { get; set; } = 0;
        public int UserId { get; set; }
    }
}
