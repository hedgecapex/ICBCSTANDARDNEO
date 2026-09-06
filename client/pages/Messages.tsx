import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Bell, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientMessage { id: string; subject: string; message: string; created_at: string; sent_at: string | null; }
const demoMessages: ClientMessage[] = [
  { id: "1", subject: "Opening deposit instructions", message: "Your application has been approved in principle. Please review the opening deposit instructions to continue account activation.", created_at: "2026-04-20T11:14:00Z", sent_at: "2026-04-20T11:14:00Z" },
  { id: "2", subject: "Application received", message: "Your onboarding application and document checklist have been received. Our team will contact you if more information is required.", created_at: "2026-04-20T10:42:00Z", sent_at: "2026-04-20T10:42:00Z" },
];

export default function Messages() {
  const [params] = useSearchParams();
  const demo = params.get("demo") === "1";
  const [messages, setMessages] = useState<ClientMessage[]>(demo ? demoMessages : []);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState("");

  useEffect(() => {
    if (demo) return;
    void fetch("/api/messages", { credentials: "include" }).then(async (response) => {
      const result = await response.json() as { messages?: ClientMessage[]; message?: string };
      if (response.status === 401) throw new Error("Please sign in to view your messages.");
      if (!response.ok) throw new Error(result.message ?? "Unable to load your messages.");
      setMessages(result.messages ?? []);
    }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load your messages.")).finally(() => setLoading(false));
  }, [demo]);

  if (loading) return <div className="container flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading your messages…</div>;
  if (error) return <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center"><p className="text-sm text-red-700">{error}</p><Link to="/sign-in" className="mt-5 text-sm font-semibold text-brand-navy">Sign in to continue</Link></div>;

  return <div className="bg-secondary"><div className="container py-10 lg:py-16"><Link to={demo ? "/application-status?demo=1" : "/application-status"} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-navy"><ArrowLeft className="h-4 w-4" /> Back to application status</Link><div className="mx-auto mt-12 max-w-4xl"><div className="flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">Applicant portal</p><h1 className="mt-3 font-display text-4xl font-semibold text-brand-navy sm:text-5xl">Messages</h1><p className="mt-3 text-sm text-muted-foreground">Updates about your application and account onboarding.</p></div><div className="flex items-center gap-2 text-sm text-muted-foreground"><Bell className="h-4 w-4 text-brand-gold" /> {messages.length} messages</div></div>{demo && <div className="mt-7 border border-brand-gold/30 bg-brand-gold/10 px-5 py-4 text-sm text-brand-navy">You are viewing sample message data.</div>}<div className="mt-8 space-y-4">{messages.length === 0 ? <div className="rounded-xl border border-border bg-background p-10 text-center text-sm text-muted-foreground">There are no messages yet.</div> : messages.map((message, index) => <article key={message.id} className={`rounded-xl border bg-background p-6 shadow-sm sm:p-8 ${index === 0 ? "border-brand-gold/60" : "border-border"}`}><div className="flex items-start gap-3"><div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-md ${index === 0 ? "bg-brand-gold/15 text-brand-navy" : "bg-secondary text-muted-foreground"}`}>{index === 0 ? <Bell className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><div className="flex flex-col justify-between gap-2 sm:flex-row"><h2 className="text-base font-semibold text-brand-navy">{message.subject}</h2><time className="text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString()}</time></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{message.message}</p>{message.subject.toLowerCase().includes("deposit") && <Link to={demo ? "/opening-deposit?demo=1" : "/opening-deposit"} className="mt-5 inline-block"><Button variant="outline" className="border-brand-navy text-brand-navy">Review deposit instructions</Button></Link>}{message.subject.toLowerCase().includes("application") && <Link to={demo ? "/application-status?demo=1" : "/application-status"} className="mt-5 inline-block"><Button variant="outline" className="border-brand-navy text-brand-navy">View application status</Button></Link>}</div></div></article>)}</div></div></div></div>;
}
