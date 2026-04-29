import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import { 
  ImagePlus, MapPin, Tag, Type, Loader2, AlertCircle, 
  CheckCircle, IndianRupee, Layers, FileText
} from 'lucide-react';

export default function PostAd() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dropdown data
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  // Dynamic Attributes
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceNegotiable, setPriceNegotiable] = useState(false);
  const [condition, setCondition] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [locality, setLocality] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchCategories();
    fetchStates();
  }, [isLoggedIn, navigate]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      if (res.data.success) {
        // Flatten categories for dropdown
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
    } catch (err) { console.error('Failed to load categories', err); }
  };

  const fetchStates = async () => {
    try {
      const res = await api.get('/locations/states/');
      if (res.data.success) setStates(res.data.data);
    } catch (err) { console.error('Failed to load states', err); }
  };

  const fetchCities = async (sId) => {
    try {
      const res = await api.get(`/locations/states/${sId}/cities/`);
      if (res.data.success) setCities(res.data.data);
    } catch (err) { console.error('Failed to load cities', err); }
  };

  const fetchCategoryAttributes = async (catId) => {
    try {
      const res = await api.get(`/categories/${catId}/attributes/`);
      if (res.data.success) {
        setCategoryAttributes(res.data.data);
        // Initialize empty values
        const initVals = {};
        res.data.data.forEach(attr => initVals[attr.id] = '');
        setAttributeValues(initVals);
      }
    } catch (err) { console.error('Failed to load attributes', err); }
  };

  // Handlers
  const handleStateChange = (e) => {
    const sId = e.target.value;
    setStateId(sId);
    setCityId('');
    setCities([]);
    if (sId) fetchCities(sId);
  };

  const handleCategoryChange = (e) => {
    const cId = e.target.value;
    setCategoryId(cId);
    setCategoryAttributes([]);
    setAttributeValues({});
    if (cId) fetchCategoryAttributes(cId);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('You can upload a maximum of 5 images.');
      return;
    }
    setImages(files);
    
    // Generate previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!categoryId || !cityId || !title) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category_id', categoryId);
    formData.append('city_id', cityId);
    if (description) formData.append('description', description);
    if (price) formData.append('price', price);
    formData.append('price_negotiable', priceNegotiable);
    if (condition) formData.append('condition', condition);
    if (locality) formData.append('locality', locality);
    formData.append('ad_type', 'sell');

    // Format attributes as JSON array of objects
    const attrArray = Object.keys(attributeValues).map(attrId => ({
      attribute_id: parseInt(attrId),
      value: attributeValues[attrId].toString()
    })).filter(a => a.value.trim() !== '');

    if (attrArray.length > 0) {
      formData.append('attribute_values', JSON.stringify(attrArray));
    }

    images.forEach(img => {
      formData.append('images', img);
    });

    try {
      const res = await api.post('/ads/create/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setSuccess('Your ad has been posted successfully!');
        window.scrollTo(0, 0);
        setTimeout(() => {
          navigate('/profile'); // Redirect to profile or ad details
        }, 2000);
      } else {
        setError(res.data.msg);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred while posting your ad.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Post a Free Ad</h1>
        <p className="text-gray-500">Fill in the details below to publish your listing.</p>
      </div>

      {error && <div className="toast-error mb-6"><AlertCircle className="w-5 h-5 shrink-0" /> {error}</div>}
      {success && <div className="toast-success mb-6"><CheckCircle className="w-5 h-5 shrink-0" /> {success}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Details */}
        <div className="card p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" /> Basic Details
          </h2>
          <div className="space-y-5">
            <div>
              <label className="label">Ad Title <span className="text-red-500">*</span></label>
              <div className="relative">
                <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" required maxLength={150} className="input-field pl-10" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. iPhone 13 Pro Max 256GB" />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="label">Category <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select required className="input-field pl-10 bg-white" value={categoryId} onChange={handleCategoryChange}>
                    <option value="">-- Select Category --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="label">Condition</label>
                <select className="input-field bg-white" value={condition} onChange={e => setCondition(e.target.value)}>
                  <option value="">-- Select Condition --</option>
                  <option value="new">New (Unused)</option>
                  <option value="like_new">Like New (Barely used)</option>
                  <option value="used">Used (Good condition)</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea rows={4} className="input-field resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what you are selling. Include details like age, warranty, features..." />
            </div>
          </div>
        </div>

        {/* Dynamic Attributes */}
        {categoryAttributes.length > 0 && (
          <div className="card p-6 md:p-8 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-500" /> Category Details
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {categoryAttributes.map(attr => (
                <div key={attr.id}>
                  <label className="label">{attr.name} {attr.is_required && <span className="text-red-500">*</span>}</label>
                  
                  {attr.field_type === 'select' && attr.options?.length ? (
                    <select 
                      required={attr.is_required} 
                      className="input-field bg-white"
                      value={attributeValues[attr.id] || ''}
                      onChange={e => setAttributeValues({...attributeValues, [attr.id]: e.target.value})}
                    >
                      <option value="">-- Select {attr.name} --</option>
                      {attr.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : attr.field_type === 'boolean' ? (
                    <div className="flex items-center h-11">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                          checked={attributeValues[attr.id] === 'true'}
                          onChange={e => setAttributeValues({...attributeValues, [attr.id]: e.target.checked ? 'true' : 'false'})}
                        />
                        <span className="text-sm font-medium text-gray-700">Yes</span>
                      </label>
                    </div>
                  ) : attr.field_type === 'number' ? (
                    <input 
                      type="number" 
                      required={attr.is_required} 
                      className="input-field"
                      value={attributeValues[attr.id] || ''}
                      onChange={e => setAttributeValues({...attributeValues, [attr.id]: e.target.value})}
                    />
                  ) : (
                    <input 
                      type="text" 
                      required={attr.is_required} 
                      className="input-field"
                      value={attributeValues[attr.id] || ''}
                      onChange={e => setAttributeValues({...attributeValues, [attr.id]: e.target.value})}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="card p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-500" /> Price Details
          </h2>
          <div className="grid md:grid-cols-2 gap-5 items-end">
            <div>
              <label className="label">Price (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">₹</span>
                <input type="number" min="0" step="0.01" className="input-field pl-8 font-bold text-gray-900" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Leave blank for "Contact for price"</p>
            </div>
            
            <div className="h-11 flex items-center">
              <label className="flex items-center gap-3 cursor-pointer px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full">
                <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded border-gray-300 accent-emerald-600" checked={priceNegotiable} onChange={e => setPriceNegotiable(e.target.checked)} />
                <span className="text-sm font-semibold text-gray-700">Price is Negotiable</span>
              </label>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" /> Location
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <label className="label">State <span className="text-red-500">*</span></label>
              <select required className="input-field bg-white" value={stateId} onChange={handleStateChange}>
                <option value="">-- Select State --</option>
                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">City <span className="text-red-500">*</span></label>
              <select required className="input-field bg-white disabled:bg-gray-100 disabled:cursor-not-allowed" value={cityId} onChange={e => setCityId(e.target.value)} disabled={!stateId}>
                <option value="">-- Select City --</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Locality / Area</label>
              <input type="text" className="input-field disabled:bg-gray-100 disabled:cursor-not-allowed" value={locality} onChange={e => setLocality(e.target.value)} placeholder="e.g. Andheri West" disabled={!cityId} />
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="card p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-pink-500" /> Photos
          </h2>
          
          <div className="mb-4">
            <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:bg-gray-50 hover:border-indigo-400 transition-colors cursor-pointer group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImagePlus className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 mb-3 transition-colors" />
                <p className="mb-1 text-sm text-gray-600"><span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-400">PNG, JPG or JPEG (Max 5 photos)</p>
              </div>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img src={src} alt="preview" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-indigo-600/90 text-white text-[10px] font-bold text-center py-0.5">COVER</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto md:px-12 py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mx-auto">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {loading ? 'Publishing Ad...' : 'Publish Your Ad Now'}
          </button>
        </div>

      </form>
    </div>
  );
}
