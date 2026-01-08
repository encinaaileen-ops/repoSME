using System;

namespace BenefitNetFlex.Sample.Models
{
    /// <summary>
    /// Model for displaying client details in the grid
    /// PATTERN: Matches structure from BenefitNetFlex reference project
    /// </summary>
    public class ClientDetailsModel
    {
        public int? ClientId { get; set; }
        public string Name { get; set; }
        public string QueryString { get; set; }
        public string ClientType { get; set; }
        public int TotalMembersCount { get; set; }
        public int ActivePrincipalsCount { get; set; }
        public int ActiveDependantsCount { get; set; }
        public int PendingAdditionMembersCount { get; set; }
        public int PoliciesCount { get; set; }
        public bool IsLost { get; set; }
        public string Country { get; set; }
        public string Industry { get; set; }
        public string Status => IsLost ? "Inactive" : "Active";
    }

    /// <summary>
    /// Model for client statistics on the Key Statistics tab
    /// </summary>
    public class ClientsStatModel
    {
        public int ClientsCount { get; set; }
        public int PoliciesCount { get; set; }
        public string TotalPremiumString { get; set; }
        public string TotalRemunerationString { get; set; }
        public string RPMString { get; set; }
        public string TotalMembersString { get; set; }
        public int PendingCensusTransactionsCount { get; set; }
        public int PendingClaimsCount { get; set; }
    }

    /// <summary>
    /// Model for chart data values
    /// </summary>
    public class ValuesForChartModel
    {
        public string category { get; set; }
        public decimal value { get; set; }
    }

    /// <summary>
    /// Model for country dropdown
    /// </summary>
    public class CountryModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
