using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using BenefitNetFlex.Sample.Models;

namespace BenefitNetFlex.Sample.Controllers
{
    /// <summary>
    /// Dashboard controller demonstrating cards, charts, and summary layouts
    /// PATTERN: Dashboard with multiple widgets and data visualization
    /// </summary>
    public class DashboardController : BaseController
    {
        // SAMPLE: Main dashboard view with cards and charts
        public ActionResult Index()
        {
            // Redirect to Home controller which handles the dashboard
            return RedirectToAction("Index", "Home");
        }

        // SAMPLE: Get dashboard statistics via AJAX
        [HttpGet]
        public JsonResult GetStatistics()
        {
            // PATTERN: Return JSON data for AJAX requests
            var stats = new
            {
                TotalMembers = 1234,
                ActivePolicies = 856,
                PendingClaims = 45,
                Revenue = 125000.50,
                Growth = 12.5
            };

            return JsonResponse(stats);
        }

        // SAMPLE: Get chart data for visualization
        [HttpGet]
        public JsonResult GetChartData(string chartType = "monthly")
        {
            // PATTERN: Return chart data in format expected by charting library
            var data = new
            {
                labels = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun" },
                datasets = new[]
                {
                    new
                    {
                        label = "Revenue",
                        data = new[] { 12000, 15000, 13000, 17000, 19000, 21000 },
                        backgroundColor = "rgba(26,179,148,0.5)"
                    },
                    new
                    {
                        label = "Expenses",
                        data = new[] { 8000, 9500, 8800, 11000, 10500, 12000 },
                        backgroundColor = "rgba(220,53,69,0.5)"
                    }
                }
            };

            return JsonResponse(data);
        }

        // SAMPLE: Get recent activity feed
        [HttpGet]
        public JsonResult GetRecentActivity()
        {
            var activities = new[]
            {
                new { Type = "info", Message = "New member registered: John Doe", Time = "2 min ago" },
                new { Type = "success", Message = "Claim #1234 approved", Time = "15 min ago" },
                new { Type = "warning", Message = "Policy expiring soon for Jane Smith", Time = "1 hour ago" },
                new { Type = "info", Message = "Monthly report generated", Time = "2 hours ago" }
            };

            return JsonResponse(activities);
        }

        // SAMPLE: Refresh dashboard widget
        [HttpPost]
        public ActionResult RefreshWidget(string widgetId)
        {
            // PATTERN: Return partial view for widget refresh
            ViewBag.WidgetId = widgetId;

            // SAMPLE: Load widget-specific data based on widgetId
            switch (widgetId)
            {
                case "stats":
                    return PartialView("_StatsWidget", GetStatsData());
                case "chart":
                    return PartialView("_ChartWidget", GetChartConfig());
                case "activity":
                    return PartialView("_ActivityWidget", GetActivityData());
                default:
                    return PartialView("_DefaultWidget");
            }
        }

        #region Helper Methods

        private DashboardViewModel GetDashboardData()
        {
            // SAMPLE: Replace with actual data retrieval logic
            return new DashboardViewModel
            {
                TotalMembers = 1234,
                ActivePolicies = 856,
                PendingClaims = 45,
                MonthlyRevenue = 125000.50m,
                YearlyGrowth = 12.5m,
                RecentActivities = GetActivityData(),
                TopProducts = GetTopProducts(),
                Notifications = GetNotifications()
            };
        }

        private List<ActivityItem> GetActivityData()
        {
            return new List<ActivityItem>
            {
                new ActivityItem { Type = "info", Message = "System backup completed", Timestamp = DateTime.Now.AddMinutes(-5) },
                new ActivityItem { Type = "success", Message = "New enrollment processed", Timestamp = DateTime.Now.AddHours(-1) },
                new ActivityItem { Type = "warning", Message = "High claim volume detected", Timestamp = DateTime.Now.AddHours(-3) }
            };
        }

        private List<ProductSummary> GetTopProducts()
        {
            return new List<ProductSummary>
            {
                new ProductSummary { Name = "Basic Health Plan", Count = 450, Revenue = 45000 },
                new ProductSummary { Name = "Premium Health Plan", Count = 280, Revenue = 56000 },
                new ProductSummary { Name = "Dental Coverage", Count = 126, Revenue = 12600 }
            };
        }

        private List<NotificationItem> GetNotifications()
        {
            return new List<NotificationItem>
            {
                new NotificationItem { Level = "info", Title = "System Update", Message = "Scheduled maintenance tonight at 10 PM" },
                new NotificationItem { Level = "warning", Title = "Action Required", Message = "5 policies require review" }
            };
        }

        private object GetStatsData()
        {
            return new { Value = new Random().Next(1000, 9999) };
        }

        private object GetChartConfig()
        {
            return new { ChartType = "line", DataPoints = 6 };
        }

        #endregion
    }
}