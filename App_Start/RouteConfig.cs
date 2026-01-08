using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace BenefitNetFlex.Sample
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            // Explicit route for LogOff action
            routes.MapRoute(
                name: "LogOff",
                url: "Account/LogOff",
                defaults: new { controller = "Account", action = "LogOff" }
            );

            // SAMPLE: Custom route for detail pages
            routes.MapRoute(
                name: "Details",
                url: "record/{id}/details",
                defaults: new { controller = "SampleDetail", action = "Details" },
                constraints: new { id = @"\d+" }
            );

            // SAMPLE: Custom route for list pages
            routes.MapRoute(
                name: "List",
                url: "list/{category}",
                defaults: new { controller = "SampleList", action = "Index", category = UrlParameter.Optional }
            );

            // SAMPLE: Custom route for forms
            routes.MapRoute(
                name: "Form",
                url: "form/{action}/{id}",
                defaults: new { controller = "SampleForm", action = "Create", id = UrlParameter.Optional }
            );

            // Default route
            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}