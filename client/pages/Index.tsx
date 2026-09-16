import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  Boxes,
  ArrowLeftRight,
  LineChart,
  Landmark,
  ShieldCheck,
  Globe2,
  Users,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { marketLinks, offices } from "@/lib/site-data";
import InstitutionalHeroArt from "@/components/brand/InstitutionalHeroArt";
import SectorArtwork from "@/components/brand/SectorArtwork";

const marketIcons = [Boxes, ArrowLeftRight, LineChart, Landmark];

const stats = [
  { label: "Global Offices", value: "4" },
  { label: "Core Markets", value: "4" },
  { label: "Years of Heritage", value: "30+" },
  { label: "Regulated Entity", value: "PRA / FCA" },
];

const sectors = [
  { kind: "real-estate" as const, label: "Real estate development", text: "Residential, commercial and mixed-use opportunities with clear collateral and delivery milestones." },
  { kind: "energy" as const, label: "Oil & Gas and energy", text: "Trading, field development and essential-energy infrastructure structured around contracts and controls." },
  { kind: "industrial" as const, label: "Industrial development", text: "Manufacturing, logistics and productive infrastructure with measurable operating outcomes." },
  { kind: "government" as const, label: "Government programs", text: "Public-purpose development and program-linked financing subject to mandate and approval." },
];

export default function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-navy">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(38 62% 52%) 1px, transparent 1px), linear-gradient(90deg, hsl(38 62% 52%) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="container relative grid gap-10 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-32">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
              ICBC Standard Bank Plc
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.1] text-white sm:text-6xl lg:text-7xl">
              Specialist financial
              <br />
              markets expertise,
              <br />
              <span className="text-brand-gold">globally connected.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              We bridge China's markets and the world's economies through
              trusted commodities, foreign exchange, fixed income and primary
              markets solutions, built on international experience and
              regulatory credibility.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 bg-brand-gold px-8 text-brand-navyDark hover:bg-brand-goldLight"
              >
                <Link to="/markets/commodities">
                  Explore Our Markets
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/25 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/sign-in">Sign In</Link>
              </Button>
            </div>
            <div className="mt-8 max-w-xl rounded-lg border border-white/15 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Builder preview</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">Explore the client and administration workflows with sample data while the production API is being deployed separately.</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
                <Link to="/dashboard?demo=1" className="border border-white/20 px-3 py-2 text-white hover:border-brand-gold hover:text-brand-gold">Client portal</Link>
                <Link to="/application-status?demo=1" className="border border-white/20 px-3 py-2 text-white hover:border-brand-gold hover:text-brand-gold">Application status</Link>
                <Link to="/admin/applications?demo=1" className="border border-white/20 px-3 py-2 text-white hover:border-brand-gold hover:text-brand-gold">Admin workspace</Link>
              </div>
            </div>
          </div>
          <div className="pointer-events-none relative hidden min-h-[360px] lg:block"><InstitutionalHeroArt /></div>
        </div>

        {/* Stats strip */}
        <div className="relative border-t border-white/10">
          <div className="container grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl font-semibold text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets grid */}
      <section className="bg-background py-24">
        <div className="container">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
              Our Markets
            </span>
            <h2 className="mt-3 font-display text-4xl font-semibold text-foreground sm:text-5xl">
              Customised solutions across four core disciplines
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {marketLinks.map((market, index) => {
              const Icon = marketIcons[index];
              return (
                <Link
                  key={market.path}
                  to={market.path}
                  className="group relative overflow-hidden rounded-lg border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-xl hover:shadow-brand-navy/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-navy text-brand-gold transition-colors group-hover:bg-brand-gold group-hover:text-brand-navyDark">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-semibold text-foreground">
                    {market.label}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {market.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy group-hover:text-brand-gold">
                    Learn more
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-10 flex flex-col gap-4 rounded-lg border border-brand-gold/30 bg-brand-gold/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-navy">Structured finance</p><p className="mt-2 font-display text-2xl font-semibold text-brand-navy">Have a secured financing opportunity?</p><p className="mt-1 text-sm text-muted-foreground">Submit an initial request for our team to review.</p></div>
            <div className="flex flex-wrap gap-3"><Button asChild className="w-fit bg-brand-navy hover:bg-brand-navy/90"><Link to="/financing/apply">Start a financing request <ArrowUpRight className="h-4 w-4" /></Link></Button><Button asChild variant="outline" className="w-fit border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white"><Link to="/financing/tools">Explore financing tools <ArrowUpRight className="h-4 w-4" /></Link></Button></div>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-24">
        <div className="container"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div className="max-w-2xl"><span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">Development focus</span><h2 className="mt-3 font-display text-4xl font-semibold text-brand-navy sm:text-5xl">Capital aligned to real-world outcomes</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Explore the sectors and project stories our financing conversations are designed to support.</p></div><Link to="/financing/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy hover:text-brand-gold">Plan an opportunity <ArrowUpRight className="h-4 w-4" /></Link></div><div className="mt-10 grid gap-5 md:grid-cols-2">{sectors.map((sector) => <Link key={sector.kind} to="/financing/tools" className="group overflow-hidden rounded-xl border border-border bg-background transition-all hover:-translate-y-1 hover:border-brand-gold/60 hover:shadow-xl hover:shadow-brand-navy/5"><div className="h-40 bg-brand-navy px-6 pt-3"><SectorArtwork kind={sector.kind} /></div><div className="p-6"><h3 className="font-display text-2xl font-semibold text-brand-navy">{sector.label}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{sector.text}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-navy group-hover:text-brand-gold">Explore preparation tools <ArrowUpRight className="h-3.5 w-3.5" /></span></div></Link>)}</div></div>
      </section>

      <section className="border-y border-border bg-background py-20">
        <div className="container"><div className="max-w-2xl"><span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">A clear path forward</span><h2 className="mt-3 font-display text-4xl font-semibold text-brand-navy sm:text-5xl">From opportunity to informed decision</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">A structured process helps clients prepare the right information and helps our teams assess each opportunity responsibly.</p></div><div className="mt-10 grid gap-4 md:grid-cols-4">{[{ title: "Explore", text: "Understand the sectors, preparation tools and indicative structure." }, { title: "Prepare", text: "Share project purpose, collateral, contribution and supporting evidence." }, { title: "Evaluate", text: "Our teams may request diligence, valuation, appraisal or clarification." }, { title: "Decide", text: "Any terms remain subject to approval, documentation and available funding." }].map((step, index) => <div key={step.title} className="relative rounded-lg border border-border bg-card p-6"><div className="flex items-center justify-between"><span className="font-display text-3xl font-semibold text-brand-gold">0{index + 1}</span><CheckCircle2 className="h-5 w-5 text-brand-gold/70" /></div><h3 className="mt-6 font-display text-2xl font-semibold text-brand-navy">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p></div>)}</div><div className="mt-8 flex gap-3 rounded-lg border border-brand-gold/30 bg-brand-gold/10 p-5 text-xs leading-relaxed text-brand-navy"><ShieldCheck className="h-4 w-4 shrink-0 text-brand-gold" />Every request is indicative until eligibility, due diligence, credit approval, legal documentation and funding conditions are satisfied.</div></div>
      </section>

      {/* Careers panel */}
      <section className="bg-secondary py-24">
        <div className="container">
          <div className="grid items-center gap-12 rounded-2xl bg-brand-navy p-10 lg:grid-cols-[1.1fr_1fr] lg:p-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                Careers
              </span>
              <h2 className="mt-5 font-display text-3xl font-semibold text-white sm:text-4xl">
                Build your expertise with a global markets specialist
              </h2>
              <p className="mt-5 max-w-lg text-white/70">
                We offer talented, self-driven professionals the flexibility,
                rewards and freedom to grow their expertise, seek new
                opportunities and realise their potential.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-8 h-12 bg-brand-gold px-8 text-brand-navyDark hover:bg-brand-goldLight"
              >
                <Link to="/careers">
                  View Careers
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <Users className="h-6 w-6 text-brand-gold" />
                <p className="mt-4 text-sm text-white/70">
                  Collaborative, international teams across four continents
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <ShieldCheck className="h-6 w-6 text-brand-gold" />
                <p className="mt-4 text-sm text-white/70">
                  Regulatory rigour backed by PRA and FCA oversight
                </p>
              </div>
              <div className="col-span-2 rounded-lg border border-white/10 bg-white/5 p-6">
                <Globe2 className="h-6 w-6 text-brand-gold" />
                <p className="mt-4 text-sm text-white/70">
                  Direct exposure to clients bridging China and global capital
                  markets
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global presence / contact */}
      <section className="bg-background py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
                Global Presence
              </span>
              <h2 className="mt-3 font-display text-4xl font-semibold text-foreground">
                Connected across major financial centres
              </h2>
              <p className="mt-5 max-w-md text-muted-foreground">
                With offices spanning the Americas, Europe and the Middle
                East, our teams are positioned to serve clients wherever
                markets move.
              </p>
              <div className="mt-8 flex items-center gap-3 rounded-lg border border-border bg-card p-5">
                <Phone className="h-5 w-5 text-brand-gold" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    +1 203 145 5000
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Client & investor enquiries
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {offices.map((office) => (
                <div
                  key={office.city}
                  className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-brand-gold/50"
                >
                  <MapPin className="h-5 w-5 text-brand-gold" />
                  <p className="mt-4 font-display text-xl font-semibold text-foreground">
                    {office.city}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {office.country}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
