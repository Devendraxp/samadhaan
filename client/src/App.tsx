import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Layout } from "@/components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Complaints from "./pages/Complaints";
import ComplaintDetail from "./pages/ComplaintDetail";
import CreateComplaint from "./pages/CreateComplaint";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import NotificationDetail from "./pages/NotificationDetail";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import StaffDashboard from "./pages/dashboard/StaffDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Layout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/complaints" element={<Complaints />} />
              <Route path="/complaint/create" element={<CreateComplaint />} />
              <Route path="/complaint/:id" element={<ComplaintDetail />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/notifications/:id" element={<NotificationDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard/student" element={<StudentDashboard />} />
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/dashboard/mess" element={<StaffDashboard domain="MESS" />} />
              <Route path="/dashboard/internet" element={<StaffDashboard domain="INTERNET" />} />
              <Route path="/dashboard/cleaning" element={<StaffDashboard domain="CLEANING" />} />
              <Route path="/dashboard/water" element={<StaffDashboard domain="WATER" />} />
              <Route path="/dashboard/transport" element={<StaffDashboard domain="TRANSPORT" />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
