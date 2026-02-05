using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using Tabang.Models;
using TabangService.DAL.Model;
using TabangService.DAL.Models;
using TabangService.DAL.Models.Enums;

namespace TabangService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MigrationController : ControllerBase
    {
        private readonly TabangContext _context;

        public MigrationController(TabangContext context)
        {
            _context = context;
        }

        [HttpPost("MigrateUserDepartments")]
        public async Task<IActionResult> MigrateUserDepartments()
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1️⃣ Load all users who don't have UserDepartments yet
                var users = await _context.Users
                    .Include(u => u.UserDepartments)
                    .Where(u => !u.UserDepartments.Any())
                    .ToListAsync();

                if (!users.Any())
                    return Ok("No users to migrate.");

                // 2️⃣ Load all departments
                var departments = await _context.Departments.ToListAsync();

                var departmentMapping = departments
                    .ToDictionary(d => d.Name.ToUpper(), d => d.Id);

                var userDepartmentsToAdd = new List<UserDepartment>();

                foreach (var user in users)
                {
                    if (user.DepartmentBase == DepartmentBase.All || (int)user.DepartmentBase == 0)
                    {
                        // Assign all departments
                        foreach (var dept in departments)
                        {
                            userDepartmentsToAdd.Add(new UserDepartment
                            {
                                UserId = user.Id,
                                DepartmentId = dept.Id
                            });
                        }
                    }
                    else
                    {
                        // Assign specific department
                        string deptName = user.DepartmentBase.ToString().ToUpper();

                        if (departmentMapping.TryGetValue(deptName, out int deptId))
                        {
                            userDepartmentsToAdd.Add(new UserDepartment
                            {
                                UserId = user.Id,
                                DepartmentId = deptId
                            });
                        }
                        else
                        {
                            // Optional: log warning if mapping fails
                            Console.WriteLine($"Warning: No department mapping found for {user.FullName} ({deptName})");
                        }
                    }
                }

                if (userDepartmentsToAdd.Any())
                {
                    await _context.UserDepartments.AddRangeAsync(userDepartmentsToAdd);
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();

                return Ok($"Migrated {userDepartmentsToAdd.Count} user departments successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Migration failed: {ex.Message}");
            }
        }

        [HttpPost("MigrateTicketDepartmentsBatch")]
        public async Task<IActionResult> MigrateTicketDepartmentsBatch()
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1️⃣ Load all departments once
                var departments = await _context.Departments.ToListAsync();
                var departmentMapping = departments.ToDictionary(d => d.Name.ToUpper(), d => d.Id);

                int batchSize = 100;
                int totalMigrated = 0;

                while (true)
                {
                    // 2️⃣ Get next batch of tickets without TicketDepartments
                    var tickets = await _context.Tickets
                        .Include(t => t.TicketDepartments)
                        .Where(t => !t.TicketDepartments.Any())
                        .OrderBy(t => t.Id)
                        .Take(batchSize)
                        .ToListAsync();

                    if (!tickets.Any())
                        break; // All done

                    var ticketDepartmentsToAdd = new List<TicketDepartment>();

                    foreach (var ticket in tickets)
                    {
                        if (ticket.DepartmentBase == DepartmentBase.All || (int)ticket.DepartmentBase == 0)
                        {
                            foreach (var dept in departments)
                            {
                                ticketDepartmentsToAdd.Add(new TicketDepartment
                                {
                                    TicketId = ticket.Id,
                                    DepartmentId = dept.Id
                                });
                            }
                        }
                        else
                        {
                            string deptName = ticket.DepartmentBase.ToString().ToUpper();
                            if (departmentMapping.TryGetValue(deptName, out int deptId))
                            {
                                ticketDepartmentsToAdd.Add(new TicketDepartment
                                {
                                    TicketId = ticket.Id,
                                    DepartmentId = deptId
                                });
                            }
                            else
                            {
                                Console.WriteLine($"Warning: No department mapping found for ticket {ticket.Id} ({deptName})");
                            }
                        }
                    }

                    if (ticketDepartmentsToAdd.Any())
                    {
                        await _context.TicketDepartments.AddRangeAsync(ticketDepartmentsToAdd);
                        await _context.SaveChangesAsync();
                        totalMigrated += ticketDepartmentsToAdd.Count;
                    }

                    // Optional: free memory
                    tickets.Clear();
                    ticketDepartmentsToAdd.Clear();
                }

                await transaction.CommitAsync();
                return Ok($"Migrated {totalMigrated} ticket departments in batches of {batchSize} successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Migration failed: {ex.Message}");
            }
        }


    }
}
