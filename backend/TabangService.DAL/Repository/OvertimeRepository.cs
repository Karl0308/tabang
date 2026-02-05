using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Models;
using Tabang.Models;
using AutoMapper;
using TabangService.DAL.Models.Enums;
using AutoMapper.Execution;

namespace TabangService.DAL.Repository
{
    public class OvertimeRepository
    {
        private readonly TabangContext _context;
        private readonly TimeZoneInfo _manilaTimeZone;
        private readonly DateTime CurrentDateTime;
        private readonly IMapper _mapp;

        public OvertimeRepository(IMapper mapper)
        {
            _mapp = mapper;
                _context = new TabangContext();
            _manilaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Taipei Standard Time");
            CurrentDateTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _manilaTimeZone);
        }
        public async Task<List<OvertimeDTO>> GetOvertimes(int _supId)
        {
            //User user = _context.Users.Include(x=>x.Department).Include(x=>x.Members).FirstOrDefault(x=>x.Id == _supId);
            User user = _context.Users.FirstOrDefault(x=>x.Id == _supId);
            if (user.isHead)
            {
                return _mapp.Map<List<OvertimeDTO>>(await _context.Overtimes.Include(x => x.User).Include(x => x.Ticket).Where(x=>x.SupervisorApproval == Approval.Approved).OrderByDescending(x => x.Id).ToListAsync());
            }

            //var isSupervisor = user.Members.Where(x => x.UserId == _supId && x.IsSupervisor).FirstOrDefault();


            //var userIds = _context.SubDepartments
            //  .Include(x => x.Members)
            //  .Where(x => x.Members.Any(z => z.UserId == _supId && z.IsSupervisor))
            //  .ToList()
            //  .SelectMany(sd => sd.Members.Select(m => m.UserId))
            //  .ToList();

            //var overtime = await _context.Overtimes
            //    .Include(x => x.User)
            //    .Include(x => x.Ticket)
            //    .Where(u => userIds.Contains(u.UserId))
            //    .OrderByDescending(x => x.Id)
            //    .ToListAsync();

            //if (isSupervisor != null)
            if (user.isSupervisor)
            {
                //var userIds = _context.SubDepartments
                //  .Include(x => x.Members)
                //  .Where(x => x.Members.Any(z => z.UserId == _supId && z.IsSupervisor))
                //  .ToList()
                //  .SelectMany(sd => sd.Members.Select(m => m.UserId))
                //  .ToList();

                //var overtime = await _context.Overtimes
                //    .Include(x => x.User)
                //    .Include(x => x.Ticket)
                //    .Where(u => userIds.Contains(u.UserId))
                //    .OrderByDescending(x => x.Id)
                //    .ToListAsync();

                var overtime = await _context.Overtimes
                    .Include(x => x.User)
                    .Include(x => x.Ticket)
                    .Where(x=>x.User.SubDepartmentId == user.SubDepartmentId)
                    .OrderByDescending(x => x.Id)
                    .ToListAsync();
                return _mapp.Map<List<OvertimeDTO>>(overtime);
            }
            else
            {
                var overtime = await _context.Overtimes
                .Include(x => x.User)
                .Include(x => x.Ticket)
                .Where(x=>x.UserId == user.Id)
                .OrderByDescending(x => x.Id)
                .ToListAsync();
                return _mapp.Map<List<OvertimeDTO>>(overtime);
            }
          
         
        }
        public OvertimeDTO SaveOvertime(OvertimeDTO _overtimeDTO)
        {
            Overtime overtime = _mapp.Map<Overtime>(_overtimeDTO);

            overtime.Time = overtime.Time.Replace(" ", "");
            overtime.User = _context.Users.Find(_overtimeDTO.UserId);
            overtime.Ticket = _context.Tickets.Find(_overtimeDTO.TicketId);
            if (overtime.Id == 0)
            {
                overtime.DateApplied = CurrentDateTime;
                _context.Overtimes.Add(overtime);
            }
            else
            {
                _context.Overtimes.Update(overtime);
            }
                _context.SaveChanges();

            OvertimeDTO overtimeDTO = _mapp.Map<OvertimeDTO>(overtime);
            return overtimeDTO;
        }
        public OvertimeDTO ApproveOvertime(int userId, bool isApprove, int overtimeId)
        {
            Overtime? overtime = _context.Overtimes.FirstOrDefault(x => x.Id == overtimeId);
            User? user = _context.Users.FirstOrDefault(x => x.Id == userId);
            if (user!.isHead)
            {
                if (isApprove) { overtime.HeadApproval = Approval.Approved; }
                else { overtime.HeadApproval = Approval.Declined; }
            }
            if (user.isSupervisor)
            {
                if (isApprove) { overtime.SupervisorApproval = Approval.Approved; }
                else { overtime.SupervisorApproval = Approval.Declined; }

                overtime.UpdatedById = userId;
            }

            _context.Overtimes.Update(overtime);
            _context.SaveChanges();

            return _mapp.Map<OvertimeDTO>(overtime); ;
        }

    }
}
