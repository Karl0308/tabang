using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tabang.Models;
using TabangService.DAL.Models;
using TabangService.DAL.Models.DTO;

namespace TabangService.DAL.Repository
{
    public class DepartmentRepository
    {
        private readonly TabangContext _context;
        private readonly IMapper _mapp;
        public DepartmentRepository(IMapper mapper)
        {
            _mapp = mapper;
            _context = new TabangContext();
            //var checkInitialDepartmant = _context.Departments.Count();
            //if (checkInitialDepartmant == 0)
            //{
            //    int headId = _context.Users.FirstOrDefault(x => x.FullName.ToLower().Contains("andrew que")).Id;
            //    Department department = new Department();
            //    department.Name = "IT Department";
            //    department.HeadId = headId;
            //    _context.Departments.Add(department);
            //    _context.SaveChanges();
            //}
        }
        //SubDepartment
        public async Task<List<SubDepartmentDTO>> GetSubDepartments()
        {
            return _mapp.Map<List<SubDepartmentDTO>>( await _context.SubDepartments.Include(x => x.Department).ToListAsync());

            //return await _context.SubDepartments.Include(x=>x.Users)
            //    .Select(x => new SubDepartmentDTO
            //    {
            //        Id = x.Id,
            //        Name = x.Name,
            //        DepartmentId = x.DepartmentId,
            //        DepartmentName = x.Department.Name,
            //        Members = x.Members.Select(z => new MemberDTO
            //        {
            //            Id = z.Id,
            //            UserId = z.UserId,
            //            UserName = z.User.FullName,
            //            SubDepartmentId = z.SubDepartmentId,
            //            SubDepartmentName = z.SubDepartment.Name,
            //            IsSupervisor = z.IsSupervisor
            //        }).ToList()

            //    }).ToListAsync();
        }
        public SubDepartmentDTO SaveSubDepartment(SubDepartmentDTO _subDepartment)
        {
            SubDepartment subDepartment = new SubDepartment() 
            { 
                Id = _subDepartment.Id,
                Name = _subDepartment.Name,
                DepartmentId = _subDepartment.DepartmentId == 0 ? _context.Departments.FirstOrDefault().Id : _subDepartment.DepartmentId,
            };

            if (subDepartment.Id == 0)
            {
                _context.SubDepartments.Add(subDepartment);
            }
            else
            {
                _context.SubDepartments.Update(subDepartment);
            }
            _context.SaveChanges();

            return _subDepartment;
        }
        public async Task<List<Department>> GetDepartments()
        {
            return await _context.Departments.ToListAsync();

        }
        public async Task<DepartmentQueryResult> GetDepartments(DepartmentQuery query)
        {
            var departmentQuery = _context.Departments.AsQueryable();

            if (!string.IsNullOrEmpty(query.Search))
            {
                departmentQuery = departmentQuery.Where(q => q.Name.ToLower().Contains(query.Search.ToLower()));
            }

            int totalRecords = await departmentQuery.CountAsync();

            var departments = await departmentQuery
                .OrderBy(q => q.Name)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return new DepartmentQueryResult
            {
                Departments = departments,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalRecords = totalRecords
            };
        }

        public Department SaveDepartment(DepartmentDTO department)
        {
            string error = "";
            error += string.IsNullOrEmpty(department.Name) ? "error empty name " : "";
            if (!string.IsNullOrEmpty(error))
            {
                throw new Exception(error);
            }

            Department? existingDepartment = _context.Departments.FirstOrDefault(q => q.Name.ToLower().Equals(department.Name.ToLower()) && q.Id != department.Id);
            if (existingDepartment != null)
            {
                throw new Exception("Department already exist!");
            }

            if (department.Id == 0)
            {
                Department newDepartment = new Department()
                {
                    Name = department.Name
                };
                _context.Departments.Add(newDepartment);
                _context.SaveChanges();
                return newDepartment;
            }
            else
            {
                Department? deptToUpdate = _context.Departments.FirstOrDefault(q => q.Id == department.Id);
                deptToUpdate.Name = department.Name;
                _context.Departments.Update(deptToUpdate);
                _context.SaveChanges();

                return deptToUpdate;
            }

          
        }


        //SubDepartment



        //Members
        //public async Task<List<MemberDTO>> GetMembersbySubDepartmentId(int _subDepId)
        //{
        //    return await _context.Members.Include(x=>x.User).Where(x=>x.SubDepartmentId == _subDepId)
        //        .Select(x => new MemberDTO
        //        {
        //            Id = x.Id,
        //            UserId = x.UserId,  
        //            UserName = x.User.FullName,
        //            SubDepartmentId = x.SubDepartmentId,
        //            IsSupervisor = x.IsSupervisor
        //        }).ToListAsync();
        //}
        //public MemberDTO AddMember(int _subDepartmentId, int _userId)
        //{
        //    SubDepartment subDepartment = _context.SubDepartments.FirstOrDefault(x=>x.Id == _subDepartmentId);

        //    Member member = new Member()
        //    {
        //        UserId = _userId,
        //        SubDepartmentId = subDepartment.Id,
        //        IsSupervisor = false
        //    };
        //    //subDepartment.Members.Add(member);

        //    //_context.Entry(member).Reference(t => t.User).Load();
        //    //_context.Entry(member).Reference(t => t.SubDepartment).Load();
        //    _context.SaveChanges();

        //    return new MemberDTO()
        //    {
        //        Id = member.Id,
        //        UserId = member.UserId,
        //        UserName = _context.Users.FirstOrDefault(x=>x.Id == member.UserId).FullName,
        //        SubDepartmentId = member.SubDepartmentId,
        //        SubDepartmentName = member.SubDepartment.Name,
        //        IsSupervisor = member.IsSupervisor
        //    }; 
        //}

        //public void RemoveMember(int _memberId)
        //{
        //    Member member = _context.Members.FirstOrDefault(x => x.Id == _memberId);
        //    _context.Members.Remove(member);
        //    _context.SaveChanges();
        //}
        //public void SetSupervisor(int _memberId)
        //{
        //    Member member = _context.Members.FirstOrDefault(x => x.Id == _memberId);
        //    member.IsSupervisor = !member.IsSupervisor;
        //    _context.Members.Update(member);
        //    _context.SaveChanges();
        //}

        //Members
    }
}
