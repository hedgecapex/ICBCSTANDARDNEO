import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { primaryNav } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-navy/95 backdrop-blur supports-[backdrop-filter]:bg-brand-navy/90">
      <div className="container flex h-20 items-center justify-between">
        <Link
          to="/"
          className="group flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-brand-gold/60 font-display text-xl font-semibold text-brand-gold">
            IS
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold tracking-wide text-white">
              ICBC Standard
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-brand-gold">
              Bank Plc
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {primaryNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium tracking-wide text-white/75 transition-colors hover:text-brand-gold",
                  isActive && "text-brand-gold",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            asChild
            variant="ghost"
            className="text-white/85 hover:bg-white/10 hover:text-white"
          >
            <Link to="/sign-in">Sign In</Link>
          </Button>
          <Button
            asChild
            className="bg-brand-gold text-brand-navyDark hover:bg-brand-goldLight"
          >
            <Link to="/online-access">
              Set Up Online Access
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-sm p-2 text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-brand-navy lg:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {primaryNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="rounded-sm px-2 py-3 text-sm font-medium text-white/85 hover:bg-white/5 hover:text-brand-gold"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-4">
              <Button
                asChild
                variant="ghost"
                className="justify-start text-white/85 hover:bg-white/10 hover:text-white"
              >
                <Link to="/sign-in" onClick={() => setOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button
                asChild
                className="bg-brand-gold text-brand-navyDark hover:bg-brand-goldLight"
              >
                <Link to="/online-access" onClick={() => setOpen(false)}>
                  Set Up Online Access
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
