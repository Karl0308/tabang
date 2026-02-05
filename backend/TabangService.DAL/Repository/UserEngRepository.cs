using AutoMapper;
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
     public class UserEngRepository
     {
        private readonly TabangContextEng _context;
        public UserEngRepository()
        {
            _context = new TabangContextEng();
        }

        public async Task<List<UserDTO>> GetUsers() 
        {

            using var connection = _context.Database.GetDbConnection();

            if (connection.State != ConnectionState.Open)
                await connection.OpenAsync();

            var sqlUsers = "SELECT * FROM Users";

            var users = (await connection.QueryAsync<UserDTO>(sqlUsers)).ToList();
            return users;
        }

    }
}
