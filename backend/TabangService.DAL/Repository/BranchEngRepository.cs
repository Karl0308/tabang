using Dapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics.Tracing;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using Tabang.Models;
using TabangService.DAL.Builder;
using TabangService.DAL.Model;
using TabangService.DAL.Models;
using TabangService.DAL.Models.DTO;
using static System.Runtime.InteropServices.JavaScript.JSType;
using static TabangService.DAL.TabangAttachmentContext;

namespace TabangService.DAL.Repository
{
     public class BranchEngRepository
    {
        private readonly TabangContextEng _context;
        public BranchEngRepository()
        {
            _context = new TabangContextEng();

        }
        public async Task<List<BranchDTO>> GeBranches() 
        {

            using var connection = _context.Database.GetDbConnection();

            if (connection.State != ConnectionState.Open)
                await connection.OpenAsync();

            var sqlUsers = "SELECT * FROM Branches";

            var branches = (await connection.QueryAsync<BranchDTO>(sqlUsers)).ToList();
            return branches;

        }
      
    }
}
