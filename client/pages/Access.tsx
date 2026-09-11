import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Globe2, HelpCircle, LockKeyhole, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AccessProps { setup?: boolean }
type AccessMode = "login" | "register";

export default function Access({ setup = false }: AccessProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AccessMode>(setup ? "register" : "login");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = { email: String(form.get("email") ?? ""), password: String(form.get("password") ?? ""), companyName: String(form.get("company") ?? "") || undefined };
    try {
      const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
      const result = await response.json() as { message?: string; user?: { role?: "client" | "admin" } };
      if (!response.ok) throw new Error(result.message ?? "Something went wrong.");
      if (mode === "login") navigate(result.user?.role === "admin" ? "/admin/applications" : "/dashboard");
      else setSubmitted(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to complete the request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#d8d8d8] text-[#292929]">
      <div className="border-b border-black/10 bg-[#eeeeee]">
        <div className="container flex min-h-12 flex-wrap items-center justify-between gap-3 py-2 text-xs text-[#666]">
          <Link to="/" className="inline-flex items-center gap-2 hover:text-[#bc0021]"><ArrowLeft className="h-3.5 w-3.5" /> Back to ICBC Standard Bank</Link>
          <div className="flex items-center gap-4"><span>繁体</span><span>简体</span><span className="inline-flex items-center gap-1"><Globe2 className="h-3.5 w-3.5" /> Global Site</span><span className="hidden items-center gap-1 border-l border-black/10 pl-4 sm:inline-flex"><Search className="h-3.5 w-3.5" /> Search</span></div>
        </div>
      </div>

      <div className="container py-8 lg:py-12">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5 border-b border-black/10 pb-6">
          <div><p className="text-2xl font-semibold tracking-tight text-[#292929]">ICBC <span className="font-normal text-[#777]">Online Banking</span></p><p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#888]">Secure access to your financial services</p></div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#444]"><Link to="/" className="hover:text-[#bc0021]">Home</Link><Link to="/careers" className="hover:text-[#bc0021]">About Us</Link><Link to="/" className="hover:text-[#bc0021]">Customer Service</Link></nav>
        </div>

        <div className="grid gap-7 lg:grid-cols-[230px_1fr]">
          <aside className="space-y-4">
            <div className="bg-white shadow-sm"><div className="bg-[#fa504b] px-5 py-3 text-sm font-bold text-white">Online Banking</div><div className="divide-y divide-[#dadada]">{["Personal Banking", "Corporate Banking", "Register / Login", "FAQs", "Guide & Install"].map((item, index) => <Link key={item} to={index === 2 ? "/sign-in" : "/"} className={`block px-5 py-3 text-sm transition-colors hover:bg-[#f8e9e9] hover:text-[#bc0021] ${index === 2 ? "font-semibold text-[#bc0021]" : "text-[#444]"}`}>{item}<ArrowRight className="float-right mt-0.5 h-4 w-4 opacity-50" /></Link>)}</div></div>
            <div className="bg-white p-5 shadow-sm"><h3 className="text-sm font-bold text-[#333]">Useful Links</h3><div className="mt-3 space-y-3 text-xs text-[#555]"><Link className="block hover:text-[#bc0021]" to="/">What&apos;s New</Link><Link className="block hover:text-[#bc0021]" to="/markets/foreign-exchange">FX Rates</Link><Link className="block hover:text-[#bc0021]" to="/markets/fixed-income">Loan Rates</Link><Link className="block hover:text-[#bc0021]" to="/">Online Security</Link></div></div>
          </aside>

          <main className="min-w-0 bg-white shadow-sm">
            <div className="border-b border-[#e2e2e2] px-6 py-4 text-xs text-[#888] sm:px-9"><Link to="/" className="hover:text-[#bc0021]">Home</Link><span className="mx-2">&gt;</span> Register / Login</div>
            <div className="grid gap-10 p-6 sm:p-9 lg:grid-cols-[1fr_0.8fr]">
              <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#bc0021]">Secure client portal</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#292929] sm:text-4xl">Register / Login</h1><p className="mt-3 max-w-lg text-sm leading-relaxed text-[#707070]">Manage your banking relationship with secure online access. Select an option below to continue to Personal Banking or Corporate Banking services.</p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2"><button type="button" onClick={() => { setMode("login"); setSubmitted(false); }} className={`border p-5 text-left transition-colors ${mode === "login" ? "border-[#fa504b] bg-[#fff5f4]" : "border-[#ddd] hover:border-[#fa504b]"}`}><LockKeyhole className="h-6 w-6 text-[#bc0021]" /><h2 className="mt-4 font-semibold">Sign in</h2><p className="mt-1 text-xs leading-relaxed text-[#777]">Existing clients can access their secure banking portal.</p></button><button type="button" onClick={() => navigate("/register")} className={`border p-5 text-left transition-colors ${mode === "register" ? "border-[#fa504b] bg-[#fff5f4]" : "border-[#ddd] hover:border-[#fa504b]"}`}><ShieldCheck className="h-6 w-6 text-[#bc0021]" /><h2 className="mt-4 font-semibold">Register</h2><p className="mt-1 text-xs leading-relaxed text-[#777]">Set up online access for your business or personal account.</p></button></div>
                <div className="mt-8 border-t border-[#e5e5e5] pt-6"><h2 className="text-sm font-bold">Choose your banking service</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><a href="https://mybank.icbc.com.cn/icbc/enperbank/index.jsp" target="_blank" rel="noreferrer" className="flex items-center justify-between border border-[#ddd] px-4 py-4 text-sm font-medium hover:border-[#fa504b] hover:text-[#bc0021]">Personal Banking <ArrowRight className="h-4 w-4" /></a><a href="https://corporbank.icbc.com.cn/icbc/corporbank/logon.jsp?Language=EN_US" target="_blank" rel="noreferrer" className="flex items-center justify-between border border-[#ddd] px-4 py-4 text-sm font-medium hover:border-[#fa504b] hover:text-[#bc0021]">Corporate Banking <ArrowRight className="h-4 w-4" /></a></div><div className="mt-4 border border-dashed border-[#bbb] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-[#777]">Builder preview</p><p className="mt-1 text-xs leading-relaxed text-[#777]">Use sample data to review the portal while the private API is being deployed.</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><Link to="/dashboard?demo=1" className="flex items-center justify-between border border-[#ddd] px-3 py-2 text-xs text-[#666] hover:border-[#fa504b] hover:text-[#bc0021]">Client dashboard <ArrowRight className="h-3.5 w-3.5" /></Link><Link to="/application-status?demo=1" className="flex items-center justify-between border border-[#ddd] px-3 py-2 text-xs text-[#666] hover:border-[#fa504b] hover:text-[#bc0021]">Application status <ArrowRight className="h-3.5 w-3.5" /></Link><Link to="/client/financing?demo=1" className="flex items-center justify-between border border-[#ddd] px-3 py-2 text-xs text-[#666] hover:border-[#fa504b] hover:text-[#bc0021]">Financing profile <ArrowRight className="h-3.5 w-3.5" /></Link><Link to="/admin/applications?demo=1" className="flex items-center justify-between border border-[#ddd] px-3 py-2 text-xs text-[#666] hover:border-[#fa504b] hover:text-[#bc0021]">Admin workspace <ArrowRight className="h-3.5 w-3.5" /></Link></div></div></div>
              </div>
              <div className="h-fit border border-[#ddd] bg-[#f7f7f7] p-6 sm:p-8"><h2 className="text-xl font-semibold">{mode === "login" ? "Welcome back" : "Request online access"}</h2><p className="mt-2 text-xs leading-relaxed text-[#777]">{mode === "login" ? "Use your registered details to securely sign in." : "Our team will contact you to complete your registration."}</p>{error && <div role="alert" className="mt-7 border border-[#e7b5b2] bg-[#fff5f4] p-4 text-sm leading-relaxed text-[#7d2222]">{error}</div>}{submitted ? <div className="mt-7 border border-[#e7b5b2] bg-[#fff5f4] p-4 text-sm leading-relaxed text-[#7d2222]">Thank you. Your request has been received and a member of our team will be in touch shortly.</div> : <form onSubmit={submit} className="mt-7 space-y-4"><div><label htmlFor="email" className="mb-1.5 block text-xs font-semibold">Email address</label><Input id="email" type="email" placeholder="you@company.com" required className="h-10 rounded-none border-[#ccc] bg-white text-sm" /></div>{mode === "register" && <div><label htmlFor="company" className="mb-1.5 block text-xs font-semibold">Company name</label><Input id="company" placeholder="Your company" required className="h-10 rounded-none border-[#ccc] bg-white text-sm" /></div>}{mode === "login" && <div><label htmlFor="password" className="mb-1.5 block text-xs font-semibold">Password</label><Input id="password" type="password" placeholder="Enter your password" minLength={12} required className="h-10 rounded-none border-[#ccc] bg-white text-sm" /></div>}<Button type="submit" disabled={loading} className="h-10 w-full rounded-none bg-[#bc0021] text-sm hover:bg-[#9d001c]">{loading ? "Please wait…" : mode === "login" ? "Sign in securely" : "Submit registration"}<ArrowRight className="h-4 w-4" /></Button></form>}<div className="mt-6 flex items-start gap-2 border-t border-[#ddd] pt-5 text-xs text-[#777]"><HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#bc0021]" /><span>{mode === "login" ? "Forgotten your password? Contact Customer Service for assistance." : "Already have online access? Switch to Sign in above."}</span></div></div>
            </div>
          </main>
        </div>
      </div>

      <div className="border-t border-[#202833] bg-[#2a3340] text-white"><div className="container flex flex-col gap-3 py-6 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-x-5 gap-y-2"><Link to="/" className="hover:text-white">Contact Us</Link><Link to="/" className="hover:text-white">Locations</Link><Link to="/legal/terms" className="hover:text-white">Terms & Conditions</Link><Link to="/" className="hover:text-white">Hotline 95588</Link></div><span>Copyright ICBC. All rights reserved.</span></div></div>
    </div>
  );
}
