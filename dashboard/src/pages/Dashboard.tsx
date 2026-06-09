import { useEffect, useState } from "react";

import { getEndpoints } from "../services/api";

export default function Dashboard() {
  const [endpoints, setEndpoints] = useState([]);

  useEffect(() => {
    getEndpoints().then(setEndpoints);
  }, []);

  return (
    <div>
      <h1>Endpoints</h1>

      <pre>{JSON.stringify(endpoints, null, 2)}</pre>
    </div>
  );
}
