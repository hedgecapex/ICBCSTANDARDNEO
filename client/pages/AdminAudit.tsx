import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, ShieldCheck } from "lucide-react";

interface AuditLog { id: string; actor_email: string; action: string; entity_type: string; entity_id: string; details: Record<string, unknown>; created_at: string; }
const demoLogs: AuditLog[] = [
  { id: "1", actor_email: "hedgecapex@gmail.com", action: "financing.approved", entity_type: "loan_application", entity_id: "LOAN-2048", details: { approvedAmount: 2000000 }, created_at: "2026-04-20 11:14 UTC" },
  { id: "2", actor_email: "hedgecapex@gmail.com", action: "deposit.verified", entity_type: "opening_deposit", entity_id: "DEP-2048", details: {}, created_at: "2026-04-20 10:58 UTC" },
  { id: "3", actor_email: "hedgecapex@gmail.com", action: "onboarding.more_information", entity_type: "onboarding_application", entity_id: "APP-1048", details: { note: "Please provide an updated valuation." }, created_at: "2026-04-20 10:42 UTC" },
];

export default function AdminAudit() {
  const [params] = useSearchParams();
  const demo = params.get("demo") === "1";
  const [logs, setLogs] = useState(demo ? demoLogs : []);
  const [error, setError] = useState("");
  useEffect(() => { if (!demo) void fetch("/api/admin/audit", { credentials: "include" }).then(async (response) => { const result = await response.json() as { logs?: AuditLog[]; message?: string }; if (!response.ok) throw new Error(result.message); setLogs(result.logs ?? []); }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load the audit log.")); }, [demo]);
  return <div className="bg-secondary"><div className="container py-10 lg:py-16"><Link to="/admin/applications?demo=1" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-navy"><ArrowLeft className="h-4 w-4" /> Back to administration</Link><div className="mt-10 flex flex-col justify-between gap-4 border-b border-border pb-7 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">Administration</p><h1 className="mt-2 font-display text-4xl font-semibold text-brand-navy">Audit log</h1><p className="mt-2 text-sm text-muted-foreground">A chronological record of sensitive administrative actions.</p></div><span className="inline-flex items-center gap-2 rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-navy"><ShieldCheck className="h-3.5 w-3.5" /> {demo ? "Demo mode" : "Live audit"}</span></div>{error ? <p className="mt-8 text-sm text-red-700">{error}</p> : <div className="mt-8 overflow-hidden rounded-lg border border-border bg-background"><div className="flex items-center gap-2 border-b border-border px-6 py-4 text-sm text-muted-foreground"><ClipboardList className="h-4 w-4" /> {logs.length} recorded actions</div><div className="divide-y divide-border">{logs.map((log) => <div key={log.id} className="grid gap-3 px-6 py-5 md:grid-cols-[1fr_1.3fr_1fr_1fr]"><div><p className="text-sm font-semibold text-brand-navy">{log.action}</p><p className="mt-1 text-xs text-muted-foreground">{log.entity_type}</p></div><div><p className="text-xs text-muted-foreground">Entity</p><p className="mt-1 text-sm">{log.entity_id}</p></div><div><p className="text-xs text-muted-foreground">Actor</p><p className="mt-1 text-sm">{log.actor_email}</p></div><div><p className="text-xs text-muted-foreground">Time</p><p className="mt-1 text-sm">{log.created_at}</p></div></div>)}</div></div>}</div></div>;
}
