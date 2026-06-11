import axios from "axios";

export async function getEndpoints() {
  const response = await axios.get(
    "http://localhost:3000/api/telemetry/endpoints",
  );

  return response.data;
}
