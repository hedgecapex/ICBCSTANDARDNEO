import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LogOut, RefreshCw, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardResponse } from "@shared/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/dashboard", { credentials: "include" });
      if (response.status === 401) return navigate("/sign-in");
      const result = await response.json() as DashboardResponse & { message?: string };
      if (!response.ok) throw new Error(result.message ?? "Unable to load dashboard.");
      setData(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadDashboard(); }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    navigate("/sign-in");
  };

  if (loading) return <div className="container flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading your secure dashboard…</div>;
  if (error) return <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center"><p className="text-sm text-red-700">{error}</p><Button onClick={() => void loadDashboard()} className="mt-5 bg-brand-navy">Try again</Button></div>;
  if (!data) return null;

  return <div className="bg-secondary"><div className="container py-12 lg:py-20"><div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">Secure client portal</p><h1 className="mt-3 font-display text-4xl font-semibold text-brand-navy sm:text-5xl">Good to see you{data.user.companyName ? `, ${data.user.companyName}` : ""}.</h1><p className="mt-2 text-sm text-muted-foreground">{data.user.email}</p></div><Button variant="outline" onClick={() => void logout()} className="w-fit border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white"><LogOut className="h-4 w-4" /> Sign out</Button></div><div className="mt-10 flex items-center justify-between"><h2 className="font-display text-2xl font-semibold">Accounts</h2><Button variant="ghost" onClick={() => void loadDashboard()} className="text-brand-navy"><RefreshCw className="h-4 w-4" /> Refresh</Button></div><div className="mt-5 grid gap-5 lg:grid-cols-2">{data.accounts.map((account) => <div key={account.accountNumber} className="rounded-lg bg-brand-navy p-7 text-white shadow-lg shadow-brand-navy/10"><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-brand-gold"><WalletCards className="h-5 w-5" /></div><span className="text-xs uppercase tracking-[0.15em] text-white/50">{account.currency}</span></div><p className="mt-10 text-sm text-white/60">{account.accountType}</p><p className="mt-1 font-display text-4xl font-semibold">{account.availableBalance}</p><p className="mt-3 text-xs tracking-wider text-white/50">{account.accountNumber}</p></div>)}</div><div className="mt-10 grid gap-5 md:grid-cols-3"><Link to="/markets/foreign-exchange" className="rounded-lg border border-border bg-background p-6 hover:border-brand-gold"><h3 className="font-semibold">FX & markets</h3><p className="mt-2 text-sm text-muted-foreground">Explore our latest market capabilities.</p><ArrowRight className="mt-5 h-4 w-4 text-brand-gold" /></Link><Link to="/careers" className="rounded-lg border border-border bg-background p-6 hover:border-brand-gold"><h3 className="font-semibold">Relationship support</h3><p className="mt-2 text-sm text-muted-foreground">Connect with our global client teams.</p><ArrowRight className="mt-5 h-4 w-4 text-brand-gold" /></Link><div className="rounded-lg border border-border bg-background p-6"><h3 className="font-semibold">Need assistance?</h3><p className="mt-2 text-sm text-muted-foreground">Call +1 203 145 5000 for client support.</p></div></div></div></div>;
}
