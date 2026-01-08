using System;
using System.Web.Mvc;

namespace BenefitNetFlex.Sample.Controllers
{
    [Authorize]
    public class UserController : BaseController
    {
        // POST: User/UpdateRecordUserActivityTime
        [HttpPost]
        public ActionResult UpdateRecordUserActivityTime()
        {
            try
            {
                // Update user's last activity timestamp
                // In a real application, this would update the user's activity in the database
                Session["LastActivityTime"] = DateTime.Now;

                return Json(new { success = true, timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        // GET: User/GetIdleTime
        [HttpGet]
        public ActionResult GetIdleTime()
        {
            try
            {
                var lastActivity = Session["LastActivityTime"] as DateTime?;
                if (lastActivity.HasValue)
                {
                    var idleMinutes = (DateTime.Now - lastActivity.Value).TotalMinutes;
                    return Json(new { idleTime = idleMinutes }, JsonRequestBehavior.AllowGet);
                }

                return Json(new { idleTime = 0 }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { error = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        // POST: User/Logout
        [HttpPost]
        public ActionResult Logout()
        {
            Session.Clear();
            Session.Abandon();
            System.Web.Security.FormsAuthentication.SignOut();

            return Json(new { success = true, redirectUrl = Url.Action("Login", "Account") });
        }
    }
}