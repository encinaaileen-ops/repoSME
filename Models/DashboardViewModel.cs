using System;
using System.Collections.Generic;

namespace BenefitNetFlex.Sample.Models
{
    /// <summary>
    /// View model for the main dashboard
    /// PATTERN: Composite view model containing multiple data sections
    /// </summary>
    public class DashboardViewModel
    {
        public int TotalMembers { get; set; }
        public int ActivePolicies { get; set; }
        public int PendingClaims { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public decimal YearlyGrowth { get; set; }

        public List<ActivityItem> RecentActivities { get; set; }
        public List<ProductSummary> TopProducts { get; set; }
        public List<NotificationItem> Notifications { get; set; }

        public DashboardViewModel()
        {
            RecentActivities = new List<ActivityItem>();
            TopProducts = new List<ProductSummary>();
            Notifications = new List<NotificationItem>();
        }
    }

    public class ActivityItem
    {
        public string Type { get; set; } // info, success, warning, error
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
        public string Icon { get; set; }
    }

    public class ProductSummary
    {
        public string Name { get; set; }
        public int Count { get; set; }
        public decimal Revenue { get; set; }
        public decimal GrowthPercentage { get; set; }
    }

    public class NotificationItem
    {
        public string Level { get; set; } // info, warning, error, success
        public string Title { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
    }
}