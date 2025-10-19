import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginPage from "./components/auth/LoginPage";
import LicenseApplicationPage from "./components/auth/LicenseApplicationPage";
import ArtistDashboard from "./pages/artist/ArtistDashboard";
import ArtistProfile from "./pages/artist/ArtistProfile";
import ArtistStats from "./pages/artist/ArtistStats";
import ArtistPerformance from "./pages/artist/ArtistPerformance";
import ArtistUpload from "./pages/artist/ArtistUpload";
import ArtistMyMusic from "./pages/artist/ArtistMyMusic";
import ArtistApproved from "./pages/artist/ArtistApproved";
import ArtistDocuments from "./pages/artist/ArtistDocuments";
import ArtistSettings from "./pages/artist/ArtistSettings";
import CompanyStatistics from "./pages/company/CompanyStatistics";
import CompanyAudioPlayer from "./pages/company/CompanyAudioPlayer";
import CompanySettings from "./pages/company/CompanySettings";
import CompanyProfile from "./pages/company/CompanyProfile";
import CompanyLogSheets from "./pages/company/CompanyLogSheets";
import CreateLogSheet from "./pages/company/CreateLogSheet";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoutes from "./pages/admin/AdminRoutes";
import NotFound from "./pages/NotFound";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import { useAuth } from "./contexts/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactElement; roles?: Array<'ARTIST'|'COMPANY'|'ADMIN'> }>=({ children, roles })=>{
  const { isAuthenticated, userRole, loading } = useAuth();
  // While auth provider is initializing, do not redirect — allow it to finish
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (roles && (!userRole || !roles.includes(userRole))) return <Navigate to="/" replace />;
  return children;
};
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyMusic from "./pages/company/CompanyMusic";

// Admin entry component: shows login when not authenticated, dashboard otherwise
const AdminEntry: React.FC = () => {
  const { isAuthenticated, userRole, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-border border-t-transparent animate-spin"></div>
      </div>
    );
  }
  if (!isAuthenticated || userRole !== 'ADMIN') {
    return <LoginPage />;
  }
  return <AdminRoutes />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/license-application" element={<LicenseApplicationPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin/*" element={<AdminEntry />} />
              
              {/* Artist Routes */}
              <Route path="/artist" element={
                <ProtectedRoute roles={["ARTIST"]}>
                  <ArtistDashboard />
                </ProtectedRoute>
              } />
              <Route path="/artist/profile" element={
                <ProtectedRoute roles={["ARTIST"]}>
                  <ArtistProfile />
                </ProtectedRoute>
              } />
              <Route path="/artist/stats" element={
                <ProtectedRoute roles={["ARTIST"]}>
                  <ArtistStats />
                </ProtectedRoute>
              } />
              <Route path="/artist/performance" element={
                <ProtectedRoute roles={["ARTIST"]}>
                  <ArtistPerformance />
                </ProtectedRoute>
              } />
              <Route path="/artist/upload" element={
                <ProtectedRoute roles={["ARTIST"]}>
                  <ArtistUpload />
                </ProtectedRoute>
              } />
              <Route path="/artist/music" element={
                <ProtectedRoute roles={["ARTIST"]}>
                  <ArtistMyMusic />
                </ProtectedRoute>
              } />
              <Route path="/artist/music/:id" element={
                <ProtectedRoute roles={["ARTIST"]}>
                  <ArtistMyMusic />
                </ProtectedRoute>
              } />
              <Route path="/artist/approved" element={
                <ProtectedRoute roles={["ARTIST"]}>
                  <ArtistApproved />
                </ProtectedRoute>
              } />
              <Route path="/artist/documents" element={
                <ProtectedRoute roles={["ARTIST"]}>
                  <ArtistDocuments />
                </ProtectedRoute>
              } />
              <Route path="/artist/settings" element={
                <ProtectedRoute roles={["ARTIST"]}>
                  <ArtistSettings />
                </ProtectedRoute>
              } />
              
              {/* Company Routes */}
              <Route path="/company" element={<Navigate to="/company/dashboard" replace />} />
              <Route path="/company/dashboard" element={
                <ProtectedRoute roles={["COMPANY"]}>
                  <CompanyDashboard />
                </ProtectedRoute>
              } />
              <Route path="/company/music" element={
                <ProtectedRoute roles={["COMPANY"]}>
                  <CompanyMusic />
                </ProtectedRoute>
              } />
              <Route path="/company/player" element={
                <ProtectedRoute roles={["COMPANY"]}>
                  <CompanyAudioPlayer />
                </ProtectedRoute>
              } />
              <Route path="/company/stats" element={
                <ProtectedRoute roles={["COMPANY"]}>
                  <CompanyStatistics />
                </ProtectedRoute>
              } />
              <Route path="/company/logsheets" element={
                <ProtectedRoute roles={["COMPANY"]}>
                  <CompanyLogSheets />
                </ProtectedRoute>
              } />
              <Route path="/company/logsheet/create" element={
                <ProtectedRoute roles={["COMPANY"]}>
                  <CreateLogSheet />
                </ProtectedRoute>
              } />
              <Route path="/company/profile" element={
                <ProtectedRoute roles={["COMPANY"]}>
                  <CompanyProfile />
                </ProtectedRoute>
              } />
              <Route path="/company/settings" element={
                <ProtectedRoute roles={["COMPANY"]}>
                  <CompanySettings />
                </ProtectedRoute>
              } />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
