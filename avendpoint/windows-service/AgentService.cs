using System;
using System.ServiceProcess;
using System.Timers;
using System.Diagnostics;
using System.IO;

namespace EndpointAgentService
{
    public partial class AgentService : ServiceBase
    {
        private ProcessManager _processManager;
        private PipeServer _pipeServer;
        private Timer _healthCheckTimer;
        private EventLog _eventLog;

        public AgentService()
        {
            ServiceName = "EndpointAgent";
            DisplayName = "Endpoint Agent";
            CanStop = true;
            CanPauseAndContinue = true;
            AutoLog = true;

            // Create event log if it doesn't exist
            if (!EventLog.SourceExists("EndpointAgent"))
            {
                EventLog.CreateEventSource("EndpointAgent", "Application");
            }

            _eventLog = new EventLog("Application");
            _eventLog.Source = "EndpointAgent";
        }

        protected override void OnStart(string[] args)
        {
            _eventLog.WriteEntry("Starting Endpoint Agent Service...", EventLogEntryType.Information);

            try
            {
                // Initialize process manager
                string nodeAppPath = GetConfigValue("NodeAppPath", "C:\\Program Files\\EndpointAgent\\avendpoint\\");
                string nodeExePath = GetConfigValue("NodeExePath", "C:\\Program Files\\EndpointAgent\\node.exe");
                _processManager = new ProcessManager(nodeExePath, nodeAppPath, _eventLog);

                // Start Node.js application
                _processManager.Start();
                _eventLog.WriteEntry("Node.js process started successfully.", EventLogEntryType.Information);

                // Initialize IPC pipe server
                _pipeServer = new PipeServer(_processManager, _eventLog);
                _pipeServer.Start();
                _eventLog.WriteEntry("Pipe server started successfully.", EventLogEntryType.Information);

                // Start health check timer
                int healthCheckInterval = GetConfigValueInt("HealthCheckIntervalSeconds", 30) * 1000;
                _healthCheckTimer = new Timer(healthCheckInterval);
                _healthCheckTimer.Elapsed += HealthCheck;
                _healthCheckTimer.AutoReset = true;
                _healthCheckTimer.Start();

                _eventLog.WriteEntry("Endpoint Agent Service started successfully.", EventLogEntryType.Information);
            }
            catch (Exception ex)
            {
                _eventLog.WriteEntry($"Service startup failed: {ex.Message}\n{ex.StackTrace}", EventLogEntryType.Error);
                throw;
            }
        }

        protected override void OnStop()
        {
            _eventLog.WriteEntry("Stopping Endpoint Agent Service...", EventLogEntryType.Information);

            try
            {
                if (_healthCheckTimer != null)
                {
                    _healthCheckTimer.Stop();
                    _healthCheckTimer.Dispose();
                }

                if (_pipeServer != null)
                {
                    _pipeServer.Stop();
                }

                if (_processManager != null)
                {
                    _processManager.Stop();
                }

                _eventLog.WriteEntry("Endpoint Agent Service stopped successfully.", EventLogEntryType.Information);
            }
            catch (Exception ex)
            {
                _eventLog.WriteEntry($"Service stop failed: {ex.Message}", EventLogEntryType.Error);
            }
        }

        private void HealthCheck(object sender, ElapsedEventArgs e)
        {
            try
            {
                if (_processManager != null && !_processManager.IsRunning)
                {
                    _eventLog.WriteEntry("Node.js process is not running. Attempting restart...", EventLogEntryType.Warning);
                    int restartDelaySeconds = GetConfigValueInt("RestartDelaySeconds", 5);
                    System.Threading.Thread.Sleep(restartDelaySeconds * 1000);
                    _processManager.Start();
                    _eventLog.WriteEntry("Node.js process restarted successfully.", EventLogEntryType.Information);
                }
            }
            catch (Exception ex)
            {
                _eventLog.WriteEntry($"Health check failed: {ex.Message}", EventLogEntryType.Error);
            }
        }

        private string GetConfigValue(string key, string defaultValue)
        {
            try
            {
                // Read from registry or app.config
                string value = System.Configuration.ConfigurationManager.AppSettings[key];
                return !string.IsNullOrEmpty(value) ? value : defaultValue;
            }
            catch
            {
                return defaultValue;
            }
        }

        private int GetConfigValueInt(string key, int defaultValue)
        {
            if (int.TryParse(GetConfigValue(key, defaultValue.ToString()), out int value))
            {
                return value;
            }
            return defaultValue;
        }
    }
}
