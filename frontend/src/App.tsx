import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./pages/LandingPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ProfilePage } from "./pages/ProfilePage";
import { InstitutionDashboard } from "./pages/InstitutionDashboard";
import { IssueCredential } from "./pages/IssueCredential";
import { StudentWallet } from "./pages/StudentWallet";
import { VerifierPortal } from "./pages/VerifierPortal";
import { CredentialExplorer } from "./pages/CredentialExplorer";
import { AboutPage } from "./pages/AboutPage";
import { AIChatbot } from "./components/AIChatbot";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Core Application Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/institution" element={<InstitutionDashboard />} />
              <Route path="/institution/issue" element={<IssueCredential />} />
              <Route path="/student" element={<StudentWallet />} />
              <Route path="/verify" element={<VerifierPortal />} />
              <Route path="/credentials" element={<CredentialExplorer />} />
              <Route path="/about" element={<AboutPage />} />

              {/* Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute requireAuth={true}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>
          <Footer />
          {/* Global Floating AI Assistant */}
          <AIChatbot />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
