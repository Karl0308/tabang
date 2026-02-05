using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TabangService.DAL.Models.Enums
{
    public enum DepartmentBase
    {
        All = 0, IS = 1, Engineering = 2, CCTV = 3
    }

    public static class DepartmentBaseExtension
    {
        public static string ToFriendlyString(this DepartmentBase me)
        {
            switch (me)
            {
                case DepartmentBase.All:
                    return "All"; //Show to all
                case DepartmentBase.IS:
                    return "Iloilo Supermart"; //Show to IS
                case DepartmentBase.Engineering:
                    return "Engineering"; //Show to Engineering
                case DepartmentBase.CCTV:
                    return "CCTV"; //Show to CCTV
                default:
                    return "Unknown";
            }
        }
    }

}
