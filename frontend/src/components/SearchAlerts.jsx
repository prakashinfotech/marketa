import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import { Bell, BellOff, Trash2, Plus, Loader2, Search, MapPin, IndianRupee, AlertCircle } from 'lucide-react';

export default function SearchAlerts() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteModalAlertId, setDeleteModalAlertId] = useState(null);


  // Form State
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchAlerts();
    fetchCategories();
    fetchStates();
  }, [isLoggedIn]);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts/me/');
      if (res.data.success) {
        setAlerts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching alerts', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      if (res.data.success) {
        const flatten = (cats, prefix = '') => {
          let flat = [];
          cats.forEach(c => {
            flat.push({ ...c, displayName: prefix + c.name });
            if (c.children?.length) flat = flat.concat(flatten(c.children, prefix + '└─ '));
          });
          return flat;
        };
        setCategories(flatten(res.data.data));
      }
    } catch (err) {}
  };

  const fetchStates = async () => {
    try {
      const res = await api.get('/locations/states/');
      if (res.data.success) setStates(res.data.data);
    } catch (err) {}
  };

  const fetchCities = async (sId) => {
    try {
      const res = await api.get(`/locations/states/${sId}/cities/`);
      if (res.data.success) setCities(res.data.data);
    } catch (err) {}
  };

  const handleStateChange = (e) => {
    const sId = e.target.value;
    setStateId(sId);
    setCityId('');
    setCities([]);
    if (sId) fetchCities(sId);
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!keyword.trim()) {
      setFormError('Keyword is required');
      return;
    }

    setActionLoading('create');
    const payload = {
      keyword: keyword.trim(),
      category_id: categoryId ? parseInt(categoryId) : null,
      city_id: cityId ? parseInt(cityId) : null,
      min_price: minPrice ? parseFloat(minPrice) : null,
      max_price: maxPrice ? parseFloat(maxPrice) : null,
    };

    try {
      const res = await api.post('/alerts/', payload);
      if (res.data.success) {
        setKeyword('');
        setCategoryId('');
        setStateId('');
        setCityId('');
        setMinPrice('');
        setMaxPrice('');
        setCities([]);
        fetchAlerts();
      } else {
        setFormError(res.data.msg);
      }
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Error creating alert');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    setActionLoading(`toggle-${id}`);
    try {
      const res = await api.put(`/alerts/${id}/toggle/`, { is_active: !currentStatus });
      if (res.data.success) {
        fetchAlerts();
      }
    } catch (err) {
      console.error('Error toggling alert', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (id) => {
    setDeleteModalAlertId(id);
  };

  const executeDelete = async () => {
    if (!deleteModalAlertId) return;
    const id = deleteModalAlertId;
    setDeleteModalAlertId(null);
    setActionLoading(`delete-${id}`);
    try {
      const res = await api.delete(`/alerts/${id}/`);
      if (res.data.success) {
        setAlerts(alerts.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error('Error deleting alert', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-500" /> Search Alerts
          </h1>
          <p className="text-gray-500 mt-1">Get notified when new ads match your specific criteria.</p>
        </div>

        {/* Create Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Alert</h2>
          {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
          
          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keyword <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" required value={keyword} onChange={e => setKeyword(e.target.value)} className="input-field pl-9 py-2 text-sm" placeholder="e.g. iPhone, Royal Enfield" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input-field py-2 text-sm bg-white">
                  <option value="">Any Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State (Optional)</label>
                  <select value={stateId} onChange={handleStateChange} className="input-field py-2 text-sm bg-white">
                    <option value="">Any State</option>
                    {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City (Optional)</label>
                  <select value={cityId} onChange={e => setCityId(e.target.value)} disabled={!stateId} className="input-field py-2 text-sm bg-white disabled:bg-gray-100">
                    <option value="">Any City</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
                <input type="number" min="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="input-field py-2 text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
                <input type="number" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="input-field py-2 text-sm" placeholder="Max" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={actionLoading === 'create'} className="btn-primary py-2 px-6 text-sm flex items-center gap-2">
                {actionLoading === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Alert
              </button>
            </div>
          </form>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Active Alerts</h2>
          
          {loading ? (
             <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
          ) : alerts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">You don't have any search alerts yet.</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className={`bg-white rounded-xl shadow-sm border transition-colors p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${alert.is_active ? 'border-indigo-200' : 'border-gray-200 opacity-75'}`}>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">"{alert.keyword}"</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-2">
                    {alert.category_name && <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">{alert.category_name}</span>}
                    {alert.city_name && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {alert.city_name}</span>}
                    {(alert.min_price || alert.max_price) && (
                      <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5"/> 
                        {alert.min_price || 0} - {alert.max_price || 'Any'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end border-t border-gray-100 pt-3 sm:border-t-0 sm:pt-0">
                  <button 
                    onClick={() => handleToggle(alert.id, alert.is_active)}
                    disabled={actionLoading === `toggle-${alert.id}`}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${alert.is_active ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                  >
                    {actionLoading === `toggle-${alert.id}` ? <Loader2 className="w-4 h-4 animate-spin"/> : (alert.is_active ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />)}
                    {alert.is_active ? 'Pause' : 'Resume'}
                  </button>
                  <button 
                    onClick={() => handleDelete(alert.id)}
                    disabled={actionLoading === `delete-${alert.id}`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Alert"
                  >
                    {actionLoading === `delete-${alert.id}` ? <Loader2 className="w-5 h-5 animate-spin"/> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Alert Confirmation Modal */}
      {deleteModalAlertId && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Alert?</h3>
              <p className="text-center text-gray-600 mb-6">
                Are you sure you want to delete this search alert?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalAlertId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
                >
                  Yes, Delete Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
