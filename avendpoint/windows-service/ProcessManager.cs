using System;
using System.Diagnostics;
using System.IO;
using System.Management;

namespace EndpointAgentService
{
    public class ProcessManager
    {
        private string _nodeExePath;
        private string _nodeAppPath;
        private EventLog _eventLog;
        private Process _nodeProcess;
        private object _lockObj = new object();

        private static string? GetCommandLine(Process process)
        {
            try
            {
                using var searcher = new ManagementObjectSearcher(
                    $"SELECT CommandLine FROM Win32_Process WHERE ProcessId = {process.Id}"
                );

                foreach (ManagementObject obj in searcher.Get())
                {
                    return obj["CommandLine"]?.ToString();
                }
            }
            catch
            {
                // Handle or log exception if needed
            }

            return null;
        }

        public bool IsRunning
        {
            get
            {
                lock (_lockObj)
                {
                    return _nodeProcess != null && !_nodeProcess.HasExited;
                }
            }
        }

        public int ProcessId
        {
            get
            {
                lock (_lockObj)
                {
                    return _nodeProcess?.Id ?? 0;
                }
            }
        }

        public long UptimeSeconds
        {
            get
            {
                lock (_lockObj)
                {
                    try
                    {
                        if (_nodeProcess == null || _nodeProcess.HasExited)
                            return 0;

                        return (long)(DateTime.Now - _nodeProcess.StartTime).TotalSeconds;
                    }
                    catch
                    {
                        // StartTime throws InvalidOperationException if process has exited
                        return 0;
                    }
                }
            }
        }

        public bool IsHealthy()
        {
            if (!IsRunning)
                return false;

            try
            {
                string heartbeatFile = Path.Combine(_nodeAppPath, "heartbeat.txt");

                if (!File.Exists(heartbeatFile))
                    return false;

                string content = File.ReadAllText(heartbeatFile).Trim();

                if (!long.TryParse(content, out long timestamp))
                {
                    _eventLog.WriteEntry(
                        "Heartbeat file contained invalid data.",
                        EventLogEntryType.Warning
                    );
                    return false;
                }

                long age = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - timestamp;
                return age < TimeSpan.FromMinutes(5).TotalMilliseconds;
            }
            catch (Exception ex)
            {
                _eventLog.WriteEntry(
                    $"Health check failed: {ex.Message}",
                    EventLogEntryType.Warning
                );
                return false;
            }
        }

        public ProcessManager(string nodeExePath, string nodeAppPath, EventLog eventLog)
        {
            _nodeExePath = nodeExePath;
            _nodeAppPath = nodeAppPath;
            _eventLog = eventLog;
            _nodeProcess = null;
        }

        public void Start()
        {
            lock (_lockObj)
            {
                if (IsRunning)
                {
                    _eventLog.WriteEntry(
                        "Node.js process is already running.",
                        EventLogEntryType.Information
                    );
                    return;
                }

                try
                {
                    if (!File.Exists(_nodeExePath))
                        throw new FileNotFoundException(
                            $"Node executable not found: {_nodeExePath}"
                        );

                    if (!Directory.Exists(_nodeAppPath))
                        throw new DirectoryNotFoundException(
                            $"App directory not found: {_nodeAppPath}"
                        );

                    KillExistingProcess();

                    ProcessStartInfo psi = new ProcessStartInfo
                    {
                        FileName = _nodeExePath,
                        Arguments = "dist/index.js",
                        WorkingDirectory = _nodeAppPath,
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        CreateNoWindow = true,
                        WindowStyle = ProcessWindowStyle.Hidden,
                    };

                    _nodeProcess = new Process { StartInfo = psi };
                    _nodeProcess.OutputDataReceived += (s, e) => LogProcessOutput(e.Data);
                    _nodeProcess.ErrorDataReceived += (s, e) => LogProcessError(e.Data);

                    _nodeProcess.Start();
                    _eventLog.WriteEntry(
                        $"Started node PID {_nodeProcess.Id}",
                        EventLogEntryType.Information
                    );

                    _nodeProcess.BeginOutputReadLine();
                    _nodeProcess.BeginErrorReadLine();

                    _eventLog.WriteEntry(
                        $"Node.js process started. PID: {_nodeProcess.Id}",
                        EventLogEntryType.Information
                    );
                }
                catch (Exception ex)
                {
                    _eventLog.WriteEntry(
                        $"Failed to start Node.js process: {ex.Message}",
                        EventLogEntryType.Error
                    );
                    throw;
                }
            }
        }

        public void Stop()
        {
            lock (_lockObj)
            {
                if (!IsRunning)
                {
                    _eventLog.WriteEntry(
                        "Node.js process is not running.",
                        EventLogEntryType.Information
                    );
                    return;
                }

                try
                {
                    // Signal graceful shutdown before waiting, its just mimicking, does not implement sigterm yet
                    _nodeProcess.CloseMainWindow();

                    int timeoutSeconds = 10;
                    if (!_nodeProcess.WaitForExit(timeoutSeconds * 1000))
                    {
                        _eventLog.WriteEntry(
                            "Node.js process did not exit in time. Force terminating.",
                            EventLogEntryType.Warning
                        );

                        _nodeProcess.Kill(true);
                        _nodeProcess.WaitForExit(5000);
                    }

                    _nodeProcess.Dispose();
                    _nodeProcess = null;

                    _eventLog.WriteEntry(
                        "Node.js process stopped successfully.",
                        EventLogEntryType.Information
                    );
                }
                catch (Exception ex)
                {
                    _eventLog.WriteEntry(
                        $"Error stopping Node.js process: {ex.Message}",
                        EventLogEntryType.Error
                    );
                }
            }
        }

        public void Restart()
        {
            // Do NOT lock here — Stop() and Start() each acquire _lockObj internally.
            // Locking here would cause a deadlock since this thread already holds the lock.
            Stop();
            System.Threading.Thread.Sleep(2000);
            Start();
        }

        private void KillExistingProcess()
        {
            try
            {
                // Kill the currently tracked instance
                if (_nodeProcess != null && !_nodeProcess.HasExited)
                {
                    _nodeProcess.Kill(true);
                    _nodeProcess.WaitForExit(5000);
                }

                // Kill any orphaned node processes running from our app directory
                // Kill any orphaned EndpointAgent node processes
                foreach (var p in Process.GetProcessesByName("node"))
                {
                    try
                    {
                        string? cmd = GetCommandLine(p);

                        if (
                            cmd != null
                            && cmd.Contains("dist/index.js", StringComparison.OrdinalIgnoreCase)
                        )
                        {
                            _eventLog.WriteEntry(
                                $"Killing orphaned node process. PID={p.Id}",
                                EventLogEntryType.Information
                            );

                            p.Kill(true);
                            p.WaitForExit(5000);
                        }
                    }
                    catch (Exception ex)
                    {
                        _eventLog.WriteEntry(
                            $"Failed to inspect node PID {p.Id}: {ex.Message}",
                            EventLogEntryType.Warning
                        );
                    }
                }
            }
            catch (Exception ex)
            {
                _eventLog.WriteEntry(
                    $"Failed to terminate previous process: {ex.Message}",
                    EventLogEntryType.Warning
                );
            }
        }

        private void LogProcessOutput(string data)
        {
            if (!string.IsNullOrEmpty(data))
            {
                if (data.Contains("error") || data.Contains("Error") || data.Contains("ERROR"))
                {
                    _eventLog.WriteEntry($"[Node.js] {data}", EventLogEntryType.Warning);
                }
            }
        }

        private void LogProcessError(string data)
        {
            if (!string.IsNullOrEmpty(data))
            {
                _eventLog.WriteEntry($"[Node.js Error] {data}", EventLogEntryType.Error);
            }
        }
    }
}
