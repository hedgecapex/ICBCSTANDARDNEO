import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marketLinks } from "@/lib/site-data";

const details = {
  commodities: {
    eyebrow: "Physical markets",
    title: "Commodities",
    intro: "Trusted access to the world's essential commodities markets.",
    body: "Our commodities team combines on-the-ground knowledge with global reach to help clients navigate complex physical and financial markets. We build practical solutions around the moments that matter to your business.",
    capabilities: ["Metals and minerals", "Energy and renewables", "Agricultural products", "Structured trade solutions"],
  },
  "foreign-exchange": {
    eyebrow: "Global currencies",
    title: "Foreign Exchange",
    intro: "Clear thinking and precise execution in every currency.",
    body: "Our experienced FX specialists provide a direct, informed perspective across developed and emerging markets. From everyday hedging to bespoke structures, our solutions are designed around your objectives.",
    capabilities: ["Spot and forward execution", "Currency hedging", "Emerging market currencies", "Bespoke structured solutions"],
  },
  "fixed-income": {
    eyebrow: "Rates and credit",
    title: "Fixed Income",
    intro: "Solutions shaped by a deep understanding of rates, credit and risk.",
    body: "Our fixed income team constructs customised solutions using a combination of interest rate, currency and credit products. We help clients find clarity and opportunity through changing market cycles.",
    capabilities: ["Rates and swaps", "Credit products", "Emerging market debt", "Portfolio solutions"],
  },
  "primary-markets": {
    eyebrow: "Capital formation",
    title: "Primary Markets",
    intro: "Full-service origination for ambitious issuers.",
    body: "Our debt capital markets teams offer full-service origination, execution and syndication capabilities. We pair deep market relationships with disciplined advice to help issuers access capital with confidence.",
    capabilities: ["Debt origination", "Syndication", "Private placements", "Issuer advisory"],
  },
} as const;

export default function MarketDetail() {
  const { market } = useParams();
  const detail = details[market as keyof typeof details] ?? details.commodities;
  const currentIndex = marketLinks.findIndex((item) => item.path.endsWith(market ?? ""));
  const nextMarket = marketLinks[(currentIndex + 1) % marketLinks.length];

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-navy py-20 lg:py-28">
        <div className="absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full border border-brand-gold/20" />
        <div className="absolute -right-12 -top-20 h-[360px] w-[360px] rounded-full border border-brand-gold/10" />
        <div className="container relative">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-brand-gold">
            <ArrowLeft className="h-4 w-4" /> Back to overview
          </Link>
          <div className="mt-16 max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">{detail.eyebrow}</span>
            <h1 className="mt-4 font-display text-6xl font-semibold text-white sm:text-7xl">{detail.title}</h1>
            <p className="mt-6 max-w-2xl text-2xl leading-snug text-white/80">{detail.intro}</p>
          </div>
        </div>
      </section>

      <section className="container grid gap-16 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:py-28">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">Our approach</span>
          <p className="mt-5 max-w-2xl text-2xl font-medium leading-relaxed text-foreground">{detail.body}</p>
          <Button asChild size="lg" className="mt-9 bg-brand-navy hover:bg-brand-navy/90">
            <Link to="/online-access">Connect with our team <ArrowUpRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-secondary/60 p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-navy text-brand-gold"><Sparkles className="h-5 w-5" /></div>
          <h2 className="mt-6 font-display text-2xl font-semibold">Capabilities</h2>
          <ul className="mt-5 space-y-4">
            {detail.capabilities.map((capability) => <li key={capability} className="flex items-center gap-3 text-sm text-muted-foreground"><Check className="h-4 w-4 text-brand-gold" />{capability}</li>)}
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-secondary py-16">
        <div className="container flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">Continue exploring</p><h2 className="mt-2 font-display text-3xl font-semibold">{nextMarket.label}</h2></div>
          <Button asChild variant="outline" className="w-fit border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white"><Link to={nextMarket.path}>View market <ArrowUpRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>
    </div>
  );
}
