using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Web.Mvc;

namespace BenefitNetFlex.Sample.Models
{
    /// <summary>
    /// View model demonstrating various form validation patterns
    /// PATTERN: Data annotations for client and server-side validation
    /// </summary>
    public class SampleFormViewModel
    {
        public int? Id { get; set; }

        // PATTERN: Required field with custom error message
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        [Display(Name = "Full Name")]
        public string Name { get; set; }

        // PATTERN: Email validation
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        [Display(Name = "Email Address")]
        public string Email { get; set; }

        // PATTERN: Phone validation with regex
        [Display(Name = "Phone Number")]
        [RegularExpression(@"^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$",
            ErrorMessage = "Invalid phone number format")]
        public string Phone { get; set; }

        // PATTERN: Text area with length validation
        [Display(Name = "Description")]
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        [DataType(DataType.MultilineText)]
        public string Description { get; set; }

        // PATTERN: Dropdown selection
        [Required(ErrorMessage = "Please select a category")]
        [Display(Name = "Category")]
        public string Category { get; set; }

        // PATTERN: Status dropdown
        [Display(Name = "Status")]
        public string Status { get; set; }

        // PATTERN: Priority selection
        [Display(Name = "Priority Level")]
        public string Priority { get; set; }

        // PATTERN: Numeric validation with range
        [Display(Name = "Amount")]
        [Range(0, 1000000, ErrorMessage = "Amount must be between 0 and 1,000,000")]
        [DisplayFormat(DataFormatString = "{0:C}")]
        public decimal Amount { get; set; }

        // PATTERN: Percentage validation
        [Display(Name = "Discount (%)")]
        [Range(0, 100, ErrorMessage = "Discount must be between 0 and 100")]
        public double? DiscountPercentage { get; set; }

        // PATTERN: Date validation
        [Required(ErrorMessage = "Start date is required")]
        [Display(Name = "Start Date")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime StartDate { get; set; }

        // PATTERN: Optional end date that must be after start date
        [Display(Name = "End Date")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime? EndDate { get; set; }

        // PATTERN: Checkbox/Boolean field
        [Display(Name = "Is Active")]
        public bool IsActive { get; set; }

        // PATTERN: Terms acceptance required
        [Display(Name = "I agree to the terms and conditions")]
        [Range(typeof(bool), "true", "true", ErrorMessage = "You must accept the terms")]
        public bool AcceptTerms { get; set; }

        // PATTERN: URL validation
        [Display(Name = "Website")]
        [Url(ErrorMessage = "Invalid URL format")]
        public string Website { get; set; }

        // PATTERN: Credit card validation
        [Display(Name = "Credit Card")]
        [CreditCard(ErrorMessage = "Invalid credit card number")]
        public string CreditCardNumber { get; set; }

        // PATTERN: Password with confirmation
        [Display(Name = "Password")]
        [DataType(DataType.Password)]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 100 characters")]
        public string Password { get; set; }

        [Display(Name = "Confirm Password")]
        [DataType(DataType.Password)]
        [System.ComponentModel.DataAnnotations.Compare("Password", ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set; }

        // PATTERN: File upload
        [Display(Name = "Attachment")]
        public string AttachmentPath { get; set; }

        // PATTERN: Multi-select
        [Display(Name = "Selected Options")]
        public List<string> SelectedOptions { get; set; }

        // PATTERN: Radio button selection
        [Display(Name = "Gender")]
        public string Gender { get; set; }

        // PATTERN: Country selection
        [Display(Name = "Country")]
        public string Country { get; set; }

        // PATTERN: State/Province (dependent on country)
        [Display(Name = "State/Province")]
        public string State { get; set; }

        // PATTERN: ZIP/Postal code with conditional validation
        [Display(Name = "ZIP/Postal Code")]
        public string PostalCode { get; set; }

        // Constructor
        public SampleFormViewModel()
        {
            IsActive = true;
            SelectedOptions = new List<string>();
            StartDate = DateTime.Today;
        }

        // PATTERN: Custom validation method
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // Custom validation logic
            if (EndDate.HasValue && EndDate < StartDate)
            {
                yield return new ValidationResult(
                    "End date must be after start date",
                    new[] { "EndDate" });
            }

            // Country-specific postal code validation
            if (Country == "US" && !string.IsNullOrEmpty(PostalCode))
            {
                if (!System.Text.RegularExpressions.Regex.IsMatch(PostalCode, @"^\d{5}(-\d{4})?$"))
                {
                    yield return new ValidationResult(
                        "Invalid US ZIP code format",
                        new[] { "PostalCode" });
                }
            }
        }
    }

    /// <summary>
    /// View model for wizard steps
    /// </summary>
    public class WizardStepViewModel
    {
        public int CurrentStep { get; set; }
        public int TotalSteps { get; set; }
        public string StepTitle { get; set; }
        public string StepDescription { get; set; }
        public bool CanGoBack { get; set; }
        public bool CanGoNext { get; set; }
        public bool IsLastStep { get; set; }
    }
}