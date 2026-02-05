using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TabangService.DAL.Models
{
    public class ItemStock
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public Category? Category { get; set; } = null;
        public string CategoryName { get { return Category != null ? Category.Name : ""; } }
        public decimal QuantityOnHand { get; set; }
    }
}
