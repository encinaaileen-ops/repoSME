using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using BenefitNetFlex.Sample.Models;

namespace BenefitNetFlex.Sample.Controllers
{
    public class AccountController : Controller
    {
        // Dummy users for testing - In production, this would come from a database
        private static readonly Dictionary<string, string> TestUsers = new Dictionary<string, string>
        {
            { "admin", "admin123" },
            { "user1", "password1" },
            { "demo", "demo123" },
            { "test", "test123" }
        };

        // GET: Account/Login
        [AllowAnonymous]
        public ActionResult Login(string returnUrl)
        {
            ViewBag.ReturnUrl = returnUrl;
            return View(new LoginModel { ReturnUrl = returnUrl });
        }

        // POST: Account/Login
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult Login(LoginModel model)
        {
            if (ModelState.IsValid)
            {
                // Check if user exists in our dummy data
                if (TestUsers.ContainsKey(model.UserName) && TestUsers[model.UserName] == model.Password)
                {
                    // Create authentication ticket
                    FormsAuthentication.SetAuthCookie(model.UserName, model.RememberMe);

                    // Store username in session
                    Session["Username"] = model.UserName;
                    Session["UserDisplayName"] = char.ToUpper(model.UserName[0]) + model.UserName.Substring(1);

                    // Redirect to return URL or home
                    if (!string.IsNullOrEmpty(model.ReturnUrl) && Url.IsLocalUrl(model.ReturnUrl))
                    {
                        return Redirect(model.ReturnUrl);
                    }
                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    ModelState.AddModelError("", "Invalid username or password");
                    model.ErrorMessage = "Invalid username or password";
                }
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        // GET: Account/Logout
        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            Session.Clear();
            Session.Abandon();
            return RedirectToAction("Login", "Account");
        }

        // GET/POST: Account/LogOff (Alias for Logout for compatibility)
        [HttpGet]
        [HttpPost]
        public ActionResult LogOff()
        {
            FormsAuthentication.SignOut();
            Session.Clear();
            Session.Abandon();
            return RedirectToAction("Login", "Account");
        }

        // GET: Account/AccessDenied
        public ActionResult AccessDenied()
        {
            ViewBag.Message = "You do not have access to this resource.";
            return View();
        }

        // GET: Account/GetTestCredentials (Helper for displaying test credentials)
        [AllowAnonymous]
        public JsonResult GetTestCredentials()
        {
            var credentials = new List<object>();
            foreach (var user in TestUsers)
            {
                credentials.Add(new { username = user.Key, password = user.Value });
            }
            return Json(credentials, JsonRequestBehavior.AllowGet);
        }
    }
}