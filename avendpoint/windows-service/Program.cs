using System;
using System.Diagnostics;
using System.ServiceProcess;
using System.Configuration.Install;
using System.Reflection;

namespace EndpointAgentService
{
    static class Program
    {
        static void Main(string[] args)
        {
            if (args.Length > 0)
            {
                switch (args[0].ToLower())
                {
                    case "install":
                        InstallService();
                        break;
                    case "uninstall":
                        UninstallService();
                        break;
                    case "debug":
                        // Run service in console for debugging
                        ServiceBase[] servicesToRun = new ServiceBase[] { new AgentService() };
                        ServiceBase.Run(servicesToRun);
                        break;
                    default:
                        Console.WriteLine("Usage: EndpointAgentService [install|uninstall|debug]");
                        break;
                }
            }
            else
            {
                // Normal service start
                ServiceBase[] servicesToRun = new ServiceBase[] { new AgentService() };
                ServiceBase.Run(servicesToRun);
            }
        }

        private static void InstallService()
        {
            try
            {
                ManagedInstallerClass.InstallHelper(new string[] { Assembly.GetExecutingAssembly().Location });
                Console.WriteLine("Service installed successfully.");
                EventLog.WriteEntry("EndpointAgent", "Service installed successfully.", EventLogEntryType.Information);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Installation failed: {ex.Message}");
                EventLog.WriteEntry("EndpointAgent", $"Installation failed: {ex.Message}", EventLogEntryType.Error);
            }
        }

        private static void UninstallService()
        {
            try
            {
                ManagedInstallerClass.InstallHelper(new string[] { "/u", Assembly.GetExecutingAssembly().Location });
                Console.WriteLine("Service uninstalled successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Uninstallation failed: {ex.Message}");
            }
        }
    }
}
