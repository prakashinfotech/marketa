import React, { useState, useEffect } from 'react';
import { 
  Layers, Plus, Loader2, AlertCircle, CheckCircle, 
  ChevronRight, FolderTree, Settings2, Hash, ToggleLeft
} from 'lucide-react';
import api from '../api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('category');
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [parentId, setParentId] = useState('');

  const [attrName, setAttrName] = useState('');
  const [attrSlug, setAttrSlug] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isRequired, setIsRequired] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const toSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      if (res.data.success) setCategories(res.data.data);
    } catch (err) { setError('Failed to load categories.'); }
    finally { setLoading(false); }
  };

  const flattenCategories = (cats, prefix = '') => {
    let flat = [];
    cats.forEach(c => {
      flat.push({ ...c, displayName: prefix + c.name });
      if (c.children?.length > 0) {
        flat = flat.concat(flattenCategories(c.children, prefix + '└─ '));
      }
    });
    return flat;
  };
  const flatCategories = flattenCategories(categories);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const payload = { name, slug };
      if (parentId) payload.parent_id = parseInt(parentId);
      if (iconUrl) payload.icon_url = iconUrl;
      const res = await api.post('/categories/', payload);
      if (res.data.success) {
        setSuccess('Category created!');
        setName(''); setSlug(''); setParentId(''); setIconUrl('');
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      } else setError(res.data.msg);
    } catch (err) { setError('Error creating category.'); }
  };

  const handleCreateAttribute = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!selectedCategory) return setError('Please select a category first.');
    try {
      const res = await api.post('/categories/attributes/', {
        category_id: parseInt(selectedCategory),
        name: attrName, slug: attrSlug,
        field_type: fieldType, is_required: isRequired
      });
      if (res.data.success) {
        setSuccess('Attribute created!');
        setAttrName(''); setAttrSlug(''); setFieldType('text'); setIsRequired(false);
        setTimeout(() => setSuccess(''), 3000);
      } else setError(res.data.msg);
    } catch (err) { setError('Error creating attribute.'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Render category tree recursively
  const renderTree = (cats, depth = 0) => {
    return cats.map(cat => (
      <div key={cat.id}>
        <div 
          className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors ${depth > 0 ? 'ml-' + (depth * 6) : ''}`}
          style={{ marginLeft: depth * 24 }}
        >
          {cat.icon_url && <span className="text-base">{cat.icon_url}</span>}
          {!cat.icon_url && <Layers className="w-3.5 h-3.5 text-gray-400" />}
          <span className={`text-sm ${depth === 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{cat.name}</span>
          <span className="text-xs text-gray-400 ml-auto font-mono">{cat.slug}</span>
        </div>
        {cat.children?.length > 0 && renderTree(cat.children, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Category Management</h1>
        <p className="text-gray-500 mt-1 text-sm">Configure categories, sub-categories, and dynamic ad attributes.</p>
      </div>

      {/* Existing categories tree */}
      {categories.length > 0 && (
        <div className="card p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FolderTree className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-900">Category Tree</h3>
            <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-100 ml-auto">
              {flatCategories.length} total
            </span>
          </div>
          <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 max-h-48 overflow-y-auto">
            {renderTree(categories)}
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && <div className="toast-error mb-6"><AlertCircle className="w-5 h-5 shrink-0" /> {error}</div>}
      {success && <div className="toast-success mb-6"><CheckCircle className="w-5 h-5 shrink-0" /> {success}</div>}

      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl mb-6 w-fit">
        <button onClick={() => setActiveTab('category')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'category' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}>
          <Layers className="w-4 h-4" /> Add Category
        </button>
        <button onClick={() => setActiveTab('attribute')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'attribute' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}>
          <Settings2 className="w-4 h-4" /> Add Attribute
        </button>
      </div>

      {/* Forms */}
      {activeTab === 'category' ? (
        <div className="card p-6 animate-fade-in">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Create Category</h2>
          <p className="text-sm text-gray-500 mb-6">Add a top-level category or a sub-category under an existing one.</p>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="label">Parent Category (Optional)</label>
              <select className="input-field !bg-white cursor-pointer" value={parentId} onChange={e => setParentId(e.target.value)}>
                <option value="">— None (Top Level) —</option>
                {flatCategories.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <input className="input-field" required value={name} 
                  onChange={e => { setName(e.target.value); setSlug(toSlug(e.target.value)); }}
                  placeholder="e.g. Mobile Phones" />
              </div>
              <div>
                <label className="label">URL Slug</label>
                <input className="input-field !bg-gray-100/50" required value={slug} 
                  onChange={e => setSlug(e.target.value)} placeholder="auto-generated" />
              </div>
            </div>
            <div>
              <label className="label">Icon (Emoji or URL)</label>
              <input className="input-field" value={iconUrl} onChange={e => setIconUrl(e.target.value)} placeholder="📱 or https://..." />
              <p className="text-xs text-gray-400 mt-1">Shows next to the category on the homepage.</p>
            </div>
            <button type="submit" className="btn-primary w-full !py-3 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Create Category
            </button>
          </form>
        </div>
      ) : (
        <div className="card p-6 animate-fade-in">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Create Dynamic Attribute</h2>
          <p className="text-sm text-gray-500 mb-6">Define a custom input field that will appear when posting an ad in this category.</p>
          <form onSubmit={handleCreateAttribute} className="space-y-4">
            <div>
              <label className="label">Category</label>
              <select className="input-field !bg-white cursor-pointer" required value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="">— Select Category —</option>
                {flatCategories.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Attribute Name</label>
                <input className="input-field" required value={attrName} 
                  onChange={e => { setAttrName(e.target.value); setAttrSlug(toSlug(e.target.value)); }}
                  placeholder="e.g. RAM, Fuel Type" />
              </div>
              <div>
                <label className="label">Slug</label>
                <input className="input-field !bg-gray-100/50" required value={attrSlug} 
                  onChange={e => setAttrSlug(e.target.value)} placeholder="auto-generated" />
              </div>
            </div>
            <div>
              <label className="label">Field Type</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'text', label: 'Text', icon: 'Aa' },
                  { value: 'number', label: 'Number', icon: '#' },
                  { value: 'select', label: 'Dropdown', icon: '▼' },
                  { value: 'boolean', label: 'Toggle', icon: '◉' },
                ].map(ft => (
                  <button key={ft.value} type="button"
                    onClick={() => setFieldType(ft.value)}
                    className={`p-3 rounded-xl text-center transition-all border-2 ${
                      fieldType === ft.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                    }`}>
                    <span className="text-lg block mb-1">{ft.icon}</span>
                    <span className="text-xs font-semibold">{ft.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 px-4 py-3 bg-violet-50/80 border border-violet-100 rounded-xl cursor-pointer hover:bg-violet-50 transition-colors">
              <input type="checkbox" className="w-4 h-4 accent-violet-600" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} />
              <div>
                <span className="text-sm font-semibold text-violet-800">Required Field</span>
                <span className="text-xs text-violet-600 block mt-0.5">Users must fill this field when posting an ad in this category</span>
              </div>
            </label>
            <button type="submit" className="btn-primary w-full !py-3 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Create Attribute
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
