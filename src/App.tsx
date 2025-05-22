
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/AdminPages/UsersPage";
import CamerasPage from "./pages/AdminPages/CamerasPage";
import DetectionsPage from "./pages/AdminPages/DetectionsPage";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const RedirectBasedOnAuth = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RedirectBasedOnAuth />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected user routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* Protected admin routes */}
            <Route path="/users" element={
              <ProtectedRoute requiresAdmin={true}>
                <UsersPage />
              </ProtectedRoute>
            } />
            <Route path="/cameras" element={
              <ProtectedRoute requiresAdmin={true}>
                <CamerasPage />
              </ProtectedRoute>
            } />
            <Route path="/detections" element={
              <ProtectedRoute requiresAdmin={true}>
                <DetectionsPage />
              </ProtectedRoute>
            } />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
