import { randomUUID } from "node:crypto";
import { pool, ensureSchema } from "./db";

export async function recordAudit(input: { actorUserId?: string; actorEmail?: string; action: string; entityType: string; entityId?: string; details?: Record<string, unknown> }) {
  await ensureSchema();
  await pool.query("INSERT INTO audit_logs (id, actor_user_id, actor_email, action, entity_type, entity_id, details) VALUES ($1,$2,$3,$4,$5,$6,$7)", [randomUUID(), input.actorUserId ?? null, input.actorEmail ?? null, input.action, input.entityType, input.entityId ?? null, JSON.stringify(input.details ?? {})]);
}
