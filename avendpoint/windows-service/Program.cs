using System;
using System.Diagnostics;
using System.ServiceProcess;

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
                        var service = new AgentService();
                        service.DebugStart();
                        break;
                    default:
                        Console.WriteLine("Usage: EndpointAgentService [install|uninstall|debug]");
                        break;
                }
            }
            else
            {
                ServiceBase[] servicesToRun = new ServiceBase[] { new AgentService() };
                ServiceBase.Run(servicesToRun);
            }
        }

        private static void InstallService()
        {
            string exePath = Process.GetCurrentProcess().MainModule!.FileName!;

            RunSc(
                $"create EndpointAgent start= auto binPath= \"{exePath}\" DisplayName= \"Endpoint Agent\""
            );

            RunSc("description EndpointAgent \"Antivirus endpoint information collection agent\"");

            RunSc(
                "failure EndpointAgent reset= 86400 actions= restart/5000/restart/5000/restart/5000"
            );

            RunSc("start EndpointAgent");
        }

        private static void UninstallService()
        {
            RunSc("stop EndpointAgent");
            RunSc("delete EndpointAgent");
        }

        private static void RunSc(string arguments)
        {
            var psi = new ProcessStartInfo
            {
                FileName = "sc.exe",
                Arguments = arguments,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true,
            };

            using var process = Process.Start(psi);
            string output = process.StandardOutput.ReadToEnd();
            string error = process.StandardError.ReadToEnd();
            process.WaitForExit();

            if (!string.IsNullOrWhiteSpace(output))
                Console.WriteLine(output);
            if (!string.IsNullOrWhiteSpace(error))
                Console.WriteLine("Error: " + error);
        }
    }
}
