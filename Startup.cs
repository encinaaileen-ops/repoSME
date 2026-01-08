using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(BenefitNetFlex.Sample.Startup))]

namespace BenefitNetFlex.Sample
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // Enable SignalR
            app.MapSignalR();
        }
    }
}