using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tabang.Models;
using TabangService.DAL.Model;
using TabangService.DAL.Models;

namespace TabangService.DAL.Repository
{
    public class NotificationRepository
    {
        private readonly TabangContext _context;
        public NotificationRepository()
        {
                _context = new TabangContext();
        }
        public async Task<List<Notification>> GetNotifications(int userId)
        {
            List<Notification> notifications = await _context.Notifications.AsNoTracking().Include(x=>x.Ticket).Include(x=>x.FromUser).Include(x=>x.ToUser).Where(x=>x.ToUserId == userId).ToListAsync();
            notifications.ForEach(notification => { 
                notification.FromUserFullName = notification.FromUser.FullName;
                notification.ToUserFullName = notification.ToUser.FullName;
                notification.TicketNumber = notification.Ticket.TicketNumber;


                notification.ToUser = null;
                notification.FromUser = null;
                notification.Ticket = null;
            });
            return notifications.OrderByDescending(x=>x.Id).ToList();
        }
        public void ReadNotification(int notifId)
        {
            Notification notification = _context.Notifications.FirstOrDefault(x => x.Id == notifId);
            //ticket.TimeStamp = DateTime.Now.AddHours(8);
            notification.isRead = true;
            _context.Notifications.Update(notification);
            _context.SaveChanges();
        }
    }
}
