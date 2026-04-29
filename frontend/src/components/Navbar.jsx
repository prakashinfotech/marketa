import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { 
  Search, Menu, X, PlusCircle, User, LogOut, ChevronDown, 
  MessageSquare, MessageCircle, Heart, Bell, Settings, LayoutDashboard 
} from 'lucide-react';

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const isAdmin = user?.role_id === 1 || user?.role_id === 2;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm' 
        : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200/50 group-hover:shadow-lg group-hover:shadow-indigo-300/50 transition-all">
              <span className="text-white font-extrabold text-lg">Q</span>
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              Quikr<span className="text-gradient">Clone</span>
            </span>
          </Link>

          {/* Search Bar — desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search for mobiles, cars, jobs and more..."
                className="input-field pl-10 !py-2.5 !rounded-xl !bg-gray-50/80 !border-gray-200/80 hover:!border-gray-300 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link to="/chat" className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-indigo-600 transition-colors" title="Messages">
                  <MessageCircle className="w-5 h-5" />
                </Link>

                <Link to="/favorites" className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-red-500 transition-colors" title="Favorites">
                  <Heart className="w-5 h-5" />
                </Link>

                <Link
                  to="/post-ad"
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-200/40 hover:shadow-lg hover:shadow-amber-300/40 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Free Ad
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-sm transition-all ${
                      dropdownOpen ? 'bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="font-semibold text-gray-700 max-w-[100px] truncate hidden lg:inline">
                      {user?.name || 'User'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 z-50 animate-scale-in">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <User className="w-4 h-4 text-gray-400" /> My Profile
                        </Link>
                        <Link to="/favorites" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Heart className="w-4 h-4 text-gray-400" /> My Favorites
                        </Link>
                        {isAdmin && (
                          <Link to="/admin/inquiries" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-gray-400" /> Admin Panel
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all">
                  Log In
                </Link>
                <Link to="/signup" className="btn-primary !px-5 !py-2">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-5 pt-3 space-y-2 animate-slide-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search..." className="input-field pl-10" />
          </div>
          {isLoggedIn ? (
            <>
              <Link to="/post-ad" onClick={() => setMobileOpen(false)} className="block w-full text-center bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 rounded-xl text-sm font-bold">Post Free Ad</Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50"><User className="w-4 h-4 text-gray-400" />My Profile</Link>
              <Link to="/favorites" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50"><Heart className="w-4 h-4 text-gray-400" />My Favorites</Link>
              {isAdmin && (
                <Link to="/admin/inquiries" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50"><LayoutDashboard className="w-4 h-4 text-gray-400" />Admin Panel</Link>
              )}
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 rounded-lg hover:bg-red-50">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Log In</Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center btn-primary !py-2.5">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
