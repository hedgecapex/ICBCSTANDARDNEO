import { randomUUID } from "node:crypto";
import { RequestHandler } from "express";
import { z } from "zod";
import { ensureSchema, pool } from "../db";
import { getSessionUser } from "./auth";

const applicationSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(7).max(40),
  accountType: z.enum(["Corporate account", "Personal account"]),
  country: z.string().trim().min(2).max(100),
  address: z.string().trim().min(5).max(300),
  sourceOfFunds: z.string().trim().min(2).max(100),
  intendedUse: z.string().trim().min(10).max(2000),
  documents: z.array(z.object({ type: z.string().min(1).max(60), fileName: z.string().min(1).max(255) })).min(3).max(10),
});

const reviewSchema = z.object({
  status: z.enum(["pending_review", "more_information", "approved", "denied"]),
  note: z.string().trim().max(2000).optional(),
});

export const submitApplication: RequestHandler = async (request, response) => {
  const parsed = applicationSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: "Complete all required application fields and documents." });
  if (!process.env.DATABASE_URL) return response.status(503).json({ message: "Onboarding is not configured yet." });
  try {
    await ensureSchema();
    const applicationId = randomUUID();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { documents, ...application } = parsed.data;
      await client.query(`INSERT INTO onboarding_applications (id, email, first_name, last_name, phone, account_type, country, address, source_of_funds, intended_use) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [applicationId, application.email, application.firstName, application.lastName, application.phone, application.accountType, application.country, application.address, application.sourceOfFunds, application.intendedUse]);
      for (const document of documents) await client.query("INSERT INTO onboarding_documents (id, application_id, document_type, file_name) VALUES ($1, $2, $3, $4)", [randomUUID(), applicationId, document.type, document.fileName]);
      await client.query("INSERT INTO notifications (id, application_id, recipient_email, subject, message) VALUES ($1, $2, $3, $4, $5)", [randomUUID(), applicationId, application.email, "Application received", "Your onboarding application has been received and is pending review."]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
    return response.status(201).json({ id: applicationId, status: "pending_review" });
  } catch (error) {
    console.error("Onboarding submission failed", error);
    return response.status(500).json({ message: "Unable to submit the application right now." });
  }
};

export const listApplications: RequestHandler = async (request, response) => {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") return response.status(403).json({ message: "Administrator access required." });
  try {
    const result = await pool.query(`SELECT a.id, a.email, a.first_name, a.last_name, a.phone, a.account_type, a.country, a.source_of_funds, a.intended_use, a.status, a.review_note, a.created_at, COALESCE(json_agg(json_build_object('type', d.document_type, 'fileName', d.file_name)) FILTER (WHERE d.id IS NOT NULL), '[]') AS documents FROM onboarding_applications a LEFT JOIN onboarding_documents d ON d.application_id = a.id GROUP BY a.id ORDER BY a.created_at DESC`);
    return response.json({ applications: result.rows });
  } catch (error) {
    console.error("Application listing failed", error);
    return response.status(500).json({ message: "Unable to load applications." });
  }
};

export const reviewApplication: RequestHandler = async (request, response) => {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") return response.status(403).json({ message: "Administrator access required." });
  const parsed = reviewSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: "Choose a valid review status." });
  try {
    const result = await pool.query("UPDATE onboarding_applications SET status = $1, review_note = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW() WHERE id = $4 RETURNING id, status, review_note", [parsed.data.status, parsed.data.note ?? null, user.id, request.params.id]);
    if (!result.rows[0]) return response.status(404).json({ message: "Application not found." });
    const subject = parsed.data.status === "approved" ? "Application approved" : parsed.data.status === "denied" ? "Application decision" : parsed.data.status === "more_information" ? "More information requested" : "Application status updated";
    const message = parsed.data.note ?? `Your onboarding application status is now ${parsed.data.status}.`;
    const applicant = await pool.query("SELECT email FROM onboarding_applications WHERE id = $1", [request.params.id]);
    if (applicant.rows[0]) await pool.query("INSERT INTO notifications (id, application_id, recipient_email, subject, message) VALUES ($1, $2, $3, $4, $5)", [randomUUID(), request.params.id, applicant.rows[0].email, subject, message]);
    return response.json({ application: result.rows[0] });
  } catch (error) {
    console.error("Application review failed", error);
    return response.status(500).json({ message: "Unable to update the application." });
  }
};
