import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Download, LogOut, Plus, RefreshCw, Settings2, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AccountSummary, DashboardResponse } from "@shared/api";

const demoData: DashboardResponse = {
  user: { id: "demo", email: "executive@icbcstandard.example", companyName: "Hedgecapex Holdings" },
  accounts: [
    { accountNumber: "ICBC-4821 9034", currency: "USD", availableBalance: "248,520.00", accountType: "Operating account", assetClass: "cash" },
    { accountNumber: "ICBC-1950 7712", currency: "EUR", availableBalance: "86,410.75", accountType: "Reserve account", assetClass: "cash" },
  ],
};

const transactions = [
  { merchant: "Global Markets Settlement", date: "20 Apr 2026", amount: "+$42,800.00", positive: true },
  { merchant: "Meridian Logistics Ltd.", date: "18 Apr 2026", amount: "−$8,450.00", positive: false },
  { merchant: "FX Conversion · EUR/USD", date: "16 Apr 2026", amount: "+$12,240.50", positive: true },
  { merchant: "Office & Operations", date: "12 Apr 2026", amount: "−$2,180.00", positive: false },
];

const assetOptions = [
  { value: "currency", label: "Currency", unit: "units", currencies: ["USD", "EUR", "GBP", "CHF", "CNY", "JPY"] },
  { value: "crypto", label: "Cryptocurrency", unit: "coins", currencies: ["BTC", "ETH"] },
  { value: "stablecoin", label: "Stablecoin", unit: "coins", currencies: ["USDC", "USDT", "DAI"] },
  { value: "metal", label: "Precious metal", unit: "grams", currencies: ["Gold", "Silver"] },
  { value: "diamond", label: "Diamond", unit: "grams", currencies: ["Diamond"] },
] as const;

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const demo = searchParams.get("demo") === "1";
  const [data, setData] = useState<DashboardResponse | null>(demo ? demoData : null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!demo);
  const [showAdmin, setShowAdmin] = useState(false);
  const [assetType, setAssetType] = useState("currency");
  const [asset, setAsset] = useState("USD");
  const [quantity, setQuantity] = useState("");
  const [value, setValue] = useState("");
  const selectedOption = assetOptions.find((option) => option.value === assetType) ?? assetOptions[0];

  const loadDashboard = async () => {
    if (demo) return;
    setLoading(true);
    setError("");
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

  const addInvestmentAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data || !quantity || !value) return;
    const newAccount: AccountSummary = {
      accountNumber: `DEMO-${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
      currency: asset,
      availableBalance: value,
      accountType: `${selectedOption.label} investment account`,
      assetClass: assetType === "currency" ? "cash" : assetType as AccountSummary["assetClass"],
      quantity,
      unit: selectedOption.unit,
    };
    setData({ ...data, accounts: [...data.accounts, newAccount] });
    setQuantity("");
    setValue("");
  };

  const logout = async () => {
    if (!demo) await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    navigate("/");
  };

  if (loading) return <div className="container flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading your secure dashboard…</div>;
  if (error) return <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center"><p className="text-sm text-red-700">{error}</p><Button onClick={() => void loadDashboard()} className="mt-5 bg-brand-navy">Try again</Button></div>;
  if (!data) return null;

  return <div className="bg-secondary"><div className="container py-12 lg:py-20">
    <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end"><div><div className="flex flex-wrap items-center gap-3"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">Client portal</p>{demo && <span className="rounded-full bg-brand-gold/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-navy">Demo mode</span>}</div><h1 className="mt-3 font-display text-4xl font-semibold text-brand-navy sm:text-5xl">Good to see you, {data.user.companyName}.</h1><p className="mt-2 text-sm text-muted-foreground">{data.user.email}</p></div><Button variant="outline" onClick={() => void logout()} className="w-fit border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white"><LogOut className="h-4 w-4" /> {demo ? "Exit demo" : "Sign out"}</Button></div>
    {demo && <div className="mt-7 border border-brand-gold/30 bg-brand-gold/10 px-5 py-4 text-sm text-brand-navy">You are viewing sample account data. Connect PostgreSQL later to replace this with real, protected account information.</div>}
    <div className="mt-10 flex items-center justify-between"><h2 className="font-display text-2xl font-semibold">Accounts & investments</h2><div className="flex items-center gap-1"><Button variant="ghost" onClick={() => setShowAdmin((current) => !current)} className="text-brand-navy"><Settings2 className="h-4 w-4" /> Admin controls</Button><Button variant="ghost" onClick={() => void loadDashboard()} className="text-brand-navy"><RefreshCw className="h-4 w-4" /> Refresh</Button></div></div>
    {showAdmin && demo && <form onSubmit={addInvestmentAccount} className="mt-5 rounded-lg border border-brand-gold/40 bg-background p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Demo admin tools</p><h3 className="mt-2 font-display text-2xl font-semibold">Add an investment account</h3><p className="mt-1 text-sm text-muted-foreground">Create sample holdings in currencies, digital assets, metals, or diamonds.</p></div><Plus className="h-5 w-5 text-brand-gold" /></div><div className="mt-6 grid gap-4 md:grid-cols-4"><label className="text-sm font-medium">Asset class<select value={assetType} onChange={(event) => { setAssetType(event.target.value); const option = assetOptions.find((item) => item.value === event.target.value) ?? assetOptions[0]; setAsset(option.currencies[0]); }} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="currency">Currency</option><option value="crypto">Cryptocurrency</option><option value="stablecoin">Stablecoin</option><option value="metal">Precious metal</option><option value="diamond">Diamond</option></select></label><label className="text-sm font-medium">Asset<select value={asset} onChange={(event) => setAsset(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{selectedOption.currencies.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-medium">Quantity ({selectedOption.unit})<Input value={quantity} onChange={(event) => setQuantity(event.target.value)} type="number" min="0" step="any" required placeholder="0.00" className="mt-2" /></label><label className="text-sm font-medium">Value (USD)<Input value={value} onChange={(event) => setValue(event.target.value)} type="number" min="0" step="0.01" required placeholder="0.00" className="mt-2" /></label></div><Button type="submit" className="mt-5 bg-brand-navy hover:bg-brand-navy/90"><Plus className="h-4 w-4" /> Add account</Button></form>}
    <div className="mt-5 grid gap-5 lg:grid-cols-2">{data.accounts.map((account) => <div key={account.accountNumber} className="rounded-lg bg-brand-navy p-7 text-white shadow-lg shadow-brand-navy/10"><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-brand-gold"><WalletCards className="h-5 w-5" /></div><span className="text-xs uppercase tracking-[0.15em] text-white/50">{account.currency}</span></div><p className="mt-10 text-sm text-white/60">{account.accountType}</p><p className="mt-1 font-display text-4xl font-semibold">{account.availableBalance} <span className="text-base font-sans font-normal text-white/50">USD</span></p>{account.quantity && <p className="mt-2 text-sm text-brand-gold">{account.quantity} {account.unit} held</p>}<p className="mt-3 text-xs tracking-wider text-white/50">{account.accountNumber}</p></div>)}</div>
    <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]"><div className="rounded-lg border border-border bg-background"><div className="flex items-center justify-between border-b border-border px-6 py-5"><h2 className="font-display text-2xl font-semibold">Recent activity</h2><Button variant="ghost" size="sm" className="text-brand-navy"><Download className="h-4 w-4" /> Statement</Button></div><div className="divide-y divide-border">{transactions.map((transaction) => <div key={`${transaction.merchant}-${transaction.date}`} className="flex items-center justify-between gap-4 px-6 py-5"><div><p className="text-sm font-medium">{transaction.merchant}</p><p className="mt-1 text-xs text-muted-foreground">{transaction.date}</p></div><span className={`text-sm font-semibold ${transaction.positive ? "text-emerald-700" : "text-foreground"}`}>{transaction.amount}</span></div>)}</div></div><div className="rounded-lg border border-border bg-background p-6"><h2 className="font-display text-2xl font-semibold">Quick actions</h2><div className="mt-5 space-y-3"><Link to="/markets/foreign-exchange" className="flex items-center justify-between border border-border px-4 py-4 text-sm hover:border-brand-gold">Explore FX markets <ArrowRight className="h-4 w-4 text-brand-gold" /></Link><Link to="/careers" className="flex items-center justify-between border border-border px-4 py-4 text-sm hover:border-brand-gold">Contact your team <ArrowRight className="h-4 w-4 text-brand-gold" /></Link><div className="border border-border px-4 py-4 text-sm"><p className="font-medium">Client support</p><p className="mt-1 text-xs text-muted-foreground">+1 203 145 5000</p></div></div></div></div>
  </div></div>;
}
