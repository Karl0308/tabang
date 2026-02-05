using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TabangService.DAL.Models
{
    [Table("Assets")]
    public class Asset
    {
        [Key,DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required,StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required, StringLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required, StringLength(50)]
        public string Branch { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string Equipment { get; set; } = string.Empty;
    }
}
