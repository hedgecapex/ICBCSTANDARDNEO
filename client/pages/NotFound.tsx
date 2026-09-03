import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-7xl font-semibold text-brand-navy">
        404
      </p>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        Page not found
      </h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="mt-8 bg-brand-navy hover:bg-brand-navy/90">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
