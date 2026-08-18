import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import { 
  ImagePlus, MapPin, Tag, Type, Loader2, AlertCircle, 
  CheckCircle, IndianRupee, Layers, FileText, X, Trash2
} from 'lucide-react';

export default function PostAd() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // if present, we are in Edit mode
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
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
  const [stateId, setStateId] = useState(''); // Need state ID to fetch cities
  const [cityId, setCityId] = useState('');
  const [locality, setLocality] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);   // images from server during edit
  const [removedImageIds, setRemovedImageIds] = useState([]); // IDs of images to delete

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const loadData = async () => {
      await fetchCategories();
      await fetchStates();
      if (isEditMode) {
        await fetchAdDetails(id);
      }
    };
    loadData();
  }, [isLoggedIn, navigate, id, isEditMode]);

  const fetchAdDetails = async (adId) => {
    try {
      const res = await api.get(`/ads/${adId}/`);
      if (res.data.success) {
        const ad = res.data.data;
        
        // Prevent editing someone else's ad
        if (ad.user?.id && ad.user.id !== user?.id) {
          navigate('/');
          return;
        }

        setTitle(ad.title || '');
        setDescription(ad.description || '');
        setPrice(ad.price || '');
        setPriceNegotiable(ad.price_negotiable || false);
        setCondition(ad.condition || '');
        setLocality(ad.locality || '');
        
        if (ad.category_id) setCategoryId(ad.category_id);
        if (ad.state_id) {
          setStateId(ad.state_id);
          await fetchCities(ad.state_id); // load cities for the state
        }
        if (ad.city_id) setCityId(ad.city_id);

        // Load existing images for edit
        if (ad.images?.length) {
          setExistingImages(ad.images.map((img, idx) => ({ ...img, id: img.id || idx })));
        }

      } else {
        setError('Failed to load ad details.');
      }
    } catch (err) {
      setError('An error occurred loading ad details.');
    } finally {
      setInitialLoading(false);
    }
  };

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
    
    // Check file size (max 5MB per image)
    const MAX_SIZE = 5 * 1024 * 1024;
    const oversizedFiles = files.filter(f => f.size > MAX_SIZE);
    if (oversizedFiles.length > 0) {
      setError('One or more images exceed the 5MB size limit.');
      return;
    }

    const totalImages = (existingImages.length - removedImageIds.length) + images.length + files.length;
    if (totalImages > 5) {
      setError('You can have a maximum of 5 images total.');
      return;
    }
    setImages(prev => [...prev, ...files]);
    
    // Generate previews for new files
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveExistingImage = (imgId) => {
    setRemovedImageIds(prev => [...prev, imgId]);
    setExistingImages(prev => prev.filter(img => img.id !== imgId));
  };

  const handleRemoveNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate Required Fields
    if (!title || !categoryId || !cityId || !description || !price) {
      setError('Please fill in all required fields (Title, Category, City, Description, Price).');
      return;
    }

    if (parseFloat(price) <= 0) {
      setError('Price must be greater than 0.');
      return;
    }

    if (!isEditMode && images.length === 0) {
      setError('Please upload at least 1 image.');
      return;
    }

    if (isEditMode) {
      const remainingImages = (existingImages.length - removedImageIds.length) + images.length;
      if (remainingImages === 0) {
        setError('An ad must have at least 1 image.');
        return;
      }
    }
    if (isEditMode && !title) {
        setError('Title is required.');
        return;
    }

    setLoading(true);

    try {
        if (isEditMode) {
            // Edit mode now sends FormData (supports images)
            const formData = new FormData();
            formData.append('title', title);
            if (description) formData.append('description', description);
            if (price) formData.append('price', price);
            formData.append('price_negotiable', priceNegotiable);
            if (condition) formData.append('condition', condition);
            if (locality) formData.append('locality', locality);
            if (categoryId) formData.append('category_id', parseInt(categoryId));
            if (cityId) formData.append('city_id', parseInt(cityId));

            // Append new images
            images.forEach(img => formData.append('images', img));

            // Append removed image IDs
            if (removedImageIds.length > 0) {
                formData.append('removed_image_ids', JSON.stringify(removedImageIds));
            }

            const res = await api.put(`/ads/${id}/update/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setSuccess('Your ad has been updated successfully!');
                window.scrollTo(0, 0);
                setTimeout(() => navigate('/my-ads'), 1500);
            } else {
                setError(res.data.msg);
            }
        } else {
            // Create mode sends FormData with images
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

            const res = await api.post('/ads/create/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setSuccess('Your ad has been posted successfully!');
                window.scrollTo(0, 0);
                setTimeout(() => navigate('/my-ads'), 1500);
            } else {
                setError(res.data.msg);
            }
        }
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred while saving your ad.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
      return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            {isEditMode ? 'Edit Ad' : 'Post a Free Ad'}
        </h1>
        <p className="text-gray-500">
            {isEditMode ? 'Update your listing details below.' : 'Fill in the details below to publish your listing.'}
        </p>
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
              <label className="label">Description <span className="text-red-500">*</span></label>
              <textarea required rows={4} className="input-field resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what you are selling. Include details like age, warranty, features..." />
            </div>
          </div>
        </div>

        {/* Dynamic Attributes */}
        {!isEditMode && categoryAttributes.length > 0 && (
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
              <label className="label">Price (₹) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">₹</span>
                <input required type="number" min="1" step="0.01" className="input-field pl-8 font-bold text-gray-900" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
              </div>
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

          {/* Existing Images (edit mode) */}
          {isEditMode && existingImages.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-600 mb-3">Current Photos</p>
              <div className="flex flex-wrap gap-4">
                {existingImages.map((img, i) => (
                  <div key={img.id || i} className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm group">
                    {/* Fall back to a relative URL so previews work without VITE_API_URL
                        (the Vite dev server proxies /uploads to the API). */}
                    <img src={img.url.startsWith('http') ? img.url : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? ''}${img.url}`} alt="existing" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(img.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {img.is_primary && (
                      <div className="absolute bottom-0 inset-x-0 bg-indigo-600/90 text-white text-[10px] font-bold text-center py-0.5">COVER</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
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

          {/* New Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-600 mb-3">{isEditMode ? 'New Photos to Add' : 'Selected Photos'}</p>
              <div className="flex flex-wrap gap-4">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm group">
                    <img src={src} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(i)}
                      className="absolute top-1 right-1 p-1 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {!isEditMode && i === 0 && existingImages.length === 0 && (
                      <div className="absolute bottom-0 inset-x-0 bg-indigo-600/90 text-white text-[10px] font-bold text-center py-0.5">COVER</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto md:px-12 py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mx-auto">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {loading ? (isEditMode ? 'Updating Ad...' : 'Publishing Ad...') : (isEditMode ? 'Update Ad' : 'Publish Your Ad Now')}
          </button>
        </div>

      </form>
    </div>
  );
}
