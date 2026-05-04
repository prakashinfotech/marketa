import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { 
  MapPin, Clock, Eye, Share2, Heart, Flag, IndianRupee, 
  Phone, MessageCircle, ShieldCheck, ChevronLeft, ChevronRight, User as UserIcon,
  X, ChevronDown, Copy, Check, ExternalLink, Layers
} from 'lucide-react';

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
  
  const viewCounted = useRef(false);
  const navigate = useNavigate();

  // Share dropdown state
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const shareRef = useRef(null);

  useEffect(() => {
    fetchAdDetail();
  }, [id]);

  // Close share menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

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
      alert("Please login to save favorites.");
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
      alert("Please login to chat");
      return;
    }
    try {
      const res = await api.post('/chat/rooms/', { ad_id: ad.id });
      if (res.data.success) {
        navigate(`/chat?room=${res.data.data.room_id}`);
      } else {
        alert(res.data.msg);
      }
    } catch (err) {
      console.error('Error starting chat', err);
      alert('Could not start chat. Please try again.');
    }
  };

  const handleReportAd = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("Please login to report an ad.");
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
        alert("Report submitted successfully. Thank you for your feedback.");
        setShowReportModal(false);
        setReportDescription('');
      } else {
        alert(res.data.msg);
      }
    } catch (err) {
      console.error('Failed to submit report', err);
      alert('Failed to submit report.');
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
                  {/* Share Button */}
                  <div className="relative" ref={shareRef}>
                    <button 
                      onClick={() => setShowShareMenu(prev => !prev)}
                      className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors" 
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Share Dropdown */}
                    {showShareMenu && (
                      <div className="absolute right-0 top-12 z-50 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                        <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Share this ad</p>
                        
                        {/* Copy Link */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            setLinkCopied(true);
                            setTimeout(() => { setLinkCopied(false); setShowShareMenu(false); }, 1500);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {linkCopied ? (
                            <><Check className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-600 font-semibold">Link Copied!</span></>
                          ) : (
                            <><Copy className="w-4 h-4 text-gray-400" /> Copy Link</>
                          )}
                        </button>

                        {/* WhatsApp */}
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Check out this ad: ${ad.title} — ${window.location.href}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowShareMenu(false)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          WhatsApp
                          <ExternalLink className="w-3 h-3 text-gray-300 ml-auto" />
                        </a>

                        {/* Twitter / X */}
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out: ${ad.title}`)}&url=${encodeURIComponent(window.location.href)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowShareMenu(false)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          X (Twitter)
                          <ExternalLink className="w-3 h-3 text-gray-300 ml-auto" />
                        </a>

                        {/* Facebook */}
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowShareMenu(false)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                          <ExternalLink className="w-3 h-3 text-gray-300 ml-auto" />
                        </a>
                      </div>
                    )}
                  </div>
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
                        alert("Please login to view phone number");
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
