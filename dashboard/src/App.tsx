import { useEffect, useState } from "react";
import "./App.css";

import { getEndpoints } from "./services/api";
import type { Endpoint } from "./types/endpoint";

function App() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEndpoints() {
      try {
        const data = await getEndpoints();
        setEndpoints(data);
      } catch (error) {
        console.error("Failed to fetch endpoints:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEndpoints();

    const interval = setInterval(fetchEndpoints, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <h1>Endpoint Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Endpoint Dashboard</h1>

      <table className="endpoint-table">
        <thead>
          <tr>
            <th>Hostname</th>
            <th>OS</th>
            <th>Antivirus</th>
            <th>Version</th>
            <th>Status</th>
            <th>Last Seen</th>
          </tr>
        </thead>

        <tbody>
          {endpoints.map((endpoint) => (
            <tr key={endpoint.id}>
              <td>{endpoint.hostname}</td>

              <td>{endpoint.osName}</td>

              <td>{endpoint.antivirus?.productName ?? "Not Detected"}</td>

              <td>{endpoint.antivirus?.version ?? "Unknown"}</td>

              <td>
                <span className={`status ${endpoint.status.toLowerCase()}`}>
                  {endpoint.status}
                </span>
              </td>

              <td>{new Date(endpoint.lastSeen).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
