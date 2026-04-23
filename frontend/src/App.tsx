import { lazy, Suspense, memo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { isAuthenticated } from "@/lib/api";
import { Loader2 } from "lucide-react";

// Lazy load all page components
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const VerifyOTP = lazy(() => import("./pages/auth/VerifyOTP"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const Candidates = lazy(() => import("./pages/Candidates"));
const Screenings = lazy(() => import("./pages/Screenings"));
const Reports = lazy(() => import("./pages/Reports"));
const Insights = lazy(() => import("./pages/Insights"));
const AIActivity = lazy(() => import("./pages/AIActivity"));
const Account = lazy(() => import("./pages/Account"));
const Team = lazy(() => import("./pages/Team"));
const Billing = lazy(() => import("./pages/Billing"));
const Help = lazy(() => import("./pages/Help"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Loading fallback component
const PageLoader = memo(() => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
));

const RequireAuth = memo(({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
});

const queryClient = new QueryClient();

const App = memo(() => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<VerifyOTP />} />

              <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/candidates" element={<Candidates />} />
                <Route path="/screenings" element={<Screenings />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/ai-activity" element={<AIActivity />} />
                <Route path="/account" element={<Account />} />
                <Route path="/team" element={<Team />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/help" element={<Help />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
));

export default App;
