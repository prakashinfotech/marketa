import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import {
  User, Mail, AtSign, Phone, Calendar, Shield,
  Save, AlertCircle, CheckCircle, Loader2, Camera, Eye, X, Smile
} from 'lucide-react';

// Predefined Cartoon Avatars
const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Toby',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
];

export default function Profile() {
  const { user, isLoggedIn, login, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(user);
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(!user);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // UI states
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [isLoggedIn]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me/');
      if (res.data.success) {
        const p = res.data.data;
        setProfile(p);
        setForm({
          name: p.name || '',
          username: p.username || '',
          email: p.email || '',
          phone: p.phone || '',
        });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await api.put('/users/me/update/', form);
      if (res.data.success) {
        setSuccess('Profile updated successfully!');
        const updatedData = res.data.data;
        setProfile({ ...profile, ...updatedData });
        login(localStorage.getItem('token'), localStorage.getItem('refreshToken'), {
          ...user,
          ...updatedData
        });
      } else {
        setError(res.data.msg || 'Update failed');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setSaving(true);
    setShowPhotoOptions(false);

    try {
      const res = await api.post('/users/me/avatar/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const newAvatar = res.data.data.avatar_url;
        setProfile({ ...profile, avatar: newAvatar });
        login(localStorage.getItem('token'), localStorage.getItem('refreshToken'), {
          ...user,
          avatar: newAvatar
        });
        setSuccess('Avatar updated successfully!');
      } else {
        setError(res.data.msg);
      }
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectDefaultAvatar = async (url) => {
    setSaving(true);
    setShowAvatarModal(false);
    try {
      const res = await api.put('/users/me/update/', { avatar: url });
      if (res.data.success) {
        setProfile({ ...profile, avatar: url });
        login(localStorage.getItem('token'), localStorage.getItem('refreshToken'), {
          ...user,
          avatar: url
        });
        setSuccess('Avatar updated successfully!');
      } else {
        setError(res.data.msg);
      }
    } catch (err) {
      setError('Failed to update avatar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'John Doe' },
    { name: 'username', label: 'Username', type: 'text', icon: AtSign, placeholder: 'johndoe123' },
    { name: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'you@example.com' },
    { name: 'phone', label: 'Phone Number', type: 'tel', icon: Phone, placeholder: '9876543210' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 mb-8 text-white flex items-center gap-5 relative">
        <div className="relative shrink-0">
          <div 
            onClick={() => setShowPhotoOptions(!showPhotoOptions)}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden border-2 border-white/30 cursor-pointer hover:border-white transition group"
          >
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile?.name?.charAt(0)?.toUpperCase() || 'U'
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Photo Options Popover */}
          {showPhotoOptions && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-10 animate-in fade-in zoom-in duration-200">
              <button 
                onClick={() => { setViewingPhoto(true); setShowPhotoOptions(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
              >
                <Eye className="w-4 h-4 text-gray-400" /> View Photo
              </button>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
              >
                <Camera className="w-4 h-4 text-gray-400" /> Upload Photo
              </button>
              <button 
                onClick={() => { setShowAvatarModal(true); setShowPhotoOptions(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
              >
                <Smile className="w-4 h-4 text-gray-400" /> Choose Cartoon Avatar
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
              />
            </div>
          )}
        </div>
        
        <div>
          <h1 className="text-xl font-bold">{profile?.name || 'User'}</h1>
          <p className="text-primary-200 text-sm">@{profile?.username}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-primary-200">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
            </span>
            <span className="flex items-center gap-1">
              {profile?.is_verified
                ? <><Shield className="w-3.5 h-3.5 text-green-300" /> Verified</>
                : <><Shield className="w-3.5 h-3.5 text-yellow-300" /> Not verified</>
              }
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit Profile</h2>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg mb-5 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 bg-green-50 text-green-700 p-3 rounded-lg mb-5 text-sm">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                <div className="relative">
                  <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                    placeholder={f.placeholder}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Full Screen Photo Viewer */}
      {viewingPhoto && profile?.avatar && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button 
            onClick={() => setViewingPhoto(false)}
            className="absolute top-6 right-6 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
          <img src={profile.avatar} alt="Full Profile" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Choose an Avatar</h3>
              <button onClick={() => setShowAvatarModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-4 gap-6">
                {DEFAULT_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectDefaultAvatar(url)}
                    className="group relative"
                  >
                    <div className="w-full aspect-square rounded-full overflow-hidden border-2 border-gray-100 hover:border-primary-500 transition-all duration-200 hover:scale-110">
                      <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
