using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TabangService.DAL.Models
{
    public class AppSetting
    {
        public int Id { get; set; }
        public string NewFrom { get; set; }
        public string NewTo { get; set; }
        public string WarningFrom { get; set; }
        public string WarningTo { get; set; }
        public string SevereFrom { get; set; }
        public string SevereTo { get; set;}

        public string NewColor { get; set; }
        public string WarningColor { get; set; }
        public string SevereColor { get; set;}
    }
}
