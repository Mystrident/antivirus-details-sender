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

            // "sc stop" only *requests* a stop and returns almost immediately —
            // it does not wait for the service to actually reach STOPPED. Our
            // OnStop() handler kills the Node child process (with up to a ~15s
            // graceful-then-force-kill sequence), so without this wait, "sc
            // delete" below — and Inno's subsequent file cleanup — can run
            // while node.exe is still being torn down in the background,
            // leading to leftover processes or "file in use" errors.
            WaitForStopped("EndpointAgent", TimeSpan.FromSeconds(30));

            RunSc("delete EndpointAgent");
        }

        /// <summary>
        /// Blocks until the given service reports Stopped, or the timeout
        /// elapses. Returns immediately (treated as "done") if the service
        /// no longer exists at all, since that's the end state we want.
        /// </summary>
        private static void WaitForStopped(string serviceName, TimeSpan timeout)
        {
            var sw = Stopwatch.StartNew();

            while (sw.Elapsed < timeout)
            {
                try
                {
                    using var sc = new ServiceController(serviceName);
                    sc.Refresh();

                    if (sc.Status == ServiceControllerStatus.Stopped)
                    {
                        return;
                    }
                }
                catch (InvalidOperationException)
                {
                    // Service isn't registered (already deleted, or the
                    // "create" call earlier never succeeded) — nothing to
                    // wait for.
                    return;
                }

                System.Threading.Thread.Sleep(500);
            }

            Console.WriteLine(
                $"Warning: {serviceName} did not report Stopped within {timeout.TotalSeconds}s; proceeding anyway."
            );
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
