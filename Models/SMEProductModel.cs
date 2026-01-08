using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BenefitNetFlex.Sample.Models
{
    /// <summary>
    /// Main SME Product model for product administration
    /// </summary>
    public class SMEProductModel
    {
        public int ProductId { get; set; }

        [Required(ErrorMessage = "Product code is required")]
        [StringLength(20)]
        [Display(Name = "Product Code")]
        public string ProductCode { get; set; }

        [Required(ErrorMessage = "Product name is required")]
        [StringLength(200)]
        [Display(Name = "Product Name")]
        public string ProductName { get; set; }

        [Required(ErrorMessage = "Category is required")]
        [Display(Name = "Category")]
        public int CategoryId { get; set; }

        public string CategoryName { get; set; }

        [Required(ErrorMessage = "Insurer is required")]
        [Display(Name = "Insurer")]
        public int InsurerId { get; set; }

        public string InsurerName { get; set; }

        [Required(ErrorMessage = "Country is required")]
        [Display(Name = "Country")]
        public int CountryId { get; set; }

        public string CountryName { get; set; }

        [Display(Name = "Description")]
        public string Description { get; set; }

        [StringLength(500)]
        [Display(Name = "Short Description")]
        public string ShortDescription { get; set; }

        [Display(Name = "Default Recommendation")]
        public bool IsDefaultRecommendation { get; set; }

        [Display(Name = "Active")]
        public bool IsActive { get; set; }

        [Display(Name = "Display Order")]
        public int DisplayOrder { get; set; }

        public int PlansCount { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime ModifiedDate { get; set; }

        // For grid link generation
        public string QueryString { get; set; }
    }

    /// <summary>
    /// Product plan model (tier levels within a product)
    /// </summary>
    public class SMEProductPlanModel
    {
        public int PlanId { get; set; }

        public int ProductId { get; set; }

        [Required(ErrorMessage = "Plan code is required")]
        [StringLength(20)]
        [Display(Name = "Plan Code")]
        public string PlanCode { get; set; }

        [Required(ErrorMessage = "Plan name is required")]
        [StringLength(100)]
        [Display(Name = "Plan Name")]
        public string PlanName { get; set; }

        [Required(ErrorMessage = "Tier level is required")]
        [Range(1, 5, ErrorMessage = "Tier level must be between 1 and 5")]
        [Display(Name = "Tier Level")]
        public int TierLevel { get; set; }

        [StringLength(50)]
        [Display(Name = "Ward Type")]
        public string WardType { get; set; }

        [Display(Name = "Active")]
        public bool IsActive { get; set; }

        [Display(Name = "Display Order")]
        public int DisplayOrder { get; set; }

        // Navigation
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
    }

    /// <summary>
    /// Age-banded pricing model for plans
    /// </summary>
    public class SMEPlanPricingModel
    {
        public int PricingId { get; set; }

        public int PlanId { get; set; }

        public int AgeBandId { get; set; }

        [Display(Name = "Age Band")]
        public string AgeBandName { get; set; }

        [Display(Name = "Compulsory Employee")]
        [DisplayFormat(DataFormatString = "{0:N2}")]
        public decimal? CompulsoryEmployeeRate { get; set; }

        [Display(Name = "Compulsory Dependent")]
        [DisplayFormat(DataFormatString = "{0:N2}")]
        public decimal? CompulsoryDependentRate { get; set; }

        [Display(Name = "Voluntary Employee")]
        [DisplayFormat(DataFormatString = "{0:N2}")]
        public decimal? VoluntaryEmployeeRate { get; set; }

        [Display(Name = "Voluntary Dependent")]
        [DisplayFormat(DataFormatString = "{0:N2}")]
        public decimal? VoluntaryDependentRate { get; set; }
    }

    /// <summary>
    /// Plan benefit schedule model
    /// </summary>
    public class SMEPlanBenefitModel
    {
        public int BenefitId { get; set; }

        public int PlanId { get; set; }

        [Required]
        [StringLength(50)]
        [Display(Name = "Benefit Code")]
        public string BenefitCode { get; set; }

        [Required]
        [StringLength(200)]
        [Display(Name = "Benefit Name")]
        public string BenefitName { get; set; }

        [Display(Name = "Benefit Limit")]
        public decimal? BenefitLimit { get; set; }

        [StringLength(100)]
        [Display(Name = "Limit Text")]
        public string LimitText { get; set; }

        [StringLength(50)]
        [Display(Name = "Limit Type")]
        public string LimitType { get; set; }

        public int? ParentBenefitId { get; set; }

        [StringLength(500)]
        [Display(Name = "Notes")]
        public string Notes { get; set; }

        [Display(Name = "Display Order")]
        public int DisplayOrder { get; set; }
    }

    /// <summary>
    /// Product dependency model
    /// </summary>
    public class SMEProductDependencyModel
    {
        public int DependencyId { get; set; }

        public int ProductId { get; set; }

        public string ProductCode { get; set; }

        public string ProductName { get; set; }

        public int RequiredProductId { get; set; }

        public string RequiredProductCode { get; set; }

        public string RequiredProductName { get; set; }
    }

    /// <summary>
    /// Product category reference model
    /// </summary>
    public class ProductCategoryModel
    {
        public int CategoryId { get; set; }

        public string CategoryName { get; set; }
    }

    /// <summary>
    /// Insurer reference model
    /// </summary>
    public class InsurerModel
    {
        public int InsurerId { get; set; }

        public string InsurerName { get; set; }

        public string InsurerCode { get; set; }
    }

    /// <summary>
    /// Age band reference model
    /// </summary>
    public class AgeBandModel
    {
        public int AgeBandId { get; set; }

        public string AgeBandName { get; set; }

        public int MinAge { get; set; }

        public int MaxAge { get; set; }
    }

    /// <summary>
    /// Statistics model for products dashboard
    /// </summary>
    public class SMEProductsStatModel
    {
        public int TotalProductsCount { get; set; }

        public int ActiveProductsCount { get; set; }

        public int TotalPlansCount { get; set; }

        public int LifeProtectionCount { get; set; }

        public int MedicalCount { get; set; }

        public int AdditionalBenefitsCount { get; set; }

        public int DefaultRecommendationCount { get; set; }
    }

    /// <summary>
    /// Chart data model for category distribution
    /// </summary>
    public class ProductCategoryChartModel
    {
        public string category { get; set; }

        public int value { get; set; }
    }
}
