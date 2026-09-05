import "dotenv/config";
import express from "express";
import { handleDemo } from "./routes/demo";
import { dashboard, login, logout, register } from "./routes/auth";
import { listApplications, reviewApplication, submitApplication } from "./routes/onboarding";

export function createServer() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.post("/api/auth/logout", logout);
  app.get("/api/auth/dashboard", dashboard);
  app.post("/api/onboarding/applications", submitApplication);
  app.get("/api/admin/applications", listApplications);
  app.patch("/api/admin/applications/:id", reviewApplication);

  return app;
}
