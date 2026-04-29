import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, MapPin, Clock, Loader2, Trash2, ShoppingBag } from 'lucide-react';
import { useAuth } from '../AuthContext';
import api from '../api';

export default function Favorites() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, [isLoggedIn]);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites/me/');
      if (res.data.success) {
        setFavorites(res.data.data);
      } else {
        setError(res.data.msg);
      }
    } catch (err) {
      setError('Failed to load favorites.');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (uuid) => {
    try {
      const res = await api.post('/favorites/toggle/', { ad_uuid: uuid });
      if (res.data.success) {
        setFavorites(favorites.filter(f => f.uuid !== uuid));
      }
    } catch (err) {
      console.error('Failed to remove favorite');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8">
            You haven't added any ads to your favorites yet. Start browsing to find something you love!
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-200"
          >
            <ShoppingBag className="w-5 h-5" /> Browse Ads
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((ad) => (
            <div key={ad.uuid} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition relative">
              <Link to={`/ad/${ad.uuid}`}>
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  {ad.image ? (
                    <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingBag className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-900 shadow-sm">
                    ₹{ad.price.toLocaleString('en-IN')}
                  </div>
                </div>
              </Link>

              <button 
                onClick={() => removeFavorite(ad.uuid)}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-red-500 hover:bg-red-50 transition shadow-sm z-10"
                title="Remove from favorites"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="p-4">
                <Link to={`/ad/${ad.uuid}`}>
                  <h3 className="font-bold text-gray-900 mb-2 truncate group-hover:text-primary-600 transition">
                    {ad.title}
                  </h3>
                </Link>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {ad.city}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(ad.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
