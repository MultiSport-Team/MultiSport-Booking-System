import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const ManageCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await adminService.getSportsCategories();
      if (result.success) {
        setCategories(result.data || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to load categories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.trim()) {
      toast.warning('Please enter a category name');
      return;
    }

    setSubmitting(true);
    try {
      const result = await adminService.addSportsCategory(newCategory);
      if (result.success) {
        setCategories([...categories, result.data]);
        setNewCategory('');
        toast.success('Category added successfully');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to add category');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="container py-5">
      <h2>Manage Sport Categories</h2>

      <div className="card mt-4">
        <div className="card-header">
          <h5>Add New Category</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleAddCategory}>
            <div className="row">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter category name (e.g., Cricket, Badminton)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <h5 className="mt-5 mb-3">All Categories ({categories.length})</h5>
      {categories.length === 0 ? (
        <div className="alert alert-info">No categories found</div>
      ) : (
        <div className="row">
          {categories.map(category => (
            <div key={category.id} className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{category.name}</h5>
                  <p className="card-text text-muted">ID: {category.id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCategoriesPage;
