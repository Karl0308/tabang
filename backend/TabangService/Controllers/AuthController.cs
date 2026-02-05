using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Diagnostics.Eventing.Reader;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Tabang.Models;
using TabangService.DAL;
using TabangService.DAL.Builder;
using TabangService.DAL.Models;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Models.Enums;
using TabangService.DAL.Repository;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace TabangService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly TabangAttachmentContext _attachmentContext;
        private readonly TabangContext _tabangcontext;

        public AuthController(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _tabangcontext = new TabangContext();
            _attachmentContext = new TabangAttachmentContext();
        }
        [AllowAnonymous]
        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginModel model)
        {
            var user = await _tabangcontext.Users.FirstOrDefaultAsync(x => x.UserName == model.Username);
            if (user != null)
            {
                var result = new Hasher().VerifyPassword(user.PasswordHash, model.Password);

                if (result)
                {
                    var token = GenerateJwtToken(user);
                    user.Token = token;
                    return Ok(user);
                }
                else
                {
                    return Unauthorized();
                }
            }
            else
            {
                return Unauthorized();
            }
 
        }

        //[HttpPost("CreateUser")]
        //public async Task<IActionResult> Create(UserModel model)
        //{
        //    if (ModelState.IsValid)
        //    {
        //        //var user = new User { UserName = model.UserName, FullName = model.FullName, Role = model.Role, Active = model.Active };
        //        //var result = await _userManager.CreateAsync(user, model.Password);

        //        //var user = new User { UserName = model.Email.Replace("@iloilosupermart.team", ""), FullName = model.FullName, Role = model.Role, Active = model.Active, Email = model.Email};
        //        var user = new User { UserName = model.FullName.Replace(" ", "").ToLower(), FullName = model.FullName, Role = model.Role, Active = model.Active, Email = model.Email };
        //        user.BranchId = model.BranchId == 0 ? null : model.BranchId;


        //        if (string.IsNullOrEmpty(model.FullName))
        //        {
        //            ModelState.AddModelError("", "error fullname ");
        //            return BadRequest(ModelState);
        //        }

        //        //if (string.IsNullOrEmpty(model.UserName))
        //        //{
        //        //    ModelState.AddModelError("", "error username ");
        //        //    return BadRequest(ModelState);
        //        //}
        //        //if (string.IsNullOrEmpty(model.Password))
        //        //{
        //        //    ModelState.AddModelError("", "error password ");
        //        //    return BadRequest(ModelState);
        //        //}
        //        //if (model.Password != model.repassword)
        //        //{
        //        //    ModelState.AddModelError("", "error match ");
        //        //    return BadRequest(ModelState);
        //        //}
        //        if (string.IsNullOrEmpty(model.Email) || !model.Email.Contains("@iloilosupermart.team"))
        //        {
        //            ModelState.AddModelError("", "error email ");
        //            return BadRequest(ModelState);
        //        }
        //        var result = await _userManager.CreateAsync(user, "123456");

        //        if (result.Succeeded)
        //        {
        //            //await _signInManager.SignInAsync(user, false);
        //            return Ok(result);
        //        }
        //        else
        //        {
        //            foreach (var error in result.Errors)
        //            {
        //                ModelState.AddModelError("", error.Description);
        //            }
        //        }
        //    }
        //    return BadRequest(ModelState);
        //}

        //[HttpPost("UpdateUser")]
        //public async Task<IActionResult> UpdateUser(UserModel userModel)
        //{
        //    var user = await _userManager.FindByNameAsync(userModel.OldUserName);

        //    if (user == null)
        //    {
        //        // Handle user not found
        //        return NotFound();
        //    }

        //    user.UserName = userModel.UserName;
        //    user.FullName = userModel.FullName;
        //    user.Email = userModel.Email;
        //    user.Role = userModel.Role;
        //    user.Active = userModel.Active;
        //    user.BranchId = userModel.BranchId == 0 ? null : userModel.BranchId;

        //    // Use UpdateAsync to update the user in the database
        //    var result = await _userManager.UpdateAsync(user);

        //    if (result.Succeeded)
        //    {
        //        return Ok(result);
        //    }
        //    else
        //    {
        //        // Handle the errors (e.g., validation errors)
        //        foreach (var error in result.Errors)
        //        {
        //            ModelState.AddModelError("", error.Description);
        //        }

        //    }

        //    return BadRequest(ModelState);
        //}

        [HttpPost("CreateUser")]
        public async Task<IActionResult> Create()
        {
            if (ModelState.IsValid)
            {
                var user = new User();

                user.FullName = Request.Form["fullname"];
                user.Email = Request.Form["email"];
                user.BranchId = int.Parse(Request.Form["branch"]) == 0 ? null : int.Parse(Request.Form["branch"]);
                user.Role = (UserRole)Enum.Parse(typeof(UserRole), Request.Form["role"]);
                user.Active = bool.Parse(Request.Form["active"]);
                user.UserName = user.FullName.Replace(" ", "").ToLower();
                user.SubDepartmentId = Request.Form["subDepartmentId"] == "null" ? null : int.Parse(Request.Form["subDepartmentId"]);
                user.isSupervisor =Request.Form["isSupervisor"] == "true" ? true : false ;


                var files = Request.Form.Files;

                
                if (string.IsNullOrEmpty(user.FullName))
                {
                    ModelState.AddModelError("", "error fullname ");
                    return BadRequest(ModelState);
                }
                //}
                if (string.IsNullOrEmpty(user.Email) || !user.Email.Contains("@iloilosupermart.team"))
                {
                    ModelState.AddModelError("", "error email ");
                    return BadRequest(ModelState);
                }
                var result = await _userManager.CreateAsync(user, "123456");

                if (result.Succeeded)
                {
                    foreach (var item in files)
                    {
                        TabangAttachmentContext.UserSignature userSignature = new TabangAttachmentContext.UserSignature();
                        userSignature.UserId = user.Id;
                        userSignature.Content = ReadFileContent(item);
                        userSignature.ContentType = item.ContentType;
                        _attachmentContext.UserSignatures.Add(userSignature);
                        _attachmentContext.SaveChanges();
                    }

                    return Ok(result);
                }
                else
                {
                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError("", error.Description);
                    }
                }
            }
            return BadRequest(ModelState);
        }



        [HttpPost("UpdateUser")] 
        public async Task<IActionResult> UpdateUser()
        {

            var user = await _userManager.FindByNameAsync(Request.Form["oldUserName"]);

            user.FullName = Request.Form["fullname"];
            user.Email = Request.Form["email"];
            user.BranchId = int.Parse(Request.Form["branch"]) == 0 ? null : int.Parse(Request.Form["branch"]);
            user.Role = (UserRole)Enum.Parse(typeof(UserRole), Request.Form["role"]);
            user.Active = bool.Parse(Request.Form["active"]);
            user.SubDepartmentId = Request.Form["subDepartmentId"] == "null" ? null : int.Parse(Request.Form["subDepartmentId"]);
            user.isSupervisor = Request.Form["isSupervisor"] == "true" ? true : false;


            var files = Request.Form.Files;
                
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                foreach (var item in files)
                {
                    TabangAttachmentContext.UserSignature userSignature = new TabangAttachmentContext.UserSignature();
                    userSignature.UserId = user.Id;
                    userSignature.Content = ReadFileContent(item);
                    userSignature.ContentType = item.ContentType;
                    _attachmentContext.UserSignatures.Add(userSignature);
                    _attachmentContext.SaveChanges();
                }
                

                return Ok(result);
            }
            else
            {
                // Handle the errors (e.g., validation errors)
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }

            }

            return BadRequest(ModelState);
        }
        private byte[] ReadFileContent(IFormFile file)
        {
            using (var memoryStream = new MemoryStream())
            {
                file.CopyTo(memoryStream);
                return memoryStream.ToArray();
            }
        }

        [HttpPost("ResetPassword")]
        public async Task<IActionResult> ResetPassword(UserModel userModel)
        {
            var user = await _userManager.FindByNameAsync(userModel.UserName);

            if (user == null)
            {
                // Handle user not found
                return NotFound();
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            // Use UpdateAsync to update the user in the database
            var result = await _userManager.ResetPasswordAsync(user, token, userModel.Password);

            if (result.Succeeded)
            {
                return Ok(result);
            }
            else
            {
                // Handle the errors (e.g., validation errors)
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }

            }

            return BadRequest(ModelState);
        }

        //[AllowAnonymous]
        //[HttpPost("AddInitialAdmin")]
        //public async Task<IActionResult> AddInitialAdmin()
        //{
        //        var user = new User { UserName = "KarloCunanan", FullName = "Karlo Cunanan", Role = UserRole.Admin, Active = true, Email = "karlo@iloilosupermart.team" };

        //        var result = await _userManager.CreateAsync(user, "123456");

        //        if (result.Succeeded)
        //        {
        //            //await _signInManager.SignInAsync(user, false);
        //            return Ok(result);
        //        }
        //        else
        //        {
        //            foreach (var error in result.Errors)
        //            {
        //                ModelState.AddModelError("", error.Description);
        //            }
        //        }
        //    return BadRequest(ModelState);
        //}


        [AllowAnonymous]
        [HttpPost("LoginEmail")]
        public async Task<IActionResult> LoginEmail(string email)
        {
            //Create initial user
            //var userToCreate = new User();

            //userToCreate.FullName ="Karlo Cunanan";
            //userToCreate.Email = "karlo@iloilosupermart.team";
            //userToCreate.BranchId =  null ;
            //userToCreate.Role = UserRole.Admin;
            //userToCreate.Active = true;
            //userToCreate.UserName = "karlocunanan";
            //userToCreate.SubDepartmentId = null ;
            //userToCreate.isSupervisor = false;


            //var result = await _userManager.CreateAsync(userToCreate, "123456");

            //Create initial user


            //var user = await new UserRepository().GetUserByCredential(model);
            try
            {

                var user = await _userManager.FindByEmailAsync(email.ToLower());
                if (user != null)
                {
                    if (user.Active == false)
                    {
                        return Unauthorized();
                    }
                    var token = GenerateJwtToken(user);
                    user.Token = token;
                    return Ok(user);
                }
            }
            catch (Exception ex)
            {

            }

            return Unauthorized();
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_configuration["JwtSettings:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.UserName)
                },
                expires: DateTime.UtcNow.AddYears(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
