import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import { Bell, CheckCircle, IndianRupee, MessageCircle, MapPin, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchNotifications();
  }, [isLoggedIn, navigate]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/me/');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, adId) => {
    try {
      await api.put(`/notifications/${id}/read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      if (adId) {
        navigate(`/ad/${adId}`);
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'wishlist_update': return <IndianRupee className="w-5 h-5 text-green-500" />;
      case 'search_alert': return <Search className="w-5 h-5 text-indigo-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-indigo-500" /> Notifications
            </h1>
            <p className="text-gray-500 mt-1">Updates on your wishlist and search alerts.</p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button onClick={handleMarkAllAsRead} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
             <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">You're all caught up! No notifications yet.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                onClick={() => handleMarkAsRead(notif.id, notif.ad_id)}
                className={`bg-white rounded-xl shadow-sm border transition-colors p-5 flex items-start gap-4 cursor-pointer hover:border-indigo-300 ${!notif.is_read ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-100'}`}
              >
                <div className="shrink-0 mt-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notif.is_read ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    {getIcon(notif.type)}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className={`text-base ${!notif.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {notif.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  
                  <span className="text-xs font-medium text-gray-400 mt-3 block">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                {!notif.is_read && (
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shrink-0 mt-2"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
