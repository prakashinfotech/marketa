import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import { ShieldAlert, Flag, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminReports() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const isAdmin = user?.role_id === 1 || user?.role_id === 2;

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchReports();
  }, [isLoggedIn, isAdmin, navigate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/admin/');
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    setUpdating(reportId);
    try {
      const res = await api.put(`/reports/admin/${reportId}/status/`, { status: newStatus });
      if (res.data.success) {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update report status.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" /> Moderation: Ad Reports
          </h1>
          <button 
            onClick={fetchReports}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">All clear!</h2>
            <p className="text-gray-500">There are no pending reports at the moment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Report Details</th>
                    <th className="px-6 py-4">Ad Information</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <Flag className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-gray-900 capitalize mb-1">{report.reason}</p>
                            <p className="text-xs text-gray-500 mb-2">by {report.reporter_name} on {format(new Date(report.created_at), 'MMM dd, yyyy')}</p>
                            {report.description && (
                              <p className="text-xs text-gray-700 bg-gray-100 p-2 rounded max-w-xs">{report.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[200px]">
                          <p className="font-semibold text-gray-900 truncate" title={report.ad_title}>{report.ad_title}</p>
                          <Link 
                            to={`/ad/${report.ad_id}`} 
                            target="_blank"
                            className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                          >
                            View Ad <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          report.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                          report.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {report.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdateStatus(report.id, 'resolved')}
                              disabled={updating === report.id}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-bold disabled:opacity-50 transition-colors"
                            >
                              Mark Resolved
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                              disabled={updating === report.id}
                              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded text-xs font-bold disabled:opacity-50 transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
