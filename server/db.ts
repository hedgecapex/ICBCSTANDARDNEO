import "dotenv/config";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
});

let schemaPromise: Promise<void> | undefined;

export function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        company_name TEXT,
        role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'client';
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        account_number TEXT NOT NULL,
        currency CHAR(3) NOT NULL DEFAULT 'USD',
        available_balance NUMERIC(18, 2) NOT NULL DEFAULT 0,
        account_type TEXT NOT NULL DEFAULT 'Operating account'
      );
      CREATE TABLE IF NOT EXISTS onboarding_applications (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        account_type TEXT NOT NULL,
        country TEXT NOT NULL,
        address TEXT NOT NULL,
        source_of_funds TEXT NOT NULL,
        intended_use TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('draft', 'pending_review', 'more_information', 'approved', 'denied')),
        review_note TEXT,
        reviewed_by TEXT,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS onboarding_status_idx ON onboarding_applications(status);
      CREATE TABLE IF NOT EXISTS onboarding_documents (
        id TEXT PRIMARY KEY,
        application_id TEXT NOT NULL REFERENCES onboarding_applications(id) ON DELETE CASCADE,
        document_type TEXT NOT NULL,
        file_name TEXT NOT NULL,
        storage_key TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        application_id TEXT REFERENCES onboarding_applications(id) ON DELETE CASCADE,
        recipient_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        sent_at TIMESTAMPTZ
      );
      CREATE TABLE IF NOT EXISTS opening_deposits (
        id TEXT PRIMARY KEY,
        application_id TEXT REFERENCES onboarding_applications(id) ON DELETE SET NULL,
        applicant_email TEXT NOT NULL,
        amount NUMERIC(18, 2) NOT NULL,
        currency CHAR(3) NOT NULL,
        proof_file_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
        review_note TEXT,
        reviewed_by TEXT,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS opening_deposits_status_idx ON opening_deposits(status);
      CREATE TABLE IF NOT EXISTS loan_applications (
        id TEXT PRIMARY KEY,
        applicant_email TEXT NOT NULL,
        market TEXT NOT NULL,
        project_name TEXT NOT NULL,
        requested_amount NUMERIC(18, 2) NOT NULL,
        currency CHAR(3) NOT NULL,
        requested_term TEXT NOT NULL,
        down_payment_percent NUMERIC(6, 2) NOT NULL,
        purpose TEXT NOT NULL,
        collateral_type TEXT NOT NULL,
        collateral_value NUMERIC(18, 2) NOT NULL,
        collateral_currency CHAR(3) NOT NULL,
        closing_cost_percent NUMERIC(6, 2) NOT NULL,
        collateral_notes TEXT NOT NULL,
        appraisal_value NUMERIC(18, 2),
        appraisal_currency CHAR(3),
        appraisal_note TEXT,
        status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'more_information', 'appraisal', 'credit_review', 'approved', 'denied')),
        approved_amount NUMERIC(18, 2),
        approved_currency CHAR(3),
        approved_term TEXT,
        approved_down_payment NUMERIC(18, 2),
        approved_closing_cost NUMERIC(18, 2),
        review_note TEXT,
        reviewed_by TEXT,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS loan_applications_status_idx ON loan_applications(status);
      CREATE TABLE IF NOT EXISTS notification_templates (
        id TEXT PRIMARY KEY,
        event_key TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS notification_deliveries (
        id TEXT PRIMARY KEY,
        template_id TEXT REFERENCES notification_templates(id) ON DELETE SET NULL,
        recipient_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
        error_message TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        sent_at TIMESTAMPTZ
      );
      CREATE TABLE IF NOT EXISTS loan_application_documents (
        id TEXT PRIMARY KEY,
        loan_application_id TEXT NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
        document_type TEXT NOT NULL,
        file_name TEXT NOT NULL,
        storage_key TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS loan_accounts (
        id TEXT PRIMARY KEY,
        loan_application_id TEXT NOT NULL UNIQUE REFERENCES loan_applications(id) ON DELETE CASCADE,
        account_number TEXT NOT NULL UNIQUE,
        approved_amount NUMERIC(18, 2) NOT NULL,
        currency CHAR(3) NOT NULL,
        approved_term TEXT NOT NULL,
        collateral_value NUMERIC(18, 2) NOT NULL,
        collateral_currency CHAR(3) NOT NULL,
        down_payment NUMERIC(18, 2) NOT NULL DEFAULT 0,
        closing_cost NUMERIC(18, 2) NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'prepared' CHECK (status IN ('prepared', 'active', 'closed')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `).then(async () => {
      const templates = [
        ["application_received", "Application received", "Your application has been received", "Your application has been received and is pending review."],
        ["more_information", "More information required", "Additional information is required", "Our team needs additional information to continue reviewing your application."],
        ["application_approved", "Application approved", "Your application has been approved", "Your application has been approved. Please review the next steps in your secure portal."],
        ["application_denied", "Application decision", "An update about your application", "Your application status has been updated. Please sign in to review the details."],
        ["appraisal_required", "Appraisal required", "Collateral appraisal required", "A collateral appraisal is required before we can complete the financing review."],
        ["credit_review", "Credit review started", "Your financing request is under credit review", "Our credit team is evaluating your request, repayment source, and supporting information."],
        ["financing_approved", "Financing approved", "Your financing request has been approved", "Your approved financing profile is ready to review in the client portal."],
        ["deposit_instructions", "Opening deposit instructions", "Your opening deposit instructions are ready", "Please review the secure opening deposit instructions in your client portal."],
        ["deposit_received", "Deposit proof received", "Your deposit proof is being verified", "We received your payment confirmation and our operations team is verifying it."],
        ["account_activated", "Account activated", "Your account is now active", "Your account has been activated. Sign in to access your client portal."],
      ];
      for (const [eventKey, name, subject, body] of templates) {
        await pool.query("INSERT INTO notification_templates (id, event_key, name, subject, body) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (event_key) DO NOTHING", [eventKey, eventKey, name, subject, body]);
      }
    });
  }
  return schemaPromise;
}
