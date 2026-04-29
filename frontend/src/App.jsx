import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import About from './components/About';
import Contact from './components/Contact';
import Favorites from './components/Favorites';
import PostAd from './components/PostAd';
import SearchResults from './components/SearchResults';
import AdDetails from './components/AdDetails';
import Chat from './components/Chat';
import AdminInquiries from './components/AdminInquiries';
import AdminLocations from './components/AdminLocations';
import AdminCategories from './components/AdminCategories';
import AdminLayout from './components/AdminLayout';

function PublicLayout({ children }) {
  const { user } = useAuth();
  const isAdmin = user?.role_id === 1 || user?.role_id === 2;

  // Protect regular contact page from admins if they accidentally go there
  const location = useLocation();
  if (isAdmin && location.pathname === '/contact') {
    return <Navigate to="/admin/inquiries" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin Routes with Dedicated Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="inquiries" replace />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="locations" element={<AdminLocations />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>

          {/* Public Routes with Navbar & Footer */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/signup" element={<PublicLayout><Signup /></PublicLayout>} />
          <Route path="/profile" element={<PublicLayout><Profile /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/favorites" element={<PublicLayout><Favorites /></PublicLayout>} />
          <Route path="/post-ad" element={<PublicLayout><PostAd /></PublicLayout>} />
          <Route path="/search" element={<PublicLayout><SearchResults /></PublicLayout>} />
          <Route path="/ad/:id" element={<PublicLayout><AdDetails /></PublicLayout>} />
          <Route path="/chat" element={<PublicLayout><Chat /></PublicLayout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
