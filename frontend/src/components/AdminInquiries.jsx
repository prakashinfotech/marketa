import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Mail, Calendar, CheckCircle, 
  AlertCircle, Loader2, Inbox, Clock, Filter
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function AdminInquiries() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    fetchInquiries();
  }, [isLoggedIn]);

  const fetchInquiries = async () => {
    try {
      const res = await api.get('/contact/');
      if (res.data.success) setInquiries(res.data.data);
      else setError(res.data.msg);
    } catch (err) {
      setError('Unauthorized or server error. Are you an admin?');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      const res = await api.patch(`/contact/${id}/resolve/`);
      if (res.data.success) {
        setInquiries(inquiries.map(m => m.id === id ? { ...m, is_resolved: true } : m));
      }
    } catch (err) {
      console.error('Failed to resolve inquiry');
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    if (filter === 'pending') return !inq.is_resolved;
    if (filter === 'resolved') return inq.is_resolved;
    return true;
  });

  const pendingCount = inquiries.filter(i => !i.is_resolved).length;
  const resolvedCount = inquiries.filter(i => i.is_resolved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">User Inquiries</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage and respond to user inquiries.</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-700">{pendingCount}</span>
            <span className="text-xs text-amber-600 font-medium">Pending</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-700">{resolvedCount}</span>
            <span className="text-xs text-emerald-600 font-medium">Resolved</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl mb-6 w-fit">
        {[
          { key: 'all', label: 'All', count: inquiries.length },
          { key: 'pending', label: 'Pending', count: pendingCount },
          { key: 'resolved', label: 'Resolved', count: resolvedCount },
        ].map(tab => (
          <button 
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              filter === tab.key 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-md ${
              filter === tab.key ? 'bg-gray-100 text-gray-600' : 'bg-gray-200/60 text-gray-400'
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {error && <div className="toast-error mb-6"><AlertCircle className="w-5 h-5 shrink-0" /> {error}</div>}

      {filteredInquiries.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">No inquiries found</h2>
          <p className="text-sm text-gray-500 mt-1">All clear — no messages match this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inq) => (
            <div 
              key={inq.id} 
              className={`card overflow-hidden transition-all duration-300 ${
                inq.is_resolved ? 'opacity-60 hover:opacity-80' : ''
              }`}
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                      inq.is_resolved 
                        ? 'bg-gray-100 text-gray-500' 
                        : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-200/30'
                    }`}>
                      {inq.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900">{inq.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {inq.email}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(inq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!inq.is_resolved ? (
                    <button 
                      onClick={() => handleResolve(inq.id)}
                      className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-200/30 hover:shadow-lg transition-all shrink-0"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                  ) : (
                    <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <CheckCircle className="w-3 h-3" /> Resolved
                    </span>
                  )}
                </div>

                <div className="mt-4 bg-gray-50/80 rounded-xl p-4 border border-gray-100/80">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    {inq.subject}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {inq.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
