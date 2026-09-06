import { RequestHandler } from "express";
import { getSessionUser } from "./auth";
import { ensureSchema, pool } from "../db";

export const listAuditLogs: RequestHandler = async (request, response) => {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") return response.status(403).json({ message: "Administrator access required." });
  try {
    await ensureSchema();
    const result = await pool.query("SELECT id, actor_email, action, entity_type, entity_id, details, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 200");
    return response.json({ logs: result.rows });
  } catch (error) {
    console.error("Audit log listing failed", error);
    return response.status(500).json({ message: "Unable to load the audit log." });
  }
};
