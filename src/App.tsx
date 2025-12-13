import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, HydrationBoundary } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Cases from "./pages/Cases";
import Entities from "./pages/Entities";
import About from "./pages/About";
import Information from "./pages/Information";
import CaseDetail from "./pages/CaseDetail";
import EntityProfile from "./pages/EntityProfile";
import ReportAllegation from "./pages/ReportAllegation";
import EntityResponse from "./pages/EntityResponse";
import ModerationDashboard from "./pages/ModerationDashboard";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";

const App = () => {
  // Create a stable query client instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));

  // Get dehydrated state from SSR (if available)
  const dehydratedState = typeof window !== 'undefined' 
    ? (window as Window & { __REACT_QUERY_STATE__?: unknown }).__REACT_QUERY_STATE__ 
    : undefined;

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/case/:id" element={<CaseDetail />} />
            <Route path="/entities" element={<Entities />} />
            <Route path="/entity/:id" element={<EntityProfile />} />
            <Route path="/report" element={<ReportAllegation />} />
            <Route path="/entity-response/:id" element={<EntityResponse />} />
            <Route path="/moderation" element={<ModerationDashboard />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/information" element={<Information />} />
            <Route path="/about" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
};

export default App;
