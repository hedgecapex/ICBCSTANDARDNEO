import "./global.css";

import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
const Index = lazy(() => import("./pages/Index"));
const Legal = lazy(() => import("./pages/Legal"));
const MarketDetail = lazy(() => import("./pages/MarketDetail"));
const Careers = lazy(() => import("./pages/Careers"));
const Access = lazy(() => import("./pages/Access"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Registration = lazy(() => import("./pages/Registration"));
const AdminApplications = lazy(() => import("./pages/AdminApplications"));
const FinancingApplication = lazy(() => import("./pages/FinancingApplication"));
const FinancingTools = lazy(() => import("./pages/FinancingTools"));
const AdminFinancing = lazy(() => import("./pages/AdminFinancing"));
const ClientFinancing = lazy(() => import("./pages/ClientFinancing"));
const AdminNotifications = lazy(() => import("./pages/AdminNotifications"));
const AdminAudit = lazy(() => import("./pages/AdminAudit"));
const ApplicationStatus = lazy(() => import("./pages/ApplicationStatus"));
const OpeningDeposit = lazy(() => import("./pages/OpeningDeposit"));
const AdminDeposits = lazy(() => import("./pages/AdminDeposits"));
const Messages = lazy(() => import("./pages/Messages"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center bg-secondary text-sm text-muted-foreground">Loading page…</div>}>
          <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/markets/:market" element={<MarketDetail />} />
            <Route path="/financing/apply" element={<FinancingApplication />} />
            <Route path="/financing/tools" element={<FinancingTools />} />
            <Route path="/admin/financing" element={<AdminFinancing />} />
            <Route path="/client/financing" element={<ClientFinancing />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/audit" element={<AdminAudit />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/sign-in" element={<Access />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/online-access" element={<Access setup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/application-status" element={<ApplicationStatus />} />
            <Route path="/opening-deposit" element={<OpeningDeposit />} />
            <Route path="/admin/deposits" element={<AdminDeposits />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/legal/:type" element={<Legal />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
