using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tabang.Models;

namespace TabangService.DAL
{
    public partial class TabangAttachmentContextEng : DbContext
    {
        public TabangAttachmentContextEng()
        {
            //this.Database.Migrate();
        }

        public TabangAttachmentContextEng(DbContextOptions<TabangAttachmentContext> options)
            : base(options)
        {
        }
        public virtual DbSet<TicketAttachment> TicketAttachments { get; set; }
        public virtual DbSet<UserSignature> UserSignatures { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        //#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer(new ConfigurationBuilder().AddJsonFile("appsettings.json").Build().GetConnectionString("attachmentconnectionEng"));

       
        public class TicketAttachment
        {
            public int Id { get; set; }
            public int? AttachmentId { get; set; }
            public int? TicketId { get; set; }
            public int? TicketCommentId { get; set; }
            public string FileName { get; set; }
            public string ContentType { get; set; }
            public byte[] Content { get; set; }
        }
        public class UserSignature
        {
            public int Id { get; set; }
            public int? UserId { get; set; }
            public string ContentType { get; set; }
            public byte[] Content { get; set; }
        }
    }
}
