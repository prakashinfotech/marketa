import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import { 
  PackageSearch, Edit, Trash2, Power, Eye, Loader2, 
  MapPin, CheckCircle, Clock, AlertCircle, RefreshCw, MessageSquare, Inbox
} from 'lucide-react';

export default function MyAds() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, active, sold, inactive
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteModalAdId, setDeleteModalAdId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchMyAds();
  }, [isLoggedIn, activeTab]);

  const fetchMyAds = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'all' ? '/ads/me/' : `/ads/me/?status=${activeTab}`;
      const res = await api.get(endpoint);
      if (res.data.success) {
        setAds(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching ads:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (adId, newStatus) => {
    setActionLoading(`status-${adId}`);
    try {
      const res = await api.put(`/ads/${adId}/status/`, { status: newStatus });
      if (res.data.success) {
        fetchMyAds(); // Refresh list to reflect changes
      } else {
        alert(res.data.msg);
      }
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (adId) => {
    setDeleteModalAdId(adId);
  };

  const executeDelete = async () => {
    if (!deleteModalAdId) return;
    const adId = deleteModalAdId;
    setDeleteModalAdId(null);
    setActionLoading(`delete-${adId}`);
    try {
      const res = await api.delete(`/ads/${adId}/`);
      if (res.data.success) {
        setAds(ads.filter(ad => ad.id !== adId));
      } else {
        alert(res.data.msg);
      }
    } catch (err) {
      alert("Failed to delete ad.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Active</span>;
      case 'sold':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><PackageSearch className="w-3 h-3"/> Sold</span>;
      case 'inactive':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 flex items-center gap-1"><Power className="w-3 h-3"/> Inactive</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1"><Clock className="w-3 h-3"/> {status}</span>;
    }
  };

  const tabs = [
    { id: 'all', label: 'All Ads' },
    { id: 'active', label: 'Active' },
    { id: 'sold', label: 'Sold' },
    { id: 'inactive', label: 'Inactive' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">My Ads</h1>
          <div className="flex items-center gap-3">
            {/* Inquiries Hub disabled for now */}
            <Link to="/post-ad" className="btn-primary">Post New Ad</Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 border-b border-gray-200 pb-px">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'border-primary-600 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads found</h3>
            <p className="text-gray-500 mb-6">You don't have any {activeTab !== 'all' ? activeTab : ''} ads yet.</p>
            {activeTab === 'all' && (
              <Link to="/post-ad" className="btn-primary inline-flex">Start Selling</Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {ads.map(ad => (
              <div key={ad.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 hover:border-primary-200 transition-colors">
                
                {/* Image */}
                <div className="w-full sm:w-40 h-40 sm:h-32 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative group">
                  <img 
                    src={ad.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=400&q=80'} 
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link to={`/ad/${ad.id}`} className="text-white text-sm font-medium flex items-center gap-1 hover:underline">
                      <Eye className="w-4 h-4" /> View Ad
                    </Link>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                        <Link to={`/ad/${ad.id}`} className="hover:text-primary-600">{ad.title}</Link>
                      </h3>
                      <div className="shrink-0 font-bold text-lg text-primary-600">
                        ₹{parseFloat(ad.price).toLocaleString('en-IN')}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                      {getStatusBadge(ad.status)}
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ad.city}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {ad.views_count || 0} views</span>
                      {ad.inquiry_count > 0 && (
                        <span className="flex items-center gap-1 text-indigo-600 font-medium">
                          <MessageSquare className="w-3.5 h-3.5" /> {ad.inquiry_count} {ad.inquiry_count === 1 ? 'inquiry' : 'inquiries'}
                        </span>
                      )}
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(ad.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-100">
                    <Link 
                      to={`/edit-ad/${ad.id}`}
                      className="btn-outline px-3 py-1.5 text-sm flex items-center gap-1.5 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </Link>
                    
                    {ad.status === 'active' && (
                      <>
                        <button 
                          onClick={() => handleStatusChange(ad.id, 'sold')}
                          disabled={actionLoading === `status-${ad.id}`}
                          className="btn-outline px-3 py-1.5 text-sm flex items-center gap-1.5 text-blue-600 hover:bg-blue-50 border-blue-200"
                        >
                          {actionLoading === `status-${ad.id}` ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle className="w-4 h-4" />} Mark Sold
                        </button>
                        <button 
                          onClick={() => handleStatusChange(ad.id, 'inactive')}
                          disabled={actionLoading === `status-${ad.id}`}
                          className="btn-outline px-3 py-1.5 text-sm flex items-center gap-1.5 text-gray-600 hover:bg-gray-100"
                        >
                          {actionLoading === `status-${ad.id}` ? <Loader2 className="w-4 h-4 animate-spin"/> : <Power className="w-4 h-4" />} Deactivate
                        </button>
                      </>
                    )}

                    {(ad.status === 'sold' || ad.status === 'inactive') && (
                      <button 
                        onClick={() => handleStatusChange(ad.id, 'active')}
                        disabled={actionLoading === `status-${ad.id}`}
                        className="btn-outline px-3 py-1.5 text-sm flex items-center gap-1.5 text-green-600 hover:bg-green-50 border-green-200"
                      >
                        {actionLoading === `status-${ad.id}` ? <Loader2 className="w-4 h-4 animate-spin"/> : <RefreshCw className="w-4 h-4" />} Reactivate
                      </button>
                    )}

                    <button 
                      onClick={() => handleDelete(ad.id)}
                      disabled={actionLoading === `delete-${ad.id}`}
                      className="btn-outline px-3 py-1.5 text-sm flex items-center gap-1.5 text-red-600 hover:bg-red-50 border-red-200 ml-auto"
                    >
                      {actionLoading === `delete-${ad.id}` ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />} Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Ad Confirmation Modal */}
      {deleteModalAdId && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Ad?</h3>
              <p className="text-center text-gray-600 mb-6">
                Are you sure you want to permanently delete this ad? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalAdId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
                >
                  Yes, Delete Ad
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
