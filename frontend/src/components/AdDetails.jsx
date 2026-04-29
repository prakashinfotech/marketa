import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { 
  MapPin, Clock, Eye, Share2, Heart, Flag, IndianRupee, 
  Phone, MessageCircle, ShieldCheck, ChevronLeft, ChevronRight, User as UserIcon
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdDetail();
  }, [id]);

  const fetchAdDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/ads/${id}/`);
      if (res.data.success) {
        setAd(res.data.data);
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
                  <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors tooltip-trigger" title="Share">
                    <Share2 className="w-4 h-4" />
                  </button>
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
                <button className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center justify-center gap-1.5 mx-auto transition-colors">
                  <Flag className="w-3.5 h-3.5" /> Report this ad
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
