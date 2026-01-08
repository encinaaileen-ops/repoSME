using System.Web;
using System.Web.Optimization;

namespace BenefitNetFlex.Sample
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            // jQuery bundle
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            // jQuery validation
            bundles.Add(new ScriptBundle("~/plugins/validate").Include(
                        "~/Scripts/jquery.validate*"));

            // jQuery unobtrusive AJAX
            bundles.Add(new ScriptBundle("~/bundles/jqueryunobtrajax").Include(
                        "~/Scripts/jquery.unobtrusive-ajax.js"));

            // Bootstrap
            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.js"));

            // Common and custom scripts
            bundles.Add(new ScriptBundle("~/bundles/common").Include(
                      "~/Scripts/common.js"));

            // BNetFlex custom bundle
            bundles.Add(new ScriptBundle("~/bundles/bnetflex").Include(
                      "~/Scripts/common.js",
                      "~/Scripts/swalExtend.js"));

            // Kendo UI Core
            bundles.Add(new ScriptBundle("~/bundles/kendo").Include(
                        "~/Scripts/libraries/kendo/2019.1.220/kendo.all.min.js",
                        "~/Scripts/libraries/kendo/2019.1.220/kendo.aspnetmvc.min.js"));

            // Kendo datasource extension
            bundles.Add(new ScriptBundle("~/bundles/kendoo_datasource_extension").Include(
                        "~/Scripts/custom/common/kendoo.datasource.extension.js"));

            // Day.js
            bundles.Add(new ScriptBundle("~/bundles/dayjs").Include(
                      "~/Scripts/dayjs.min.js"));

            // Knockout
            bundles.Add(new ScriptBundle("~/bundles/knockout").Include(
                      "~/Scripts/knockout-{version}.js"));

            // SignalR
            bundles.Add(new ScriptBundle("~/bundles/signalr").Include(
                      "~/Scripts/jquery.signalR-{version}.js"));

            // Inspinia theme scripts
            bundles.Add(new ScriptBundle("~/bundles/inspinia").Include(
                      "~/Scripts/inspinia.js",
                      "~/Scripts/app.js"));

            // Inspinia with MetisMenu
            bundles.Add(new ScriptBundle("~/bundles/inspiniaMetisMenu").Include(
                      "~/Scripts/plugins/metisMenu/metisMenu.min.js"));

            // Pace
            bundles.Add(new ScriptBundle("~/bundles/inspiniaPace").Include(
                      "~/Scripts/plugins/pace/pace.min.js"));

            // Skin config
            bundles.Add(new ScriptBundle("~/bundles/skinConfig").Include(
                      "~/Scripts/app/skin.config.min.js"));

            // Other bundle
            bundles.Add(new ScriptBundle("~/bundles/other").Include(
                      "~/Scripts/plugins/typehead/bootstrap3-typeahead.min.js"));

            // Plugin bundles
            bundles.Add(new ScriptBundle("~/plugins/slimScroll").Include(
                      "~/Scripts/plugins/slimscroll/jquery.slimscroll.min.js"));

            bundles.Add(new ScriptBundle("~/plugins/iCheck").Include(
                      "~/Scripts/plugins/iCheck/icheck.min.js"));

            bundles.Add(new ScriptBundle("~/plugins/flot").Include(
                      "~/Scripts/plugins/flot/jquery.flot.js",
                      "~/Scripts/plugins/flot/jquery.flot.tooltip.min.js",
                      "~/Scripts/plugins/flot/jquery.flot.resize.js",
                      "~/Scripts/plugins/flot/jquery.flot.pie.js",
                      "~/Scripts/plugins/flot/jquery.flot.time.js"));

            bundles.Add(new ScriptBundle("~/plugins/vectorMap").Include(
                      "~/Scripts/plugins/jvectormap/jquery-jvectormap-1.2.2.min.js",
                      "~/Scripts/plugins/jvectormap/jquery-jvectormap-world-mill-en.js"));

            // jQuery Idle Timeout
            bundles.Add(new ScriptBundle("~/bundles/jqueryIdleTimeout").Include(
                      "~/Scripts/plugins/jquery-idleTimeout/store.min.js",
                      "~/Scripts/plugins/jquery-idleTimeout/jquery-idleTimeout.min.js"));

            // CSS Styles
            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/flex/bootstrap.min.css",
                      "~/Content/animate.css",
                      "~/Content/style.css",
                      "~/Content/custom/motornet.css"));

            // Kendo CSS - Nova theme (matching reference BenefitNetFlex project)
            bundles.Add(new StyleBundle("~/Content/kendo/css").Include(
                      "~/Content/libraries/kendo/2019.1.220/kendo.common-nova.core.min.css",
                      "~/Content/libraries/kendo/2019.1.220/kendo.common-nova.min.css",
                      "~/Content/libraries/kendo/2019.1.220/kendo.nova.min.css",
                      "~/Content/libraries/kendo/2019.1.220/kendo.dataviz.min.css"));

            // Font Awesome
            bundles.Add(new StyleBundle("~/font-awesome/css").Include(
                      "~/Fonts/font-awesome/css/font-awesome.css"));

            // iCheck styles
            bundles.Add(new StyleBundle("~/plugins/iCheckStyles").Include(
                      "~/Content/plugins/iCheck/custom.css"));

            // jQuery Idle Timeout CSS
            bundles.Add(new StyleBundle("~/Content/jqueryIdleTimeout/css").Include(
                      "~/Scripts/plugins/jquery-idleTimeout/main.css"));

            // Sarabun Font CSS
            bundles.Add(new StyleBundle("~/Content/Sarabun/css").Include(
                      "~/Content/fonts/Sarabun/css/sarabun.css"));
        }
    }
}