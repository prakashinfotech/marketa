import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { 
  MessageSquare, LayoutDashboard, LogOut, MapPin, Layers, 
  ChevronRight, Home, ExternalLink
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare, badge: null },
    { name: 'Locations', path: '/admin/locations', icon: MapPin, badge: null },
    { name: 'Categories', path: '/admin/categories', icon: Layers, badge: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* ─── Sidebar ──────────────────────────────────── */}
      <aside className="w-[260px] bg-gray-950 text-gray-400 flex flex-col border-r border-gray-800/50">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-800/50">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-extrabold text-lg">Q</span>
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight block leading-tight">Admin Panel</span>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">QuikrClone</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 px-3">
          <p className="px-3 text-[10px] font-bold text-gray-600 uppercase tracking-[0.15em] mb-3">Management</p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-[0.8125rem] transition-all duration-200 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white border border-indigo-500/20' 
                      : 'hover:bg-gray-800/60 hover:text-gray-200 border border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-indigo-500/20 text-indigo-400' 
                      : 'bg-gray-800/60 text-gray-500 group-hover:text-gray-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </Link>
              );
            })}
          </div>

          <div className="mt-8">
            <p className="px-3 text-[10px] font-bold text-gray-600 uppercase tracking-[0.15em] mb-3">Quick Access</p>
            <Link to="/" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[0.8125rem] text-gray-500 hover:text-gray-200 hover:bg-gray-800/60 transition-all group border border-transparent">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-800/60 text-gray-500 group-hover:text-gray-300">
                <ExternalLink className="w-4 h-4" />
              </div>
              <span>View Website</span>
            </Link>
          </div>
        </nav>

        {/* User profile */}
        <div className="p-3 border-t border-gray-800/50">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-900/50">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-indigo-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-gray-500 truncate font-medium">{user?.email || 'admin@quikr.com'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 mt-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 h-16 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">Admin</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="font-semibold text-gray-800">
              {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-400">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
