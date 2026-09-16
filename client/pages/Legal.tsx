import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const pages = {
  terms: {
    label: "Terms & Conditions",
    title: "Terms for using ICBC Standard NEOBank",
    intro: "These terms describe the basis on which visitors and clients may use the ICBC Standard NEOBank digital platform and its online services.",
    sections: [
      ["Using this website", "The website is provided for general information and for access to selected digital services. You agree to use it lawfully, protect your access credentials and provide information that is accurate and current."],
      ["Financial information and services", "Market content, calculators, indicative figures and preparation tools are educational or informational unless expressly stated otherwise. They do not constitute an offer, advice, commitment, invitation or guarantee of financing, investment performance or execution."],
      ["Applications and communications", "Submitting an application does not create a banking, financing or advisory relationship and does not guarantee approval. We may request clarification, supporting evidence, appraisal, due diligence or additional documentation before making any decision."],
      ["Intellectual property and availability", "Content, design, marks and software used by ICBC Standard NEOBank are protected by applicable law. We may update, suspend or withdraw portions of the platform where reasonably necessary for security, maintenance or service changes."],
    ],
  },
  privacy: {
    label: "Privacy Notice",
    title: "How ICBC Standard NEOBank handles information",
    intro: "This notice explains the categories of information we may collect through the digital platform and the purposes for which it may be used.",
    sections: [
      ["Information we may collect", "Depending on the service, this may include identity and contact details, company information, application data, account activity, device and security information, communications and document metadata. The demo document workflow records document type and filename metadata rather than storing uploaded files."],
      ["How information is used", "Information may be used to provide services, assess applications, perform onboarding and compliance checks, protect accounts, communicate with clients, maintain records, improve the platform and meet legal or regulatory obligations."],
      ["Sharing and retention", "Information may be shared with service providers, professional advisers, group entities, regulators or authorities where permitted or required. Retention periods depend on the purpose, applicable law, risk controls and recordkeeping obligations."],
      ["Your choices and rights", "Depending on your location and applicable law, you may have rights relating to access, correction, deletion, restriction, objection or portability. Requests may be subject to identity verification and legal exceptions."],
    ],
  },
  "regulatory-disclosures": {
    label: "Regulatory Disclosures",
    title: "Regulatory information and important notices",
    intro: "ICBC Standard NEOBank presents digital access to specialist markets and finance workflows. Regulatory status and service availability depend on the relevant legal entity, jurisdiction and product.",
    sections: [
      ["Authorisation and regulation", "ICBC Standard Bank Plc — Authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and Prudential Regulation Authority. Services may be subject to additional local requirements, permissions and restrictions."],
      ["No guaranteed outcome", "Past performance, market commentary, indicative calculations and preparation results are not guarantees of future results. Financing, account opening, investment and transaction services remain subject to eligibility, due diligence, approval, documentation, funding and applicable law."],
      ["Jurisdiction and eligibility", "Products and services may not be available to every person or in every jurisdiction. You are responsible for understanding the laws and requirements that apply to you before requesting a service or relying on information presented here."],
      ["Risk and independent advice", "Financial products and market activity may involve loss, liquidity, currency, credit, interest-rate and other risks. Consider whether a service is appropriate for your circumstances and obtain independent professional advice where necessary."],
    ],
  },
  "corporate-disclosures": {
    label: "Corporate Disclosures",
    title: "Corporate information",
    intro: "This page provides high-level corporate information for the ICBC Standard NEOBank digital experience and should be read with the applicable legal-entity documentation.",
    sections: [
      ["Digital brand and legal entity", "ICBC Standard NEOBank is the digital experience and service presentation used in this project. The legal entity responsible for a product, account or communication will be identified in the applicable agreement, notice or onboarding documentation."],
      ["Corporate communications", "Information on this website may be updated without notice and is not intended to replace a formal agreement, regulatory filing, client communication or approved product disclosure."],
      ["Conflicts and complaints", "Potential conflicts are managed through applicable policies and controls. Clients should use the contact and complaints channels stated in their relevant agreement or official communication."],
      ["Contact and verification", "Before sharing sensitive information or acting on a request, verify that you are using an approved ICBC Standard NEOBank channel. We will not ask you to disclose passwords, one-time codes or private keys through an unsolicited message."],
    ],
  },
} as const;

type LegalKey = keyof typeof pages;

export default function Legal() {
  const { type } = useParams();
  const page = pages[(type as LegalKey) in pages ? (type as LegalKey) : "terms"];

  return (
    <div className="bg-secondary">
      <section className="bg-brand-navy py-16 text-white lg:py-24">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-brand-gold">
            <ArrowLeft className="h-4 w-4" /> Back to overview
          </Link>
          <div className="mt-14 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">{page.label}</p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-tight sm:text-6xl">{page.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">{page.intro}</p>
          </div>
        </div>
      </section>

      <main className="container py-12 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <aside className="h-fit rounded-xl border border-brand-gold/30 bg-brand-gold/10 p-6 lg:sticky lg:top-24">
            <ShieldCheck className="h-6 w-6 text-brand-gold" />
            <p className="mt-5 text-sm font-semibold text-brand-navy">Important information</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">This page is general information and does not replace the agreement, policy, disclosure or notice that applies to a specific service.</p>
          </aside>
          <div className="space-y-5">
            {page.sections.map(([heading, text]) => (
              <section key={heading} className="rounded-xl border border-border bg-background p-7 sm:p-9">
                <div className="flex gap-4">
                  <FileText className="mt-1 h-5 w-5 shrink-0 text-brand-gold" />
                  <div><h2 className="font-display text-2xl font-semibold text-brand-navy">{heading}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p></div>
                </div>
              </section>
            ))}
            <p className="pt-4 text-xs leading-relaxed text-muted-foreground">This draft disclosure language is intended for the ICBC Standard NEOBank digital experience and should be reviewed and approved by qualified legal, compliance and regulatory teams before production use.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
