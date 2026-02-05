using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tabang.Models;
using TabangService.DAL.Models;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Models.Enums;

namespace TabangService.DAL.Repository
{
    public class ItemStockRepository
    {
        private readonly TabangContext _context;
        private readonly TimeZoneInfo _manilaTimeZone;
        private readonly DateTime CurrentDateTime;
        public ItemStockRepository()
        {
            _context = new TabangContext();
            _manilaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Taipei Standard Time");
            CurrentDateTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _manilaTimeZone);
        }
        public async Task<ItemStockQueryResult> GetItemStocks(ItemStockQuery query)
        {
            var itemQuery = _context.ItemStocks.AsQueryable();

            if (!string.IsNullOrEmpty(query.Search))
            {
                itemQuery = itemQuery.Where(q => q.Name.ToLower().Contains(query.Search.ToLower()));
            }
            if (query.CategoryId > 0)
            {
                itemQuery = itemQuery.Where(q => q.CategoryId == query.CategoryId);
            }

            int totalRecords = await itemQuery.CountAsync();

            var itemStocks = await itemQuery
                .Include(q => q.Category)
                .OrderBy(q => q.Name)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return new ItemStockQueryResult
            {
                ItemStocks = itemStocks,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalRecords = totalRecords
            };
        }

        public async Task<ItemStock> GetItemStockById(int id)
        {
            return await _context.ItemStocks
                .Include(q => q.Category)
                .FirstOrDefaultAsync(q => q.Id == id);
        }

        public async Task<ItemStock> AddItemStock(ItemStockDTO itemStock)
        {
            string error = "";
            error += string.IsNullOrEmpty(itemStock.Name) ? "error empty name " : "";
            error += itemStock.CategoryId == 0 ? "error empty category " : "";
            if (!string.IsNullOrEmpty(error))
            {
                throw new Exception(error);
            }
            ItemStock? existingItem = await _context.ItemStocks
                .FirstOrDefaultAsync(q => q.Name.ToLower().Equals(itemStock.Name.ToLower()) && q.Id != itemStock.Id);
            if (existingItem != null)
            {
                throw new Exception("Item already exists!");
            }

            Category category = await _context.Categories.FindAsync(itemStock.CategoryId);
            ItemStock itemToSave = new ItemStock()
            {
                Id = itemStock.Id,
                Name = itemStock.Name,
                CategoryId = itemStock.CategoryId,
                QuantityOnHand = itemStock.QuantityOnHand,
            };
            if (itemStock.Id == 0)
            {
                _context.ItemStocks.Add(itemToSave);
            }
            else
            {
                _context.ItemStocks.Update(itemToSave);
            }
            await _context.SaveChangesAsync();
            itemToSave.Category = category;
            return itemToSave;
        }

        public async Task<ItemStockHistoryDTO> UpdateItemStockSupply(AdjustItemStockDTO dto)
        {
            var itemStock = await _context.ItemStocks.FindAsync(dto.ItemStockId);

            if (itemStock == null)
            {
                throw new Exception("Item stock not found");
            }

            if (dto.Quantity == 0)
            {
                throw new Exception("Quantity is zero");
            }
            if (dto.StockType == StockType.StockIn)
            {
                itemStock.QuantityOnHand += dto.Quantity;
            }
            else if (dto.StockType == StockType.StockOut)
            {
                if (itemStock.QuantityOnHand < dto.Quantity)
                {
                    throw new Exception("Insufficient stock to subtract");
                }
                itemStock.QuantityOnHand -= dto.Quantity;
            }
            else
            {
                throw new Exception("Invalid adjustment type");
            }

            // Create stock history entry
            StockHistory stockHistory = new StockHistory
            {
                ItemStockId = itemStock.Id,
                UserId = dto.UserId,
                RefNo = dto.RefNo,
                Quantity = dto.Quantity,
                PreviousQuantity = dto.StockType == StockType.StockIn ? itemStock.QuantityOnHand - dto.Quantity : itemStock.QuantityOnHand + dto.Quantity,
                CurrentQuantity = itemStock.QuantityOnHand,
                StockType = dto.StockType,
                Date = CurrentDateTime
            };
            _context.StockHistories.Add(stockHistory);
            _context.ItemStocks.Update(itemStock);

            await _context.SaveChangesAsync();
            return new ItemStockHistoryDTO
            {
                Id = stockHistory.Id,
                ItemStockId = stockHistory.ItemStockId,
                UserId = stockHistory.UserId,
                ItemName = itemStock.Name,
                CategoryName = itemStock.Category?.Name ?? string.Empty,
                UserName = stockHistory.User?.FullName ?? string.Empty,
                RefNo = stockHistory.RefNo,
                Quantity = stockHistory.Quantity,
                PreviousQuantity = stockHistory.PreviousQuantity,
                CurrentQuantity = stockHistory.CurrentQuantity,
                StockType = stockHistory.StockType,
                Date = stockHistory.Date
            };
        }
        public async Task DeleteItemStock(int id)
        {
            var itemStock = await _context.ItemStocks.FindAsync(id);
            if (itemStock == null)
            {
                throw new Exception("Item stock not found");
            }
            _context.ItemStocks.Remove(itemStock);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ItemStockHistoryDTO>> GetItemStocksByTicket(string ticketNum)
        {
            var historyQuery = _context.StockHistories.AsQueryable();

            if (!string.IsNullOrEmpty(ticketNum))
            {
                historyQuery = historyQuery.Where(q => q.RefNo.Equals(ticketNum));
            }

            var histories = await historyQuery
                .Include(q=>q.ItemStock).ThenInclude(q=>q.Category)
                .Include(q => q.User)
                .ToListAsync();

          return histories.Select(q => new ItemStockHistoryDTO
          {
              Id = q.Id,
              ItemStockId = q.ItemStockId,
              ItemName = q.ItemName,
              CategoryName = q.ItemStock?.Category?.Name ?? string.Empty,
              UserId = q.UserId,
              UserName = q.UserName,
              RefNo = q.RefNo,
              Quantity = q.Quantity,
              PreviousQuantity = q.PreviousQuantity,
              CurrentQuantity = q.CurrentQuantity,
              StockType = q.StockType,
              Date = q.Date,
          }).ToList();

        }

        public async Task<List<ItemStockDTO>> SearchItemStocks(string search)
        {
            var historyQuery = _context.ItemStocks.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                historyQuery = historyQuery.Where(q => q.Name.ToLower().Contains(search));
            }

            var histories = await historyQuery
                .Include(q => q.Category)
                .Where(q=>q.QuantityOnHand > 0)
                .Take(10)
                .ToListAsync();

            return histories.Select(q => new ItemStockDTO
            {
                Id = q.Id,
                Name = q.Name,
                CategoryId = q.CategoryId,
                CategoryName = q.Category?.Name ?? string.Empty,
                QuantityOnHand = q.QuantityOnHand
            }).ToList();

        }
    }
}
