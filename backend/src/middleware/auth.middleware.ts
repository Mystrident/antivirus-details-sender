import { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "crypto";

export function verifyAgent(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.header("x-agent-key");

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "Missing API key",
    });
  }

  

  const expectedKey = process.env.AGENT_API_KEY ?? "";
  const provided = Buffer.from(apiKey);
  const expected = Buffer.from(expectedKey);

  const isValid =
    provided.length === expected.length &&
    timingSafeEqual(provided, expected);

  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid API key",
    });
  }

  next();
}
