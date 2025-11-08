import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import Auth from "./pages/Auth";
import Resellers from "./pages/Resellers";
import Manufacturers from "./pages/Manufacturers";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";

export default function App() {
  return (
    <Router>
      <div className="bg-[#F9FAFB] text-[#111827] font-sans">
        <Navbar />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/resellers" 
            element={
              <ProtectedRoute requiredRole="reseller">
                <Resellers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manufacturers" 
            element={
              <ProtectedRoute requiredRole="manufacturer">
                <Manufacturers />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Features />
                <HowItWorks />
                <CTA />
              </>
            }
          />
        </Routes>
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}
