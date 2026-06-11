import "dotenv/config";
import express from "express";
import cors from "cors";

import telemetryRoutes from "./routes/telemetry.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/telemetry", telemetryRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
