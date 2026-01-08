using System;
using System.Collections.Generic;

namespace BenefitNetFlex.Sample.Models
{
    /// <summary>
    /// View model for list pages with grid
    /// PATTERN: Configuration model for Kendo Grid views
    /// </summary>
    public class ListViewModel
    {
        public string Title { get; set; }
        public bool CanAdd { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool CanExport { get; set; }
        public int PageSize { get; set; }
        public string DefaultSortField { get; set; }
        public string DefaultSortDirection { get; set; }

        public ListViewModel()
        {
            PageSize = 20;
            CanExport = true;
            DefaultSortField = "Id";
            DefaultSortDirection = "asc";
        }
    }

    /// <summary>
    /// Sample entity for demonstrating list operations
    /// PATTERN: Basic entity model with common properties
    /// </summary>
    public class SampleEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string Status { get; set; }
        public double Amount { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string Owner { get; set; }
        public bool IsActive => Status == "Active";

        // Additional properties for demonstration
        public string Code => $"SMPL-{Id:D5}";
        public string DisplayName => $"{Name} ({Category})";
    }
}