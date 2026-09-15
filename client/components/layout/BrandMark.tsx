interface BrandMarkProps {
  className?: string;
}

export default function BrandMark({ className = "" }: BrandMarkProps) {
  return <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-brand-gold/60 bg-brand-navyDark/40 ${className}`} aria-hidden="true"><svg viewBox="0 0 40 40" className="h-8 w-8" fill="none"><path d="M9 11.5h8.2c3.4 0 5.7 1.8 5.7 4.5 0 1.8-.9 3.2-2.4 4 2.2.7 3.5 2.3 3.5 4.6 0 3.4-2.7 5.4-6.8 5.4H9V11.5Zm4.1 3.5v4h3.5c1.4 0 2.2-.7 2.2-2s-.8-2-2.2-2h-3.5Zm0 7.3v4.2h3.9c1.6 0 2.5-.7 2.5-2.1s-.9-2.1-2.5-2.1h-3.9Z" fill="hsl(var(--brand-gold))"/><path d="M27 11.5h4v18h-4v-18Z" fill="hsl(var(--brand-gold-light))"/><path d="M8 33h24" stroke="hsl(var(--brand-gold))" strokeWidth="1.5" strokeLinecap="round" opacity=".7"/></svg></span>;
}
