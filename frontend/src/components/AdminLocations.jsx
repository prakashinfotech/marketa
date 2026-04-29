import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Loader2, AlertCircle, CheckCircle, Globe, Building2, Star } from 'lucide-react';
import api from '../api';

export default function AdminLocations() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('state');
  
  const [newStateName, setNewStateName] = useState('');
  const [newStateSlug, setNewStateSlug] = useState('');
  const [newCityName, setNewCityName] = useState('');
  const [newCitySlug, setNewCitySlug] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [isPopular, setIsPopular] = useState(false);

  useEffect(() => { fetchStates(); }, []);

  // Auto-generate slug
  const toSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const fetchStates = async () => {
    try {
      const res = await api.get('/locations/states/');
      if (res.data.success) setStates(res.data.data);
    } catch (err) { setError('Failed to load states.'); }
    finally { setLoading(false); }
  };

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleCreateState = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const res = await api.post('/locations/states/', { name: newStateName, slug: newStateSlug });
      if (res.data.success) {
        setSuccess('State created successfully!');
        setNewStateName(''); setNewStateSlug('');
        fetchStates();
        setTimeout(() => setSuccess(''), 3000);
      } else setError(res.data.msg);
    } catch (err) { setError('Error creating state.'); }
  };

  const handleCreateCity = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!selectedStateId) return setError('Please select a state first.');
    try {
      const res = await api.post('/locations/cities/', {
        name: newCityName, slug: newCitySlug,
        state_id: parseInt(selectedStateId), is_popular: isPopular
      });
      if (res.data.success) {
        setSuccess('City created successfully!');
        setNewCityName(''); setNewCitySlug(''); setIsPopular(false);
        setTimeout(() => setSuccess(''), 3000);
      } else setError(res.data.msg);
    } catch (err) { setError('Error creating city.'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Location Management</h1>
        <p className="text-gray-500 mt-1 text-sm">Add and configure states and cities for the platform.</p>
      </div>

      {/* Existing states overview */}
      {states.length > 0 && (
        <div className="card p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-900">Existing States</h3>
            <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-100 ml-auto">{states.length} states</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {states.map(s => (
              <span key={s.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:border-indigo-200 hover:bg-indigo-50 transition-all cursor-default">
                <MapPin className="w-3 h-3 text-gray-400" />
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && <div className="toast-error mb-6"><AlertCircle className="w-5 h-5 shrink-0" /> {error}</div>}
      {success && <div className="toast-success mb-6"><CheckCircle className="w-5 h-5 shrink-0" /> {success}</div>}

      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl mb-6 w-fit">
        <button 
          onClick={() => setActiveTab('state')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'state' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Globe className="w-4 h-4" /> Add State
        </button>
        <button 
          onClick={() => setActiveTab('city')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'city' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Building2 className="w-4 h-4" /> Add City
        </button>
      </div>

      {/* Forms */}
      {activeTab === 'state' ? (
        <div className="card p-6 animate-fade-in">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Create New State</h2>
          <p className="text-sm text-gray-500 mb-6">Add a new state or union territory to the platform.</p>
          <form onSubmit={handleCreateState} className="space-y-4">
            <div>
              <label className="label">State Name</label>
              <input className="input-field" required value={newStateName} 
                onChange={e => { setNewStateName(e.target.value); setNewStateSlug(toSlug(e.target.value)); }}
                placeholder="e.g. Maharashtra" />
            </div>
            <div>
              <label className="label">URL Slug</label>
              <input className="input-field !bg-gray-100/50" required value={newStateSlug} 
                onChange={e => setNewStateSlug(e.target.value)} placeholder="auto-generated" />
              <p className="text-xs text-gray-400 mt-1">Used in URLs. Auto-generated from name.</p>
            </div>
            <button type="submit" className="btn-primary w-full !py-3 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Create State
            </button>
          </form>
        </div>
      ) : (
        <div className="card p-6 animate-fade-in">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Create New City</h2>
          <p className="text-sm text-gray-500 mb-6">Add a city under an existing state.</p>
          <form onSubmit={handleCreateCity} className="space-y-4">
            <div>
              <label className="label">Select State</label>
              <select className="input-field !bg-white cursor-pointer" required value={selectedStateId} onChange={e => setSelectedStateId(e.target.value)}>
                <option value="">— Choose State —</option>
                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">City Name</label>
                <input className="input-field" required value={newCityName} 
                  onChange={e => { setNewCityName(e.target.value); setNewCitySlug(toSlug(e.target.value)); }}
                  placeholder="e.g. Mumbai" />
              </div>
              <div>
                <label className="label">URL Slug</label>
                <input className="input-field !bg-gray-100/50" required value={newCitySlug} 
                  onChange={e => setNewCitySlug(e.target.value)} placeholder="auto-generated" />
              </div>
            </div>
            <label className="flex items-center gap-3 px-4 py-3 bg-amber-50/80 border border-amber-100 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
              <input type="checkbox" className="w-4 h-4 text-amber-500 border-gray-300 rounded accent-amber-500" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} />
              <div>
                <span className="text-sm font-semibold text-amber-800 flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Mark as Popular</span>
                <span className="text-xs text-amber-600 block mt-0.5">Popular cities appear on the homepage for quick browsing</span>
              </div>
            </label>
            <button type="submit" className="btn-primary w-full !py-3 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Create City
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
