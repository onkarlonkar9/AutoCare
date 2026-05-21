import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AIAssistant } from "@/components/AIAssistant";
import { JobCardCalculator } from "@/components/JobCardCalculator";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/shared/RouteGuards";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import Payment from "./pages/Payment";
import Contact from "./pages/Contact";

// Owner
import DashboardLayout from "./layouts/DashboardLayout";
import OwnerDashboard from "./pages/owner/Dashboard";
import Vehicles from "./pages/owner/Vehicles";
import VehicleDetail from "./pages/owner/VehicleDetail";
import AddVehicle from "./pages/owner/AddVehicle";
import ServiceHistory from "./pages/owner/ServiceHistory";
import AddServiceRecord from "./pages/owner/AddServiceRecord";
import Analytics from "./pages/owner/Analytics";
import Notifications from "./pages/owner/Notifications";
import SettingsPage from "./pages/owner/Settings";

// Service Center
import ServiceCenterLayout from "./layouts/ServiceCenterLayout";
import SCDashboard from "./pages/service-center/Dashboard";
import JobCards from "./pages/service-center/JobCards";
import JobCardDetail from "./pages/service-center/JobCardDetail";
import JobCardInvoice from "./pages/service-center/JobCardInvoice";
import CreateJobCard from "./pages/service-center/CreateJobCard";
import Customers from "./pages/service-center/Customers";
import Mechanics from "./pages/service-center/Mechanics";
import VehicleLookup from "./pages/service-center/VehicleLookup";
import SCAnalytics from "./pages/service-center/Analytics";
import SCSettings from "./pages/service-center/Settings";
import SCExtensions from "./pages/service-center/Extensions";
import Supplies from "./pages/service-center/Supplies";
import WheelAlignment from "./pages/service-center/WheelAlignment";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/contact" element={<Navigate to="/" replace />} />

              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/payment" element={<Payment />} />
              </Route>

              {/* Vehicle Owner */}
              <Route element={<ProtectedRoute allowedRoles={["owner", "admin"]} />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<OwnerDashboard />} />
                  <Route path="vehicles" element={<Vehicles />} />
                  <Route path="vehicles/add" element={<AddVehicle />} />
                  <Route path="vehicles/:id" element={<VehicleDetail />} />
                  <Route path="services" element={<ServiceHistory />} />
                  <Route path="services/add" element={<AddServiceRecord />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* Service Center */}
              <Route element={<ProtectedRoute allowedRoles={["service_center", "admin"]} />}>
                <Route path="/service-center" element={<ServiceCenterLayout />}>
                  <Route index element={<SCDashboard />} />
                  <Route path="jobs" element={<JobCards />} />
                  <Route path="jobs/create" element={<CreateJobCard />} />
                  <Route path="jobs/:id" element={<JobCardDetail />} />
                  <Route path="jobs/:id/invoice" element={<JobCardInvoice />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="mechanics" element={<Mechanics />} />
                  <Route path="lookup" element={<VehicleLookup />} />
                  <Route path="analytics" element={<SCAnalytics />} />
                  <Route path="settings" element={<SCSettings />} />
                  <Route path="extensions" element={<SCExtensions />} />
                  <Route path="supplies" element={<Supplies />} />
                  <Route path="wheel-alignment" element={<WheelAlignment />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <AIAssistant />
            <JobCardCalculator />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
