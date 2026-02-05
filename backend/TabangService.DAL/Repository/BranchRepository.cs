using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tabang.Models;
using TabangService.DAL.Model;
using TabangService.DAL.Models;
using TabangService.DAL.Models.DTO;

namespace TabangService.DAL.Repository
{
    public class BranchRepository
    {

        private readonly TabangContext _context;
        public BranchRepository()
        {
            _context = new TabangContext();
        }
        public async Task<List<Branch>> GetBranches()
        {
            return await _context.Branches.ToListAsync();

        }
        public async Task<BranchQueryResult> GetBranches(BranchQuery query)
        {
            var branchQuery = _context.Branches.AsQueryable();

            if (!string.IsNullOrEmpty(query.Search))
            {
                branchQuery = branchQuery.Where(q => q.Name.ToLower().Contains(query.Search.ToLower()));
            }

            int totalRecords = await branchQuery.CountAsync();

            var branches = await branchQuery
                .OrderBy(q => q.Name)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return new BranchQueryResult
            {
                Branches = branches,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalRecords = totalRecords
            };
        }

        public Branch SaveBranch(BranchModel branchModel)
        {
            string error = "";
            error += string.IsNullOrEmpty(branchModel.Name) ? "error name " : "";

            if (!string.IsNullOrEmpty(error))
            {
                throw new Exception(error);
            }

            Branch branch = new Branch() { Id = branchModel.Id, Name = branchModel.Name, DepartmentBase = branchModel.DepartmentBase };
            if (branch.Id == 0)
            {
                _context.Branches.Add(branch);
                _context.SaveChanges();
            }
            else
            {
                _context.Branches.Update(branch);
                _context.SaveChanges();
            }
            return branch;
        }
    }
}
