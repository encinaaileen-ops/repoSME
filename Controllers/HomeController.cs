using System.Web.Mvc;

namespace BenefitNetFlex.Sample.Controllers
{
    /// <summary>
    /// Main entry point controller
    /// </summary>
    public class HomeController : BaseController
    {
        // SAMPLE: Main landing page after login
        public ActionResult Index()
        {
            ViewBag.Description = "Welcome to BenefitNetFlex";

            // Dashboard requires authentication
            if (!User.Identity.IsAuthenticated)
                return RedirectToAction("Login", "Account");

            return View("Dashboard");
        }

        // SAMPLE: About page demonstrating static content
        public ActionResult About()
        {
            ViewBag.Header = "About This Sample";
            ViewBag.Message = "This is a scaffold project for rapid prototyping.";

            return View();
        }

        // SAMPLE: Contact page with form example
        public ActionResult Contact()
        {
            ViewBag.Header = "Contact Us";
            ViewBag.Message = "Your contact page.";

            return View();
        }

        // SAMPLE: Empty layout for testing
        public ActionResult Blank()
        {
            return View();
        }
    }
}