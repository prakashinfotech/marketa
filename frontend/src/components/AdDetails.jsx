import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import {
  MapPin, Clock, Eye, Heart, Flag, IndianRupee,
  Phone, MessageCircle, ShieldCheck, ChevronLeft, ChevronRight, User as UserIcon,
  X, ChevronDown, Layers, AlertCircle, CheckCircle, Info
} from 'lucide-react';
import ShareButton from './ShareButton';

export default function AdDetails() {
  const { id } = useParams();
  const { isLoggedIn, user } = useAuth();
  
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [similarAds, setSimilarAds] = useState([]);

  // Toast notification state
  const [toast, setToast] = useState(null); // { type: 'success'|'error'|'info', message: '' }
  const toastTimer = useRef(null);

  const showToast = (type, message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };
  
  const viewCounted = useRef(false);
  const navigate = useNavigate();

  // Share is handled by the reusable <ShareButton/> component (Web Share API +
  // copy / WhatsApp / SMS / Email fallback). No local state needed here.

  useEffect(() => {
    fetchAdDetail();
  }, [id]);

  // Separate effect for view count — runs only once even in StrictMode and prevents refresh inflation
  useEffect(() => {
    if (!viewCounted.current && id) {
      viewCounted.current = true;
      
      // Check session storage to prevent increment on page refresh
      const viewedAds = JSON.parse(sessionStorage.getItem('viewedAds') || '[]');
      if (!viewedAds.includes(id)) {
        api.post(`/ads/${id}/view/`).catch(() => {});
        viewedAds.push(id);
        sessionStorage.setItem('viewedAds', JSON.stringify(viewedAds));
      }
    }
  }, [id]);

  const fetchAdDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/ads/${id}/`);
      if (res.data.success) {
        setAd(res.data.data);
        
        // Sync to backend recently viewed
        if (isLoggedIn) {
          api.post('/recently-viewed/', { ad_uuid: res.data.data.uuid }).catch(() => {});
        }

        // Fetch similar ads
        api.get(`/ads/${id}/similar/`).then(simRes => {
          if (simRes.data.success) setSimilarAds(simRes.data.data || []);
        }).catch(() => {});
        if (isLoggedIn) {
          try {
            const favRes = await api.get('/favorites/me/');
            if (favRes.data.success) {
              const isFav = favRes.data.data.some(f => f.uuid === res.data.data.uuid);
              setIsFavorited(isFav);
            }
          } catch (e) {}
        }
      } else {
        setError(res.data.msg);
      }
    } catch (err) {
      setError('Failed to load ad details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      showToast('info', 'Please login to save favorites.');
      return;
    }
    try {
      const res = await api.post('/favorites/toggle/', { ad_uuid: ad.uuid });
      if (res.data.success) {
        setIsFavorited(!isFavorited);
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  const nextImage = () => {
    if (ad && ad.images && activeImageIndex < ad.images.length - 1) {
      setActiveImageIndex(prev => prev + 1);
    }
  };

  const prevImage = () => {
    if (ad && ad.images && activeImageIndex > 0) {
      setActiveImageIndex(prev => prev - 1);
    }
  };

  const startChat = async () => {
    if (!isLoggedIn) {
      showToast('info', 'Please login to chat with the seller.');
      return;
    }
    try {
      const res = await api.post('/chat/rooms/', { ad_id: ad.id });
      if (res.data.success) {
        navigate(`/chat?room=${res.data.data.room_id}`);
      } else {
        showToast('error', res.data.msg);
      }
    } catch (err) {
      console.error('Error starting chat', err);
      showToast('error', 'Could not start chat. Please try again.');
    }
  };

  const handleReportAd = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      showToast('info', 'Please login to report an ad.');
      navigate('/login');
      return;
    }
    setSubmittingReport(true);
    try {
      const res = await api.post('/reports/', {
        ad_id: parseInt(id),
        reason: reportReason,
        description: reportDescription
      });
      if (res.data.success) {
        showToast('success', 'Report submitted successfully. Thank you for your feedback.');
        setShowReportModal(false);
        setReportDescription('');
      } else {
        showToast('error', res.data.msg || 'Failed to submit report.');
      }
    } catch (err) {
      console.error('Failed to submit report', err);
      showToast('error', 'Failed to submit report. Please try again.');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl inline-block shadow-sm">
          <h2 className="text-xl font-bold mb-2">Oops!</h2>
          <p>{error || 'Ad not found.'}</p>
          <Link to="/" className="btn-primary inline-block mt-4">Go back home</Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === ad.user.id;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6 font-medium">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span className="mx-2">›</span>
          <Link to={`/search?category=${ad.category}`} className="hover:text-indigo-600 transition-colors">{ad.category}</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900 truncate max-w-[200px] sm:max-w-md">{ad.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image Gallery */}
            <div className="card overflow-hidden bg-white">
              <div className="relative aspect-[4/3] bg-black flex items-center justify-center group">
                {ad.images && ad.images.length > 0 ? (
                  <>
                    <img 
                      src={ad.images[activeImageIndex].url} 
                      alt={`${ad.title} - Image ${activeImageIndex + 1}`} 
                      className="max-w-full max-h-full object-contain"
                    />
                    
                    {/* Navigation Arrows */}
                    {ad.images.length > 1 && (
                      <>
                        <button 
                          onClick={prevImage}
                          disabled={activeImageIndex === 0}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={nextImage}
                          disabled={activeImageIndex === ad.images.length - 1}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      {activeImageIndex + 1} / {ad.images.length}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500">No images available</div>
                )}
              </div>
              
              {/* Thumbnails */}
              {ad.images && ad.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto bg-white border-t border-gray-100">
                  {ad.images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx ? 'border-indigo-600 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main Info Card */}
            <div className="card p-6 sm:p-8 bg-white">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-2">
                    {ad.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-gray-500">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {ad.locality ? `${ad.locality}, ` : ''}{ad.city}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> {new Date(ad.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-gray-400" /> {ad.views_count} views</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <ShareButton title={ad.title} text={ad.description?.slice(0, 140)} />
                  <button 
                    onClick={toggleFavorite}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors tooltip-trigger ${
                      isFavorited 
                        ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                        : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500'
                    }`} 
                    title="Favorite"
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="py-5 border-y border-gray-100 mb-6">
                {ad.price ? (
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-black text-gray-900 tracking-tight flex items-center">
                      <IndianRupee className="w-8 h-8 -mr-1" />
                      {parseFloat(ad.price).toLocaleString('en-IN')}
                    </span>
                    {ad.price_negotiable && (
                      <span className="text-sm font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md mb-1.5">
                        Negotiable
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xl font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
                    Contact for price
                  </span>
                )}
              </div>

              {/* Attributes Grid */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Details</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                  {ad.condition && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Condition</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{ad.condition.replace('_', ' ')}</p>
                    </div>
                  )}
                  {ad.ad_type && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Ad Type</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{ad.ad_type}</p>
                    </div>
                  )}
                  {ad.attributes && ad.attributes.map((attr, idx) => (
                    <div key={idx}>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{attr.name}</p>
                      <p className="text-sm font-medium text-gray-900">{attr.value === 'true' ? 'Yes' : attr.value === 'false' ? 'No' : attr.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {ad.description && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                  <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-medium bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    {ad.description}
                  </div>
                </div>
              )}
            </div>

          </div>
          
          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            
            {/* Seller Info Card */}
            <div className="card p-6 bg-white sticky top-24 shadow-xl shadow-black/5 border-indigo-50/50 border-2">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                Seller Details
              </h3>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0 border-2 border-white shadow-md overflow-hidden">
                  {ad.user.avatar ? (
                    <img src={ad.user.avatar} alt={ad.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-indigo-500" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg leading-tight">{ad.user.name}</h4>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">Member since {new Date(ad.user.created_at).getFullYear()}</p>
                </div>
              </div>

              {!isOwner ? (
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      if (!isLoggedIn) {
                        // redirect to login or show modal
                        showToast('info', 'Please login to view phone number.');
                        return;
                      }
                      setShowPhone(true);
                    }}
                    className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      showPhone 
                        ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25'
                    }`}
                  >
                    <Phone className={`w-5 h-5 ${showPhone ? 'text-emerald-500' : ''}`} />
                    {showPhone ? ad.user.phone || 'Phone not provided' : 'Show Phone Number'}
                  </button>
                  
                  <button 
                    onClick={startChat}
                    className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat with Seller
                  </button>
                </div>
              ) : (
                <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl text-center font-bold text-sm border border-indigo-100">
                  This is your ad
                </div>
              )}
            </div>

            {/* Safety Tips */}
            <div className="card p-5 bg-white border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Safety Tips for Buyers
              </h3>
              <ul className="space-y-3 text-xs font-medium text-gray-500">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  Meet seller at a public place
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  Check the item before you buy
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  Pay only after collecting the item
                </li>
              </ul>
              <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                <button 
                  onClick={() => setShowReportModal(true)}
                  className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center justify-center gap-1.5 mx-auto transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" /> Report this ad
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* ─── Similar Ads ────────────────────────────────── */}
      {similarAds.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Layers className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Similar Ads</h2>
            <span className="text-sm text-gray-400 ml-1">in {ad?.category}</span>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 custom-scrollbar">
            {similarAds.map((sim) => (
              <Link
                key={sim.id}
                to={`/ad/${sim.id}`}
                className="w-[240px] shrink-0 card overflow-hidden group flex flex-col hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 border-gray-100"
              >
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  {sim.image ? (
                    <img src={sim.image} alt={sim.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">No Image</div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight group-hover:text-violet-600 transition-colors mb-2">
                    {sim.title}
                  </h3>
                  <div className="mb-3">
                    {sim.price ? (
                      <span className="text-lg font-black text-gray-900 flex items-center">
                        <IndianRupee className="w-4 h-4 -mr-0.5" />
                        {parseFloat(sim.price).toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Contact for price</span>
                    )}
                  </div>
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    <span className="truncate">{sim.locality ? `${sim.locality}, ` : ''}{sim.city}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-slide-in max-w-sm w-full">
          <div className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 ${
            toast.type === 'success' ? 'bg-emerald-50/95 border-emerald-200 shadow-emerald-500/10' :
            toast.type === 'error' ? 'bg-red-50/95 border-red-200 shadow-red-500/10' :
            'bg-blue-50/95 border-blue-200 shadow-blue-500/10'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-100' :
              toast.type === 'error' ? 'bg-red-100' :
              'bg-blue-100'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />}
              {toast.type === 'error' && <AlertCircle className="w-4.5 h-4.5 text-red-600" />}
              {toast.type === 'info' && <Info className="w-4.5 h-4.5 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${
                toast.type === 'success' ? 'text-emerald-800' :
                toast.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Info'}
              </p>
              <p className={`text-sm mt-0.5 font-medium ${
                toast.type === 'success' ? 'text-emerald-600' :
                toast.type === 'error' ? 'text-red-600' :
                'text-blue-600'
              }`}>{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)} 
              className={`p-1 rounded-full transition-colors shrink-0 ${
                toast.type === 'success' ? 'hover:bg-emerald-200/50 text-emerald-400' :
                toast.type === 'error' ? 'hover:bg-red-200/50 text-red-400' :
                'hover:bg-blue-200/50 text-blue-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" /> Report Ad
              </h2>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-6">
                Please let us know why you are reporting this ad. Your report will be reviewed by our moderation team.
              </p>
              
              <form onSubmit={handleReportAd}>
                <div className="mb-5">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Reporting</label>
                  <div className="relative">
                    <select 
                      className="input-field w-full appearance-none pr-10"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    >
                      <option value="spam">It's spam or misleading</option>
                      <option value="fraud">I suspect it's fraudulent</option>
                      <option value="offensive">It contains offensive content</option>
                      <option value="duplicate">It's a duplicate ad</option>
                      <option value="other">Other reason</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Additional Details (Optional)</label>
                  <textarea 
                    className="input-field w-full resize-none h-24"
                    placeholder="Provide any additional context..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submittingReport}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition-colors disabled:opacity-70"
                  >
                    {submittingReport ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
