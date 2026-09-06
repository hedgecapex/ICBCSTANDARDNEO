import "dotenv/config";
import express from "express";
import { handleDemo } from "./routes/demo";
import { dashboard, login, logout, register } from "./routes/auth";
import { listApplications, reviewApplication, submitApplication } from "./routes/onboarding";
import { listDeposits, reviewDeposit, submitDeposit } from "./routes/deposits";
import { listLoanApplications, reviewLoanApplication, submitLoanApplication } from "./routes/loans";
import { listDeliveries, listTemplates, updateTemplate } from "./routes/notifications";

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
  app.post("/api/onboarding/deposits", submitDeposit);
  app.get("/api/admin/deposits", listDeposits);
  app.patch("/api/admin/deposits/:id", reviewDeposit);
  app.post("/api/financing/applications", submitLoanApplication);
  app.get("/api/admin/financing/applications", listLoanApplications);
  app.patch("/api/admin/financing/applications/:id", reviewLoanApplication);
  app.get("/api/admin/notifications/templates", listTemplates);
  app.patch("/api/admin/notifications/templates/:id", updateTemplate);
  app.get("/api/admin/notifications/deliveries", listDeliveries);

  return app;
}
