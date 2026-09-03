import { Link } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaceholderProps {
  title: string;
  description?: string;
}

export default function Placeholder({
  title,
  description = "This page hasn't been built out yet. Keep prompting to describe what you'd like to see here and it will come to life.",
}: PlaceholderProps) {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-gold/40 bg-brand-navy/5">
        <Construction className="h-7 w-7 text-brand-gold" />
      </div>
      <h1 className="mt-8 font-display text-4xl font-semibold text-foreground">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">{description}</p>
      <Button asChild className="mt-8 bg-brand-navy hover:bg-brand-navy/90">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}
