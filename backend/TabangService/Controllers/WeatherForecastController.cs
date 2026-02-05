using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tabang.Models;
using TabangService.DAL.Models;

namespace TabangService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [AllowAnonymous]
    public class WeatherForecastController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private static readonly string[] Summaries = new[]
        {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

        private readonly ILogger<WeatherForecastController> _logger;


        public WeatherForecastController(UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpGet(Name = "GetWeatherForecast")]
        public async Task<IEnumerable<WeatherForecast>> Get()
        {
            var user = await _userManager.FindByNameAsync("karl5");
            if (user != null)
            {
                user.Email = "patrick@iloilosupermart.team";
                user.Active = true;
                user.Role = DAL.Models.Enums.UserRole.Admin;
                await _userManager.UpdateAsync(user);
            }
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }
        [HttpGet("migrate")]
        public async Task<string> Migrate([FromServices] TabangContext con)
        {
            await con.Database.MigrateAsync();
            return "Database migration completed successfully.";
        }
        //http://localhost:5178/WeatherForecast/migrate

        [HttpGet("FixUsers")]
        public async Task<string> FixUsers([FromServices] TabangContext con)
        {
            List<User> users = await con.Users.ToListAsync();

            //foreach (var user in users.Where(q => q.Email != null && q.NormalizedUserName == null))
            //{
            //    if (user.NormalizedEmail == null)
            //    {
            //         user.NormalizedEmail = user.Email.ToUpper();
            //        if (user.DepartmentBase == DAL.Models.Enums.DepartmentBase.All)
            //        {
            //            user.DepartmentBase = DAL.Models.Enums.DepartmentBase.IS;
            //        }
            //        if (user.Id == 4)
            //        {
            //            user.Role = DAL.Models.Enums.UserRole.SysAdmin;
            //            user.DepartmentBase = DAL.Models.Enums.DepartmentBase.All;
            //        }
            //        if (user.Id == 6)
            //        {
            //            user.Role = DAL.Models.Enums.UserRole.SysAdmin;
            //            user.DepartmentBase = DAL.Models.Enums.DepartmentBase.All;
            //        }

            //        await _userManager.UpdateAsync(user);
            //    }
            //}

            foreach (var user in users.Where(q => q.Id == 32 || q.Id == 4 || q.Id == 6))
            {
                    user.DepartmentBase = DAL.Models.Enums.DepartmentBase.All;

                await _userManager.UpdateAsync(user);
            }
        
            return "User Fix completed successfully.";
        }
}
}