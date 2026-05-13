import React, { useState } from 'react';
import axios from 'axios';

function PolicyTypeForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/policies/types', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus({ type: 'success', message: 'Policy Category created successfully!' });
      setFormData({ name: '', description: '', image: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to create policy category' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-gutter rounded-xl border border-outline-variant/30 flex flex-col gap-stack-md hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-unit">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Create Policy Category</h3>
        <p className="text-body-sm text-on-surface-variant max-w-[400px]">
          Add a new classification for policies (e.g. Health, Vehicle, Real Estate).
        </p>
      </div>

      {status.message && (
        <div className={`p-4 rounded-lg text-body-sm ${status.type === 'success' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-error-container text-on-error-container'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md mt-4">
        <div className="flex flex-col gap-unit">
          <label htmlFor="name" className="text-label-md text-on-surface font-semibold">Category Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            placeholder="e.g. Health Insurance"
          />
        </div>

        <div className="flex flex-col gap-unit">
          <label htmlFor="description" className="text-label-md text-on-surface font-semibold">Description</label>
          <textarea
            id="description"
            name="description"
            required
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
            placeholder="Detailed explanation of what this category covers..."
          ></textarea>
        </div>

        <div className="flex flex-col gap-unit">
          <label htmlFor="image" className="text-label-md text-on-surface font-semibold">Image URL</label>
          <input
            id="image"
            name="image"
            type="url"
            value={formData.image}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex justify-end pt-unit">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Creating...' : 'Create Category'}
            {!loading && <span className="material-symbols-outlined text-[18px]">add_circle</span>}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PolicyTypeForm;
