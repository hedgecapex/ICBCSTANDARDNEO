import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route
              path="/markets/commodities"
              element={
                <Placeholder title="Commodities" />
              }
            />
            <Route
              path="/markets/foreign-exchange"
              element={
                <Placeholder title="Foreign Exchange" />
              }
            />
            <Route
              path="/markets/fixed-income"
              element={
                <Placeholder title="Fixed Income" />
              }
            />
            <Route
              path="/markets/primary-markets"
              element={
                <Placeholder title="Primary Markets" />
              }
            />
            <Route path="/careers" element={<Placeholder title="Careers" />} />
            <Route path="/sign-in" element={<Placeholder title="Sign In" />} />
            <Route
              path="/online-access"
              element={<Placeholder title="Set Up Online Access" />}
            />
            <Route
              path="/legal/terms"
              element={<Placeholder title="Terms & Conditions" />}
            />
            <Route
              path="/legal/privacy"
              element={<Placeholder title="Privacy Notice" />}
            />
            <Route
              path="/legal/regulatory-disclosures"
              element={<Placeholder title="Regulatory Disclosures" />}
            />
            <Route
              path="/legal/corporate-disclosures"
              element={<Placeholder title="Corporate Disclosures" />}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
