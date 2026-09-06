import { randomUUID } from "node:crypto";
import { RequestHandler } from "express";
import { z } from "zod";
import { ensureSchema, pool } from "../db";
import { getSessionUser } from "./auth";
import { recordAudit } from "../audit";

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

export const getClientFinancingProfile: RequestHandler = async (request, response) => {
  const user = await getSessionUser(request);
  if (!user) return response.status(401).json({ message: "Authentication required." });
  try {
    await ensureSchema();
    const result = await pool.query(`SELECT la.account_number, la.approved_amount, la.currency, la.approved_term, la.collateral_value, la.collateral_currency, la.down_payment, la.closing_cost, la.status, a.project_name, a.market FROM loan_accounts la JOIN loan_applications a ON a.id = la.loan_application_id WHERE lower(a.applicant_email) = lower($1) ORDER BY la.created_at DESC`, [user.email]);
    return response.json({ profile: result.rows[0] ?? null });
  } catch (error) {
    console.error("Client financing profile failed", error);
    return response.status(500).json({ message: "Unable to load the financing profile." });
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
    if (parsed.data.status === "approved") {
      const loan = await pool.query("SELECT approved_amount, approved_currency, approved_term, collateral_value, collateral_currency FROM loan_applications WHERE id=$1", [request.params.id]);
      const approved = loan.rows[0];
      if (!approved?.approved_amount || !approved.approved_currency || !approved.approved_term) return response.status(400).json({ message: "Approved amount, currency, and term are required before creating a loan profile." });
      await pool.query("INSERT INTO loan_accounts (id, loan_application_id, account_number, approved_amount, currency, approved_term, collateral_value, collateral_currency, down_payment, closing_cost) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (loan_application_id) DO UPDATE SET approved_amount=EXCLUDED.approved_amount, currency=EXCLUDED.currency, approved_term=EXCLUDED.approved_term, collateral_value=EXCLUDED.collateral_value, collateral_currency=EXCLUDED.collateral_currency, down_payment=EXCLUDED.down_payment, closing_cost=EXCLUDED.closing_cost", [randomUUID(), request.params.id, `LOAN-${randomUUID().slice(0, 8).toUpperCase()}`, approved.approved_amount, approved.approved_currency, approved.approved_term, approved.collateral_value, approved.collateral_currency, parsed.data.approvedDownPayment ?? 0, parsed.data.approvedClosingCost ?? 0]);
    }
    const applicant = await pool.query("SELECT applicant_email FROM loan_applications WHERE id=$1", [request.params.id]);
    if (applicant.rows[0]) await pool.query("INSERT INTO notifications (id, recipient_email, subject, message) VALUES ($1,$2,$3,$4)", [randomUUID(), applicant.rows[0].applicant_email, "Financing application updated", parsed.data.note ?? `Your financing request status is now ${parsed.data.status}.`]);
    await recordAudit({ actorUserId: user.id, actorEmail: user.email, action: `financing.${parsed.data.status}`, entityType: "loan_application", entityId: String(request.params.id), details: { approvedAmount: parsed.data.approvedAmount ?? null, note: parsed.data.note ?? null } });
    return response.json({ application: result.rows[0] });
  } catch (error) {
    console.error("Loan application review failed", error);
    return response.status(500).json({ message: "Unable to update the financing application." });
  }
};
