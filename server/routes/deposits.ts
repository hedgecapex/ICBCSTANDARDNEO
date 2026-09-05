import { randomUUID } from "node:crypto";
import { RequestHandler } from "express";
import { z } from "zod";
import { ensureSchema, pool } from "../db";
import { getSessionUser } from "./auth";

const depositSchema = z.object({
  applicationId: z.string().trim().min(1).max(100),
  applicantEmail: z.string().trim().toLowerCase().email(),
  amount: z.coerce.number().positive().max(1000000000),
  currency: z.string().trim().length(3).toUpperCase(),
  proofFileName: z.string().trim().min(1).max(255),
});

const reviewSchema = z.object({ status: z.enum(["pending", "verified", "rejected"]), note: z.string().trim().max(2000).optional() });

export const submitDeposit: RequestHandler = async (request, response) => {
  const parsed = depositSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: "Provide the deposit amount and payment-proof details." });
  if (!process.env.DATABASE_URL) return response.status(503).json({ message: "Deposit verification is not configured yet." });
  try {
    await ensureSchema();
    const application = await pool.query("SELECT id, email, status FROM onboarding_applications WHERE id = $1 AND lower(email) = $2", [parsed.data.applicationId, parsed.data.applicantEmail]);
    if (!application.rows[0]) return response.status(404).json({ message: "Application not found." });
    const id = randomUUID();
    await pool.query("INSERT INTO opening_deposits (id, application_id, applicant_email, amount, currency, proof_file_name) VALUES ($1,$2,$3,$4,$5,$6)", [id, parsed.data.applicationId, parsed.data.applicantEmail, parsed.data.amount, parsed.data.currency, parsed.data.proofFileName]);
    return response.status(201).json({ id, status: "pending" });
  } catch (error) {
    console.error("Deposit submission failed", error);
    return response.status(500).json({ message: "Unable to submit the deposit proof right now." });
  }
};

export const listDeposits: RequestHandler = async (request, response) => {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") return response.status(403).json({ message: "Administrator access required." });
  try {
    const result = await pool.query("SELECT id, application_id, applicant_email, amount, currency, proof_file_name, status, review_note, created_at FROM opening_deposits ORDER BY created_at DESC");
    return response.json({ deposits: result.rows });
  } catch (error) {
    console.error("Deposit listing failed", error);
    return response.status(500).json({ message: "Unable to load deposits." });
  }
};

export const reviewDeposit: RequestHandler = async (request, response) => {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") return response.status(403).json({ message: "Administrator access required." });
  const parsed = reviewSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: "Choose a valid deposit status." });
  try {
    const result = await pool.query("UPDATE opening_deposits SET status = $1, review_note = $2, reviewed_by = $3, reviewed_at = NOW() WHERE id = $4 RETURNING id, status, review_note", [parsed.data.status, parsed.data.note ?? null, user.id, request.params.id]);
    if (!result.rows[0]) return response.status(404).json({ message: "Deposit not found." });
    return response.json({ deposit: result.rows[0] });
  } catch (error) {
    console.error("Deposit review failed", error);
    return response.status(500).json({ message: "Unable to update the deposit." });
  }
};
