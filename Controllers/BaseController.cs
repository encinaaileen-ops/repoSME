using System;
using System.Web.Mvc;

namespace BenefitNetFlex.Sample.Controllers
{
    /// <summary>
    /// Base controller for all controllers in the sample application
    /// PATTERN: All controllers should inherit from this base controller
    /// </summary>
    [Authorize]
    public class BaseController : Controller
    {
        // SAMPLE: Add common properties and methods shared across controllers
        // Example: User context, logging, common error handling

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            // SAMPLE: Add common pre-action logic here
            // Example: Set ViewBag properties, check user session, log requests

            // Set current user information from authentication
            if (User.Identity.IsAuthenticated)
            {
                ViewBag.CurrentUser = User.Identity.Name;
                ViewBag.UserDisplayName = Session["UserDisplayName"] ?? User.Identity.Name;
            }
            else
            {
                ViewBag.CurrentUser = "Guest";
                ViewBag.UserDisplayName = "Guest";
            }

            ViewBag.CurrentTime = DateTime.Now;
            ViewBag.IsAuthenticated = User.Identity.IsAuthenticated;

            base.OnActionExecuting(filterContext);
        }

        protected override void OnException(ExceptionContext filterContext)
        {
            // SAMPLE: Add global exception handling logic
            // In production, log to your logging framework

            base.OnException(filterContext);
        }

        /// <summary>
        /// Helper method to return JSON result with proper settings
        /// </summary>
        protected JsonResult JsonResponse(object data, bool success = true, string message = "")
        {
            return Json(new
            {
                success = success,
                message = message,
                data = data,
                timestamp = DateTime.UtcNow
            }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Set common alert messages using TempData
        /// </summary>
        protected void SetAlert(string message, string type = "info")
        {
            TempData["AlertMessage"] = message;
            TempData["AlertType"] = type; // success, info, warning, danger
        }
    }
}