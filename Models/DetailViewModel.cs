using System;
using System.Collections.Generic;

namespace BenefitNetFlex.Sample.Models
{
    /// <summary>
    /// Comprehensive detail view model
    /// PATTERN: Master view model with all related data
    /// </summary>
    public class DetailViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public string Category { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string CreatedBy { get; set; }
        public string ModifiedBy { get; set; }

        // Additional properties
        public List<string> Tags { get; set; }
        public Dictionary<string, string> Attributes { get; set; }

        // Related data counts
        public int DocumentCount { get; set; }
        public int NoteCount { get; set; }
        public int HistoryCount { get; set; }
        public int RelatedCount { get; set; }

        public DetailViewModel()
        {
            Tags = new List<string>();
            Attributes = new Dictionary<string, string>();
        }
    }

    /// <summary>
    /// History record item
    /// </summary>
    public class HistoryItem
    {
        public DateTime Date { get; set; }
        public string Action { get; set; }
        public string User { get; set; }
        public string Details { get; set; }
        public string Icon { get; set; }
    }

    /// <summary>
    /// Document attachment item
    /// </summary>
    public class DocumentItem
    {
        public int Id { get; set; }
        public int RecordId { get; set; }
        public string FileName { get; set; }
        public long FileSize { get; set; }
        public string FileType { get; set; }
        public DateTime UploadedDate { get; set; }
        public string UploadedBy { get; set; }
        public string DocumentCategory { get; set; }
        public bool IsDeleted { get; set; }

        public string FileSizeFormatted
        {
            get
            {
                if (FileSize < 1024)
                    return $"{FileSize} B";
                if (FileSize < 1024 * 1024)
                    return $"{FileSize / 1024.0:F1} KB";
                return $"{FileSize / (1024.0 * 1024.0):F1} MB";
            }
        }
    }

    /// <summary>
    /// Note/Comment item
    /// </summary>
    public class NoteItem
    {
        public int Id { get; set; }
        public int RecordId { get; set; }
        public string Text { get; set; }
        public string Category { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsPrivate { get; set; }
        public bool IsPinned { get; set; }
    }

    /// <summary>
    /// Timeline activity item
    /// </summary>
    public class TimelineActivity
    {
        public DateTime Date { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string User { get; set; }
        public string Icon { get; set; }
        public Dictionary<string, object> Metadata { get; set; }

        public TimelineActivity()
        {
            Metadata = new Dictionary<string, object>();
        }
    }

    /// <summary>
    /// Version information
    /// </summary>
    public class VersionInfo
    {
        public int Version { get; set; }
        public DateTime Date { get; set; }
        public string User { get; set; }
        public string Changes { get; set; }
        public object Data { get; set; }
    }

    /// <summary>
    /// Version comparison model
    /// </summary>
    public class VersionComparison
    {
        public int RecordId { get; set; }
        public VersionInfo Version1 { get; set; }
        public VersionInfo Version2 { get; set; }
        public List<FieldDifference> Differences { get; set; }

        public VersionComparison()
        {
            Differences = new List<FieldDifference>();
        }
    }

    /// <summary>
    /// Field difference between versions
    /// </summary>
    public class FieldDifference
    {
        public string Field { get; set; }
        public string OldValue { get; set; }
        public string NewValue { get; set; }
        public string ChangeType { get; set; } // Added, Modified, Deleted
    }
}