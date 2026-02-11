import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import venueService from '../../services/venueService';
import './VendorPages.css';

const AddVenuePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    sport_category_id: '',
    name: '',
    city: '',
    state: '',
    address: '',
    description: '',
    price_per_hour: '',
  });

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const result = await venueService.getSportsCategories();
      if (result.success) {
        setCategories(result.data || []);
      } else {
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load sport categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sport_category_id.trim()) {
      newErrors.sport_category_id = 'Sport category is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Venue name is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.price_per_hour.trim()) {
      newErrors.price_per_hour = 'Price per hour is required';
    } else if (isNaN(parseFloat(formData.price_per_hour)) || parseFloat(formData.price_per_hour) <= 0) {
      newErrors.price_per_hour = 'Price must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count (max 5 images)
    if (selectedImages.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }

    // Validate file types and size
    const validFiles = files.filter((file) => {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only JPG, PNG, and WebP allowed.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`File too large: ${file.name}. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs
    const newPreviews = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setSelectedImages((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index].preview);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Prepare data with proper types
      const venueData = {
        sport_category_id: parseInt(formData.sport_category_id),
        name: formData.name.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        address: formData.address.trim(),
        description: formData.description.trim(),
        price_per_hour: parseFloat(formData.price_per_hour),
      };

      const result = await venueService.createVenue(venueData);
      if (result.success) {
        const venueId = result.data.id;
        toast.success('Venue created successfully!');

        // Upload images if selected
        if (selectedImages.length > 0) {
          toast.info('Uploading images...');
          let uploadedCount = 0;
          
          for (const file of selectedImages) {
            const formDataImage = new FormData();
            formDataImage.append('image', file);

            try {
              const uploadResult = await venueService.addVenueImage(venueId, formDataImage);
              console.log('Image upload result:', uploadResult);
              if (uploadResult.success) {
                uploadedCount++;
                console.log(`Image uploaded successfully: ${file.name}`);
              } else {
                console.error(`Failed to upload ${file.name}:`, uploadResult);
              }
            } catch (error) {
              console.error('Error uploading image:', error);
            }
          }

          toast.success(`${uploadedCount} image(s) uploaded successfully!`);
        }

        navigate('/vendor/venues');
      } else {
        toast.error(result.message || 'Failed to create venue');
      }
    } catch (error) {
      console.error('Error creating venue:', error);
      toast.error(error.message || 'Failed to create venue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">Add New Venue</h2>
              <small>Fill in all details to create your venue</small>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Sport Category - First Field */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <span className="text-danger">*</span> Sport Category
                  </label>
                  {categoriesLoading ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <select
                      className={`form-select form-select-lg ${errors.sport_category_id ? 'is-invalid' : ''}`}
                      name="sport_category_id"
                      value={formData.sport_category_id}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Sport Category --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.sport_category_id && (
                    <div className="invalid-feedback d-block">{errors.sport_category_id}</div>
                  )}
                </div>

                {/* Venue Name */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <span className="text-danger">*</span> Venue Name
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    name="name"
                    placeholder="Enter venue name (e.g., City Sports Complex)"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                </div>

                {/* City and State Row */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      <span className="text-danger">*</span> City
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                      name="city"
                      placeholder="Enter city name"
                      value={formData.city}
                      onChange={handleChange}
                    />
                    {errors.city && <div className="invalid-feedback d-block">{errors.city}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      <span className="text-danger">*</span> State
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                      name="state"
                      placeholder="Enter state name"
                      value={formData.state}
                      onChange={handleChange}
                    />
                    {errors.state && <div className="invalid-feedback d-block">{errors.state}</div>}
                  </div>
                </div>

                {/* Address */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <span className="text-danger">*</span> Address
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                    name="address"
                    placeholder="Enter complete address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                  {errors.address && <div className="invalid-feedback d-block">{errors.address}</div>}
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <span className="text-danger">*</span> Description
                  </label>
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    name="description"
                    rows="4"
                    placeholder="Describe your venue (facilities, amenities, features, etc.)"
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                  {errors.description && (
                    <div className="invalid-feedback d-block">{errors.description}</div>
                  )}
                </div>

                {/* Venue Images */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    📸 Venue Images (Optional)
                  </label>
                  <small className="d-block text-muted mb-2">
                    You can upload up to 5 images. Supported formats: JPG, PNG, WebP (Max 5MB each)
                  </small>
                  <div className="mb-3">
                    <input
                      type="file"
                      className="form-control"
                      id="venue-images"
                      multiple
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleImageSelect}
                      disabled={loading || selectedImages.length >= 5}
                    />
                  </div>

                  {/* Image Preview Grid */}
                  {imagePreviews.length > 0 && (
                    <div className="row mb-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="col-md-4 col-sm-6 mb-3">
                          <div className="position-relative" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <img
                              src={preview.preview}
                              alt={`Preview ${index + 1}`}
                              className="img-fluid"
                              style={{ height: '150px', width: '100%', objectFit: 'cover' }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute"
                              style={{ top: '5px', right: '5px' }}
                              onClick={() => removeImage(index)}
                              title="Remove image"
                            >
                              ✕
                            </button>
                            <small className="position-absolute bottom-0 start-0 bg-dark bg-opacity-50 text-white p-1 w-100 text-truncate">
                              {preview.name}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedImages.length > 0 && (
                    <div className="alert alert-info mb-3">
                      <strong>{selectedImages.length}</strong> image(s) selected
                      {selectedImages.length < 5 && (
                        <span> - You can add {5 - selectedImages.length} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Per Hour */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <span className="text-danger">*</span> Price Per Hour (₹)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      className={`form-control ${errors.price_per_hour ? 'is-invalid' : ''}`}
                      name="price_per_hour"
                      placeholder="Enter hourly rate"
                      min="0"
                      step="0.01"
                      value={formData.price_per_hour}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.price_per_hour && (
                    <div className="invalid-feedback d-block">{errors.price_per_hour}</div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg"
                    onClick={() => navigate('/vendor/venues')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading || categoriesLoading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Venue'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Help Text */}
          <div className="alert alert-info mt-4">
            <strong>💡 Note:</strong> All fields marked with <span className="text-danger">*</span> are required. Make sure to provide accurate information for better visibility to customers.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVenuePage;