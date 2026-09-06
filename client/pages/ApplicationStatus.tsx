import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Clock3, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApplicationRecord { id: string; first_name: string; last_name: string; email: string; status: "pending_review" | "more_information" | "approved" | "denied"; review_note: string | null; created_at: string; updated_at: string; }
interface DepositRecord { status: "pending" | "verified" | "rejected"; amount: string; currency: string; }
const demoApplication: ApplicationRecord = { id: "APP-1048", first_name: "Northstar", last_name: "Trading", email: "operations@northstar.example", status: "pending_review", review_note: null, created_at: "2026-04-20T10:42:00Z", updated_at: "2026-04-20T10:42:00Z" };

const statusLabel: Record<ApplicationRecord["status"], string> = { pending_review: "Pending review", more_information: "More information requested", approved: "Approved", denied: "Application decision" };

export default function ApplicationStatus() {
  const [params] = useSearchParams();
  const demo = params.get("demo") === "1";
  const [application, setApplication] = useState<ApplicationRecord | null>(demo ? demoApplication : null);
  const [deposit, setDeposit] = useState<DepositRecord | null>(null);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState("");

  useEffect(() => {
    if (demo) return;
    void fetch("/api/onboarding/status", { credentials: "include" }).then(async (response) => {
      const result = await response.json() as { application?: ApplicationRecord | null; deposit?: DepositRecord | null; message?: string };
      if (response.status === 401) throw new Error("Please sign in to view your application status.");
      if (!response.ok) throw new Error(result.message ?? "Unable to load application status.");
      setApplication(result.application ?? null);
      setDeposit(result.deposit ?? null);
    }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load application status.")).finally(() => setLoading(false));
  }, [demo]);

  if (loading) return <div className="container flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading your application status…</div>;
  if (error) return <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center"><p className="text-sm text-red-700">{error}</p><Link to="/sign-in" className="mt-5 text-sm font-semibold text-brand-navy">Sign in to continue</Link></div>;
  if (!application) return <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center"><p className="font-display text-3xl font-semibold text-brand-navy">No application found</p><p className="mt-2 text-sm text-muted-foreground">Submit an onboarding application to begin the review process.</p><Link to="/register" className="mt-6"><Button className="bg-brand-navy text-white">Start registration</Button></Link></div>;

  const approved = application.status === "approved";
  const denied = application.status === "denied";
  const steps = [
    { label: "Application submitted", detail: new Date(application.created_at).toLocaleString(), complete: true },
    { label: "Initial review", detail: application.status === "pending_review" ? "Our onboarding team is checking your information" : "Initial review completed", complete: !application || application.status !== "pending_review" },
    { label: approved ? "Account activation" : denied ? "Application decision" : "Compliance decision", detail: application.review_note ?? (approved ? "Your application has been approved" : denied ? "Please review the message center for details" : "Approval or further questions"), complete: approved || denied },
  ];

  return <div className="bg-secondary"><div className="container py-10 lg:py-16"><Link to={demo ? "/" : "/dashboard"} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-navy"><ArrowLeft className="h-4 w-4" /> Back to {demo ? "home" : "client portal"}</Link><div className="mx-auto mt-12 max-w-4xl"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">Applicant portal</p><h1 className="mt-3 font-display text-4xl font-semibold text-brand-navy sm:text-5xl">Application status</h1><p className="mt-3 text-sm text-muted-foreground">Reference <span className="font-semibold text-foreground">{application.id}</span> · {application.email}</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-gold/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-navy"><Clock3 className="h-4 w-4" /> {statusLabel[application.status]}</span></div>{demo && <div className="mt-7 border border-brand-gold/30 bg-brand-gold/10 px-5 py-4 text-sm text-brand-navy">You are viewing sample application data.</div>}<div className="mt-10 rounded-xl border border-border bg-background p-6 shadow-sm sm:p-9"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-navy text-brand-gold"><ShieldCheck className="h-5 w-5" /></div><div><h2 className="font-display text-2xl font-semibold">Your application is progressing</h2><p className="mt-1 text-sm text-muted-foreground">We will contact you if anything else is needed.</p></div></div><div className="mt-10 space-y-0">{steps.map((step, index) => <div key={step.label} className="flex gap-4"><div className="flex flex-col items-center"><div className={`flex h-8 w-8 items-center justify-center rounded-full ${step.complete ? "bg-brand-navy text-brand-gold" : "border border-border bg-background text-muted-foreground"}`}>{step.complete ? <Check className="h-4 w-4" /> : index + 1}</div>{index < steps.length - 1 && <div className={`my-1 h-12 w-px ${step.complete ? "bg-brand-navy/30" : "bg-border"}`} />}</div><div className="pb-8"><p className="text-sm font-semibold text-brand-navy">{step.label}</p><p className="mt-1 text-sm text-muted-foreground">{step.detail}</p></div></div>)}</div>{application.review_note && <div className="mt-2 rounded-lg border border-brand-gold/40 bg-brand-gold/10 p-4 text-sm text-brand-navy"><strong>Review note:</strong> {application.review_note}</div>}{deposit && <div className="mt-5 rounded-lg border border-border p-4 text-sm"><p className="font-semibold text-brand-navy">Opening deposit: <span className="capitalize">{deposit.status}</span></p><p className="mt-1 text-muted-foreground">{deposit.currency} {Number(deposit.amount).toLocaleString()}</p></div>}<div className="mt-8 flex flex-wrap gap-3"><Link to={demo ? "/messages?demo=1" : "/messages"}><Button className="bg-brand-navy text-white hover:bg-brand-navy/90"><Mail className="h-4 w-4" /> Open messages</Button></Link>{approved && <Link to={demo ? "/opening-deposit?demo=1" : "/opening-deposit"}><Button variant="outline" className="border-brand-navy text-brand-navy">Review opening deposit</Button></Link>}</div></div></div></div></div>;
}
