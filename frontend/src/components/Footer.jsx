import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Heart, ExternalLink } from 'lucide-react';
import api from '../api';

export default function Footer() {
  const { user, isLoggedIn, logout } = useAuth();
  const isAdmin = user?.role_id === 1 || user?.role_id === 2;
  const year = new Date().getFullYear();
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories/');
        if (res.data.success) {
          setCategories(res.data.data.slice(0, 6));
        }
      } catch (err) {
        console.error("Footer categories fetch failed", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <footer className="bg-gray-950 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-extrabold text-lg">Q</span>
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">QuikrClone</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              India's largest classifieds platform. Buy, sell, rent — everything you need in one place.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-[0.15em]">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              {categories.length > 0 ? (
                categories.map(cat => (
                  <li key={cat.id}>
                    <Link to={`/search?category_id=${cat.id}`} className="text-gray-500 hover:text-white transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                // Skeleton loading state
                [1, 2, 3, 4].map(i => (
                  <li key={i} className="h-4 w-24 bg-gray-800/50 animate-pulse rounded-md"></li>
                ))
              )}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-[0.15em]">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/post-ad" className="text-gray-500 hover:text-white transition-colors">Post Free Ad</Link></li>
              {isLoggedIn ? (
                <>
                  <li><Link to="/profile" className="text-gray-500 hover:text-white transition-colors">My Profile</Link></li>
                  <li><Link to="/favorites" className="text-gray-500 hover:text-white transition-colors">My Favorites</Link></li>
                  <li><button onClick={logout} className="text-gray-500 hover:text-white transition-colors">Logout</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/signup" className="text-gray-500 hover:text-white transition-colors">Create Account</Link></li>
                  <li><Link to="/login" className="text-gray-500 hover:text-white transition-colors">Login</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-[0.15em]">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="text-gray-500 hover:text-white transition-colors">About Us</Link></li>
              {!isAdmin && (
                <li><Link to="/contact" className="text-gray-500 hover:text-white transition-colors">Contact Us</Link></li>
              )}
              <li><Link to="/terms" className="text-gray-500 hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link to="/privacy" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/50 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {year} QuikrClone. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 flex items-center gap-1.5">
            Built with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for educational purposes
          </p>
        </div>
      </div>
    </footer>
  );
}
