using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using BenefitNetFlex.Sample.Models;

namespace BenefitNetFlex.Sample.Controllers
{
    /// <summary>
    /// Controller demonstrating form handling with validation
    /// PATTERN: Form submission with client and server-side validation
    /// </summary>
    public class SampleFormController : BaseController
    {
        // SAMPLE: Display form for creating new record
        public ActionResult Create()
        {
            ViewBag.Header = "Create New Record";
            ViewBag.BreadCrumb = new[] { "Home", "Forms", "Create" };

            var model = new SampleFormViewModel
            {
                // Set defaults
                StartDate = DateTime.Today,
                Status = "Active",
                Priority = "Medium"
            };

            // Load dropdown data
            ViewBag.Categories = GetCategories();
            ViewBag.Priorities = GetPriorities();
            ViewBag.Countries = GetCountries();

            return View(model);
        }

        // SAMPLE: Handle form submission with validation
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(SampleFormViewModel model)
        {
            // PATTERN: Server-side validation
            if (ModelState.IsValid)
            {
                // Additional business validation
                if (model.EndDate.HasValue && model.EndDate < model.StartDate)
                {
                    ModelState.AddModelError("EndDate", "End date must be after start date");
                }

                if (model.Amount < 0)
                {
                    ModelState.AddModelError("Amount", "Amount cannot be negative");
                }

                // Check for duplicate
                if (IsDuplicateName(model.Name))
                {
                    ModelState.AddModelError("Name", "A record with this name already exists");
                }
            }

            if (ModelState.IsValid)
            {
                try
                {
                    // SAMPLE: Save to database
                    // In production, save to your data store
                    var id = SaveRecord(model);

                    SetAlert("Record created successfully!", "success");
                    return RedirectToAction("Details", new { id = id });
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", "An error occurred while saving. Please try again.");
                    // Log exception in production
                }
            }

            // If we got this far, something failed, redisplay form
            ViewBag.Header = "Create New Record";
            ViewBag.Categories = GetCategories();
            ViewBag.Priorities = GetPriorities();
            ViewBag.Countries = GetCountries();

            return View(model);
        }

        // SAMPLE: Edit existing record
        public ActionResult Edit(int id)
        {
            ViewBag.Header = "Edit Record";
            ViewBag.BreadCrumb = new[] { "Home", "Forms", "Edit" };

            // SAMPLE: Load existing data
            var model = GetRecordById(id);
            if (model == null)
            {
                return HttpNotFound();
            }

            ViewBag.Categories = GetCategories();
            ViewBag.Priorities = GetPriorities();
            ViewBag.Countries = GetCountries();

            return View(model);
        }

        // SAMPLE: Handle edit form submission
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(int id, SampleFormViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // SAMPLE: Update record
                    UpdateRecord(id, model);

                    SetAlert("Record updated successfully!", "success");
                    return RedirectToAction("Details", new { id = id });
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", "An error occurred while updating. Please try again.");
                }
            }

            ViewBag.Header = "Edit Record";
            ViewBag.Categories = GetCategories();
            ViewBag.Priorities = GetPriorities();
            ViewBag.Countries = GetCountries();

            return View(model);
        }

        // SAMPLE: Multi-step wizard form
        public ActionResult Wizard(int step = 1)
        {
            ViewBag.Header = "Multi-Step Form Wizard";
            ViewBag.CurrentStep = step;
            ViewBag.TotalSteps = 4;

            var model = GetWizardModel(step);
            return View($"Wizard/Step{step}", model);
        }

        // SAMPLE: Handle wizard step submission
        [HttpPost]
        public ActionResult WizardStep(int step, FormCollection form)
        {
            // PATTERN: Validate current step
            if (ValidateWizardStep(step, form))
            {
                // Save step data to session or temp storage
                SaveWizardStepData(step, form);

                if (step < 4)
                {
                    // Go to next step
                    return RedirectToAction("Wizard", new { step = step + 1 });
                }
                else
                {
                    // Final step - process complete form
                    ProcessWizardData();
                    SetAlert("Wizard completed successfully!", "success");
                    return RedirectToAction("Index", "Home");
                }
            }

            // Validation failed, redisplay current step
            ViewBag.CurrentStep = step;
            ViewBag.TotalSteps = 4;
            var model = GetWizardModel(step);
            return View($"Wizard/Step{step}", model);
        }

        // SAMPLE: AJAX validation for unique field
        [HttpPost]
        public JsonResult CheckNameAvailability(string name, int? id)
        {
            // PATTERN: Remote validation for unique constraints
            bool isAvailable = !IsDuplicateName(name, id);

            return Json(new
            {
                available = isAvailable,
                message = isAvailable ? "Name is available" : "This name is already taken"
            });
        }

        // SAMPLE: Dynamic field loading via AJAX
        [HttpGet]
        public JsonResult GetSubcategories(string category)
        {
            // PATTERN: Cascading dropdown data
            var subcategories = GetSubcategoriesForCategory(category);
            return Json(subcategories, JsonRequestBehavior.AllowGet);
        }

        // SAMPLE: File upload handling
        [HttpPost]
        public ActionResult UploadAttachment()
        {
            // PATTERN: Handle file uploads with validation
            if (Request.Files.Count > 0)
            {
                var file = Request.Files[0];

                // Validate file
                if (file.ContentLength > 10485760) // 10MB
                {
                    return Json(new { success = false, message = "File size cannot exceed 10MB" });
                }

                var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xlsx", ".png", ".jpg" };
                var extension = System.IO.Path.GetExtension(file.FileName).ToLower();

                if (!allowedExtensions.Contains(extension))
                {
                    return Json(new { success = false, message = "Invalid file type" });
                }

                // SAMPLE: Save file and return reference
                var fileName = Guid.NewGuid() + extension;
                // In production, save to proper storage

                return Json(new
                {
                    success = true,
                    fileName = fileName,
                    originalName = file.FileName,
                    size = file.ContentLength
                });
            }

            return Json(new { success = false, message = "No file uploaded" });
        }

        #region Helper Methods

        private SelectList GetCategories()
        {
            var items = new List<SelectListItem>
            {
                new SelectListItem { Value = "", Text = "-- Select Category --" },
                new SelectListItem { Value = "Healthcare", Text = "Healthcare" },
                new SelectListItem { Value = "Dental", Text = "Dental" },
                new SelectListItem { Value = "Vision", Text = "Vision" },
                new SelectListItem { Value = "Life", Text = "Life Insurance" },
                new SelectListItem { Value = "Disability", Text = "Disability" }
            };
            return new SelectList(items, "Value", "Text");
        }

        private SelectList GetPriorities()
        {
            var items = new List<SelectListItem>
            {
                new SelectListItem { Value = "Low", Text = "Low" },
                new SelectListItem { Value = "Medium", Text = "Medium" },
                new SelectListItem { Value = "High", Text = "High" },
                new SelectListItem { Value = "Critical", Text = "Critical" }
            };
            return new SelectList(items, "Value", "Text");
        }

        private SelectList GetCountries()
        {
            var items = new List<SelectListItem>
            {
                new SelectListItem { Value = "US", Text = "United States" },
                new SelectListItem { Value = "CA", Text = "Canada" },
                new SelectListItem { Value = "GB", Text = "United Kingdom" },
                new SelectListItem { Value = "AU", Text = "Australia" }
            };
            return new SelectList(items, "Value", "Text");
        }

        private bool IsDuplicateName(string name, int? excludeId = null)
        {
            // SAMPLE: Check for duplicate in database
            // In production, check against your data store
            return false;
        }

        private int SaveRecord(SampleFormViewModel model)
        {
            // SAMPLE: Save to database and return ID
            return new Random().Next(1000, 9999);
        }

        private SampleFormViewModel GetRecordById(int id)
        {
            // SAMPLE: Load from database
            return new SampleFormViewModel
            {
                Id = id,
                Name = $"Sample Record {id}",
                Description = "This is a sample description",
                Category = "Healthcare",
                Status = "Active",
                Priority = "Medium",
                Amount = 1000.00m,
                StartDate = DateTime.Today.AddDays(-30),
                EndDate = DateTime.Today.AddDays(30)
            };
        }

        private void UpdateRecord(int id, SampleFormViewModel model)
        {
            // SAMPLE: Update in database
        }

        private object GetWizardModel(int step)
        {
            // SAMPLE: Return appropriate model for wizard step
            return new { Step = step };
        }

        private bool ValidateWizardStep(int step, FormCollection form)
        {
            // SAMPLE: Validate wizard step data
            return true;
        }

        private void SaveWizardStepData(int step, FormCollection form)
        {
            // SAMPLE: Save to session or temp storage
        }

        private void ProcessWizardData()
        {
            // SAMPLE: Process complete wizard data
        }

        private List<SelectListItem> GetSubcategoriesForCategory(string category)
        {
            // SAMPLE: Return subcategories based on category
            var subcategories = new List<SelectListItem>
            {
                new SelectListItem { Value = "1", Text = $"{category} - Option 1" },
                new SelectListItem { Value = "2", Text = $"{category} - Option 2" },
                new SelectListItem { Value = "3", Text = $"{category} - Option 3" }
            };
            return subcategories;
        }

        #endregion
    }
}