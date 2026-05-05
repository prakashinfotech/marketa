import React, { useState, useEffect } from 'react';
import { 
  Layers, Plus, Loader2, AlertCircle, CheckCircle, 
  ChevronRight, FolderTree, Settings2, Hash, ToggleLeft,
  Edit2, Trash2, X, AlertTriangle, ChevronDown, ChevronUp,
  Image as ImageIcon, Type, MousePointer2, CheckSquare
} from 'lucide-react';
import api from '../api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modals
  const [showCatModal, setShowCatModal] = useState(false);
  const [showAttrModal, setShowAttrModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'category' | 'attribute', id: number, name: string }

  // Form states
  const [editingCategory, setEditingCategory] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', slug: '', icon_url: '', parent_id: '', description: '', is_active: true });
  
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [attrForm, setAttrForm] = useState({ name: '', slug: '', field_type: 'text', options: '', is_required: false });

  // UI state
  const [expandedCats, setExpandedCats] = useState(new Set());

  useEffect(() => { fetchCategories(); }, []);

  const toSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) { setError('Failed to load categories.'); }
    finally { setLoading(false); }
  };

  const fetchAttributes = async (catId) => {
    try {
      const res = await api.get(`/categories/${catId}/attributes/`);
      if (res.data.success) {
        setCategoryAttributes(res.data.data);
      }
    } catch (err) { setError('Failed to load attributes.'); }
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

  const toggleExpand = (id) => {
    const next = new Set(expandedCats);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedCats(next);
  };

  const clearMessages = () => { setError(''); setSuccess(''); };

  // ── Category Handlers ──────────────────────────────────────────────────

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCatForm({ name: '', slug: '', icon_url: '', parent_id: '', description: '', is_active: true });
    setShowCatModal(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setCatForm({
      name: cat.name,
      slug: cat.slug,
      icon_url: cat.icon_url || '',
      parent_id: cat.parent_id || '',
      description: cat.description || '',
      is_active: cat.is_active ?? true
    });
    setShowCatModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const payload = { ...catForm };
      if (payload.parent_id) payload.parent_id = parseInt(payload.parent_id);
      else payload.parent_id = null;

      let res;
      if (editingCategory) {
        res = await api.put(`/categories/${editingCategory.id}/`, payload);
      } else {
        res = await api.post('/categories/', payload);
      }

      if (res.data.success) {
        setSuccess(`Category ${editingCategory ? 'updated' : 'created'}!`);
        setShowCatModal(false);
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      } else setError(res.data.msg);
    } catch (err) { setError('Error saving category.'); }
  };

  // ── Attribute Handlers ─────────────────────────────────────────────────

  const handleAddAttribute = (catId) => {
    setEditingAttribute(null);
    setSelectedCategoryId(catId);
    setAttrForm({ name: '', slug: '', field_type: 'text', options: '', is_required: false });
    setShowAttrModal(true);
  };

  const handleEditAttribute = (attr) => {
    setEditingAttribute(attr);
    setAttrForm({
      name: attr.name,
      slug: attr.slug,
      field_type: attr.field_type,
      options: attr.options ? attr.options.join(', ') : '',
      is_required: attr.is_required
    });
    setShowAttrModal(true);
  };

  const handleSaveAttribute = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const optionsArr = attrForm.options ? attrForm.options.split(',').map(s => s.trim()).filter(Boolean) : null;
      const payload = { ...attrForm, options: optionsArr };

      let res;
      if (editingAttribute) {
        res = await api.put(`/categories/attributes/${editingAttribute.id}/`, payload);
      } else {
        res = await api.post('/categories/attributes/', { ...payload, category_id: selectedCategoryId });
      }

      if (res.data.success) {
        setSuccess(`Attribute ${editingAttribute ? 'updated' : 'created'}!`);
        setShowAttrModal(false);
        if (selectedCategoryId) fetchAttributes(selectedCategoryId);
        setTimeout(() => setSuccess(''), 3000);
      } else setError(res.data.msg);
    } catch (err) { setError('Error saving attribute.'); }
  };

  // ── Delete Handlers ──────────────────────────────────────────────────

  const confirmDelete = (type, item) => {
    setDeleteTarget({ type, id: item.id, name: item.name });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    clearMessages();
    try {
      let res;
      if (deleteTarget.type === 'category') {
        res = await api.delete(`/categories/${deleteTarget.id}/`);
      } else {
        res = await api.delete(`/categories/attributes/${deleteTarget.id}/`);
      }

      if (res.data.success) {
        setSuccess(`${deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)} deleted!`);
        setShowDeleteModal(false);
        if (deleteTarget.type === 'category') {
          fetchCategories();
          if (selectedCategoryId === deleteTarget.id) {
            setSelectedCategoryId(null);
            setCategoryAttributes([]);
          }
        } else {
          if (selectedCategoryId) fetchAttributes(selectedCategoryId);
        }
        setTimeout(() => setSuccess(''), 3000);
      } else setError(res.data.msg);
    } catch (err) { setError('Error deleting item.'); }
  };

  // ── Render Tree ────────────────────────────────────────────────────────

  const renderTree = (cats, depth = 0) => {
    return cats.map(cat => {
      const hasChildren = cat.children?.length > 0;
      const isExpanded = expandedCats.has(cat.id);
      const isSelected = selectedCategoryId === cat.id;

      return (
        <div key={cat.id}>
          <div 
            className={`group flex items-center gap-3 py-2 px-3 rounded-xl transition-all mb-1 cursor-pointer ${
              isSelected ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : 'hover:bg-gray-100 border border-transparent'
            }`}
            style={{ marginLeft: depth * 24 }}
            onClick={() => {
              setSelectedCategoryId(cat.id);
              fetchAttributes(cat.id);
            }}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); toggleExpand(cat.id); }}
              className={`p-1 rounded-md hover:bg-gray-200 transition-colors ${!hasChildren ? 'invisible' : ''}`}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
            </button>
            
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-200/50'}`}>
              {cat.icon_url ? <span className="text-base">{cat.icon_url}</span> : <Layers className="w-4 h-4 text-gray-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${isSelected ? 'font-bold text-indigo-900' : 'font-semibold text-gray-700'}`}>{cat.name}</p>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{cat.slug}</p>
            </div>

            <div className={`flex items-center gap-1 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <button 
                onClick={(e) => { e.stopPropagation(); handleEditCategory(cat); }}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                title="Edit Category"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); confirmDelete('category', cat); }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="Delete Category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {hasChildren && isExpanded && renderTree(cat.children, depth + 1)}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Building hierarchy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Category Management</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Configure category trees and dynamic ad attributes.</p>
        </div>
        <button onClick={handleAddCategory} className="btn-primary flex items-center gap-2 whitespace-nowrap shadow-indigo-200">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Alerts */}
      {error && <div className="toast-error mb-6 animate-shake"><AlertCircle className="w-5 h-5 shrink-0" /> {error}</div>}
      {success && <div className="toast-success mb-6 animate-bounce-in"><CheckCircle className="w-5 h-5 shrink-0" /> {success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Tree Side */}
        <div className="lg:col-span-5">
          <div className="card h-[calc(100vh-280px)] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-900">Category Structure</h3>
              </div>
              <span className="text-[10px] font-bold bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-full uppercase tracking-tighter">
                {flatCategories.length} Categories
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {categories.length > 0 ? renderTree(categories) : (
                <div className="text-center py-12">
                  <Layers className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No categories found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attributes Detail Side */}
        <div className="lg:col-span-7">
          {selectedCategoryId ? (
            <div className="card h-[calc(100vh-280px)] flex flex-col animate-fade-in">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Attributes: {flatCategories.find(c => c.id === selectedCategoryId)?.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Dynamic form fields</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleAddAttribute(selectedCategoryId)}
                  className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors border border-indigo-200/50"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Attribute
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {categoryAttributes.length > 0 ? (
                  categoryAttributes.map(attr => (
                    <div key={attr.id} className="group p-4 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 mt-1">
                            {attr.field_type === 'text' && <Type className="w-4 h-4" />}
                            {attr.field_type === 'number' && <Hash className="w-4 h-4" />}
                            {attr.field_type === 'select' && <MousePointer2 className="w-4 h-4" />}
                            {attr.field_type === 'boolean' && <CheckSquare className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 text-sm">{attr.name}</h4>
                              {attr.is_required && <span className="text-[8px] bg-red-50 text-red-600 font-extrabold px-1.5 py-0.5 rounded-full">REQUIRED</span>}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono">
                              <span>SLUG: {attr.slug}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                              <span>TYPE: {attr.field_type.toUpperCase()}</span>
                            </div>
                            {attr.options && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {attr.options.map((opt, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-semibold">{opt}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEditAttribute(attr)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => confirmDelete('attribute', attr)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 opacity-50">
                    <Settings2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 font-medium">No custom attributes defined for this category.</p>
                    <p className="text-xs text-gray-400 mt-1">Add attributes to create custom fields for ads in this category.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card h-[calc(100vh-280px)] flex items-center justify-center p-12 text-center bg-gray-50/30 border-dashed">
              <div className="max-w-xs animate-fade-in">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-gray-100">
                  <MousePointer2 className="w-10 h-10 text-indigo-500 animate-bounce-subtle" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Select a Category</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Choose a category from the structure on the left to manage its dynamic fields and attributes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── MODALS ────────────────────────────────────────────────────────── */}

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">{editingCategory ? 'Update Category' : 'New Category'}</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5 tracking-tight">Organize products and services</p>
              </div>
              <button onClick={() => setShowCatModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveCategory} className="p-8 space-y-5">
              <div>
                <label className="label">Parent Category</label>
                <select 
                  className="input-field !bg-gray-50 !border-gray-200 !rounded-xl" 
                  value={catForm.parent_id} 
                  onChange={e => setCatForm({...catForm, parent_id: e.target.value})}
                >
                  <option value="">— None (Top Level) —</option>
                  {flatCategories.filter(c => c.id !== editingCategory?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.displayName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label flex items-center gap-1.5">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    className="input-field"
                    value={catForm.name} 
                    onChange={e => setCatForm({...catForm, name: e.target.value, slug: toSlug(e.target.value)})}
                    placeholder="e.g. Mobile Phones" 
                  />
                </div>
                <div>
                  <label className="label">URL Slug</label>
                  <input 
                    required 
                    className="input-field !bg-gray-100/50 !border-transparent" 
                    value={catForm.slug} 
                    onChange={e => setCatForm({...catForm, slug: e.target.value})}
                    placeholder="auto-generated" 
                  />
                </div>
              </div>

              <div>
                <label className="label">Visual Icon (Emoji or SVG URL)</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <input 
                    className="input-field pl-10" 
                    value={catForm.icon_url} 
                    onChange={e => setCatForm({...catForm, icon_url: e.target.value})}
                    placeholder="📱, 🚗, or URL" 
                  />
                </div>
              </div>

              <div>
                <label className="label">Short Description</label>
                <textarea 
                  className="input-field min-h-[80px] py-3" 
                  value={catForm.description} 
                  onChange={e => setCatForm({...catForm, description: e.target.value})}
                  placeholder="What can users find in this category?"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-primary w-full !py-4 shadow-indigo-100 flex items-center justify-center gap-2">
                  {editingCategory ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attribute Modal */}
      {showAttrModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">{editingAttribute ? 'Update Attribute' : 'New Attribute'}</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5 tracking-tight">Define custom fields for ads</p>
              </div>
              <button onClick={() => setShowAttrModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveAttribute} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Attribute Name <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    className="input-field"
                    value={attrForm.name} 
                    onChange={e => setAttrForm({...attrForm, name: e.target.value, slug: toSlug(e.target.value)})}
                    placeholder="e.g. RAM, Fuel Type" 
                  />
                </div>
                <div>
                  <label className="label">Field Slug</label>
                  <input 
                    required 
                    className="input-field !bg-gray-100/50 !border-transparent" 
                    value={attrForm.slug} 
                    onChange={e => setAttrForm({...attrForm, slug: e.target.value})}
                    placeholder="auto-generated" 
                  />
                </div>
              </div>

              <div>
                <label className="label mb-3">Field Input Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'text', label: 'Text', icon: <Type className="w-5 h-5" /> },
                    { value: 'number', label: 'Number', icon: <Hash className="w-5 h-5" /> },
                    { value: 'select', label: 'Select', icon: <MousePointer2 className="w-5 h-5" /> },
                    { value: 'boolean', label: 'Toggle', icon: <CheckSquare className="w-5 h-5" /> },
                  ].map(type => (
                    <button 
                      key={type.value}
                      type="button"
                      onClick={() => setAttrForm({...attrForm, field_type: type.value})}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                        attrForm.field_type === type.value 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                          : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      {type.icon}
                      <span className="text-[10px] font-bold uppercase">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {attrForm.field_type === 'select' && (
                <div className="animate-fade-in">
                  <label className="label">Dropdown Options</label>
                  <input 
                    required={attrForm.field_type === 'select'}
                    className="input-field" 
                    value={attrForm.options} 
                    onChange={e => setAttrForm({...attrForm, options: e.target.value})}
                    placeholder="Option 1, Option 2, Option 3..." 
                  />
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">Separate values with commas</p>
                </div>
              )}

              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200/50">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-indigo-600 rounded-lg" 
                  checked={attrForm.is_required} 
                  onChange={e => setAttrForm({...attrForm, is_required: e.target.checked})} 
                />
                <div>
                  <span className="text-sm font-bold text-gray-700">Make field required</span>
                  <p className="text-xs text-gray-500">Users must provide a value when posting an ad</p>
                </div>
              </label>

              <div className="pt-2">
                <button type="submit" className="btn-primary w-full !py-4 shadow-indigo-100 flex items-center justify-center gap-2">
                  {editingAttribute ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingAttribute ? 'Update Attribute' : 'Create Attribute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full animate-scale-in border border-gray-100">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Are you sure?</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                You are about to delete the {deleteTarget?.type} <span className="font-bold text-gray-900">"{deleteTarget?.name}"</span>. 
                This action will hide it from the platform and cannot be easily undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-6 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
