using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using BenefitNetFlex.Sample.Models;

namespace BenefitNetFlex.Sample.Controllers
{
    /// <summary>
    /// Controller demonstrating detail views and inline editing
    /// PATTERN: Master-detail views with tabs and inline editing
    /// </summary>
    public class SampleDetailController : BaseController
    {
        // SAMPLE: Display detailed view with tabs
        public ActionResult Details(int id)
        {
            ViewBag.Header = "Record Details";
            ViewBag.BreadCrumb = new[] { "Home", "Records", "Details" };

            // SAMPLE: Load comprehensive detail model
            var model = GetDetailModel(id);
            if (model == null)
            {
                return HttpNotFound();
            }

            // SAMPLE: Check user permissions for actions
            ViewBag.CanEdit = true; // In production, check actual permissions
            ViewBag.CanDelete = true;
            ViewBag.CanClone = true;

            return View(model);
        }

        // SAMPLE: Load tab content via AJAX
        [HttpGet]
        public ActionResult LoadTab(int id, string tabName)
        {
            // PATTERN: Lazy load tab content for performance
            switch (tabName.ToLower())
            {
                case "general":
                    var generalInfo = GetGeneralInfo(id);
                    return PartialView("Tabs/_GeneralTab", generalInfo);

                case "history":
                    var history = GetHistoryRecords(id);
                    return PartialView("Tabs/_HistoryTab", history);

                case "documents":
                    var documents = GetDocuments(id);
                    return PartialView("Tabs/_DocumentsTab", documents);

                case "notes":
                    var notes = GetNotes(id);
                    return PartialView("Tabs/_NotesTab", notes);

                case "related":
                    var related = GetRelatedRecords(id);
                    return PartialView("Tabs/_RelatedTab", related);

                default:
                    return HttpNotFound();
            }
        }

        // SAMPLE: Inline editing endpoint
        [HttpPost]
        public JsonResult UpdateField(int id, string fieldName, string value)
        {
            // PATTERN: Handle inline field updates
            try
            {
                // Validate field and value
                if (!IsValidField(fieldName))
                {
                    return JsonResponse(null, false, "Invalid field name");
                }

                // SAMPLE: Apply business rules
                var validationResult = ValidateFieldValue(fieldName, value);
                if (!validationResult.IsValid)
                {
                    return JsonResponse(null, false, validationResult.Message);
                }

                // SAMPLE: Update in database
                UpdateFieldInDatabase(id, fieldName, value);

                // Return formatted value if needed
                var formattedValue = FormatFieldValue(fieldName, value);

                return JsonResponse(new
                {
                    fieldName = fieldName,
                    value = value,
                    formattedValue = formattedValue
                }, true, "Field updated successfully");
            }
            catch (Exception ex)
            {
                return JsonResponse(null, false, "Error updating field");
            }
        }

        // SAMPLE: Add note to record
        [HttpPost]
        public JsonResult AddNote(int id, string note, string category)
        {
            // PATTERN: Add timestamped notes/comments
            if (string.IsNullOrWhiteSpace(note))
            {
                return JsonResponse(null, false, "Note cannot be empty");
            }

            var newNote = new NoteItem
            {
                Id = new Random().Next(1000, 9999),
                RecordId = id,
                Text = note,
                Category = category,
                CreatedBy = "Current User", // In production, get from auth
                CreatedDate = DateTime.Now
            };

            // SAMPLE: Save to database
            // SaveNote(newNote);

            return JsonResponse(newNote, true, "Note added successfully");
        }

        // SAMPLE: Upload document for record
        [HttpPost]
        public ActionResult UploadDocument(int id)
        {
            // PATTERN: Handle document uploads tied to records
            if (Request.Files.Count > 0)
            {
                var file = Request.Files[0];

                // Validate and save file
                var document = new DocumentItem
                {
                    Id = new Random().Next(1000, 9999),
                    RecordId = id,
                    FileName = file.FileName,
                    FileSize = file.ContentLength,
                    UploadedBy = "Current User",
                    UploadedDate = DateTime.Now
                };

                // SAMPLE: Save file and metadata
                // SaveDocument(document, file);

                return Json(new { success = true, document = document });
            }

            return Json(new { success = false, message = "No file uploaded" });
        }

        // SAMPLE: Delete document
        [HttpPost]
        public JsonResult DeleteDocument(int id, int documentId)
        {
            // PATTERN: Soft delete with audit trail
            try
            {
                // SAMPLE: Mark as deleted in database
                // MarkDocumentDeleted(documentId);

                return JsonResponse(null, true, "Document deleted successfully");
            }
            catch (Exception ex)
            {
                return JsonResponse(null, false, "Error deleting document");
            }
        }

        // SAMPLE: Timeline view
        public ActionResult Timeline(int id)
        {
            ViewBag.Header = "Activity Timeline";
            ViewBag.BreadCrumb = new[] { "Home", "Records", "Timeline" };

            var activities = GetTimelineActivities(id);
            ViewBag.RecordId = id;

            return View(activities);
        }

        // SAMPLE: Version history
        public ActionResult VersionHistory(int id)
        {
            ViewBag.Header = "Version History";
            ViewBag.BreadCrumb = new[] { "Home", "Records", "History" };

            var versions = GetVersionHistory(id);
            ViewBag.RecordId = id;

            return View(versions);
        }

        // SAMPLE: Compare versions
        [HttpGet]
        public ActionResult CompareVersions(int id, int version1, int version2)
        {
            // PATTERN: Show differences between versions
            var comparison = new VersionComparison
            {
                RecordId = id,
                Version1 = GetVersion(id, version1),
                Version2 = GetVersion(id, version2),
                Differences = CalculateDifferences(version1, version2)
            };

            return PartialView("_VersionComparison", comparison);
        }

        // SAMPLE: Print-friendly view
        public ActionResult Print(int id)
        {
            var model = GetDetailModel(id);
            if (model == null)
            {
                return HttpNotFound();
            }

            // Use print layout
            return View("PrintView", model);
        }

        // SAMPLE: Export to PDF
        public ActionResult ExportPdf(int id)
        {
            // PATTERN: Generate PDF from detail view
            var model = GetDetailModel(id);

            // In production, use a PDF library like iTextSharp or Rotativa
            // var pdf = GeneratePdf(model);

            // For demo, return JSON success
            return Json(new { success = true, message = "PDF generated successfully" });
        }

        // SAMPLE: Clone record
        [HttpPost]
        public ActionResult Clone(int id)
        {
            // PATTERN: Duplicate record with new ID
            try
            {
                var original = GetDetailModel(id);
                if (original == null)
                {
                    return Json(new { success = false, message = "Record not found" });
                }

                // Create copy with new ID
                var newId = CreateClone(original);

                return Json(new
                {
                    success = true,
                    newId = newId,
                    message = "Record cloned successfully"
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error cloning record" });
            }
        }

        #region Helper Methods

        private DetailViewModel GetDetailModel(int id)
        {
            // SAMPLE: Build comprehensive detail model
            return new DetailViewModel
            {
                Id = id,
                Name = $"Sample Record {id}",
                Description = "Detailed description of the record",
                Status = "Active",
                Category = "Healthcare",
                CreatedDate = DateTime.Now.AddDays(-30),
                ModifiedDate = DateTime.Now.AddDays(-1),
                CreatedBy = "John Doe",
                ModifiedBy = "Jane Smith",

                // Additional details
                Tags = new List<string> { "Important", "Reviewed", "Q1-2024" },
                Attributes = new Dictionary<string, string>
                {
                    { "Priority", "High" },
                    { "Region", "North America" },
                    { "Type", "Standard" }
                },

                // Related counts for badges
                DocumentCount = 5,
                NoteCount = 12,
                HistoryCount = 25,
                RelatedCount = 3
            };
        }

        private object GetGeneralInfo(int id)
        {
            return new
            {
                Id = id,
                BasicInfo = "General information about the record",
                Statistics = new { Views = 150, Updates = 12, Shares = 5 }
            };
        }

        private List<HistoryItem> GetHistoryRecords(int id)
        {
            return new List<HistoryItem>
            {
                new HistoryItem { Date = DateTime.Now.AddDays(-1), Action = "Updated", User = "Jane Smith", Details = "Changed status to Active" },
                new HistoryItem { Date = DateTime.Now.AddDays(-5), Action = "Created", User = "John Doe", Details = "Initial creation" }
            };
        }

        private List<DocumentItem> GetDocuments(int id)
        {
            return new List<DocumentItem>
            {
                new DocumentItem { Id = 1, FileName = "Contract.pdf", FileSize = 1024000, UploadedDate = DateTime.Now.AddDays(-10) },
                new DocumentItem { Id = 2, FileName = "Invoice.xlsx", FileSize = 512000, UploadedDate = DateTime.Now.AddDays(-5) }
            };
        }

        private List<NoteItem> GetNotes(int id)
        {
            return new List<NoteItem>
            {
                new NoteItem { Id = 1, Text = "Important note about this record", CreatedBy = "Admin", CreatedDate = DateTime.Now.AddHours(-2) },
                new NoteItem { Id = 2, Text = "Follow up required next week", CreatedBy = "Manager", CreatedDate = DateTime.Now.AddDays(-1) }
            };
        }

        private List<object> GetRelatedRecords(int id)
        {
            return new List<object>
            {
                new { Id = 101, Name = "Related Record 1", Type = "Child", Status = "Active" },
                new { Id = 102, Name = "Related Record 2", Type = "Reference", Status = "Pending" }
            };
        }

        private List<TimelineActivity> GetTimelineActivities(int id)
        {
            return new List<TimelineActivity>
            {
                new TimelineActivity
                {
                    Date = DateTime.Now.AddDays(-1),
                    Type = "update",
                    Title = "Record Updated",
                    Description = "Status changed from Pending to Active",
                    User = "Jane Smith",
                    Icon = "fa-edit"
                },
                new TimelineActivity
                {
                    Date = DateTime.Now.AddDays(-7),
                    Type = "create",
                    Title = "Record Created",
                    Description = "Initial record creation",
                    User = "John Doe",
                    Icon = "fa-plus"
                }
            };
        }

        private List<VersionInfo> GetVersionHistory(int id)
        {
            return new List<VersionInfo>
            {
                new VersionInfo { Version = 3, Date = DateTime.Now.AddDays(-1), User = "Jane Smith", Changes = "Updated description and status" },
                new VersionInfo { Version = 2, Date = DateTime.Now.AddDays(-5), User = "Bob Johnson", Changes = "Added documents" },
                new VersionInfo { Version = 1, Date = DateTime.Now.AddDays(-30), User = "John Doe", Changes = "Initial version" }
            };
        }

        private VersionInfo GetVersion(int id, int version)
        {
            return new VersionInfo
            {
                Version = version,
                Date = DateTime.Now.AddDays(-version * 5),
                Data = new { /* Version-specific data */ }
            };
        }

        private List<FieldDifference> CalculateDifferences(int v1, int v2)
        {
            return new List<FieldDifference>
            {
                new FieldDifference { Field = "Status", OldValue = "Pending", NewValue = "Active" },
                new FieldDifference { Field = "Priority", OldValue = "Medium", NewValue = "High" }
            };
        }

        private bool IsValidField(string fieldName)
        {
            var validFields = new[] { "name", "description", "status", "category", "priority" };
            return validFields.Contains(fieldName.ToLower());
        }

        private ValidationResult ValidateFieldValue(string fieldName, string value)
        {
            // SAMPLE: Field-specific validation
            if (fieldName.ToLower() == "email" && !value.Contains("@"))
            {
                return new ValidationResult { IsValid = false, Message = "Invalid email format" };
            }

            return new ValidationResult { IsValid = true };
        }

        private void UpdateFieldInDatabase(int id, string fieldName, string value)
        {
            // SAMPLE: Update specific field in database
        }

        private string FormatFieldValue(string fieldName, string value)
        {
            // SAMPLE: Format value for display
            if (fieldName.ToLower() == "amount")
            {
                if (decimal.TryParse(value, out decimal amount))
                {
                    return amount.ToString("C");
                }
            }
            return value;
        }

        private int CreateClone(DetailViewModel original)
        {
            // SAMPLE: Create duplicate with new ID
            return new Random().Next(1000, 9999);
        }

        #endregion

        #region Inner Classes

        public class ValidationResult
        {
            public bool IsValid { get; set; }
            public string Message { get; set; }
        }

        #endregion
    }
}