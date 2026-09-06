import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, FileText, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FinancingProfile {
  account_number: string;
  approved_amount: string;
  currency: string;
  approved_term: string;
  collateral_value: string;
  collateral_currency: string;
  down_payment: string;
  closing_cost: string;
  status: "prepared" | "active" | "closed";
  project_name: string;
  market: string;
}

const demoProfile: FinancingProfile = {
  account_number: "LOAN-4821-9034",
  approved_amount: "2000000.00",
  currency: "USD",
  approved_term: "36 months",
  collateral_value: "3200000.00",
  collateral_currency: "USD",
  down_payment: "400000.00",
  closing_cost: "25000.00",
  status: "prepared",
  project_name: "Northstar Trading Ltd.",
  market: "Commodities",
};

const money = (value: string, currency: string) => `${currency} ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

export default function ClientFinancing() {
  const [params] = useSearchParams();
  const demo = params.get("demo") === "1";
  const [profile, setProfile] = useState<FinancingProfile | null>(demo ? demoProfile : null);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState("");

  useEffect(() => {
    if (demo) return;
    void fetch("/api/financing/profile", { credentials: "include" })
      .then(async (response) => {
        const result = await response.json() as { profile?: FinancingProfile | null; message?: string };
        if (response.status === 401) throw new Error("Please sign in to view your financing profile.");
        if (!response.ok) throw new Error(result.message ?? "Unable to load the financing profile.");
        setProfile(result.profile ?? null);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load the financing profile."))
      .finally(() => setLoading(false));
  }, [demo]);

  if (loading) return <div className="container flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading your financing profile…</div>;
  if (error) return <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center"><p className="text-sm text-red-700">{error}</p><Link to="/sign-in" className="mt-5 text-sm font-semibold text-brand-navy">Sign in to continue</Link></div>;
  if (!profile) return <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center"><p className="font-display text-3xl font-semibold text-brand-navy">No approved financing profile yet</p><p className="mt-2 max-w-md text-sm text-muted-foreground">Approved facilities will appear here after the review team completes its decision.</p><Link to="/financing/apply" className="mt-6"><Button className="bg-brand-navy text-white hover:bg-brand-navy/90">Start a financing request <ArrowRight className="h-4 w-4" /></Button></Link></div>;

  const active = profile.status === "active";
  return <div className="bg-secondary"><div className="container py-10 lg:py-16">
    <Link to={demo ? "/dashboard?demo=1" : "/dashboard"} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-navy"><ArrowLeft className="h-4 w-4" /> Back to client portal</Link>
    <div className="mt-10 flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">Client financing</p><h1 className="mt-3 font-display text-4xl font-semibold text-brand-navy sm:text-5xl">Approved loan profile</h1><p className="mt-3 text-sm text-muted-foreground">{profile.project_name} · {profile.market} facility</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-gold/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-navy"><Clock3 className="h-4 w-4" /> {active ? "Active facility" : "Prepared for activation"}</span></div>
    {demo && <div className="mt-7 border border-brand-gold/30 bg-brand-gold/10 px-5 py-4 text-sm text-brand-navy">You are viewing a sample approved financing profile.</div>}
    <div className="mt-8 rounded-xl bg-brand-navy p-7 text-white shadow-lg shadow-brand-navy/10 sm:p-10"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start"><div><p className="text-xs uppercase tracking-[0.2em] text-brand-gold">Loan account</p><p className="mt-3 font-display text-3xl font-semibold">{profile.account_number}</p><p className="mt-2 text-sm text-white/60">Secured {profile.market.toLowerCase()} facility</p></div><Landmark className="h-8 w-8 text-brand-gold" /></div><div className="mt-10 grid gap-7 sm:grid-cols-3"><div><p className="text-xs text-white/50">Approved amount</p><p className="mt-2 text-2xl font-semibold">{money(profile.approved_amount, profile.currency)}</p></div><div><p className="text-xs text-white/50">Approved term</p><p className="mt-2 text-2xl font-semibold">{profile.approved_term}</p></div><div><p className="text-xs text-white/50">Facility status</p><p className="mt-2 text-2xl font-semibold capitalize">{profile.status}</p></div></div></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className="rounded-lg border border-border bg-background p-7"><h2 className="font-display text-2xl font-semibold text-brand-navy">Facility terms</h2><div className="mt-6 grid gap-5 sm:grid-cols-2"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Collateral value</p><p className="mt-1 font-semibold">{money(profile.collateral_value, profile.collateral_currency)}</p></div><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Down payment</p><p className="mt-1 font-semibold">{money(profile.down_payment, profile.currency)}</p></div><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Closing costs</p><p className="mt-1 font-semibold">{money(profile.closing_cost, profile.currency)}</p></div><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Collateral currency</p><p className="mt-1 font-semibold">{profile.collateral_currency}</p></div></div></div><div className="rounded-lg border border-border bg-background p-7"><h2 className="font-display text-2xl font-semibold text-brand-navy">Activation checklist</h2><div className="mt-5 space-y-4"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" /><div><p className="text-sm font-semibold">Credit approval recorded</p><p className="mt-1 text-xs text-muted-foreground">The approved terms are held in your secure profile.</p></div></div><div className="flex gap-3"><Clock3 className="mt-0.5 h-5 w-5 text-brand-gold" /><div><p className="text-sm font-semibold">Final activation review</p><p className="mt-1 text-xs text-muted-foreground">Operations will confirm final conditions before activation.</p></div></div><Button variant="outline" className="mt-2 w-full border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white"><FileText className="h-4 w-4" /> Facility documents</Button></div></div></div>
  </div></div>;
}
