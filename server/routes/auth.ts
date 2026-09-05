import { randomBytes, randomUUID, createHash } from "node:crypto";
import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool, ensureSchema } from "../db";
import type { AuthResponse, DashboardResponse } from "@shared/api";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(12).max(128),
  companyName: z.string().trim().max(160).optional(),
});

const sessionCookie = "icbc_session";
const sessionDurationMs = 1000 * 60 * 60 * 8;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function readCookie(request: Parameters<RequestHandler>[0]) {
  const header = request.headers.cookie ?? "";
  const value = header.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${sessionCookie}=`));
  return value?.slice(sessionCookie.length + 1);
}

function setSessionCookie(response: Parameters<RequestHandler>[1], token: string) {
  const flags = [
    `${sessionCookie}=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${sessionDurationMs / 1000}`,
  ];
  if (process.env.NODE_ENV === "production") flags.push("Secure");
  response.setHeader("Set-Cookie", flags.join("; "));
}

function clearSessionCookie(response: Parameters<RequestHandler>[1]) {
  response.setHeader("Set-Cookie", `${sessionCookie}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
}

export async function getSessionUser(request: Parameters<RequestHandler>[0]) {
  const token = readCookie(request);
  if (!token || !process.env.DATABASE_URL) return null;
  await ensureSchema();
  const result = await pool.query("SELECT u.id, u.email, u.company_name, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > NOW()", [hashToken(token)]);
  return result.rows[0] as { id: string; email: string; company_name: string | null; role: "client" | "admin" } | undefined ?? null;
}

export const register: RequestHandler = async (request, response) => {
  const parsed = credentialsSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: "Enter a valid email and a password of at least 12 characters." });
  if (!process.env.DATABASE_URL) return response.status(503).json({ message: "Authentication is not configured. Set DATABASE_URL to connect PostgreSQL." });

  try {
    await ensureSchema();
    const { email, password, companyName } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = randomUUID();
    const accountId = randomUUID();
    const accountNumber = `ICBC-${randomBytes(4).toString("hex").toUpperCase()}`;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("INSERT INTO users (id, email, password_hash, company_name) VALUES ($1, $2, $3, $4)", [userId, email, passwordHash, companyName ?? null]);
      await client.query("INSERT INTO accounts (id, user_id, account_number, currency, available_balance, account_type) VALUES ($1, $2, $3, 'USD', 0, 'Operating account')", [accountId, userId, accountNumber]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      if ((error as { code?: string }).code === "23505") return response.status(409).json({ message: "An account with this email already exists." });
      throw error;
    } finally {
      client.release();
    }
    const token = randomBytes(32).toString("base64url");
    await pool.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '8 hours')", [hashToken(token), userId]);
    setSessionCookie(response, token);
    const body: AuthResponse = { user: { id: userId, email, companyName: companyName ?? null } };
    return response.status(201).json(body);
  } catch (error) {
    console.error("Registration failed", error);
    return response.status(500).json({ message: "Unable to create the account right now." });
  }
};

export const login: RequestHandler = async (request, response) => {
  const parsed = credentialsSchema.pick({ email: true, password: true }).safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: "Enter a valid email and password." });
  if (!process.env.DATABASE_URL) return response.status(503).json({ message: "Authentication is not configured. Set DATABASE_URL to connect PostgreSQL." });

  try {
    await ensureSchema();
    const { email, password } = parsed.data;
    const result = await pool.query("SELECT id, email, password_hash, company_name FROM users WHERE email = $1", [email]);
    const user = result.rows[0] as { id: string; email: string; password_hash: string; company_name: string | null } | undefined;
    const valid = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!valid) return response.status(401).json({ message: "Email or password is incorrect." });
    const token = randomBytes(32).toString("base64url");
    await pool.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '8 hours')", [hashToken(token), user.id]);
    setSessionCookie(response, token);
    const body: AuthResponse = { user: { id: user.id, email: user.email, companyName: user.company_name } };
    return response.json(body);
  } catch (error) {
    console.error("Login failed", error);
    return response.status(500).json({ message: "Unable to sign in right now." });
  }
};

export const logout: RequestHandler = async (request, response) => {
  const token = readCookie(request);
  if (token && process.env.DATABASE_URL) await pool.query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
  clearSessionCookie(response);
  return response.status(204).send();
};

export const dashboard: RequestHandler = async (request, response) => {
  const token = readCookie(request);
  if (!token || !process.env.DATABASE_URL) return response.status(401).json({ message: "Authentication required." });
  try {
    await ensureSchema();
    const result = await pool.query(`SELECT u.id, u.email, u.company_name, a.account_number, a.currency, a.available_balance, a.account_type FROM sessions s JOIN users u ON u.id = s.user_id LEFT JOIN accounts a ON a.user_id = u.id WHERE s.token_hash = $1 AND s.expires_at > NOW()`, [hashToken(token)]);
    if (!result.rows[0]) return response.status(401).json({ message: "Authentication required." });
    const first = result.rows[0];
    const body: DashboardResponse = {
      user: { id: first.id, email: first.email, companyName: first.company_name },
      accounts: result.rows.filter((row) => row.account_number).map((row) => ({ accountNumber: row.account_number, currency: row.currency, availableBalance: row.available_balance, accountType: row.account_type })),
    };
    return response.json(body);
  } catch (error) {
    console.error("Dashboard request failed", error);
    return response.status(500).json({ message: "Unable to load account data right now." });
  }
};
