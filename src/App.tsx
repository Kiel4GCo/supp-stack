import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StackBuilder from "./pages/StackBuilder";
import DeficiencyAdvisor from "./pages/DeficiencyAdvisor";
import SupplementDetail from "./pages/SupplementDetail";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import SharedStack from "./pages/SharedStack";
import BloodWork from "./pages/BloodWork";
import MuscleBuildingGuide from "./pages/MuscleBuildingGuide";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/supplement/:id" element={<SupplementDetail />} />
          <Route path="/stack-builder" element={<StackBuilder />} />
          <Route path="/deficiency-advisor" element={<DeficiencyAdvisor />} />
          <Route path="/blood-work" element={<BloodWork />} />
          <Route path="/muscle-building-guide" element={<MuscleBuildingGuide />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/shared-stack/:shareToken" element={<SharedStack />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
