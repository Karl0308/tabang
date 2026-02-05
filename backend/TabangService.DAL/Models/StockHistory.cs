using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models
{
    public class StockHistory
    {
        public int Id { get; set; }
        public int ItemStockId { get; set; }
        public ItemStock? ItemStock { get; set; } = null;
        public string ItemName { get { return ItemStock != null ? ItemStock.Name : ""; } }
        public int UserId { get; set; }
        public User? User { get; set; } = null;
        public string UserName { get { return User != null ? User.FullName : ""; } }
        public string RefNo { get; set; } = string.Empty;
        public decimal Quantity { get; set; } = 0;
        public decimal PreviousQuantity { get; set; } = 0;
        public decimal CurrentQuantity { get; set; } = 0;
        public StockType StockType { get; set; } = StockType.StockIn;
        public DateTime Date { get; set; } = DateTime.Now;
    }
}
