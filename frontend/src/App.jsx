import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ToastProvider } from './ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalShortcuts from './components/GlobalShortcuts';
import { PageSpinner } from './components/ui';

// Eagerly loaded — needed on every page render
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Lazy-loaded — code-split per page for faster initial paint
const HomePage           = lazy(() => import('./components/HomePage'));
const Login              = lazy(() => import('./components/Login'));
const Signup             = lazy(() => import('./components/Signup'));
const Profile            = lazy(() => import('./components/Profile'));
const About              = lazy(() => import('./components/About'));
const Contact            = lazy(() => import('./components/Contact'));
const Favorites          = lazy(() => import('./components/Favorites'));
const PostAd             = lazy(() => import('./components/PostAd'));
const SearchResults      = lazy(() => import('./components/SearchResults'));
const AdDetails          = lazy(() => import('./components/AdDetails'));
const Chat               = lazy(() => import('./components/Chat'));
const AdminInquiries     = lazy(() => import('./components/AdminInquiries'));
const AdminLocations     = lazy(() => import('./components/AdminLocations'));
const AdminCategories    = lazy(() => import('./components/AdminCategories'));
const AdminReports       = lazy(() => import('./components/AdminReports'));
const AdminFAQs          = lazy(() => import('./components/AdminFAQs'));
const AdminKnowledgeBase = lazy(() => import('./components/AdminKnowledgeBase'));
const AdminLayout        = lazy(() => import('./components/AdminLayout'));
const AdminLogin         = lazy(() => import('./components/AdminLogin'));
const ChatBot            = lazy(() => import('./components/ChatBot'));
const TermsOfUse         = lazy(() => import('./components/TermsOfUse'));
const PrivacyPolicy      = lazy(() => import('./components/PrivacyPolicy'));
const ServicesPage       = lazy(() => import('./components/ServicesPage'));
const VerifyEmail        = lazy(() => import('./components/VerifyEmail'));
const ForgotPassword     = lazy(() => import('./components/ForgotPassword'));
const ResetPassword      = lazy(() => import('./components/ResetPassword'));
const MyAds              = lazy(() => import('./components/MyAds'));
const SearchAlerts       = lazy(() => import('./components/SearchAlerts'));
const Notifications      = lazy(() => import('./components/Notifications'));
const NotFound           = lazy(() => import('./components/NotFound'));

function PublicLayout({ children }) {
  const { user } = useAuth();
  const isAdmin = user?.role_id === 1 || user?.role_id === 2;

  const location = useLocation();
  if (isAdmin && location.pathname === '/contact') {
    return <Navigate to="/admin/inquiries" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 text-sm font-semibold text-gray-900"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Suspense fallback={<PageSpinner />}>{children}</Suspense>
      </main>
      <Footer />
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <ScrollToTop />
            <GlobalShortcuts />
            <Routes>
              {/* Admin */}
              <Route
                path="/admin/login"
                element={<Suspense fallback={<PageSpinner />}><AdminLogin /></Suspense>}
              />
              <Route
                path="/admin"
                element={<Suspense fallback={<PageSpinner />}><AdminLayout /></Suspense>}
              >
                <Route index element={<Navigate to="categories" replace />} />
                <Route path="inquiries"      element={<Suspense fallback={<PageSpinner />}><AdminInquiries /></Suspense>} />
                <Route path="locations"      element={<Suspense fallback={<PageSpinner />}><AdminLocations /></Suspense>} />
                <Route path="categories"     element={<Suspense fallback={<PageSpinner />}><AdminCategories /></Suspense>} />
                <Route path="reports"        element={<Suspense fallback={<PageSpinner />}><AdminReports /></Suspense>} />
                <Route path="faqs"           element={<Suspense fallback={<PageSpinner />}><AdminFAQs /></Suspense>} />
                <Route path="knowledge-base" element={<Suspense fallback={<PageSpinner />}><AdminKnowledgeBase /></Suspense>} />
              </Route>

              {/* Public */}
              <Route path="/"                element={<PublicLayout><HomePage /></PublicLayout>} />
              <Route path="/login"           element={<PublicLayout><Login /></PublicLayout>} />
              <Route path="/signup"          element={<PublicLayout><Signup /></PublicLayout>} />
              <Route path="/profile"         element={<PublicLayout><Profile /></PublicLayout>} />
              <Route path="/about"           element={<PublicLayout><About /></PublicLayout>} />
              <Route path="/contact"         element={<PublicLayout><Contact /></PublicLayout>} />
              <Route path="/favorites"       element={<PublicLayout><Favorites /></PublicLayout>} />
              <Route path="/post-ad"         element={<PublicLayout><PostAd /></PublicLayout>} />
              <Route path="/search"          element={<PublicLayout><SearchResults /></PublicLayout>} />
              <Route path="/ad/:id"          element={<PublicLayout><AdDetails /></PublicLayout>} />
              <Route path="/chat"            element={<PublicLayout><Chat /></PublicLayout>} />
              <Route path="/services"        element={<PublicLayout><ServicesPage /></PublicLayout>} />
              <Route path="/terms"           element={<PublicLayout><TermsOfUse /></PublicLayout>} />
              <Route path="/privacy"         element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
              <Route path="/verify"          element={<PublicLayout><VerifyEmail /></PublicLayout>} />
              <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
              <Route path="/reset-password"  element={<PublicLayout><ResetPassword /></PublicLayout>} />
              <Route path="/my-ads"          element={<PublicLayout><MyAds /></PublicLayout>} />
              <Route path="/edit-ad/:id"     element={<PublicLayout><PostAd /></PublicLayout>} />
              <Route path="/alerts"          element={<PublicLayout><SearchAlerts /></PublicLayout>} />
              <Route path="/notifications"   element={<PublicLayout><Notifications /></PublicLayout>} />

              {/* 404 — must be last */}
              <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
