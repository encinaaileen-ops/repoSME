using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using BenefitNetFlex.Sample.Models;

namespace BenefitNetFlex.Sample.Controllers
{
    /// <summary>
    /// Controller for client management
    /// PATTERN: Follows BenefitNetFlex reference project structure
    /// </summary>
    public class ClientController : BaseController
    {
        // SAMPLE: Static list of countries for dropdown
        private static readonly List<CountryModel> Countries = new List<CountryModel>
        {
            new CountryModel { Id = 1, Name = "United States" },
            new CountryModel { Id = 2, Name = "United Kingdom" },
            new CountryModel { Id = 3, Name = "Canada" },
            new CountryModel { Id = 4, Name = "Australia" },
            new CountryModel { Id = 5, Name = "Germany" },
            new CountryModel { Id = 6, Name = "France" },
            new CountryModel { Id = 7, Name = "Japan" },
            new CountryModel { Id = 8, Name = "Singapore" },
            new CountryModel { Id = 9, Name = "Hong Kong" },
            new CountryModel { Id = 10, Name = "South Africa" }
        };

        // SAMPLE: Static list of clients for demonstration
        private static readonly List<ClientDetailsModel> SampleClients = GenerateSampleClients();

        private static List<ClientDetailsModel> GenerateSampleClients()
        {
            var clients = new List<ClientDetailsModel>();
            var types = new[] { "Client" };
            var industries = new[] { "Technology", "Healthcare", "Finance", "Manufacturing", "Retail" };
            var countries = Countries.Select(c => c.Name).ToArray();
            var random = new Random(42);

            for (int i = 1; i <= 50; i++)
            {
                clients.Add(new ClientDetailsModel
                {
                    ClientId = i,
                    Name = $"Client {i:D3} Corporation",
                    QueryString = $"?clientId={i}",
                    ClientType = types[random.Next(types.Length)],
                    TotalMembersCount = random.Next(50, 5000),
                    ActivePrincipalsCount = random.Next(20, 2000),
                    ActiveDependantsCount = random.Next(30, 3000),
                    PendingAdditionMembersCount = random.Next(0, 100),
                    PoliciesCount = random.Next(1, 20),
                    IsLost = random.Next(10) == 0, // 10% chance of being lost
                    Country = countries[random.Next(countries.Length)],
                    Industry = industries[random.Next(industries.Length)]
                });
            }

            return clients;
        }

        /// <summary>
        /// Main clients listing page with search and grid
        /// </summary>
        public ActionResult Clients()
        {
            ViewBag.Header = "Clients";
            ViewBag.Countries = Countries;
            ViewBag.DateFormat = "dd/MM/yyyy";

            return View();
        }

        /// <summary>
        /// AJAX action for Kendo Grid to search/filter clients
        /// Manual implementation without Kendo.Mvc server-side components
        /// </summary>
        [HttpPost]
        public ActionResult SearchClientsAsync(string name, int? countryId, bool isIncludeSubgroups = false, int page = 1, int pageSize = 10, int skip = 0, int take = 10)
        {
            var query = SampleClients.AsQueryable();

            // Filter by name
            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(c => c.Name.IndexOf(name, StringComparison.OrdinalIgnoreCase) >= 0);
            }

            // Filter by country
            if (countryId.HasValue)
            {
                var country = Countries.FirstOrDefault(c => c.Id == countryId.Value);
                if (country != null)
                {
                    query = query.Where(c => c.Country == country.Name);
                }
            }

            // Get total count before paging
            var total = query.Count();

            // Apply paging (Kendo sends skip/take or page/pageSize)
            var skipCount = skip > 0 ? skip : (page - 1) * pageSize;
            var takeCount = take > 0 ? take : pageSize;

            var data = query
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
        /// Get client statistics for the Key Statistics tab
        /// </summary>
        [HttpGet]
        public ActionResult GetClientsQuickStat()
        {
            var stats = new ClientsStatModel
            {
                ClientsCount = SampleClients.Count,
                PoliciesCount = SampleClients.Sum(c => c.PoliciesCount),
                TotalPremiumString = "$12,500,000.00",
                TotalRemunerationString = "$625,000.00",
                RPMString = "5.00%",
                TotalMembersString = SampleClients.Sum(c => c.TotalMembersCount).ToString("N0"),
                PendingCensusTransactionsCount = 45,
                PendingClaimsCount = 128
            };

            return Json(new { Success = true, ClientsStat = stats }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get industry demographics for the chart
        /// </summary>
        [HttpPost]
        public ActionResult GetIndustriesDemographics()
        {
            var industries = SampleClients
                .GroupBy(c => c.Industry)
                .Select(g => new ValuesForChartModel
                {
                    category = g.Key,
                    value = g.Count()
                })
                .OrderByDescending(v => v.value)
                .ToList();

            return Json(industries);
        }

        /// <summary>
        /// Client details page
        /// </summary>
        public ActionResult Details(int? clientId)
        {
            if (!clientId.HasValue)
            {
                return RedirectToAction("Clients");
            }

            var client = SampleClients.FirstOrDefault(c => c.ClientId == clientId);
            if (client == null)
            {
                return HttpNotFound();
            }

            ViewBag.Header = client.Name;
            return View(client);
        }

        /// <summary>
        /// Add new client page
        /// </summary>
        public ActionResult Add()
        {
            ViewBag.Header = "Add Client";
            ViewBag.Countries = Countries;
            return View();
        }

        /// <summary>
        /// Export clients to Excel (placeholder)
        /// </summary>
        [HttpPost]
        public ActionResult ExportClients(string name, int? countryId, DateTime? selectedDate)
        {
            // SAMPLE: In production, implement actual Excel export
            return Json("/Content/sample-export.xlsx");
        }
    }
}
