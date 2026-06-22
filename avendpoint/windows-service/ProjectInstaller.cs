using System.Configuration.Install;
using System.ServiceProcess;

namespace EndpointAgentService
{
    [System.ComponentModel.RunInstaller(true)]
    public class ProjectInstaller : Installer
    {
        private ServiceProcessInstaller _serviceProcessInstaller;
        private ServiceInstaller _serviceInstaller;

        public ProjectInstaller()
        {
            _serviceProcessInstaller = new ServiceProcessInstaller();
            _serviceInstaller = new ServiceInstaller();

            // Run service as Local System account
            _serviceProcessInstaller.Account = ServiceAccount.LocalSystem;

            // Service configuration
            _serviceInstaller.ServiceName = "EndpointAgent";
            _serviceInstaller.DisplayName = "Endpoint Agent";
            _serviceInstaller.Description = "Antivirus endpoint information collection agent";
            _serviceInstaller.StartType = ServiceStartMode.Automatic;

            Installers.Add(_serviceProcessInstaller);
            Installers.Add(_serviceInstaller);
        }
    }
}
