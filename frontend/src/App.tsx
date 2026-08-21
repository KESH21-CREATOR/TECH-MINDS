import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./pages/LandingPage";
import { InstitutionDashboard } from "./pages/InstitutionDashboard";
import { IssueCredential } from "./pages/IssueCredential";
import { StudentWallet } from "./pages/StudentWallet";
import { VerifierPortal } from "./pages/VerifierPortal";
import { CredentialExplorer } from "./pages/CredentialExplorer";
import { AboutPage } from "./pages/AboutPage";

export const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/institution" element={<InstitutionDashboard />} />
            <Route path="/institution/issue" element={<IssueCredential />} />
            <Route path="/student" element={<StudentWallet />} />
            <Route path="/verify" element={<VerifierPortal />} />
            <Route path="/credentials" element={<CredentialExplorer />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
