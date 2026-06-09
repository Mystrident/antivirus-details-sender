import express from "express";
import cors from "cors";

import telemetryRoutes from "./routes/telemetry.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/api/telemetry", telemetryRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
