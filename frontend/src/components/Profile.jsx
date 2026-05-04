import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import {
  User, Mail, AtSign, Phone, Calendar, Shield,
  Save, AlertCircle, CheckCircle, Loader2, Camera, Eye, EyeOff, X, Smile, Lock
} from 'lucide-react';

// Predefined Cartoon Avatars with specific styles
const DEFAULT_AVATARS = [
  // Standard
  ...['Felix', 'Aneka', 'Max', 'Sofia', 'Jack', 'Milo', 'Toby', 'Luna'].map(seed => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`),
  
  // Comedy / Funny
  ...['Bozo', 'Giggles', 'Chuckles', 'Jester', 'Silly', 'Wacky', 'Goofy', 'Zany', 'Bonkers', 'Bananas'].map(seed => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&mouth=tongue,twinkle&eyes=surprised,eyeRoll,squint`),
  
  // Serious / Professional
  ...['Boss', 'Director', 'Agent', 'Judge', 'Officer', 'Mayor', 'Chief', 'Executive', 'Admin', 'Pro'].map(seed => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&mouth=serious,default&clothing=blazerAndShirt,blazerAndSweater&eyes=default`),
  
  // Senior / Older
  ...['Gramps', 'Granny', 'Elder', 'Wisdom', 'Pop', 'Nana', 'Senior', 'Veteran', 'Pops', 'Grammy'].map(seed => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&hairColor=silverGray,platinum&accessories=prescription01,prescription02&facialHair=beardMagestic,beardLight`),

  // Additional variety
  ...['Leo', 'Zoe', 'Oliver', 'Chloe', 'Charlie', 'Bella', 'Sam', 'Lucy', 'Oscar', 'Daisy'].map(seed => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`),
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

  // Change Password state
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [showPwFields, setShowPwFields] = useState(false);

  // Account Deletion state
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteCode, setDeleteCode] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);


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
        login(sessionStorage.getItem('token'), sessionStorage.getItem('refreshToken'), {
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

    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar image must be smaller than 5MB.');
      return;
    }

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
        login(sessionStorage.getItem('token'), sessionStorage.getItem('refreshToken'), {
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
        login(sessionStorage.getItem('token'), sessionStorage.getItem('refreshToken'), {
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

  const handleVerifyRequest = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/users/request-verification/');
      if (res.data.success) {
        setSuccess('Verification email sent! Please check your inbox.');
      } else {
        setError(res.data.msg);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send verification email.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (pwForm.new_password.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwSaving(true);
    try {
      const res = await api.post('/users/change-password/', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      });
      if (res.data.success) {
        setPwSuccess('Password changed successfully! A confirmation email has been sent.');
        setPwForm({ old_password: '', new_password: '', confirm_password: '' });
        setShowPwFields(false);
      } else {
        setPwError(res.data.msg || 'Failed to change password.');
      }
    } catch (err) {
      setPwError(err.response?.data?.msg || 'Something went wrong.');
    } finally {
      setPwSaving(false);
    }
  };

  const handleRequestDelete = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await api.post('/users/request-delete-account/');
      if (res.data.success) {
        setDeleteMode('confirm');
      } else {
        setDeleteError(res.data.msg || 'Failed to request account deletion.');
      }
    } catch (err) {
      setDeleteError(err.response?.data?.msg || 'Something went wrong.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteCode) {
      setDeleteError('Please enter the confirmation code.');
      return;
    }
    
    // Show custom modal instead of window.confirm
    setShowDeleteConfirmModal(true);
  };

  const executeAccountDeletion = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    setShowDeleteConfirmModal(false);
    try {
      const res = await api.post('/users/confirm-delete-account/', { code: deleteCode });
      if (res.data.success) {
        logout(); // Automatically redirects to login
      } else {
        setDeleteError(res.data.msg || 'Invalid code. Deletion failed.');
      }
    } catch (err) {
      setDeleteError(err.response?.data?.msg || 'Something went wrong.');
    } finally {
      setDeleteLoading(false);
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
      {/* Verification Banner */}
      {!profile?.is_verified && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Your account is not verified</h3>
              <p className="text-xs text-amber-700 mt-0.5">Please verify your email address to unlock all features and build trust with buyers/sellers.</p>
            </div>
          </div>
          <button 
            onClick={handleVerifyRequest}
            disabled={saving}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {saving ? 'Sending...' : 'Verify Account'}
          </button>
        </div>
      )}

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
          <p className="text-primary-200 text-sm">
            @{profile?.username} • {profile?.role_id === 1 ? 'Super Admin' : profile?.role_id === 2 ? 'Admin' : 'Verified Member'}
          </p>
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

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          {!showPwFields && (
            <button
              onClick={() => setShowPwFields(true)}
              className="text-primary-600 text-sm font-semibold hover:underline flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4" /> Change
            </button>
          )}
        </div>

        {pwError && (
          <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg mb-5 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{pwError}</span>
          </div>
        )}
        {pwSuccess && (
          <div className="flex items-start gap-2 bg-green-50 text-green-700 p-3 rounded-lg mb-5 text-sm">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{pwSuccess}</span>
          </div>
        )}

        {showPwFields && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={pwForm.old_password}
                  onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                  placeholder="Enter your current password"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={pwForm.new_password}
                    onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={pwForm.confirm_password}
                    onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowPwFields(false); setPwError(''); setPwForm({ old_password: '', new_password: '', confirm_password: '' }); }}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pwSaving}
                className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
              >
                {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {pwSaving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}

        {!showPwFields && !pwSuccess && (
          <p className="text-sm text-gray-400">Click "Change" to update your password. You'll need your current password to confirm.</p>
        )}
      </div>

      {/* Danger Zone (Account Deletion) */}
      <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6 md:p-8 mt-8">
        <h2 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-700 mb-6">Permanently delete your account and all associated data. This action cannot be undone.</p>
        
        {deleteError && (
          <div className="flex items-start gap-2 bg-red-100 text-red-800 p-3 rounded-lg mb-5 text-sm border border-red-200">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{deleteError}</span>
          </div>
        )}

        {!deleteMode ? (
          <button
            onClick={() => setDeleteMode('request')}
            className="btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500 border-none px-6 py-2"
          >
            Delete Account
          </button>
        ) : deleteMode === 'request' ? (
          <div className="bg-white p-5 rounded-lg border border-red-100 shadow-sm">
            <p className="text-sm text-gray-800 mb-4 font-medium">Are you sure? A confirmation code will be sent to your email.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteMode(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDelete}
                disabled={deleteLoading}
                className="btn-primary bg-red-600 hover:bg-red-700 border-none flex items-center gap-2"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Confirmation Code
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-lg border border-red-100 shadow-sm animate-fade-in">
            <p className="text-sm text-gray-800 mb-4">We've sent a code to your email. Enter it below to confirm deletion.</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={deleteCode}
                onChange={(e) => setDeleteCode(e.target.value)}
                placeholder="Enter confirmation code"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 uppercase tracking-wide"
              />
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading || !deleteCode}
                className="btn-primary bg-red-600 hover:bg-red-700 border-none shrink-0 flex items-center gap-2"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Deletion
              </button>
            </div>
            <button
              onClick={() => { setDeleteMode(false); setDeleteCode(''); setDeleteError(''); }}
              className="text-gray-500 text-xs hover:text-gray-700 mt-3 hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
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
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
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

      {/* Account Deletion Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Account?</h3>
              <p className="text-center text-gray-600 mb-6">
                Are you absolutely sure you want to permanently delete your account? This action cannot be undone and you will lose all your ads, favorites, and profile data.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAccountDeletion}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
                >
                  Yes, Delete My Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
