using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models.DTO
{
    public class ItemStockDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal QuantityOnHand { get; set; }
    }

    public class ItemStockHistoryDTO
    {
        public int Id { get; set; }
        public int ItemStockId { get; set; }
        public int UserId { get; set; }
        public string ItemName { get; set; }
        public string CategoryName { get; set; }
        public string UserName { get; set; }
        public string RefNo { get; set; } = string.Empty;
        public decimal Quantity { get; set; } = 0;
        public decimal PreviousQuantity { get; set; } = 0;
        public decimal CurrentQuantity { get; set; } = 0;
        public StockType StockType { get; set; } = StockType.StockIn;
        public DateTime Date { get; set; } = DateTime.Now;
    }
}
