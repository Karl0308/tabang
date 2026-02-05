using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
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
    public class UserRepository
    {
        private readonly TabangContext _context;
        private readonly TabangAttachmentContext _attachmentContext;
        private readonly UserManager<User> _userManager;
        public UserRepository()
        {
            _context = new TabangContext();
            _attachmentContext = new TabangAttachmentContext();

        }
        public UserRepository(UserManager<User> userManager)
        {
            _context = new TabangContext();
            _attachmentContext = new TabangAttachmentContext();
            _userManager = userManager;
        }
        public async Task<List<User>> GetUsers(bool getAll)
        {
            if (getAll == false)
            {
                var activeUsers = await _context.Users.Include(x => x.Branch).OrderBy(x => x.FullName).Where(q => q.Active).ToListAsync();
                activeUsers.ForEach(x =>
                {
                    x.BranchName = x.Branch == null ? "Unassigned" : x.Branch.Name;
                    x.Branch = null;
                });
                return activeUsers;
            }

            var users = await _context.Users.Include(x => x.Branch).OrderBy(x => x.FullName).ToListAsync();
            users.ForEach(x =>
            {
                x.BranchName = x.Branch == null ? "Unassigned" : x.Branch.Name;
                x.Branch = null;
            });
            return users;
        }
        public async Task<UserQueryResult> GetUsers(UserQuery query)
        {
            var userQuery = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(query.Search))
            {
                userQuery = userQuery.Where(q => q.FullName.ToLower().Contains(query.Search.ToLower()));
            }

            int totalRecords = await userQuery.CountAsync();

            var users = await userQuery
                .Include(q=>q.Branch)
                .Include(q=>q.UserDepartments).ThenInclude(d=>d.Department)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            users.ForEach(x =>
            {
                x.BranchName = x.Branch == null ? "Unassigned" : x.Branch.Name;
                x.Branch = null;
            });
            return new UserQueryResult
            {
                Users = users,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalRecords = totalRecords
            };
        }
        public async Task<User> GetUserId(int _id)
        {
            return _context.Users.FirstOrDefault(x => x.Id == _id);
        }
        public async Task<List<User>> GetUserAssignees()
        {
            return await _context.Users.Where(x => x.Role == Models.Enums.UserRole.Assignee).ToListAsync();
        }
        public async Task<User> GetUserByUsername(string _username)
        {
            return _context.Users.FirstOrDefault(x => x.UserName == _username);
        }
        public async Task<User> GetUserByCredential(LoginModel _model)
        {
            return _context.Users.FirstOrDefault(x => x.UserName == _model.Username && x.Password == _model.Password);
        }
        public async Task<User> PostUser(UserManager<User> _userManager, UserModel _user)
        {
            string error = "";
            error += string.IsNullOrEmpty(_user.FullName) ? "error fullname " : "";
            error += string.IsNullOrEmpty(_user.UserName) ? "error username " : "";
            if (_user.Id == 0)
            {
                error += string.IsNullOrEmpty(_user.Password) ? "error password " : "";
                error += _user.Password != _user.repassword ? "error match " : "";
            }


            if (!string.IsNullOrEmpty(error))
            {
                throw new Exception(error);
            }

            User? checkExistingusername = _context.Users.FirstOrDefault(x => x.UserName.ToLower() == _user.UserName && x.Id != _user.Id);

            if (checkExistingusername != null)
            {
                error += "error exist";
                throw new Exception(error);
            }

            User? currentUser = _context.Users.AsNoTracking().FirstOrDefault(q => q.Id == _user.Id);
            User user = new User()
            {
                Id = _user.Id,
                FullName = _user.FullName,
                UserName = _user.UserName,
                PasswordHash = _user.Password == null || _user.Password.IsNullOrEmpty() ? currentUser.PasswordHash : new Hasher().HashPassword(_user.Password),
                Email = _user.Email,
                BranchId = _user.BranchId == 0 ? null : _user.BranchId,
                DepartmentBase = _user.DepartmentBase,
                Role = _user.Role,
                Active = _user.Active
            };

            if (_user.Id == 0)
            {
               
                var result = await _userManager.CreateAsync(user);

                var userDepartments = _user.DepartmentIds.Select(did => new UserDepartment
                {
                    UserId = user.Id,
                    DepartmentId = did
                }).ToList();

                _context.UserDepartments.AddRange(userDepartments);
                await _context.SaveChangesAsync();

                //_context.Users.Add(user);
                //_context.SaveChanges();
            }
            else
            {
                try
                {
                    var existingUser = await _context.Users.Include(u => u.UserDepartments).FirstOrDefaultAsync(q => q.UserName == _user.UserName);
                    var userToUpdate = await _userManager.FindByNameAsync(existingUser.UserName);

                    userToUpdate.Email = _user.Email;
                    userToUpdate.FullName = _user.FullName;
                    userToUpdate.BranchId = _user.BranchId == 0 ? null : _user.BranchId;
                    userToUpdate.DepartmentBase = _user.DepartmentBase;
                    userToUpdate.Role = _user.Role;
                    userToUpdate.Active = _user.Active;

                    _context.UserDepartments.RemoveRange(existingUser.UserDepartments);

                    var result = await _userManager.UpdateAsync(userToUpdate);

                    var existingDepartments = await _context.UserDepartments
                    .Where(ud => ud.UserId == userToUpdate.Id)
                    .ToListAsync();
                    _context.UserDepartments.RemoveRange(existingDepartments);

                    // Add new
                    var newDepartments = _user.DepartmentIds.Select(did => new UserDepartment
                    {
                        UserId = userToUpdate.Id,
                        DepartmentId = did
                    }).ToList();

                    _context.UserDepartments.AddRange(newDepartments);

                    await _context.SaveChangesAsync();

                }
                catch (Exception ex)
                {

                    throw;
                }

            }
            return user;
        }
        public async Task ResetPassword(ResetPassword reset)
        {

            User? currentUser = _context.Users.FirstOrDefault(q => q.Id == reset.Id);
            if (!new Hasher().VerifyPassword(currentUser.PasswordHash, reset.OldPassword))
            {
                throw new Exception("Passwords do not match!");
            }

            var userToUpdate = await _userManager.FindByNameAsync(currentUser.UserName);
            userToUpdate.PasswordHash = new Hasher().HashPassword(reset.NewPassword);

            var result = await _userManager.UpdateAsync(userToUpdate);
        }
        public async Task ResetUserPassword(ResetPassword reset)
        {

            User? currentUser = _context.Users.FirstOrDefault(q => q.Id == reset.Id);
            if (reset.OldPassword.Trim() != reset.NewPassword.Trim())
            {
                throw new Exception("Passwords do not match!");
            }
            //var existingUser = await _context.Users.FirstOrDefaultAsync(q => q.UserName == currentUser.UserName);

            var userToUpdate = await _userManager.FindByNameAsync(currentUser.UserName);
            userToUpdate.PasswordHash = new Hasher().HashPassword(reset.NewPassword);

            var result = await _userManager.UpdateAsync(userToUpdate);
        }
        public async Task<object> GetUserSignatureById(int _userId)
        {
            try
            {
                //TicketAttachment attachment = await _context.TicketAttachments.Where(x => x.Id == _attachmentId).FirstOrDefaultAsync();
                var attachmentNew = await _attachmentContext.UserSignatures.Where(x => x.UserId == _userId).OrderByDescending(x => x.Id).FirstOrDefaultAsync();

                return attachmentNew;
            }
            catch (Exception ex)
            {

                throw;
            }

        }

        public async Task<object> GetUsersSignatureOvertime(int id)
        {
            try
            {
                Overtime overtime = await _context.Overtimes.FirstOrDefaultAsync(x => x.Id == id);
                Department department = await _context.Departments.FirstOrDefaultAsync();

                var attachmentUser = await _attachmentContext.UserSignatures.Where(x => x.UserId == overtime.UserId).OrderByDescending(x => x.Id).FirstOrDefaultAsync();
                var attachmentSupervisor = await _attachmentContext.UserSignatures.Where(x => x.UserId == overtime.UpdatedById).OrderByDescending(x => x.Id).FirstOrDefaultAsync();
                var attachmentHead = await _attachmentContext.UserSignatures.Where(x => x.UserId == department.HeadId).OrderByDescending(x => x.Id).FirstOrDefaultAsync();
                List<UserSignature> signatures = new List<UserSignature>();
                signatures.Add(attachmentUser);
                signatures.Add(attachmentSupervisor);
                signatures.Add(attachmentHead);

                return signatures;
            }
            catch (Exception ex)
            {

                throw;
            }

        }


    }
}
