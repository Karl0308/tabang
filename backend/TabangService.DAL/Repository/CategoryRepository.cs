using Microsoft.AspNetCore.Mvc;
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
    public class CategoryRepository
    {

        private readonly TabangContext _context;
        public CategoryRepository()
        {
            _context = new TabangContext();
        }
        public async Task<CategoryQueryResult> GetCategories(CategoryQuery query)
        {
            var categoryQuery = _context.Categories.AsQueryable();

            if (!string.IsNullOrEmpty(query.Search))
            {
                categoryQuery = categoryQuery.Where(q => q.Name.ToLower().Contains(query.Search.ToLower()));
            }

            int totalRecords = await categoryQuery.CountAsync();

            var category = await categoryQuery
                .OrderBy(q => q.Name)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return new CategoryQueryResult
            {
                Categories = category,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalRecords = totalRecords
            };
        }

        public Category SaveCategory(Category category)
        {
            string error = "";
            error += string.IsNullOrEmpty(category.Name) ? "error empty name " : "";
            if (!string.IsNullOrEmpty(error))
            {
                throw new Exception(error);
            }

            Category? existingCategory = _context.Categories.FirstOrDefault(q => q.Name.ToLower().Equals(category.Name.ToLower()) && q.Id != category.Id);
            if (existingCategory != null)
            {
                throw new Exception("Category already exist!");
            }

            if (category.Id == 0)
            {
                _context.Categories.Add(category);
                 _context.SaveChanges();
            }
            else
            {
                _context.Categories.Update(category);
                _context.SaveChanges();
            }
            return category;
        }
        public async void DeleteCategory(int id)
        {
           await _context.Categories.Where(q => q.Id == id).ExecuteDeleteAsync();
        }
    }
}
