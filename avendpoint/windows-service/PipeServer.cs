using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Pipes;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Text;
using System.Text.Json;
using System.Threading;

namespace EndpointAgentService
{
    public class PipeServer
    {
        private const string PipeName = "EndpointAgent";
        private ProcessManager _processManager;
        private EventLog _eventLog;
        private bool _isRunning;
        private Thread _listenerThread;

        public PipeServer(ProcessManager processManager, EventLog eventLog)
        {
            _processManager = processManager;
            _eventLog = eventLog;
            _isRunning = false;
        }

        public void Start()
        {
            _isRunning = true;
            _listenerThread = new Thread(ListenForConnections);
            _listenerThread.Start();
            _eventLog.WriteEntry(
                "Pipe server listening on: " + PipeName,
                EventLogEntryType.Information
            );
        }

        public void Stop()
        {
            _isRunning = false;
            if (_listenerThread != null && _listenerThread.IsAlive)
            {
                _listenerThread.Join(5000);
            }
            _eventLog.WriteEntry("Pipe server stopped.", EventLogEntryType.Information);
        }

        private void ListenForConnections()
        {
            while (_isRunning)
            {
                try
                {
                    var pipeSecurity = new PipeSecurity();

                    pipeSecurity.AddAccessRule(
                        new PipeAccessRule(
                            new SecurityIdentifier(WellKnownSidType.AuthenticatedUserSid, null),
                            PipeAccessRights.FullControl,
                            AccessControlType.Allow
                        )
                    );

                    using var pipeServer = NamedPipeServerStreamAcl.Create(
                        PipeName,
                        PipeDirection.InOut,
                        NamedPipeServerStream.MaxAllowedServerInstances,
                        PipeTransmissionMode.Message,
                        PipeOptions.None,
                        1024,
                        1024,
                        pipeSecurity
                    );
                    {
                        pipeServer.WaitForConnection();
                        HandleClient(pipeServer);
                    }
                }
                catch (Exception ex)
                {
                    if (_isRunning)
                    {
                        _eventLog.WriteEntry(
                            $"Pipe server error: {ex.Message}",
                            EventLogEntryType.Error
                        );
                    }
                }
            }
        }

        private void HandleClient(NamedPipeServerStream pipeServer)
        {
            try
            {
                using (StreamReader reader = new StreamReader(pipeServer, Encoding.UTF8))
                using (StreamWriter writer = new StreamWriter(pipeServer, Encoding.UTF8))
                {
                    string command = reader.ReadLine();

                    string response = ProcessCommand(command);
                    writer.WriteLine(response);
                    writer.Flush();
                }
            }
            catch (Exception ex)
            {
                _eventLog.WriteEntry(
                    $"Error handling client: {ex.Message}",
                    EventLogEntryType.Error
                );
            }
        }

        private string ProcessCommand(string command)
        {
            try
            {
                return command?.ToUpper() switch
                {
                    "GET_STATUS" => GetStatusJson(),
                    "START_AGENT" => StartAgent(),
                    "STOP_AGENT" => StopAgent(),
                    "GET_UPTIME" => GetUptimeJson(),
                    _ => ErrorResponse("Unknown command: " + command),
                };
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        private string GetStatusJson()
        {
            var status = new
            {
                status = _processManager.IsRunning ? "RUNNING" : "STOPPED",
                uptime = _processManager.UptimeSeconds,
                processId = _processManager.ProcessId,
                lastError = (string)null,
            };
            return JsonSerializer.Serialize(status);
        }

        private string StartAgent()
        {
            try
            {
                if (_processManager.IsRunning)
                {
                    return SuccessResponse("Agent is already running");
                }

                _processManager.Start();
                return SuccessResponse("Agent started");
            }
            catch (Exception ex)
            {
                return ErrorResponse("Failed to start agent: " + ex.Message);
            }
        }

        private string StopAgent()
        {
            try
            {
                if (!_processManager.IsRunning)
                {
                    return SuccessResponse("Agent is not running");
                }

                _processManager.Stop();
                return SuccessResponse("Agent stopped");
            }
            catch (Exception ex)
            {
                return ErrorResponse("Failed to stop agent: " + ex.Message);
            }
        }

        private string GetUptimeJson()
        {
            var uptime = new { uptime = _processManager.UptimeSeconds };
            return JsonSerializer.Serialize(uptime);
        }

        private string SuccessResponse(string message)
        {
            var response = new { status = "SUCCESS", message };
            return JsonSerializer.Serialize(response);
        }

        private string ErrorResponse(string message)
        {
            var response = new { status = "ERROR", message };
            return JsonSerializer.Serialize(response);
        }
    }
}
