using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tabang.Models;
using TabangService.DAL.Models;
using TabangService.DAL.Models.DTO;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace TabangService.DAL.Repository
{
    public class AppSettingRepository
    {

        private readonly TabangContext _context;
        public AppSettingRepository()
        {
            _context = new TabangContext();
        }

        public async Task<AppSetting> GetAppSettings()
        {
            AppSetting setting = await _context.AppSettings.FirstOrDefaultAsync();
            if (setting == null)
            {
                setting = new AppSetting();
                setting.Id = 0;
                setting.NewFrom = "00";
                setting.NewTo = "03";
                setting.WarningFrom = "03";
                setting.WarningTo = "12";
                setting.SevereFrom = "12";
                setting.SevereTo = "12";
                setting.NewColor = "yellow";
                setting.WarningColor = "orange";
                setting.SevereColor = "red";
            }
            return setting;

        }
        public AppSetting SaveAppSetting(AppSetting app)
        {
            if (int.Parse(app.NewTo) == 0) 
            {
                throw new Exception("New Ticket Time To must greater than 0.");
            }


            if (int.Parse(app.WarningTo) < int.Parse(app.WarningFrom))
            {
                throw new Exception("Warning Ticket Time To must greater than Warning From.");
            }

          
            if (_context.AppSettings.Count() == 0)
            {
                _context.AppSettings.Add(app);
                _context.SaveChanges();
            }
            else
            {
                try
                {
                  AppSetting  appSetting = _context.AppSettings.FirstOrDefault();
                    appSetting.NewFrom = app.NewFrom;
                    appSetting.NewTo = app.NewTo;
                    appSetting.WarningFrom = app.WarningFrom;
                    appSetting.WarningTo = app.WarningTo;
                    appSetting.SevereFrom = app.SevereFrom;
                    appSetting.SevereTo = app.SevereTo;
                    appSetting.NewColor = app.NewColor;
                    appSetting.WarningColor = app.WarningColor;
                    appSetting.SevereColor = app.SevereColor;

                _context.AppSettings.Update(appSetting);
                _context.SaveChanges();
                }
                catch (Exception ex)
                {

                    throw;
                }
              
            }
           

            return app;
        }
    }
}
