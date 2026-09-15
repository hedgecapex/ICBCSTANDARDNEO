import { Link } from "react-router-dom";
import { Phone, MapPin } from "lucide-react";
import { legalLinks, marketLinks, offices } from "@/lib/site-data";
import BrandMark from "./BrandMark";

export default function Footer() {
  return (
    <footer className="bg-brand-navyDark text-white/70">
      <div className="container grid gap-12 py-16 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark />
            <span className="font-display text-lg font-semibold text-white">
              ICBC Standard Bank Plc
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
            Specialist financial markets expertise connecting China and the
            world's major economies through commodities, foreign exchange,
            fixed income and primary markets solutions.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
            <Phone className="h-4 w-4 text-brand-gold" />
            <span>+1 203 145 5000</span>
          </div>
        </div>

        <div>
          <h3 className="font-display text-base font-semibold text-white">
            Markets
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {marketLinks.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="transition-colors hover:text-brand-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/careers"
                className="transition-colors hover:text-brand-gold"
              >
                Careers
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base font-semibold text-white">
            Global Offices
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {offices.map((office) => (
              <li key={office.city} className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                <span>
                  {office.city}, {office.country}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-4 py-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {legalLinks.map((item, index) => (
              <span key={item.path} className="flex items-center gap-4">
                <Link to={item.path} className="hover:text-brand-gold">
                  {item.label}
                </Link>
                {index < legalLinks.length - 1 && (
                  <span className="text-white/20">|</span>
                )}
              </span>
            ))}
          </nav>
          <p>
            ICBC Standard Bank Plc — Authorised by the Prudential Regulation
            Authority and regulated by the Financial Conduct Authority and
            Prudential Regulation Authority. Copyright &copy;{" "}
            {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
