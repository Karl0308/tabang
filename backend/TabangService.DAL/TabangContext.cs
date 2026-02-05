using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Reflection.Metadata;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TabangService.DAL.Model;
using TabangService.DAL.Models;
using TabangService.DAL.Models.DTO;

namespace Tabang.Models;

public partial class TabangContext : DbContext
{
    public TabangContext()
    {
        //this.Database.Migrate();
    }

    public TabangContext(DbContextOptions<TabangContext> options)
        : base(options)
    {
       //this.Database.Migrate();
    }
    public virtual DbSet<Ticket> Tickets { get; set; }
    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<TicketHistory> TicketHistories { get; set; }
    public virtual DbSet<TicketComment> TicketComments { get; set; }
    public virtual DbSet<TicketAttachment> TicketAttachments { get; set; }
    public virtual DbSet<Branch> Branches { get; set; }
    public virtual DbSet<Notification> Notifications { get; set; }
    public virtual DbSet<Department> Departments { get; set; }
    public virtual DbSet<SubDepartment> SubDepartments { get; set; }
    public virtual DbSet<Member> Members { get; set; }
    public virtual DbSet<Overtime> Overtimes { get; set; }
    public virtual DbSet<AppSetting> AppSettings { get; set; }
    public virtual DbSet<Asset> Assets { get; set; }
    public virtual DbSet<TicketAsset> TicketAssets { get; set; }
    public virtual DbSet<TicketCatchup> TicketCatchups { get; set; }
    public virtual DbSet<Category> Categories { get; set; }
    public virtual DbSet<ItemStock> ItemStocks { get; set; }
    public virtual DbSet<StockHistory> StockHistories { get; set; }
    public virtual DbSet<UserDepartment> UserDepartments { get; set; }
    public virtual DbSet<TicketDepartment> TicketDepartments { get; set; }
    public virtual DbSet<Workstream> Workstreams { get; set; }
    public virtual DbSet<WorkstreamSubtask> WorkstreamSubtasks { get; set; }
    public virtual DbSet<WorkstreamHistory> WorkstreamHistories { get; set; }
    public virtual DbSet<AdditionalAssignee> AdditionalAssignees { get; set; }
    public virtual DbSet<StarRating> StarRatings { get; set; }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    //#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
    => optionsBuilder.UseSqlServer(new ConfigurationBuilder().AddJsonFile("appsettings.json").Build().GetConnectionString("DefaultConnection"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.Tickets");

            entity.HasMany(e => e.TicketHistories)
            .WithOne(e => e.Ticket)
            .HasForeignKey(e => e.TicketId).IsRequired(true);
                    
            entity.HasMany(e => e.TicketComments)
            .WithOne(e => e.Ticket)
            .HasForeignKey(e => e.TicketId).IsRequired(true);

            entity.HasMany(e => e.TicketAttachments)
            .WithOne(e => e.Ticket)
            .HasForeignKey(e => e.TicketId).IsRequired(true);

            entity.HasMany(e => e.TicketAssets)
            .WithOne(e => e.Ticket)
            .HasForeignKey(e => e.TicketFK).IsRequired(true);

            entity.HasMany(e => e.Notifications)
            .WithOne(e => e.Ticket)
            .HasForeignKey(e => e.TicketId).IsRequired(true);

            entity.HasOne(e => e.Branch)
            .WithMany(e => e.Tickets)
            .HasForeignKey(e => e.BranchId)
            .IsRequired(false);   

            entity.HasMany(e => e.Overtime)
            .WithOne(e => e.Ticket)
            .HasForeignKey(e => e.TicketId).IsRequired(true).OnDelete(DeleteBehavior.NoAction);

            entity.HasMany(e => e.TicketCatchups)
            .WithOne(e => e.Ticket)
            .HasForeignKey(e => e.TicketId).IsRequired(true);

            entity.HasMany(e => e.TicketDepartments)
            .WithOne(e => e.Ticket)
            .HasForeignKey(e => e.TicketId).IsRequired(true);

            entity.HasMany(e => e.AdditionalAssignees)
            .WithOne(e => e.Ticket)
            .HasForeignKey(e => e.TicketId).IsRequired(true);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.Users");

            entity.HasMany(e => e.ReporterTickets)
            .WithOne(e => e.Reporter)
            .HasForeignKey(e => e.ReporterId)
            .IsRequired(false);

            entity.HasMany(e => e.NotificationActions)
            .WithOne(e => e.FromUser)
            .HasForeignKey(e => e.FromUserId)
            .IsRequired(true).OnDelete(DeleteBehavior.NoAction);

            entity.HasMany(e => e.NotificationsTo)
            .WithOne(e => e.ToUser)
            .HasForeignKey(e => e.ToUserId)
            .IsRequired(true).OnDelete(DeleteBehavior.NoAction);

            entity.HasMany(e => e.Tickets)
            .WithOne(e => e.Assignee)
            .HasForeignKey(e => e.AssigneeId)
            .IsRequired(false);

            entity.HasOne(e => e.Branch)
            .WithMany(e => e.Users)
            .HasForeignKey(e => e.BranchId)
            .IsRequired(false);

            entity.HasOne(e => e.SubDepartment)
            .WithMany(e => e.Users)
            .HasForeignKey(e => e.SubDepartmentId)
            .IsRequired(false);

            entity.HasMany(e => e.UserDepartments)
           .WithOne(e => e.User)
           .HasForeignKey(e => e.UserId).IsRequired(true);


            //Departments
            //entity.HasOne(e => e.Department)
            //.WithOne(e => e.Head)
            //.HasForeignKey<Department>(e => e.HeadId)
            //.IsRequired(false);

            //entity.HasMany(e => e.Members)
            //.WithOne(e => e.User)
            //.HasForeignKey(e => e.UserId)
            //.IsRequired(true).OnDelete(DeleteBehavior.NoAction);


            //entity.HasMany(e => e.Overtime)
            //.WithOne(e => e.User)
            //.HasForeignKey(e => e.UserId)
            //.IsRequired(true).OnDelete(DeleteBehavior.NoAction);

            //entity.HasMany(e => e.UpdatedOvertime)
            //.WithOne(e => e.UpdatedBy)
            //.HasForeignKey(e => e.UpdatedById)
            //.IsRequired(false).OnDelete(DeleteBehavior.NoAction);

            //Departments
        });

        modelBuilder.Entity<TicketHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.TicketHistories");

            entity.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .IsRequired(true);
        });

        modelBuilder.Entity<TicketComment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.TicketComments");

            entity.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .IsRequired(true);


            entity.HasMany(e => e.TicketAttachments)
            .WithOne(e => e.TicketComment)
            .HasForeignKey(e => e.TicketCommentId).IsRequired(false);
        });


        modelBuilder.Entity<TicketAttachment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.TicketAttachments");  

            entity.Property(e => e.Id)
                .HasColumnName("Id") 
                .ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<Branch>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.Branches");

            entity.Property(e => e.Id)
                .HasColumnName("Id")
                .ValueGeneratedOnAdd();


        });


        //Groupings
        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.Departments");

            entity.Property(e => e.Id)
                .HasColumnName("Id")
                .ValueGeneratedOnAdd();

            entity.HasMany(e => e.SubDepartments)
            .WithOne(e => e.Department)
            .HasForeignKey(e => e.DepartmentId)
            .IsRequired(false);
        });

        modelBuilder.Entity<SubDepartment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.SubDepartments");

            entity.Property(e => e.Id)
                .HasColumnName("Id")
                .ValueGeneratedOnAdd();

           // entity.HasMany(e => e.Members)
           //.WithOne(e => e.SubDepartment)
           //.HasForeignKey(e => e.SubDepartmentId)
           //.IsRequired(false);

        });

        modelBuilder.Entity<Member>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.Member");

            entity.Property(e => e.Id)
                .HasColumnName("Id")
                .ValueGeneratedOnAdd();

        });

        modelBuilder.Entity<AppSetting>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.AppSettings");

            entity.Property(e => e.Id)
                .HasColumnName("Id")
                .ValueGeneratedOnAdd();

        });

        modelBuilder.Entity<TicketCatchup>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.TicketCatchups");

            entity.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .IsRequired(false);
        });
        
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.Categories");
        });

        modelBuilder.Entity<ItemStock>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.ItemStocks");

            entity.HasOne(e => e.Category)
            .WithMany()
            .HasForeignKey(e => e.CategoryId)
            .IsRequired(false);
        });

        modelBuilder.Entity<StockHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.StockHistories");

            entity.HasOne(e => e.ItemStock)
            .WithMany()
            .HasForeignKey(e => e.ItemStockId)
            .IsRequired(false);

            entity.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .IsRequired(false);
        });

        modelBuilder.Entity<Workstream>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.Workstreams");

            entity.HasMany(e => e.WorkstreamHistories)
            .WithOne(e => e.Workstream)
            .HasForeignKey(e => e.WorkstreamId).IsRequired(true);

            entity.HasMany(e => e.Subtasks)
            .WithOne(e => e.Workstream)
            .HasForeignKey(e => e.WorkstreamId).IsRequired(true);


            entity.HasOne(e => e.Owner)
            .WithMany(e => e.Workstreams)
            .HasForeignKey(e => e.OwnerId)
            .IsRequired(false);


            entity.HasOne(e => e.Branch)
            .WithMany(e => e.Workstreams)
            .HasForeignKey(e => e.BranchId)
            .IsRequired(false);

            entity.HasMany(e => e.Tickets)
            .WithOne(e => e.Workstream)
            .HasForeignKey(e => e.WorkstreamId).IsRequired(false);

        });

        modelBuilder.Entity<WorkstreamSubtask>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.WorkstreamSubtasks");

            entity.HasOne(e => e.Assignee)
            .WithMany()
            .HasForeignKey(e => e.AssigneeId)
            .IsRequired(false);

            entity.HasOne(e => e.Branch)
            .WithMany()
            .HasForeignKey(e => e.BranchId)
            .IsRequired(false);
        });

        modelBuilder.Entity<WorkstreamHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.WorkstreamHistories");

            entity.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .IsRequired(true);
        });
        modelBuilder.Entity<StarRating>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.StarRatings");

            entity.HasOne(e => e.Ticket)
            .WithMany()
            .HasForeignKey(e => e.TicketId)
            .IsRequired(false);
        });



        OnModelCreatingPartial(modelBuilder);

        //Ignore DTO
        modelBuilder.Ignore<OvertimeDTO>();
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
