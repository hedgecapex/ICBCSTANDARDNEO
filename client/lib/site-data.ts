export interface MarketLink {
  label: string;
  path: string;
  description: string;
}

export const marketLinks: MarketLink[] = [
  {
    label: "Commodities",
    path: "/markets/commodities",
    description:
      "Trusted, extensive global solutions built on deep international experience across physical commodities in every major market.",
  },
  {
    label: "Foreign Exchange",
    path: "/markets/foreign-exchange",
    description:
      "Innovative, experienced FX specialists delivering standardised and bespoke solutions to domestic and international clients.",
  },
  {
    label: "Fixed Income",
    path: "/markets/fixed-income",
    description:
      "Customised fixed income solutions combining interest rate, currency and credit products for sophisticated portfolios.",
  },
  {
    label: "Primary Markets",
    path: "/markets/primary-markets",
    description:
      "Full-service debt capital markets origination, execution and syndication capabilities for issuers worldwide.",
  },
];

export const primaryNav = [
  ...marketLinks.map(({ label, path }) => ({ label, path })),
  { label: "Careers", path: "/careers" },
];

export const offices = [
  { city: "New York", country: "United States" },
  { city: "Zurich", country: "Switzerland", address: "Bahnhofplatz, 11 Bahnofquai, Zurich 8001 Switzerland" },
  { city: "Dubai", country: "United Arab Emirates" },
  { city: "Manama", country: "Bahrain", address: "Bahrain Financial Habour, Manama Sea Front 346, Manama, Bahrain" },
];

export const legalLinks = [
  { label: "Terms & Conditions", path: "/legal/terms" },
  { label: "Privacy Notice", path: "/legal/privacy" },
  { label: "Regulatory Disclosures", path: "/legal/regulatory-disclosures" },
  { label: "Corporate Disclosures", path: "/legal/corporate-disclosures" },
];
