/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { PageTransition } from './components/PageTransition';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HeritageBackground } from './components/HeritageBackground';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { AdminLayout } from './components/AdminLayout';
import { LandingPage } from './pages/LandingPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { LoginPage } from './pages/LoginPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { AboutServicesPage } from './pages/AboutServicesPage';
import { FirstTimeAnimation } from './components/FirstTimeAnimation';
import { ContactForm } from './components/ContactForm';
import { AuthProvider } from './contexts/AuthContext';
import { PropertiesProvider } from './contexts/PropertiesContext';
import { useAuth } from './contexts/AuthContext';
import { ProjectsPage } from './pages/ProjectsPage';
import { MediaPage } from './pages/MediaPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Guard: redirect to /login if not authenticated
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <PropertiesProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* ── Login (no layout) ── */}
            <Route path="/login" element={<LoginPage />} />

            {/* ── Admin Portal (protected, own layout) ── */}
            <Route
              path="/admin/*"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <Routes>
                      <Route path="properties" element={<PageTransition><PropertiesPage isAdmin /></PageTransition>} />
                      <Route path="" element={<Navigate to="properties" replace />} />
                      <Route path="*" element={<Navigate to="properties" replace />} />
                    </Routes>
                  </AdminLayout>
                </RequireAuth>
              }
            />

            {/* ── Public Site (always public, own layout) ── */}
            <Route path="*" element={<PublicLayout />} />
          </Routes>
        </Router>
      </PropertiesProvider>
    </AuthProvider>
  );
}

function PublicLayout() {
  const location = useLocation();
  const isPropertyPage = location.pathname.startsWith('/property/');

  return (
    <div className="relative min-h-screen">
      <HeritageBackground />
      <FirstTimeAnimation>
        <>
          {!isPropertyPage && <Navigation />}
          <main className="relative z-10">
            <Routes>
              <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
              <Route path="/properties" element={<PageTransition><PropertiesPage /></PageTransition>} />
              <Route path="/projects" element={<PageTransition><ProjectsPage /></PageTransition>} />
              <Route path="/media" element={<PageTransition><MediaPage /></PageTransition>} />
              <Route path="/property/:id" element={<PageTransition><PropertyDetailsPage /></PageTransition>} />
              <Route path="/privacy" element={<PageTransition><PrivacyPolicyPage /></PageTransition>} />
              <Route path="/about" element={<PageTransition><AboutUsPage /></PageTransition>} />
              <Route path="/about/services" element={<PageTransition><AboutServicesPage /></PageTransition>} />
              <Route path="/contact" element={<PageTransition><ContactForm standalone={true} /></PageTransition>} />
            </Routes>
          </main>
          <Footer />
        </>
      </FirstTimeAnimation>
    </div>
  );
}
