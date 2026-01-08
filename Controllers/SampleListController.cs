using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using BenefitNetFlex.Sample.Models;

namespace BenefitNetFlex.Sample.Controllers
{
    /// <summary>
    /// Controller demonstrating list views with Kendo Grid
    /// PATTERN: Data table with filtering, sorting, and pagination
    /// </summary>
    public class SampleListController : BaseController
    {
        private static List<SampleEntity> _mockData = GenerateMockData();

        // SAMPLE: Main list view with Kendo Grid
        public ActionResult Index()
        {
            ViewBag.Header = "Sample List";
            ViewBag.BreadCrumb = new[] { "Home", "Samples", "List" };

            // SAMPLE: Pass configuration to view
            var model = new ListViewModel
            {
                Title = "Sample Data List",
                CanAdd = true,
                CanEdit = true,
                CanDelete = true,
                PageSize = 20
            };

            return View(model);
        }

        // SAMPLE: Kendo Grid data source endpoint
        [HttpPost]
        public JsonResult GetGridData(GridRequest request)
        {
            // PATTERN: Server-side paging, sorting, filtering for Kendo Grid
            var query = _mockData.AsQueryable();

            // Apply filtering
            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                query = query.Where(x =>
                    x.Name.Contains(request.SearchTerm) ||
                    x.Description.Contains(request.SearchTerm) ||
                    x.Category.Contains(request.SearchTerm));
            }

            // Apply category filter
            if (!string.IsNullOrEmpty(request.Category))
            {
                query = query.Where(x => x.Category == request.Category);
            }

            // Apply status filter
            if (!string.IsNullOrEmpty(request.Status))
            {
                query = query.Where(x => x.Status == request.Status);
            }

            // Get total count before paging
            var total = query.Count();

            // Apply sorting
            if (!string.IsNullOrEmpty(request.SortField))
            {
                switch (request.SortField.ToLower())
                {
                    case "name":
                        query = request.SortDirection == "desc" ?
                            query.OrderByDescending(x => x.Name) :
                            query.OrderBy(x => x.Name);
                        break;
                    case "date":
                        query = request.SortDirection == "desc" ?
                            query.OrderByDescending(x => x.CreatedDate) :
                            query.OrderBy(x => x.CreatedDate);
                        break;
                    case "amount":
                        query = request.SortDirection == "desc" ?
                            query.OrderByDescending(x => x.Amount) :
                            query.OrderBy(x => x.Amount);
                        break;
                    default:
                        query = query.OrderBy(x => x.Id);
                        break;
                }
            }
            else
            {
                query = query.OrderBy(x => x.Id);
            }

            // Apply paging
            var pageSize = request.PageSize ?? 20;
            var page = request.Page ?? 1;
            var data = query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            // PATTERN: Return format expected by Kendo Grid
            return Json(new
            {
                Data = data,
                Total = total,
                AggregateResults = new
                {
                    TotalAmount = _mockData.Sum(x => x.Amount),
                    AverageAmount = _mockData.Average(x => x.Amount)
                }
            });
        }

        // SAMPLE: Export to Excel endpoint
        [HttpPost]
        public ActionResult ExportToExcel(string searchTerm, string category, string status)
        {
            // PATTERN: Export filtered data to Excel
            var query = _mockData.AsQueryable();

            // Apply same filters as grid
            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(x =>
                    x.Name.Contains(searchTerm) ||
                    x.Description.Contains(searchTerm));
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(x => x.Category == category);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(x => x.Status == status);
            }

            // SAMPLE: In production, use EPPlus or similar to generate Excel
            var data = query.ToList();

            // For demo, return JSON
            return Json(new { success = true, message = $"Exported {data.Count} records" });
        }

        // SAMPLE: Bulk action endpoint
        [HttpPost]
        public JsonResult BulkAction(string action, int[] selectedIds)
        {
            // PATTERN: Handle bulk operations on selected items
            if (selectedIds == null || selectedIds.Length == 0)
            {
                return JsonResponse(null, false, "No items selected");
            }

            switch (action.ToLower())
            {
                case "delete":
                    // SAMPLE: Remove selected items
                    _mockData.RemoveAll(x => selectedIds.Contains(x.Id));
                    return JsonResponse(null, true, $"Deleted {selectedIds.Length} items");

                case "activate":
                    // SAMPLE: Update status of selected items
                    foreach (var item in _mockData.Where(x => selectedIds.Contains(x.Id)))
                    {
                        item.Status = "Active";
                    }
                    return JsonResponse(null, true, $"Activated {selectedIds.Length} items");

                case "deactivate":
                    foreach (var item in _mockData.Where(x => selectedIds.Contains(x.Id)))
                    {
                        item.Status = "Inactive";
                    }
                    return JsonResponse(null, true, $"Deactivated {selectedIds.Length} items");

                default:
                    return JsonResponse(null, false, "Invalid action");
            }
        }

        // SAMPLE: Get filter options for dropdowns
        [HttpGet]
        public JsonResult GetFilterOptions()
        {
            var categories = _mockData.Select(x => x.Category).Distinct().OrderBy(x => x);
            var statuses = _mockData.Select(x => x.Status).Distinct().OrderBy(x => x);

            return JsonResponse(new
            {
                Categories = categories,
                Statuses = statuses
            });
        }

        // SAMPLE: Quick view partial for modal
        public ActionResult QuickView(int id)
        {
            var item = _mockData.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                return HttpNotFound();
            }

            return PartialView("_QuickView", item);
        }

        #region Helper Methods

        private static List<SampleEntity> GenerateMockData()
        {
            var random = new Random();
            var categories = new[] { "Healthcare", "Dental", "Vision", "Life", "Disability" };
            var statuses = new[] { "Active", "Inactive", "Pending", "Expired" };
            var data = new List<SampleEntity>();

            for (int i = 1; i <= 150; i++)
            {
                data.Add(new SampleEntity
                {
                    Id = i,
                    Name = $"Sample Item {i}",
                    Description = $"This is a description for sample item {i}",
                    Category = categories[random.Next(categories.Length)],
                    Status = statuses[random.Next(statuses.Length)],
                    Amount = Math.Round(random.NextDouble() * 10000, 2),
                    CreatedDate = DateTime.Now.AddDays(-random.Next(1, 365)),
                    ModifiedDate = DateTime.Now.AddDays(-random.Next(0, 30)),
                    Owner = $"User {random.Next(1, 10)}"
                });
            }

            return data;
        }

        #endregion
    }

    // SAMPLE: Request model for grid operations
    public class GridRequest
    {
        public int? Page { get; set; }
        public int? PageSize { get; set; }
        public string SortField { get; set; }
        public string SortDirection { get; set; }
        public string SearchTerm { get; set; }
        public string Category { get; set; }
        public string Status { get; set; }
    }
}