using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tabang.Models;
using TabangService.DAL.Model;
using TabangService.DAL.Models;

namespace TabangService.DAL
{
    public class TabangContextEng : DbContext
    {
        public TabangContextEng()
        {
                
        }
        public TabangContextEng(DbContextOptions<TabangContextEng> options)
      : base(options)
        {
            //this.Database.Migrate();
        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        //#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer(new ConfigurationBuilder().AddJsonFile("appsettings.json").Build().GetConnectionString("DefaultConnectionEng"));

    }
}
