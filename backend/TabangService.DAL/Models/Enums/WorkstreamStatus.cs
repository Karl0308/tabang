using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TabangService.DAL.Models.Enums
{
    public enum WorkstreamStatus
    {
        Planning = 0,
        Active = 1,
        OnHold = 2,
        Completed = 3,
        Cancelled = 4,
        All = 10
    }

}
