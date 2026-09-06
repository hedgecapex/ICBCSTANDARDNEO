import { RequestHandler } from "express";
import { z } from "zod";
import { ensureSchema, pool } from "../db";
import { getSessionUser } from "./auth";

const templateSchema = z.object({ name: z.string().trim().min(2).max(120), subject: z.string().trim().min(2).max(200), body: z.string().trim().min(10).max(5000), enabled: z.boolean() });

export const listTemplates: RequestHandler = async (request, response) => {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") return response.status(403).json({ message: "Administrator access required." });
  try { await ensureSchema(); const result = await pool.query("SELECT id, event_key, name, subject, body, enabled, updated_at FROM notification_templates ORDER BY name"); return response.json({ templates: result.rows }); } catch (error) { console.error("Notification template listing failed", error); return response.status(500).json({ message: "Unable to load notification templates." }); }
};

export const updateTemplate: RequestHandler = async (request, response) => {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") return response.status(403).json({ message: "Administrator access required." });
  const parsed = templateSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: "Provide a valid notification template." });
  try { const result = await pool.query("UPDATE notification_templates SET name=$1, subject=$2, body=$3, enabled=$4, updated_at=NOW() WHERE id=$5 RETURNING id, event_key, name, subject, body, enabled, updated_at", [parsed.data.name, parsed.data.subject, parsed.data.body, parsed.data.enabled, request.params.id]); if (!result.rows[0]) return response.status(404).json({ message: "Notification template not found." }); return response.json({ template: result.rows[0] }); } catch (error) { console.error("Notification template update failed", error); return response.status(500).json({ message: "Unable to update notification template." }); }
};

export const listDeliveries: RequestHandler = async (request, response) => {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") return response.status(403).json({ message: "Administrator access required." });
  try { const result = await pool.query("SELECT id, recipient_email, subject, status, error_message, created_at, sent_at FROM notification_deliveries ORDER BY created_at DESC LIMIT 100"); return response.json({ deliveries: result.rows }); } catch (error) { console.error("Notification delivery listing failed", error); return response.status(500).json({ message: "Unable to load notification deliveries." }); }
};
