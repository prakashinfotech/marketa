import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Loader2, AlertCircle, CheckCircle, Globe, Building2, Star, Edit2, Trash2, X, Search } from 'lucide-react';
import api from '../api';
import { ConfirmDialog } from './ui';

export default function AdminLocations() {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'state', 'city'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit states
  const [editingItem, setEditingItem] = useState(null); // {type: 'state'|'city', data: {}}
  // Delete confirmation state: { type, id } | null
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Form states
  const [newStateName, setNewStateName] = useState('');
  const [newStateSlug, setNewStateSlug] = useState('');
  const [newCityName, setNewCityName] = useState('');
  const [newCitySlug, setNewCitySlug] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [isPopular, setIsPopular] = useState(false);

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statesRes, citiesRes] = await Promise.all([
        api.get('/locations/states/'),
        api.get('/locations/cities/')
      ]);
      if (statesRes.data.success) setStates(statesRes.data.data);
      if (citiesRes.data.success) setCities(citiesRes.data.data);
    } catch (err) { 
      setError('Failed to load locations.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const toSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleCreateState = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const res = await api.post('/locations/states/', { name: newStateName, slug: newStateSlug });
      if (res.data.success) {
        setSuccess('State created successfully!');
        setNewStateName(''); setNewStateSlug('');
        fetchData();
        setActiveTab('list');
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
        fetchData();
        setActiveTab('list');
        setTimeout(() => setSuccess(''), 3000);
      } else setError(res.data.msg);
    } catch (err) { setError('Error creating city.'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    clearMessages();
    const { type, data } = editingItem;
    try {
      const endpoint = type === 'state' ? `/locations/states/${data.id}` : `/locations/cities/${data.id}`;
      const res = await api.put(endpoint, data);
      if (res.data.success) {
        setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`);
        setEditingItem(null);
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else setError(res.data.msg);
    } catch (err) { setError(`Error updating ${type}.`); }
  };

  // Triggered by row delete button — opens the confirm dialog.
  const handleDelete = (type, id) => setPendingDelete({ type, id });

  // Called from <ConfirmDialog onConfirm>.
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { type, id } = pendingDelete;
    clearMessages();
    setDeleting(true);
    try {
      const endpoint = type === 'state' ? `/locations/states/${id}` : `/locations/cities/${id}`;
      const res = await api.delete(endpoint);
      if (res.data.success) {
        setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.data.msg);
      }
    } catch (err) {
      setError(`Error deleting ${type}.`);
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.state_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && states.length === 0) {
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
    <div className="max-w-6xl pb-20">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Location Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Configure states and cities available on the platform.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('state')} className="btn-secondary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add State
          </button>
          <button onClick={() => setActiveTab('city')} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add City
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="toast-error mb-6"><AlertCircle className="w-5 h-5 shrink-0" /> {error}</div>}
      {success && <div className="toast-success mb-6"><CheckCircle className="w-5 h-5 shrink-0" /> {success}</div>}

      {/* Main Content Tabs */}
      <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl mb-6 w-fit">
        <button 
          onClick={() => setActiveTab('list')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          View All
        </button>
        <button 
          onClick={() => setActiveTab('state')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'state' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          New State
        </button>
        <button 
          onClick={() => setActiveTab('city')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'city' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          New City
        </button>
      </div>

      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* States Column */}
          <div className="lg:col-span-1">
            <div className="card h-full">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" /> States
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{states.length}</span>
              </div>
              <div className="p-2 max-h-[600px] overflow-y-auto">
                {states.map(s => (
                  <div key={s.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingItem({ type: 'state', data: s })}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete('state', s.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cities Column */}
          <div className="lg:col-span-2">
            <div className="card h-full">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 shrink-0">
                  <Building2 className="w-4 h-4 text-amber-500" /> Cities
                </h3>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search cities..." 
                    className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-wider font-bold">
                      <th className="px-4 py-3">City Name</th>
                      <th className="px-4 py-3">State</th>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCities.map(c => (
                      <tr key={c.id} className="group hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-gray-900">{c.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-gray-600 bg-white border border-gray-100 px-2 py-1 rounded-md">{c.state_name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1 rounded">{c.slug}</code>
                        </td>
                        <td className="px-4 py-3">
                          {c.is_popular ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                              <Star className="w-2.5 h-2.5 fill-amber-500" /> POPULAR
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">Regular</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => setEditingItem({ type: 'city', data: c })}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete('city', c.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredCities.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-12 text-center text-gray-500 text-sm italic">
                          No cities found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forms for New Items */}
      {activeTab === 'state' && (
        <div className="card p-8 animate-fade-in max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New State</h2>
              <p className="text-sm text-gray-500">Add a new state or union territory to the platform.</p>
            </div>
          </div>
          
          <form onSubmit={handleCreateState} className="space-y-5">
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
            <div className="pt-4 flex gap-3">
              <button type="submit" className="btn-primary flex-1 !py-3 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Create State
              </button>
              <button type="button" onClick={() => setActiveTab('list')} className="btn-secondary !py-3 px-6">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'city' && (
        <div className="card p-8 animate-fade-in max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New City</h2>
              <p className="text-sm text-gray-500">Add a city under an existing state.</p>
            </div>
          </div>

          <form onSubmit={handleCreateCity} className="space-y-5">
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
            <div className="pt-4 flex gap-3">
              <button type="submit" className="btn-primary flex-1 !py-3 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Create City
              </button>
              <button type="button" onClick={() => setActiveTab('list')} className="btn-secondary !py-3 px-6">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-gray-900">Edit {editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)}</h3>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="label">Name</label>
                <input 
                  className="input-field" 
                  required 
                  value={editingItem.data.name} 
                  onChange={e => setEditingItem({
                    ...editingItem, 
                    data: { ...editingItem.data, name: e.target.value, slug: toSlug(e.target.value) }
                  })}
                />
              </div>
              <div>
                <label className="label">URL Slug</label>
                <input 
                  className="input-field !bg-gray-100/50" 
                  required 
                  value={editingItem.data.slug} 
                  onChange={e => setEditingItem({
                    ...editingItem, 
                    data: { ...editingItem.data, slug: e.target.value }
                  })}
                />
              </div>
              
              {editingItem.type === 'city' && (
                <>
                  <div>
                    <label className="label">State</label>
                    <select 
                      className="input-field !bg-white cursor-pointer" 
                      required 
                      value={editingItem.data.state_id} 
                      onChange={e => setEditingItem({
                        ...editingItem, 
                        data: { ...editingItem.data, state_id: parseInt(e.target.value) }
                      })}
                    >
                      {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <label className="flex items-center gap-3 px-4 py-3 bg-amber-50/80 border border-amber-100 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-amber-500 border-gray-300 rounded accent-amber-500" 
                      checked={editingItem.data.is_popular} 
                      onChange={e => setEditingItem({
                        ...editingItem, 
                        data: { ...editingItem.data, is_popular: e.target.checked }
                      })} 
                    />
                    <span className="text-sm font-semibold text-amber-800">Mark as Popular City</span>
                  </label>
                </>
              )}
              
              <div className="pt-4 flex gap-3">
                <button type="submit" className="btn-primary flex-1 !py-3">Save Changes</button>
                <button type="button" onClick={() => setEditingItem(null)} className="btn-secondary flex-1 !py-3">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title={`Delete this ${pendingDelete?.type ?? 'item'}?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}
