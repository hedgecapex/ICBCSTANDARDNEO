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
import MarketDetail from "./pages/MarketDetail";
import Careers from "./pages/Careers";
import Access from "./pages/Access";
import Dashboard from "./pages/Dashboard";
import Registration from "./pages/Registration";
import AdminApplications from "./pages/AdminApplications";
import ApplicationStatus from "./pages/ApplicationStatus";
import OpeningDeposit from "./pages/OpeningDeposit";
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
            <Route path="/markets/:market" element={<MarketDetail />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/sign-in" element={<Access />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/online-access" element={<Access setup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/application-status" element={<ApplicationStatus />} />
            <Route path="/opening-deposit" element={<OpeningDeposit />} />
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
