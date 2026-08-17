import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import {
  Search, MapPin, Smartphone, Car, Laptop, Home as HomeIcon,
  ArrowRight, TrendingUp, Shield, MessageCircle, Sparkles, IndianRupee, Heart, ChevronRight,
  Clock, Eye
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Mobiles': Smartphone,
  'Cars & Bikes': Car,
  'Electronics': Laptop,
  'Real Estate': HomeIcon,
};

const CATEGORY_GRADIENTS = {
  'Mobiles': 'from-blue-500 to-cyan-400',
  'Cars & Bikes': 'from-emerald-500 to-teal-400',
  'Electronics': 'from-violet-500 to-purple-400',
  'Real Estate': 'from-orange-500 to-amber-400',
};

const CATEGORY_BG = {
  'Mobiles': 'bg-blue-50 group-hover:bg-blue-100',
  'Cars & Bikes': 'bg-emerald-50 group-hover:bg-emerald-100',
  'Electronics': 'bg-violet-50 group-hover:bg-violet-100',
  'Real Estate': 'bg-orange-50 group-hover:bg-orange-100',
};

// ── Testimonials Data ────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    avatar: 'P',
    city: 'Mumbai',
    rating: 5,
    text: 'Sold my old laptop within 2 days! The chat feature made it super easy to connect with buyers. Highly recommend!',
    color: 'from-pink-500 to-rose-400',
  },
  {
    name: 'Rahul Verma',
    avatar: 'R',
    city: 'Delhi',
    rating: 5,
    text: 'Found an amazing deal on a second-hand bike. The seller was verified and the whole process was smooth.',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    name: 'Ananya Patel',
    avatar: 'A',
    city: 'Ahmedabad',
    rating: 4,
    text: 'Great platform for finding tenants. Posted my flat listing and got 10+ inquiries in the first day!',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    name: 'Vikram Singh',
    avatar: 'V',
    city: 'Bangalore',
    rating: 5,
    text: 'Best classifieds platform I\'ve used. Clean interface, fast responses, and no spam. Love it!',
    color: 'from-violet-500 to-purple-400',
  },
  {
    name: 'Sneha Reddy',
    avatar: 'S',
    city: 'Hyderabad',
    rating: 5,
    text: 'The AI chatbot helped me understand how to post my first ad. Very user-friendly for beginners!',
    color: 'from-amber-500 to-orange-400',
  },
  {
    name: 'Arjun Nair',
    avatar: 'A',
    city: 'Chennai',
    rating: 4,
    text: 'Bought a used iPhone at half the market price. The photos and descriptions were accurate. Will use again!',
    color: 'from-indigo-500 to-blue-400',
  },
  {
    name: 'Meera Joshi',
    avatar: 'M',
    city: 'Pune',
    rating: 5,
    text: 'Moved cities and furnished my entire house through Marketa. Saved lakhs compared to buying new!',
    color: 'from-rose-500 to-pink-400',
  },
  {
    name: 'Karan Mehta',
    avatar: 'K',
    city: 'Jaipur',
    rating: 5,
    text: 'The safety tips and verified profiles give me confidence while dealing with strangers. Excellent service!',
    color: 'from-teal-500 to-emerald-400',
  },
];

function TestimonialSlider() {
  const scrollRef = useRef(null);

  // Duplicate for seamless infinite scroll
  const items = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div className="relative">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div
        ref={scrollRef}
        className="flex gap-5 animate-scroll-x"
        style={{
          width: 'max-content',
        }}
      >
        {items.map((t, idx) => (
          <div
            key={idx}
            className="w-[320px] shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col"
          >
            {/* Stars */}
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < t.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Review Text */}
            <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-4">
              "{t.text}"
            </p>

            {/* User Info */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                {t.avatar}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">{t.city}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [recentAds, setRecentAds] = useState([]);
  const [recentlyViewedAds, setRecentlyViewedAds] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    api.get('/categories/').then(res => {
      if (res.data.success) setCategories(res.data.data || []);
    }).catch(() => {});
    api.get('/locations/cities/popular/').then(res => {
      if (res.data.success) setCities(res.data.data || []);
    }).catch(() => {});
    api.get('/ads/list/?limit=6').then(res => {
      if (res.data.success) setRecentAds(res.data.data.ads || []);
    }).catch(() => {});

    if (isLoggedIn) {
      api.get('/favorites/me/').then(res => {
        if (res.data.success) {
          const favSet = new Set(res.data.data.map(f => f.uuid));
          setFavorites(favSet);
        }
      }).catch(() => {});
    } else {
      setFavorites(new Set());
    }

    // Fetch recently viewed ads
    if (isLoggedIn) {
      api.get('/recently-viewed/me/').then(res => {
        if (res.data.success) setRecentlyViewedAds(res.data.data || []);
      }).catch(() => {});
    } else {
      setRecentlyViewedAds([]);
    }
  }, [isLoggedIn]);

  const toggleFavorite = async (adUuid) => {
    if (!isLoggedIn) {
      alert("Please login to save favorites.");
      return;
    }
    try {
      const res = await api.post('/favorites/toggle/', { ad_uuid: adUuid });
      if (res.data.success) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          if (newSet.has(adUuid)) {
            newSet.delete(adUuid);
          } else {
            newSet.add(adUuid);
          }
          return newSet;
        });
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    let url = '/search?';
    if (searchQuery) url += `q=${encodeURIComponent(searchQuery)}&`;
    if (searchCity) url += `city=${searchCity}&`;
    navigate(url);
  };

  const displayCategories = categories.length > 0 ? categories : [
    { id: 1, name: 'Mobiles', slug: 'mobiles' },
    { id: 2, name: 'Cars & Bikes', slug: 'cars-bikes' },
    { id: 3, name: 'Electronics', slug: 'electronics' },
    { id: 4, name: 'Real Estate', slug: 'real-estate' },
  ];

  const displayCities = cities.length > 0 ? cities : [
    { id: 1, name: 'Mumbai' }, { id: 2, name: 'Delhi' },
    { id: 3, name: 'Bangalore' }, { id: 4, name: 'Ahmedabad' },
    { id: 5, name: 'Pune' },
  ];

  return (
    <div className="animate-fade-in">
      {/* ─── Hero Section ──────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800" />
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              India's #1 Classifieds Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] mb-5 text-white tracking-tight">
              Buy, Sell & Rent<br />
              <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                Anything Near You
              </span>
            </h1>
            <p className="text-indigo-200 text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              Find amazing deals on mobiles, cars, homes, jobs and more from sellers in your city.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl shadow-black/20 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 text-gray-900 text-sm rounded-xl border-0 bg-gray-50/80 focus:bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="relative sm:w-44">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select 
                  value={searchCity}
                  onChange={e => setSearchCity(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 text-gray-700 text-sm rounded-xl border-0 bg-gray-50/80 appearance-none cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">All Cities</option>
                  {displayCities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-7 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30">
                <Search className="w-4 h-4" /> Search
              </button>
            </form>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 md:gap-12 mt-10">
              {[
                { label: 'Active Ads', value: '50K+' },
                { label: 'Happy Users', value: '10K+' },
                { label: 'Cities', value: '100+' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-xl md:text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs text-indigo-300 font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories Grid ──────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayCategories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.name] || Laptop;
            const gradient = CATEGORY_GRADIENTS[cat.name] || 'from-gray-500 to-gray-400';
            const bgClass = CATEGORY_BG[cat.name] || 'bg-gray-50';
            return (
              <Link
                key={cat.id}
                to={`/search?category=${cat.id}`}
                className="card p-5 flex items-center gap-4 group hover:-translate-y-0.5"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${bgClass}`}>
                  <Icon className={`w-6 h-6 bg-gradient-to-br ${gradient} bg-clip-text`} style={{color: 'inherit'}} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm">{cat.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Browse ads</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Popular Cities ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Popular Cities</h2>
            <p className="text-sm text-gray-500 mt-0.5">Browse listings near you</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {displayCities.map((city) => (
            <Link
              key={city.id}
              to={`/search?city=${city.id}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-100 rounded-full text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-md hover:shadow-indigo-100/50 transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
              {city.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Fresh Recommendations ────────────────────── */}
      {recentAds.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Fresh Recommendations</h2>
              <p className="text-gray-500 mt-1">Recently posted ads around you</p>
            </div>
            <Link to="/search" className="hidden md:flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentAds.map((ad) => (
              <Link key={ad.id} to={`/ad/${ad.id}`} className="card overflow-hidden group flex flex-col hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 border-gray-100">
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  {ad.image ? (
                    <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">No Image</div>
                  )}
                  <button 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation();
                      toggleFavorite(ad.uuid);
                    }} 
                    className={`absolute top-3 right-3 w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-all z-10 ${
                      favorites.has(ad.uuid) 
                        ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                        : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(ad.uuid) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors mb-2">
                    {ad.title}
                  </h3>
                  
                  <div className="mb-4">
                    {ad.price ? (
                      <span className="text-xl font-black text-gray-900 flex items-center">
                        <IndianRupee className="w-5 h-5 -mr-0.5" />
                        {parseFloat(ad.price).toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                        Contact for price
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5 truncate max-w-[60%]">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                      <span className="truncate">{ad.locality ? `${ad.locality}, ` : ''}{ad.city}</span>
                    </div>
                    <span className="shrink-0">{new Date(ad.created_at).toLocaleDateString('en-IN', {month:'short', day:'numeric'})}</span>
                  </div>
                  
                  {/* Seller Info */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                      {ad.user_avatar ? (
                        <img src={ad.user_avatar} alt={ad.user_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-indigo-700">{ad.user_name?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-600 truncate">
                      {ad.user_name || 'Anonymous User'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/search" className="md:hidden mt-6 w-full flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-3 rounded-xl transition-colors">
            View all recommendations <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}

      {/* ─── Recently Viewed ──────────────────────────── */}
      {recentlyViewedAds.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Recently Viewed</h2>
              </div>
              <p className="text-gray-500 mt-1 ml-10">Pick up where you left off</p>
            </div>
            <button
              onClick={() => {
                if (isLoggedIn) {
                  api.delete('/recently-viewed/').then(() => {
                    setRecentlyViewedAds([]);
                  });
                }
              }}
              className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              Clear History
            </button>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 custom-scrollbar">
            {recentlyViewedAds.map((ad) => (
              <Link
                key={ad.id}
                to={`/ad/${ad.id}`}
                className="w-[260px] shrink-0 card overflow-hidden group flex flex-col hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 border-gray-100"
              >
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  {ad.image ? (
                    <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">No Image</div>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(ad.uuid);
                    }}
                    className={`absolute top-3 right-3 w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-all z-10 ${
                      favorites.has(ad.uuid)
                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                        : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(ad.uuid) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors mb-2">
                    {ad.title}
                  </h3>
                  <div className="mb-3">
                    {ad.price ? (
                      <span className="text-lg font-black text-gray-900 flex items-center">
                        <IndianRupee className="w-4 h-4 -mr-0.5" />
                        {parseFloat(ad.price).toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Contact for price
                      </span>
                    )}
                  </div>
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    <span className="truncate">{ad.locality ? `${ad.locality}, ` : ''}{ad.city}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── How it Works ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            How It Works
          </h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">Three simple steps to buy or sell anything on Marketa</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: TrendingUp, title: 'Post Your Ad', desc: 'Create a free listing in under a minute with photos and details.', color: 'from-blue-500 to-cyan-400', bg: 'bg-blue-50', step: '01' },
            { icon: MessageCircle, title: 'Connect with Buyers', desc: 'Receive inquiries and chat directly with interested buyers.', color: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-50', step: '02' },
            { icon: Shield, title: 'Close the Deal', desc: 'Meet safely, finalize the deal, and enjoy the transaction.', color: 'from-violet-500 to-purple-400', bg: 'bg-violet-50', step: '03' },
          ].map((item, i) => (
            <div key={i} className="card p-8 text-center group hover:-translate-y-1">
              <div className="relative inline-flex">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${item.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-8 h-8 text-gray-700" />
                </div>
                <span className={`absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-gradient-to-br ${item.color} text-white text-xs font-extrabold flex items-center justify-center shadow-lg`}>
                  {item.step}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mt-5 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Happy Customers ───────────────────────────── */}
      <section className="mt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Happy Customers ❤️</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">See what our users are saying about Marketa</p>
        </div>

        <TestimonialSlider />
      </section>

      {/* ─── CTA Section ──────────────────────────────── */}
      {!isLoggedIn && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20 mb-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-10 md:p-16">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full blur-2xl -translate-x-1/3 translate-y-1/3" />
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                  Ready to start selling?
                </h2>
                <p className="text-indigo-200 max-w-md leading-relaxed">
                  Post your first ad for free and reach thousands of buyers near you. It only takes a minute.
                </p>
              </div>
              <Link
                to="/signup"
                className="bg-white text-indigo-700 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2 whitespace-nowrap shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
