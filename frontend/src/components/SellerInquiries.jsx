import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import {
  MessageSquare, ChevronDown, ChevronRight, Loader2, User,
  Eye, CheckCircle, Package, Clock, ArrowRight, Inbox
} from 'lucide-react';

export default function SellerInquiries() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAd, setExpandedAd] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchInquiries();
  }, [isLoggedIn]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chat/inquiries/');
      if (res.data.success) {
        setGroups(res.data.data);
        // Auto-expand the first group if only one
        if (res.data.data.length === 1) {
          setExpandedAd(res.data.data[0].ad_id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch inquiries', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (adId) => {
    setExpandedAd(prev => prev === adId ? null : adId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'sold': return 'bg-blue-100 text-blue-700';
      case 'inactive': return 'bg-gray-100 text-gray-600';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const totalInquiries = groups.reduce((sum, g) => sum + g.total_inquiries, 0);
  const totalUnread = groups.reduce((sum, g) => sum + g.total_unread, 0);

  return (
    <div className="bg-gray-50 min-h-screen py-10 animate-fade-in">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Inbox className="w-6 h-6 text-indigo-600" />
              Inquiries Hub
            </h1>
            <p className="text-sm text-gray-500 mt-1">All buyer conversations grouped by your ads</p>
          </div>
          <Link to="/my-ads" className="btn-outline text-sm flex items-center gap-1.5">
            <Package className="w-4 h-4" /> My Ads
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{totalInquiries}</p>
              <p className="text-xs text-gray-500 font-medium">Total Inquiries</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{totalUnread}</p>
              <p className="text-xs text-gray-500 font-medium">Unread Messages</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{groups.length}</p>
              <p className="text-xs text-gray-500 font-medium">Ads with Chats</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Inbox className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No inquiries yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              When buyers start chatting about your ads, their conversations will appear here grouped by ad.
            </p>
            <Link to="/post-ad" className="btn-primary inline-flex">Post an Ad</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.ad_id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                {/* Ad Header (Accordion trigger) */}
                <button
                  onClick={() => toggleExpand(group.ad_id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
                >
                  {/* Ad Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    {group.ad_image ? (
                      <img src={group.ad_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Ad Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{group.ad_title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getStatusColor(group.ad_status)}`}>
                        {group.ad_status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {group.ad_price && (
                        <span className="font-semibold text-indigo-600">₹{parseFloat(group.ad_price).toLocaleString('en-IN')}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {group.total_inquiries} {group.total_inquiries === 1 ? 'inquiry' : 'inquiries'}
                      </span>
                    </div>
                  </div>

                  {/* Unread badge + expand */}
                  <div className="flex items-center gap-3 shrink-0">
                    {group.total_unread > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                        {group.total_unread} new
                      </span>
                    )}
                    {expandedAd === group.ad_id ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Buyer List */}
                {expandedAd === group.ad_id && (
                  <div className="border-t border-gray-100 bg-gray-50/30 divide-y divide-gray-100">
                    {group.buyers.map((buyer) => (
                      <Link
                        key={buyer.room_id}
                        to={`/chat?room=${buyer.room_id}`}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-indigo-50/40 transition-colors group"
                      >
                        {/* Buyer Avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          {buyer.buyer_avatar ? (
                            <img src={buyer.buyer_avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-sm">
                              {buyer.buyer_name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>

                        {/* Buyer Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-semibold text-gray-900 text-sm">{buyer.buyer_name}</span>
                            {buyer.last_message_at && (
                              <span className="text-[10px] text-gray-400 shrink-0">
                                {new Date(buyer.last_message_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{buyer.last_message || 'No messages yet'}</p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                            <span>{buyer.message_count} messages</span>
                          </div>
                        </div>

                        {/* Unread + Arrow */}
                        <div className="flex items-center gap-2 shrink-0">
                          {buyer.unread_count > 0 && (
                            <span className="bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                              {buyer.unread_count}
                            </span>
                          )}
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      </Link>
                    ))}
                    
                    {/* View Ad link */}
                    <div className="px-5 py-3 bg-gray-50/50">
                      <Link 
                        to={`/ad/${group.ad_id}`} 
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Ad Details
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
