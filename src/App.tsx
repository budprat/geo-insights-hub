import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import PortfolioCommand from "@/pages/PortfolioCommand";
import AssetBriefing from "@/pages/AssetBriefing";
import EvidenceExplorer from "@/pages/EvidenceExplorer";
import WorkflowBuilder from "@/pages/WorkflowBuilder";
import ROICalculator from "@/pages/ROICalculator";
import ScenarioSimulator from "@/pages/ScenarioSimulator";
import CommunityChallenges from "@/pages/CommunityChallenges";
import InsightMarketplace from "@/pages/InsightMarketplace";
import LiveMonitoring from "@/pages/LiveMonitoring";
import SatelliteTracker from "@/pages/SatelliteTracker";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<PortfolioCommand />} />
            <Route path="/asset/:assetId" element={<AssetBriefing />} />
            <Route path="/evidence/:assetId" element={<EvidenceExplorer />} />
            <Route path="/workflows" element={<WorkflowBuilder />} />
            <Route path="/roi" element={<ROICalculator />} />
            <Route path="/scenarios" element={<ScenarioSimulator />} />
            <Route path="/community" element={<CommunityChallenges />} />
            <Route path="/marketplace" element={<InsightMarketplace />} />
            <Route path="/monitoring" element={<LiveMonitoring />} />
            <Route path="/satellites" element={<SatelliteTracker />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
