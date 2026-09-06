import { randomUUID } from "node:crypto";
import { RequestHandler } from "express";
import { z } from "zod";
import { ensureSchema, pool } from "../db";
import { getSessionUser } from "./auth";

const loanSchema = z.object({
  applicantEmail: z.string().trim().toLowerCase().email(),
  market: z.string().trim().min(2).max(80),
  projectName: z.string().trim().min(2).max(200),
  requestedAmount: z.coerce.number().positive(),
  currency: z.string().trim().length(3).toUpperCase(),
  requestedTerm: z.string().trim().min(2).max(60),
  downPaymentPercent: z.coerce.number().min(0).max(100),
  purpose: z.string().trim().min(10).max(3000),
  collateralType: z.string().trim().min(2).max(120),
  collateralValue: z.coerce.number().positive(),
  collateralCurrency: z.string().trim().length(3).toUpperCase(),
  closingCostPercent: z.coerce.number().min(0).max(100),
  collateralNotes: z.string().trim().min(5).max(3000),
  documents: z.array(z.object({ type: z.string().min(1).max(100), fileName: z.string().min(1).max(255) })).min(3).max(10),
});

const reviewSchema = z.object({
  status: z.enum(["pending_review", "more_information", "appraisal", "credit_review", "approved", "denied"]),
  appraisalValue: z.coerce.number().positive().optional(),
  appraisalCurrency: z.string().trim().length(3).toUpperCase().optional(),
  appraisalNote: z.string().trim().max(3000).optional(),
  approvedAmount: z.coerce.number().positive().optional(),
  approvedCurrency: z.string().trim().length(3).toUpperCase().optional(),
  approvedTerm: z.string().trim().max(60).optional(),
  approvedDownPayment: z.coerce.number().min(0).optional(),
  approvedClosingCost: z.coerce.number().min(0).optional(),
  note: z.string().trim().max(3000).optional(),
});

export const submitLoanApplication: RequestHandler = async (request, response) => {
  const parsed = loanSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: "Complete the financing request and supporting document checklist." });
  if (!process.env.DATABASE_URL) return response.status(503).json({ message: "Financing applications are not configured yet." });
  try {
    await ensureSchema();
    const loanId = randomUUID();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { documents, ...loan } = parsed.data;
      await client.query(`INSERT INTO loan_applications (id, applicant_email, market, project_name, requested_amount, currency, requested_term, down_payment_percent, purpose, collateral_type, collateral_value, collateral_currency, closing_cost_percent, collateral_notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, [loanId, loan.applicantEmail, loan.market, loan.projectName, loan.requestedAmount, loan.currency, loan.requestedTerm, loan.downPaymentPercent, loan.purpose, loan.collateralType, loan.collateralValue, loan.collateralCurrency, loan.closingCostPercent, loan.collateralNotes]);
      for (const document of documents) await client.query("INSERT INTO loan_application_documents (id, loan_application_id, document_type, file_name) VALUES ($1,$2,$3,$4)", [randomUUID(), loanId, document.type, document.fileName]);
      await client.query("INSERT INTO notifications (id, recipient_email, subject, message) VALUES ($1,$2,$3,$4)", [randomUUID(), loan.applicantEmail, "Financing request received", "Your secured-finance request has been received and is pending initial review."]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
    return response.status(201).json({ id: loanId, status: "pending_review" });
  } catch (error) {
    console.error("Loan application failed", error);
    return response.status(500).json({ message: "Unable to submit the financing request right now." });
  }
};

export const listLoanApplications: RequestHandler = async (request, response) => {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") return response.status(403).json({ message: "Administrator access required." });
  try {
    const result = await pool.query(`SELECT l.*, COALESCE(json_agg(json_build_object('type', d.document_type, 'fileName', d.file_name)) FILTER (WHERE d.id IS NOT NULL), '[]') AS documents FROM loan_applications l LEFT JOIN loan_application_documents d ON d.loan_application_id = l.id GROUP BY l.id ORDER BY l.created_at DESC`);
    return response.json({ applications: result.rows });
  } catch (error) {
    console.error("Loan application listing failed", error);
    return response.status(500).json({ message: "Unable to load financing applications." });
  }
};

export const reviewLoanApplication: RequestHandler = async (request, response) => {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") return response.status(403).json({ message: "Administrator access required." });
  const parsed = reviewSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: "Provide a valid review decision." });
  try {
    const result = await pool.query(`UPDATE loan_applications SET status=$1, appraisal_value=$2, appraisal_currency=$3, appraisal_note=$4, approved_amount=$5, approved_currency=$6, approved_term=$7, approved_down_payment=$8, approved_closing_cost=$9, review_note=$10, reviewed_by=$11, reviewed_at=NOW(), updated_at=NOW() WHERE id=$12 RETURNING id, status, approved_amount, approved_currency, approved_term, approved_down_payment, approved_closing_cost, review_note`, [parsed.data.status, parsed.data.appraisalValue ?? null, parsed.data.appraisalCurrency ?? null, parsed.data.appraisalNote ?? null, parsed.data.approvedAmount ?? null, parsed.data.approvedCurrency ?? null, parsed.data.approvedTerm ?? null, parsed.data.approvedDownPayment ?? null, parsed.data.approvedClosingCost ?? null, parsed.data.note ?? null, user.id, request.params.id]);
    if (!result.rows[0]) return response.status(404).json({ message: "Financing application not found." });
    const applicant = await pool.query("SELECT applicant_email FROM loan_applications WHERE id=$1", [request.params.id]);
    if (applicant.rows[0]) await pool.query("INSERT INTO notifications (id, recipient_email, subject, message) VALUES ($1,$2,$3,$4)", [randomUUID(), applicant.rows[0].applicant_email, "Financing application updated", parsed.data.note ?? `Your financing request status is now ${parsed.data.status}.`]);
    return response.json({ application: result.rows[0] });
  } catch (error) {
    console.error("Loan application review failed", error);
    return response.status(500).json({ message: "Unable to update the financing application." });
  }
};
