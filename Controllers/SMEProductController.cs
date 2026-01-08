using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using BenefitNetFlex.Sample.Models;

namespace BenefitNetFlex.Sample.Controllers
{
    /// <summary>
    /// Controller for SME Product Administration
    /// PATTERN: Follows BenefitNetFlex reference project structure
    /// </summary>
    public class SMEProductController : BaseController
    {
        #region Reference Data

        private static readonly List<ProductCategoryModel> Categories = new List<ProductCategoryModel>
        {
            new ProductCategoryModel { CategoryId = 1, CategoryName = "Life & Protection Benefits" },
            new ProductCategoryModel { CategoryId = 2, CategoryName = "Medical Benefits" },
            new ProductCategoryModel { CategoryId = 3, CategoryName = "Additional Benefits" }
        };

        private static readonly List<InsurerModel> Insurers = new List<InsurerModel>
        {
            new InsurerModel { InsurerId = 1, InsurerName = "AIA Singapore", InsurerCode = "AIA_SG" },
            new InsurerModel { InsurerId = 2, InsurerName = "Chubb Singapore", InsurerCode = "CHUBB_SG" },
            new InsurerModel { InsurerId = 3, InsurerName = "Liberty Insurance HK", InsurerCode = "LIBERTY_HK" },
            new InsurerModel { InsurerId = 4, InsurerName = "Chubb Hong Kong", InsurerCode = "CHUBB_HK" }
        };

        private static readonly List<CountryModel> Countries = new List<CountryModel>
        {
            new CountryModel { Id = 1, Name = "Singapore" },
            new CountryModel { Id = 2, Name = "Hong Kong" }
        };

        private static readonly List<AgeBandModel> AgeBands = new List<AgeBandModel>
        {
            new AgeBandModel { AgeBandId = 1, AgeBandName = "39 and below", MinAge = 0, MaxAge = 39 },
            new AgeBandModel { AgeBandId = 2, AgeBandName = "40 - 44", MinAge = 40, MaxAge = 44 },
            new AgeBandModel { AgeBandId = 3, AgeBandName = "45 - 49", MinAge = 45, MaxAge = 49 },
            new AgeBandModel { AgeBandId = 4, AgeBandName = "50 - 54", MinAge = 50, MaxAge = 54 },
            new AgeBandModel { AgeBandId = 5, AgeBandName = "55 - 59", MinAge = 55, MaxAge = 59 },
            new AgeBandModel { AgeBandId = 6, AgeBandName = "60 - 64", MinAge = 60, MaxAge = 64 },
            new AgeBandModel { AgeBandId = 7, AgeBandName = "65 - 69", MinAge = 65, MaxAge = 69 },
            new AgeBandModel { AgeBandId = 8, AgeBandName = "70 - 74", MinAge = 70, MaxAge = 74 }
        };

        #endregion

        #region Sample Data

        private static readonly List<SMEProductModel> SampleProducts = GenerateSampleProducts();
        private static readonly List<SMEProductPlanModel> SamplePlans = GenerateSamplePlans();
        private static readonly List<SMEPlanPricingModel> SamplePricing = GenerateSamplePricing();

        private static List<SMEProductModel> GenerateSampleProducts()
        {
            var products = new List<SMEProductModel>
            {
                // Life & Protection Benefits
                new SMEProductModel
                {
                    ProductId = 1, ProductCode = "GTL", ProductName = "Group Term Life",
                    CategoryId = 1, CategoryName = "Life & Protection Benefits",
                    InsurerId = 1, InsurerName = "AIA Singapore",
                    CountryId = 1, CountryName = "Singapore",
                    Description = "Provide 24-hour worldwide coverage against Death or Total & Permanent Disability (TPD) to any cause, including illness and accident.",
                    ShortDescription = "Coverage against Death or TPD",
                    IsDefaultRecommendation = true, IsActive = true, DisplayOrder = 1, PlansCount = 2,
                    CreatedDate = DateTime.Now.AddMonths(-6), ModifiedDate = DateTime.Now.AddDays(-5),
                    QueryString = "?productId=1"
                },
                new SMEProductModel
                {
                    ProductId = 2, ProductCode = "GPA", ProductName = "Group Personal Accident",
                    CategoryId = 1, CategoryName = "Life & Protection Benefits",
                    InsurerId = 2, InsurerName = "Chubb Singapore",
                    CountryId = 1, CountryName = "Singapore",
                    Description = "Provides coverage for accidental death, permanent disability, and medical expenses arising from accidents.",
                    ShortDescription = "Accident coverage for death and disability",
                    IsDefaultRecommendation = true, IsActive = true, DisplayOrder = 2, PlansCount = 3,
                    CreatedDate = DateTime.Now.AddMonths(-6), ModifiedDate = DateTime.Now.AddDays(-3),
                    QueryString = "?productId=2"
                },
                new SMEProductModel
                {
                    ProductId = 3, ProductCode = "CI", ProductName = "Critical Illness",
                    CategoryId = 1, CategoryName = "Life & Protection Benefits",
                    InsurerId = 1, InsurerName = "AIA Singapore",
                    CountryId = 1, CountryName = "Singapore",
                    Description = "Lump sum benefit upon diagnosis of covered critical illnesses including cancer, heart attack, stroke, and more.",
                    ShortDescription = "Lump sum on critical illness diagnosis",
                    IsDefaultRecommendation = false, IsActive = true, DisplayOrder = 3, PlansCount = 2,
                    CreatedDate = DateTime.Now.AddMonths(-5), ModifiedDate = DateTime.Now.AddDays(-10),
                    QueryString = "?productId=3"
                },
                new SMEProductModel
                {
                    ProductId = 4, ProductCode = "DI", ProductName = "Disability Income",
                    CategoryId = 1, CategoryName = "Life & Protection Benefits",
                    InsurerId = 1, InsurerName = "AIA Singapore",
                    CountryId = 1, CountryName = "Singapore",
                    Description = "Monthly income replacement benefit during temporary disability due to illness or accident.",
                    ShortDescription = "Monthly income during disability",
                    IsDefaultRecommendation = false, IsActive = true, DisplayOrder = 4, PlansCount = 2,
                    CreatedDate = DateTime.Now.AddMonths(-5), ModifiedDate = DateTime.Now.AddDays(-15),
                    QueryString = "?productId=4"
                },
                // Medical Benefits
                new SMEProductModel
                {
                    ProductId = 5, ProductCode = "GHS", ProductName = "Group Hospital & Surgical",
                    CategoryId = 2, CategoryName = "Medical Benefits",
                    InsurerId = 1, InsurerName = "AIA Singapore",
                    CountryId = 1, CountryName = "Singapore",
                    Description = "Comprehensive hospitalisation coverage including room & board, surgical fees, ICU, and in-hospital treatments.",
                    ShortDescription = "Hospital and surgical coverage",
                    IsDefaultRecommendation = true, IsActive = true, DisplayOrder = 5, PlansCount = 5,
                    CreatedDate = DateTime.Now.AddMonths(-6), ModifiedDate = DateTime.Now.AddDays(-2),
                    QueryString = "?productId=5"
                },
                new SMEProductModel
                {
                    ProductId = 6, ProductCode = "GP", ProductName = "General Practitioner (Outpatient Clinical)",
                    CategoryId = 2, CategoryName = "Medical Benefits",
                    InsurerId = 1, InsurerName = "AIA Singapore",
                    CountryId = 1, CountryName = "Singapore",
                    Description = "Coverage for outpatient GP consultations, prescribed medications, and basic diagnostic tests.",
                    ShortDescription = "GP consultation and medication",
                    IsDefaultRecommendation = true, IsActive = true, DisplayOrder = 6, PlansCount = 3,
                    CreatedDate = DateTime.Now.AddMonths(-6), ModifiedDate = DateTime.Now.AddDays(-1),
                    QueryString = "?productId=6"
                },
                new SMEProductModel
                {
                    ProductId = 7, ProductCode = "SP", ProductName = "Outpatient Specialist",
                    CategoryId = 2, CategoryName = "Medical Benefits",
                    InsurerId = 1, InsurerName = "AIA Singapore",
                    CountryId = 1, CountryName = "Singapore",
                    Description = "Coverage for specialist consultations and treatments on an outpatient basis.",
                    ShortDescription = "Specialist consultation coverage",
                    IsDefaultRecommendation = true, IsActive = true, DisplayOrder = 7, PlansCount = 3,
                    CreatedDate = DateTime.Now.AddMonths(-5), ModifiedDate = DateTime.Now.AddDays(-7),
                    QueryString = "?productId=7"
                },
                new SMEProductModel
                {
                    ProductId = 8, ProductCode = "GMM", ProductName = "Group Major Medical",
                    CategoryId = 2, CategoryName = "Medical Benefits",
                    InsurerId = 1, InsurerName = "AIA Singapore",
                    CountryId = 1, CountryName = "Singapore",
                    Description = "Extended coverage beyond basic hospitalisation for major medical expenses and long-term treatments.",
                    ShortDescription = "Major medical expense coverage",
                    IsDefaultRecommendation = false, IsActive = true, DisplayOrder = 8, PlansCount = 2,
                    CreatedDate = DateTime.Now.AddMonths(-4), ModifiedDate = DateTime.Now.AddDays(-20),
                    QueryString = "?productId=8"
                },
                new SMEProductModel
                {
                    ProductId = 9, ProductCode = "MAT", ProductName = "Maternity",
                    CategoryId = 2, CategoryName = "Medical Benefits",
                    InsurerId = 1, InsurerName = "AIA Singapore",
                    CountryId = 1, CountryName = "Singapore",
                    Description = "Coverage for pre-natal, delivery, and post-natal expenses including normal and caesarean delivery.",
                    ShortDescription = "Maternity and childbirth coverage",
                    IsDefaultRecommendation = false, IsActive = true, DisplayOrder = 9, PlansCount = 2,
                    CreatedDate = DateTime.Now.AddMonths(-4), ModifiedDate = DateTime.Now.AddDays(-25),
                    QueryString = "?productId=9"
                },
                new SMEProductModel
                {
                    ProductId = 10, ProductCode = "DEN", ProductName = "Dental",
                    CategoryId = 2, CategoryName = "Medical Benefits",
                    InsurerId = 1, InsurerName = "AIA Singapore",
                    CountryId = 1, CountryName = "Singapore",
                    Description = "Coverage for dental treatments including check-ups, fillings, extractions, and dentures.",
                    ShortDescription = "Dental treatment coverage",
                    IsDefaultRecommendation = false, IsActive = true, DisplayOrder = 10, PlansCount = 2,
                    CreatedDate = DateTime.Now.AddMonths(-3), ModifiedDate = DateTime.Now.AddDays(-12),
                    QueryString = "?productId=10"
                },
                new SMEProductModel
                {
                    ProductId = 11, ProductCode = "MH", ProductName = "Mental Wellbeing",
                    CategoryId = 2, CategoryName = "Medical Benefits",
                    InsurerId = 1, InsurerName = "AIA Singapore",
                    CountryId = 1, CountryName = "Singapore",
                    Description = "Coverage for mental health consultations, counselling, and psychiatric treatments.",
                    ShortDescription = "Mental health and counselling",
                    IsDefaultRecommendation = false, IsActive = true, DisplayOrder = 11, PlansCount = 2,
                    CreatedDate = DateTime.Now.AddMonths(-2), ModifiedDate = DateTime.Now.AddDays(-8),
                    QueryString = "?productId=11"
                },
                // Additional Benefits
                new SMEProductModel
                {
                    ProductId = 12, ProductCode = "TRV", ProductName = "Travel Accident",
                    CategoryId = 3, CategoryName = "Additional Benefits",
                    InsurerId = 2, InsurerName = "Chubb Singapore",
                    CountryId = 1, CountryName = "Singapore",
                    Description = "Coverage for accidents occurring during business travel including medical expenses and trip interruption.",
                    ShortDescription = "Business travel accident coverage",
                    IsDefaultRecommendation = false, IsActive = true, DisplayOrder = 12, PlansCount = 2,
                    CreatedDate = DateTime.Now.AddMonths(-3), ModifiedDate = DateTime.Now.AddDays(-18),
                    QueryString = "?productId=12"
                },
                new SMEProductModel
                {
                    ProductId = 13, ProductCode = "WICA", ProductName = "Work Injury Compensation",
                    CategoryId = 3, CategoryName = "Additional Benefits",
                    InsurerId = 1, InsurerName = "AIA Singapore",
                    CountryId = 1, CountryName = "Singapore",
                    Description = "Statutory coverage for work-related injuries and occupational diseases as required by WICA.",
                    ShortDescription = "Statutory work injury coverage",
                    IsDefaultRecommendation = false, IsActive = true, DisplayOrder = 13, PlansCount = 1,
                    CreatedDate = DateTime.Now.AddMonths(-6), ModifiedDate = DateTime.Now.AddDays(-30),
                    QueryString = "?productId=13"
                }
            };

            return products;
        }

        private static List<SMEProductPlanModel> GenerateSamplePlans()
        {
            var plans = new List<SMEProductPlanModel>();
            int planId = 1;

            // GTL Plans
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 1, ProductCode = "GTL", ProductName = "Group Term Life", PlanCode = "Plan1", PlanName = "Core / Buy down", TierLevel = 1, IsActive = true, DisplayOrder = 1 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 1, ProductCode = "GTL", ProductName = "Group Term Life", PlanCode = "Plan2", PlanName = "Buy up", TierLevel = 2, IsActive = true, DisplayOrder = 2 });

            // GPA Plans
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 2, ProductCode = "GPA", ProductName = "Group Personal Accident", PlanCode = "Plan1", PlanName = "Basic", TierLevel = 1, IsActive = true, DisplayOrder = 1 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 2, ProductCode = "GPA", ProductName = "Group Personal Accident", PlanCode = "Plan2", PlanName = "Enhanced", TierLevel = 2, IsActive = true, DisplayOrder = 2 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 2, ProductCode = "GPA", ProductName = "Group Personal Accident", PlanCode = "Plan3", PlanName = "Premium", TierLevel = 3, IsActive = true, DisplayOrder = 3 });

            // CI Plans
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 3, ProductCode = "CI", ProductName = "Critical Illness", PlanCode = "Plan1", PlanName = "Standard", TierLevel = 1, IsActive = true, DisplayOrder = 1 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 3, ProductCode = "CI", ProductName = "Critical Illness", PlanCode = "Plan2", PlanName = "Comprehensive", TierLevel = 2, IsActive = true, DisplayOrder = 2 });

            // DI Plans
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 4, ProductCode = "DI", ProductName = "Disability Income", PlanCode = "Plan1", PlanName = "Basic", TierLevel = 1, IsActive = true, DisplayOrder = 1 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 4, ProductCode = "DI", ProductName = "Disability Income", PlanCode = "Plan2", PlanName = "Enhanced", TierLevel = 2, IsActive = true, DisplayOrder = 2 });

            // GHS Plans (5 ward types)
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 5, ProductCode = "GHS", ProductName = "Group Hospital & Surgical", PlanCode = "Plan1", PlanName = "1 Bed Private", TierLevel = 1, WardType = "1 Bed Pte", IsActive = true, DisplayOrder = 1 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 5, ProductCode = "GHS", ProductName = "Group Hospital & Surgical", PlanCode = "Plan2", PlanName = "2 Bed Private", TierLevel = 2, WardType = "2 Bed Pte", IsActive = true, DisplayOrder = 2 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 5, ProductCode = "GHS", ProductName = "Group Hospital & Surgical", PlanCode = "Plan3", PlanName = "4 Bed Private", TierLevel = 3, WardType = "4 Bed Pte", IsActive = true, DisplayOrder = 3 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 5, ProductCode = "GHS", ProductName = "Group Hospital & Surgical", PlanCode = "Plan4", PlanName = "Government A/B1", TierLevel = 4, WardType = "Govt A/B1", IsActive = true, DisplayOrder = 4 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 5, ProductCode = "GHS", ProductName = "Group Hospital & Surgical", PlanCode = "Plan5", PlanName = "Government B2/C", TierLevel = 5, WardType = "Govt B2/C", IsActive = true, DisplayOrder = 5 });

            // GP Plans
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 6, ProductCode = "GP", ProductName = "General Practitioner", PlanCode = "Plan1", PlanName = "Basic", TierLevel = 1, IsActive = true, DisplayOrder = 1 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 6, ProductCode = "GP", ProductName = "General Practitioner", PlanCode = "Plan2", PlanName = "Standard", TierLevel = 2, IsActive = true, DisplayOrder = 2 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 6, ProductCode = "GP", ProductName = "General Practitioner", PlanCode = "Plan3", PlanName = "Enhanced", TierLevel = 3, IsActive = true, DisplayOrder = 3 });

            // SP Plans
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 7, ProductCode = "SP", ProductName = "Outpatient Specialist", PlanCode = "Plan1", PlanName = "Basic", TierLevel = 1, IsActive = true, DisplayOrder = 1 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 7, ProductCode = "SP", ProductName = "Outpatient Specialist", PlanCode = "Plan2", PlanName = "Standard", TierLevel = 2, IsActive = true, DisplayOrder = 2 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 7, ProductCode = "SP", ProductName = "Outpatient Specialist", PlanCode = "Plan3", PlanName = "Enhanced", TierLevel = 3, IsActive = true, DisplayOrder = 3 });

            // GMM Plans
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 8, ProductCode = "GMM", ProductName = "Group Major Medical", PlanCode = "Plan1", PlanName = "Standard", TierLevel = 1, IsActive = true, DisplayOrder = 1 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 8, ProductCode = "GMM", ProductName = "Group Major Medical", PlanCode = "Plan2", PlanName = "Enhanced", TierLevel = 2, IsActive = true, DisplayOrder = 2 });

            // MAT Plans
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 9, ProductCode = "MAT", ProductName = "Maternity", PlanCode = "Plan1", PlanName = "Standard", TierLevel = 1, IsActive = true, DisplayOrder = 1 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 9, ProductCode = "MAT", ProductName = "Maternity", PlanCode = "Plan2", PlanName = "Enhanced", TierLevel = 2, IsActive = true, DisplayOrder = 2 });

            // DEN Plans
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 10, ProductCode = "DEN", ProductName = "Dental", PlanCode = "Plan1", PlanName = "Basic", TierLevel = 1, IsActive = true, DisplayOrder = 1 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 10, ProductCode = "DEN", ProductName = "Dental", PlanCode = "Plan2", PlanName = "Comprehensive", TierLevel = 2, IsActive = true, DisplayOrder = 2 });

            // MH Plans
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 11, ProductCode = "MH", ProductName = "Mental Wellbeing", PlanCode = "Plan1", PlanName = "Basic", TierLevel = 1, IsActive = true, DisplayOrder = 1 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 11, ProductCode = "MH", ProductName = "Mental Wellbeing", PlanCode = "Plan2", PlanName = "Comprehensive", TierLevel = 2, IsActive = true, DisplayOrder = 2 });

            // TRV Plans
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 12, ProductCode = "TRV", ProductName = "Travel Accident", PlanCode = "Plan1", PlanName = "Standard", TierLevel = 1, IsActive = true, DisplayOrder = 1 });
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 12, ProductCode = "TRV", ProductName = "Travel Accident", PlanCode = "Plan2", PlanName = "Premium", TierLevel = 2, IsActive = true, DisplayOrder = 2 });

            // WICA Plans
            plans.Add(new SMEProductPlanModel { PlanId = planId++, ProductId = 13, ProductCode = "WICA", ProductName = "Work Injury Compensation", PlanCode = "Plan1", PlanName = "Statutory", TierLevel = 1, IsActive = true, DisplayOrder = 1 });

            return plans;
        }

        private static List<SMEPlanPricingModel> GenerateSamplePricing()
        {
            var pricing = new List<SMEPlanPricingModel>();
            int pricingId = 1;

            // Base rates for GTL Plan 1 (per $1000 sum assured, annual)
            decimal[] gtlBaseRates = { 0.38m, 0.43m, 0.75m, 1.32m, 2.33m, 4.00m, 6.43m, 10.43m };

            foreach (var plan in SamplePlans)
            {
                for (int i = 0; i < AgeBands.Count; i++)
                {
                    var ageBand = AgeBands[i];
                    decimal baseRate = gtlBaseRates[i];

                    // Adjust rate based on product/plan
                    decimal multiplier = 1.0m;
                    if (plan.ProductCode == "GPA") multiplier = 0.8m;
                    else if (plan.ProductCode == "CI") multiplier = 1.5m;
                    else if (plan.ProductCode == "GHS") multiplier = 2.0m + (plan.TierLevel * 0.5m);
                    else if (plan.ProductCode == "GP") multiplier = 0.3m;
                    else if (plan.ProductCode == "SP") multiplier = 0.5m;

                    // Higher tiers cost more
                    multiplier *= (1 + (plan.TierLevel - 1) * 0.15m);

                    pricing.Add(new SMEPlanPricingModel
                    {
                        PricingId = pricingId++,
                        PlanId = plan.PlanId,
                        AgeBandId = ageBand.AgeBandId,
                        AgeBandName = ageBand.AgeBandName,
                        CompulsoryEmployeeRate = Math.Round(baseRate * multiplier, 2),
                        CompulsoryDependentRate = Math.Round(baseRate * multiplier * 1.1m, 2),
                        VoluntaryEmployeeRate = Math.Round(baseRate * multiplier * 1.3m, 2),
                        VoluntaryDependentRate = Math.Round(baseRate * multiplier * 1.4m, 2)
                    });
                }
            }

            return pricing;
        }

        #endregion

        #region View Actions

        /// <summary>
        /// Main products listing page with search and grid
        /// </summary>
        public ActionResult Products()
        {
            ViewBag.Header = "SME Product Admin";
            ViewBag.Categories = Categories;
            ViewBag.Insurers = Insurers;
            ViewBag.Countries = Countries;

            return View();
        }

        /// <summary>
        /// Product details page with tabs
        /// </summary>
        public ActionResult Details(int? productId)
        {
            if (!productId.HasValue)
            {
                return RedirectToAction("Products");
            }

            var product = SampleProducts.FirstOrDefault(p => p.ProductId == productId);
            if (product == null)
            {
                return HttpNotFound();
            }

            ViewBag.Header = product.ProductName + " (" + product.ProductCode + ")";
            ViewBag.Categories = Categories;
            ViewBag.Insurers = Insurers;
            ViewBag.Countries = Countries;
            ViewBag.AgeBands = AgeBands;

            return View(product);
        }

        /// <summary>
        /// Add new product page
        /// </summary>
        public ActionResult Add()
        {
            ViewBag.Header = "Add Product";
            ViewBag.Categories = Categories;
            ViewBag.Insurers = Insurers;
            ViewBag.Countries = Countries;

            return View("Details", new SMEProductModel { IsActive = true });
        }

        #endregion

        #region AJAX Actions

        /// <summary>
        /// AJAX action for Kendo Grid to search/filter products
        /// </summary>
        [HttpPost]
        public ActionResult SearchProductsAsync(string name, int? categoryId, int? insurerId, int? countryId, bool? isActive, bool? isDefaultRecommendation, int page = 1, int pageSize = 10, int skip = 0, int take = 10)
        {
            var query = SampleProducts.AsQueryable();

            // Filter by name
            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(p => p.ProductName.IndexOf(name, StringComparison.OrdinalIgnoreCase) >= 0 ||
                                         p.ProductCode.IndexOf(name, StringComparison.OrdinalIgnoreCase) >= 0);
            }

            // Filter by category
            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            // Filter by insurer
            if (insurerId.HasValue)
            {
                query = query.Where(p => p.InsurerId == insurerId.Value);
            }

            // Filter by country
            if (countryId.HasValue)
            {
                query = query.Where(p => p.CountryId == countryId.Value);
            }

            // Filter by active status
            if (isActive.HasValue)
            {
                query = query.Where(p => p.IsActive == isActive.Value);
            }

            // Filter by default recommendation
            if (isDefaultRecommendation.HasValue)
            {
                query = query.Where(p => p.IsDefaultRecommendation == isDefaultRecommendation.Value);
            }

            // Get total count before paging
            var total = query.Count();

            // Apply paging
            var skipCount = skip > 0 ? skip : (page - 1) * pageSize;
            var takeCount = take > 0 ? take : pageSize;

            var data = query
                .OrderBy(p => p.DisplayOrder)
                .Skip(skipCount)
                .Take(takeCount)
                .ToList();

            // Return in Kendo DataSource format
            return Json(new
            {
                Data = data,
                Total = total
            });
        }

        /// <summary>
        /// Get products statistics for the Key Statistics tab
        /// </summary>
        [HttpGet]
        public ActionResult GetProductsQuickStat()
        {
            var stats = new SMEProductsStatModel
            {
                TotalProductsCount = SampleProducts.Count,
                ActiveProductsCount = SampleProducts.Count(p => p.IsActive),
                TotalPlansCount = SamplePlans.Count,
                LifeProtectionCount = SampleProducts.Count(p => p.CategoryId == 1),
                MedicalCount = SampleProducts.Count(p => p.CategoryId == 2),
                AdditionalBenefitsCount = SampleProducts.Count(p => p.CategoryId == 3),
                DefaultRecommendationCount = SampleProducts.Count(p => p.IsDefaultRecommendation)
            };

            return Json(new { Success = true, ProductsStat = stats }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get category demographics for the chart
        /// </summary>
        [HttpPost]
        public ActionResult GetCategoryDemographics()
        {
            var categories = SampleProducts
                .GroupBy(p => p.CategoryName)
                .Select(g => new ProductCategoryChartModel
                {
                    category = g.Key,
                    value = g.Count()
                })
                .OrderByDescending(v => v.value)
                .ToList();

            return Json(categories);
        }

        /// <summary>
        /// Get plans for a specific product
        /// </summary>
        [HttpPost]
        public ActionResult GetProductPlans(int productId, int skip = 0, int take = 10)
        {
            var query = SamplePlans.Where(p => p.ProductId == productId).AsQueryable();

            var total = query.Count();
            var data = query
                .OrderBy(p => p.DisplayOrder)
                .Skip(skip)
                .Take(take)
                .ToList();

            return Json(new { Data = data, Total = total });
        }

        /// <summary>
        /// Get pricing for a specific plan
        /// </summary>
        [HttpPost]
        public ActionResult GetPlanPricing(int planId, int skip = 0, int take = 10)
        {
            var query = SamplePricing.Where(p => p.PlanId == planId).AsQueryable();

            var total = query.Count();
            var data = query
                .OrderBy(p => p.AgeBandId)
                .Skip(skip)
                .Take(take)
                .ToList();

            return Json(new { Data = data, Total = total });
        }

        /// <summary>
        /// Save product (placeholder - sample only)
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult SaveProduct(SMEProductModel model)
        {
            if (!ModelState.IsValid)
            {
                return Json(new { Success = false, Message = "Validation failed" });
            }

            // SAMPLE: In production, save to database
            return Json(new { Success = true, Message = "Product saved successfully", ProductId = model.ProductId > 0 ? model.ProductId : 14 });
        }

        /// <summary>
        /// Save plan (placeholder - sample only)
        /// </summary>
        [HttpPost]
        public ActionResult SavePlan(SMEProductPlanModel model)
        {
            if (!ModelState.IsValid)
            {
                return Json(new { Success = false, Message = "Validation failed" });
            }

            // SAMPLE: In production, save to database
            return Json(new { Success = true, Message = "Plan saved successfully", PlanId = model.PlanId > 0 ? model.PlanId : 100 });
        }

        /// <summary>
        /// Save pricing (placeholder - sample only)
        /// </summary>
        [HttpPost]
        public ActionResult SavePricing(List<SMEPlanPricingModel> pricing)
        {
            // SAMPLE: In production, save to database
            return Json(new { Success = true, Message = "Pricing saved successfully" });
        }

        /// <summary>
        /// Export products to Excel (placeholder)
        /// </summary>
        [HttpPost]
        public ActionResult ExportProducts(string name, int? categoryId, int? insurerId)
        {
            // SAMPLE: In production, implement actual Excel export
            return Json("/Content/sample-products-export.xlsx");
        }

        #endregion
    }
}
