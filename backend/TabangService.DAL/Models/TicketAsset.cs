using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;

namespace TabangService.DAL.Models
{
    [Table("TicketAssets")]
    public class TicketAsset
    {
        [Key,DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public Ticket? Ticket { get; set; }
        [ForeignKey("Ticket")]
        public int TicketFK { get; set; }

        public Asset? Asset { get; set; }

        [ForeignKey("Asset")]
        public int AssetFK { get; set; }
    }
}
