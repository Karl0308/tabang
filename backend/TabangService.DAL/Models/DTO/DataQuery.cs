using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Model;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Models.DTO
{
    public class DataQuery
    {
        public string Search { get; set; } = "";
        public int PageNumber { get; set; } = 1;  // Default to page 1
        public int PageSize { get; set; } = 5;   // Default page size (adjust as needed)
    }
    public class AssetDataQueryResult
    {
        public List<Asset> Assets { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalRecords { get; set; }
    }

    public class ItemStockQuery
    {
        public string Search { get; set; } = "";
        public int CategoryId { get; set; } = 0;
        public int PageNumber { get; set; } = 1;  // Default to page 1
        public int PageSize { get; set; } = 10;   // Default page size (adjust as needed)
    }
    public class ItemStockQueryResult
    {
        public List<ItemStock> ItemStocks { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalRecords { get; set; }
    }
    public class CategoryQuery
    {
        public string Search { get; set; } = "";
        public int PageNumber { get; set; } = 1;  // Default to page 1
        public int PageSize { get; set; } = 5;   // Default page size (adjust as needed)
    }
    public class CategoryQueryResult
    {
        public List<Category> Categories { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalRecords { get; set; }
    }
    public class DepartmentQuery
    {
        public string Search { get; set; } = "";
        public int PageNumber { get; set; } = 1;  // Default to page 1
        public int PageSize { get; set; } = 5;   // Default page size (adjust as needed)
    }
    public class DepartmentQueryResult
    {
        public List<Department> Departments { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalRecords { get; set; }
    }
    public class BranchQuery
    {
        public string Search { get; set; } = "";
        public int PageNumber { get; set; } = 1;  // Default to page 1
        public int PageSize { get; set; } = 5;   // Default page size (adjust as needed)
    }
    public class BranchQueryResult
    {
        public List<Branch> Branches { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalRecords { get; set; }
    }
    public class UserQuery
    {
        public string Search { get; set; } = "";
        public int PageNumber { get; set; } = 1;  // Default to page 1
        public int PageSize { get; set; } = 5;   // Default page size (adjust as needed)
    }
    public class UserQueryResult
    {
        public List<User> Users { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalRecords { get; set; }
    }
}
