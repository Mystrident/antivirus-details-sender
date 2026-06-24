using System;
using System.IO.Pipes;
using System.Text;
using System.IO;

namespace EndpointTrayManager
{
    public class PipeClient
    {
        private const string PipeName = "EndpointAgent";
        private const string ServerName = "."; // Local machine

        public string SendCommand(string command)
        {
            try
            {
                using var pipeClient = new NamedPipeClientStream(
    ServerName,
    PipeName,
    PipeDirection.InOut);
                {
                    // Try to connect with timeout
                    pipeClient.Connect(5000); // 5 second timeout

                    using (StreamReader reader = new StreamReader(pipeClient, Encoding.UTF8))
                    using (StreamWriter writer = new StreamWriter(pipeClient, Encoding.UTF8))
                    {
                        writer.WriteLine(command);
                        writer.Flush();

                        string response = reader.ReadLine();
                        return response ?? "No response";
                    }
                }
            }
            catch (TimeoutException)
            {
                throw new Exception("Service is not responding. Please ensure the Endpoint Agent Service is running.");
            }
            catch (IOException)
            {
                throw new Exception("Cannot connect to service. Is the Endpoint Agent Service installed and running?");
            }
            catch (Exception ex)
            {
                throw new Exception($"Communication error: {ex.Message}");
            }
        }
    }
}
