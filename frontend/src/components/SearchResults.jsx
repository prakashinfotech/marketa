import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import { Search, MapPin, SlidersHorizontal, Loader2, IndianRupee, Heart, X, ArrowUpDown, Package, Tag, RotateCcw, Filter } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const cityId = searchParams.get('city') || '';
  const categoryId = searchParams.get('category') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const condition = searchParams.get('condition') || '';
  const adType = searchParams.get('ad_type') || '';
  const sortBy = searchParams.get('sort_by') || '';

  const { isLoggedIn } = useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  // Category-specific dynamic attributes
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [attrFilters, setAttrFilters] = useState({});
  const [loadingAttrs, setLoadingAttrs] = useState(false);

  // Local price inputs (not committed to URL until user clicks Apply)
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  useEffect(() => {
    fetchFilters();
  }, []);

  // Fetch category attributes when category changes
  useEffect(() => {
    if (categoryId) {
      setLoadingAttrs(true);
      api.get(`/categories/${categoryId}/attributes/`)
        .then(res => {
          if (res.data.success) {
            setCategoryAttributes(res.data.data);
          } else {
            setCategoryAttributes([]);
          }
        })
        .catch(() => setCategoryAttributes([]))
        .finally(() => setLoadingAttrs(false));
    } else {
      setCategoryAttributes([]);
      setAttrFilters({});
    }
  }, [categoryId]);

  useEffect(() => {
    fetchAds();
  }, [query, cityId, categoryId, minPrice, maxPrice, condition, adType, sortBy]);

  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  const fetchFilters = async () => {
    try {
      const [catsRes] = await Promise.all([
        api.get('/categories/'),
      ]);
      if (catsRes.data.success) {
        const flatten = (cats, prefix = '') => {
          let flat = [];
          cats.forEach(c => {
            flat.push({ ...c, displayName: prefix + c.name });
            if (c.children?.length) flat = flat.concat(flatten(c.children, prefix + '└─ '));
          });
          return flat;
        };
        setCategories(flatten(catsRes.data.data));
      }
      api.get('/locations/cities/popular/').then(res => {
        if(res.data.success) setCities(res.data.data);
      }).catch(()=>{});
    } catch (err) { console.error('Failed to load filters', err); }
  };

  const fetchAds = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/ads/list/?limit=50';
      if (query) url += `&search_query=${encodeURIComponent(query)}`;
      if (cityId) url += `&city_id=${cityId}`;
      if (categoryId) url += `&category_id=${categoryId}`;
      if (minPrice) url += `&min_price=${minPrice}`;
      if (maxPrice) url += `&max_price=${maxPrice}`;
      if (condition) url += `&condition=${condition}`;
      if (adType) url += `&ad_type=${adType}`;
      if (sortBy) url += `&sort_by=${sortBy}`;

      // Append category-specific attribute filters
      const activeAttrFilters = Object.fromEntries(
        Object.entries(attrFilters).filter(([_, v]) => v !== '' && v !== undefined)
      );
      if (Object.keys(activeAttrFilters).length > 0) {
        url += `&attribute_filters=${encodeURIComponent(JSON.stringify(activeAttrFilters))}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        setAds(res.data.data.ads);
      } else {
        setError(res.data.msg);
      }
    } catch (err) {
      setError('Failed to fetch search results.');
    } finally {
      setLoading(false);
    }

    if (isLoggedIn) {
      try {
        const favRes = await api.get('/favorites/me/');
        if (favRes.data.success) {
          const favSet = new Set(favRes.data.data.map(f => f.uuid));
          setFavorites(favSet);
        }
      } catch (err) {}
    } else {
      setFavorites(new Set());
    }
  };

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

  const updateSearch = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const applyPriceFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    if (localMinPrice) newParams.set('min_price', localMinPrice); else newParams.delete('min_price');
    if (localMaxPrice) newParams.set('max_price', localMaxPrice); else newParams.delete('max_price');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setAttrFilters({});
  };

  const handleAttrFilterChange = (attrId, value) => {
    setAttrFilters(prev => ({ ...prev, [attrId]: value }));
  };

  const applyAttrFilters = () => {
    fetchAds();
  };

  const attrFilterCount = Object.values(attrFilters).filter(v => v !== '' && v !== undefined).length;
  const activeFilterCount = [categoryId, cityId, minPrice, maxPrice, condition, adType, sortBy].filter(Boolean).length + attrFilterCount;

  return (
    <div className="bg-gray-50 min-h-screen py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-3 relative z-20">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              className="input-field pl-11 !bg-gray-50/50" 
              placeholder="What are you looking for?" 
              defaultValue={query}
              onKeyDown={(e) => { if(e.key === 'Enter') updateSearch('q', e.target.value) }}
              onBlur={(e) => updateSearch('q', e.target.value)}
            />
          </div>
          <div className="md:w-64 relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select 
              className="input-field pl-11 !bg-gray-50/50 cursor-pointer"
              value={cityId}
              onChange={e => updateSearch('city', e.target.value)}
            >
              <option value="">All Cities</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button onClick={fetchAds} className="btn-primary flex items-center justify-center gap-2 md:w-32">
            <Search className="w-4 h-4" /> Find
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* ─── Sidebar Filters ─────────────────────────── */}
          <div className="w-full md:w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-24 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
              
              {/* Header — stays pinned */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
                  <h2 className="font-bold text-gray-900">Filters</h2>
                  {activeFilterCount > 0 && (
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              <div className="divide-y divide-gray-50 overflow-y-auto custom-scrollbar flex-1">
                
                {/* Sort By */}
                <div className="p-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    <ArrowUpDown className="w-3.5 h-3.5" /> Sort By
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { value: '', label: 'Newest First' },
                      { value: 'price_low', label: 'Price: Low to High' },
                      { value: 'price_high', label: 'Price: High to Low' },
                      { value: 'popular', label: 'Most Popular' },
                      { value: 'oldest', label: 'Oldest First' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateSearch('sort_by', opt.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          sortBy === opt.value
                            ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="p-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    <Tag className="w-3.5 h-3.5" /> Category
                  </label>
                  <select 
                    className="input-field text-sm cursor-pointer !py-2.5"
                    value={categoryId}
                    onChange={e => updateSearch('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                  </select>
                </div>

                {/* Price Range */}
                <div className="p-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    <IndianRupee className="w-3.5 h-3.5" /> Price Range
                  </label>
                  <div className="flex gap-2 items-center mb-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={localMinPrice}
                      onChange={e => setLocalMinPrice(e.target.value)}
                      className="input-field text-sm !py-2 text-center flex-1"
                      min="0"
                    />
                    <span className="text-gray-400 font-bold text-xs">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={localMaxPrice}
                      onChange={e => setLocalMaxPrice(e.target.value)}
                      className="input-field text-sm !py-2 text-center flex-1"
                      min="0"
                    />
                  </div>
                  <button
                    onClick={applyPriceFilter}
                    className="w-full py-2 rounded-lg text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    Apply Price
                  </button>
                  {/* Quick price presets */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {[
                      { label: 'Under ₹5K', min: '', max: '5000' },
                      { label: '₹5K-25K', min: '5000', max: '25000' },
                      { label: '₹25K-1L', min: '25000', max: '100000' },
                      { label: 'Above ₹1L', min: '100000', max: '' },
                    ].map(preset => {
                      const isActive = minPrice === preset.min && maxPrice === preset.max;
                      return (
                        <button
                          key={preset.label}
                          onClick={() => {
                            const newParams = new URLSearchParams(searchParams);
                            if (preset.min) newParams.set('min_price', preset.min); else newParams.delete('min_price');
                            if (preset.max) newParams.set('max_price', preset.max); else newParams.delete('max_price');
                            setSearchParams(newParams);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Condition */}
                <div className="p-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    <Package className="w-3.5 h-3.5" /> Condition
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { value: '', label: 'All Conditions' },
                      { value: 'new', label: 'Brand New', dot: 'bg-emerald-500' },
                      { value: 'like_new', label: 'Like New', dot: 'bg-blue-500' },
                      { value: 'used', label: 'Used', dot: 'bg-amber-500' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateSearch('condition', opt.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                          condition === opt.value
                            ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opt.dot && <span className={`w-2 h-2 rounded-full ${opt.dot}`}></span>}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ad Type */}
                <div className="p-5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                    Listing Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: '', label: 'All' },
                      { value: 'sell', label: 'Sell' },
                      { value: 'rent', label: 'Rent' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateSearch('ad_type', opt.value)}
                        className={`py-2 rounded-lg text-xs font-bold text-center transition-all ${
                          adType === opt.value
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Dynamic Category-Specific Filters ──────────── */}
                {categoryId && categoryAttributes.length > 0 && (
                  <div className="p-5 border-t-2 border-indigo-100">
                    <label className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4">
                      <Filter className="w-3.5 h-3.5" />
                      {categories.find(c => String(c.id) === String(categoryId))?.displayName || 'Category'} Filters
                    </label>
                    
                    {loadingAttrs ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {categoryAttributes.map(attr => (
                          <div key={attr.id}>
                            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{attr.name}</label>
                            
                            {attr.field_type === 'select' && attr.options?.length ? (
                              <select
                                className="input-field text-sm !py-2 cursor-pointer"
                                value={attrFilters[attr.id] || ''}
                                onChange={e => handleAttrFilterChange(attr.id, e.target.value)}
                              >
                                <option value="">All {attr.name}</option>
                                {attr.options.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : attr.field_type === 'boolean' ? (
                              <div className="flex gap-2">
                                {[
                                  { value: '', label: 'Any' },
                                  { value: 'true', label: 'Yes' },
                                  { value: 'false', label: 'No' },
                                ].map(opt => (
                                  <button
                                    key={opt.value}
                                    onClick={() => handleAttrFilterChange(attr.id, opt.value)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                                      (attrFilters[attr.id] || '') === opt.value
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            ) : attr.field_type === 'number' ? (
                              <input
                                type="number"
                                placeholder={`Enter ${attr.name}`}
                                className="input-field text-sm !py-2"
                                value={attrFilters[attr.id] || ''}
                                onChange={e => handleAttrFilterChange(attr.id, e.target.value)}
                              />
                            ) : (
                              <input
                                type="text"
                                placeholder={`Enter ${attr.name}`}
                                className="input-field text-sm !py-2"
                                value={attrFilters[attr.id] || ''}
                                onChange={e => handleAttrFilterChange(attr.id, e.target.value)}
                              />
                            )}
                          </div>
                        ))}

                        {/* Apply button */}
                        <button
                          onClick={applyAttrFilters}
                          className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm mt-2"
                        >
                          Apply {categories.find(c => String(c.id) === String(categoryId))?.displayName || ''} Filters
                        </button>
                        {attrFilterCount > 0 && (
                          <button
                            onClick={() => { setAttrFilters({}); setTimeout(() => fetchAds(), 100); }}
                            className="w-full py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Clear {attrFilterCount} filter{attrFilterCount > 1 ? 's' : ''}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* ─── Results Area ────────────────────────────── */}
          <div className="flex-1 min-w-0">
            
            {/* Results Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {query ? `Search results for "${query}"` : 'Latest Ads'}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {ads.length} result{ads.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  {condition && (
                    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {condition.replace('_', ' ')}
                      <button onClick={() => updateSearch('condition', '')} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {adType && (
                    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {adType}
                      <button onClick={() => updateSearch('ad_type', '')} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {(minPrice || maxPrice) && (
                    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      ₹{minPrice || '0'} – ₹{maxPrice || '∞'}
                      <button onClick={() => {
                        const p = new URLSearchParams(searchParams);
                        p.delete('min_price'); p.delete('max_price');
                        setSearchParams(p);
                      }} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {Object.entries(attrFilters).filter(([_, v]) => v !== '' && v !== undefined).map(([attrId, val]) => {
                    const attr = categoryAttributes.find(a => String(a.id) === String(attrId));
                    return (
                      <span key={attrId} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {attr?.name}: {val}
                        <button onClick={() => {
                          const newFilters = { ...attrFilters };
                          delete newFilters[attrId];
                          setAttrFilters(newFilters);
                          setTimeout(() => fetchAds(), 100);
                        }} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Searching for deals...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-6 rounded-2xl text-center">
                {error}
              </div>
            ) : ads.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No results found</h2>
                <p className="text-gray-500 max-w-sm mx-auto">
                  We couldn't find any ads matching your criteria. Try adjusting your filters or searching for something else.
                </p>
                <button 
                  onClick={clearAllFilters}
                  className="mt-6 px-6 py-2 border-2 border-indigo-100 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ads.map((ad) => (
                  <Link key={ad.id} to={`/ad/${ad.id}`} className="card overflow-hidden group flex flex-col hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 border-gray-100">
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                      {ad.image ? (
                        <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">No Image</div>
                      )}
                      
                      {/* Favorite Button */}
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

                      {/* Condition Badge */}
                      {ad.condition && (
                        <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm ${
                          ad.condition === 'new' ? 'bg-emerald-500/90 text-white' :
                          ad.condition === 'like_new' ? 'bg-blue-500/90 text-white' :
                          'bg-amber-500/90 text-white'
                        }`}>
                          {ad.condition.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors mb-2">
                        {ad.title}
                      </h3>
                      
                      <div className="mb-3">
                        {ad.price ? (
                          <span className="text-xl font-black text-gray-900 flex items-center">
                            <IndianRupee className="w-5 h-5 -mr-0.5" />
                            {parseFloat(ad.price).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            Contact for price
                          </span>
                        )}
                      </div>

                      {/* Attribute Specs */}
                      {ad.attribute_specs && ad.attribute_specs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {ad.attribute_specs.slice(0, 4).map((spec, i) => (
                            <span key={i} className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                              {spec.value}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1.5 truncate max-w-[60%]">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
