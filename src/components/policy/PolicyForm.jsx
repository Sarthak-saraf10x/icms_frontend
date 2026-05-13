import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PolicyForm({ initialData, onSaved }) {
  const [policyTypes, setPolicyTypes] = useState([]);
  const [formData, setFormData] = useState({
    policy_name: '',
    policy_number: '',
    policy_type_id: '',
    price: '',
    time_period: '',
    start_date: '',
    end_date: '',
    coverage_details: '',
    is_claimable: false,
    required_documents_count: 0,
    documents_list: '',
    requires_inspection: false,
    inspection_checklist: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPolicyTypes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/policies/types', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPolicyTypes(res.data);
        if (res.data.length > 0 && !initialData) {
          setFormData(prev => ({ ...prev, policy_type_id: res.data[0].id || res.data[0]._id || res.data[0].policy_type_id }));
        }
      } catch (err) {
        console.error("Failed to load policy types", err);
      }
    };
    fetchPolicyTypes();
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        policy_name: initialData.policy_name || '',
        policy_number: initialData.policy_number || '',
        policy_type_id: initialData.policy_type_id || '',
        price: initialData.price || '',
        time_period: initialData.time_period || '',
        start_date: initialData.start_date ? initialData.start_date.split('T')[0] : '',
        end_date: initialData.end_date ? initialData.end_date.split('T')[0] : '',
        coverage_details: initialData.coverage_details || '',
        is_claimable: !!initialData.is_claimable,
        required_documents_count: initialData.required_documents_count || 0,
        documents_list: Array.isArray(initialData.documents_list) ? initialData.documents_list.join('\n') : (initialData.documents_list || ''),
        requires_inspection: !!initialData.requires_inspection,
        inspection_checklist: Array.isArray(initialData.inspection_checklist) ? initialData.inspection_checklist.join('\n') : (initialData.inspection_checklist || '')
      });
    } else {
      // Reset logic handles default form
      setFormData(prev => ({
        ...prev,
        policy_name: '',
        policy_number: '',
        price: '',
        time_period: '',
        start_date: '',
        end_date: '',
        coverage_details: '',
        is_claimable: false,
        required_documents_count: 0,
        documents_list: '',
        requires_inspection: false,
        inspection_checklist: ''
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        required_documents_count: parseInt(formData.required_documents_count),
        documents_list: formData.documents_list ? formData.documents_list.split('\n').filter(d => d.trim() !== '') : [],
        inspection_checklist: formData.inspection_checklist ? formData.inspection_checklist.split('\n').filter(d => d.trim() !== '') : []
      };

      if (initialData) {
        await axios.put(`http://localhost:5000/api/policies/${initialData.policy_id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatus({ type: 'success', message: 'Policy updated successfully!' });
      } else {
        await axios.post('http://localhost:5000/api/policies/', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatus({ type: 'success', message: 'Policy created successfully!' });
      }

      if (onSaved) {
        setTimeout(onSaved, 1500);
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to process policy' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all";
  const labelClass = "text-label-md text-on-surface font-semibold";

  return (
    <div className="bg-white p-gutter rounded-xl border border-outline-variant/30 flex flex-col gap-stack-md hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-unit">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
          {initialData ? 'Edit Policy' : 'Add New Policy'}
        </h3>
        <p className="text-body-sm text-on-surface-variant max-w-[500px]">
          {initialData ? 'Update the details and requirements of this policy offering.' : 'Create a new policy offering. Fill in the coverage details and requirements.'}
        </p>
      </div>

      {status.message && (
        <div className={`p-4 rounded-lg text-body-sm ${status.type === 'success' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-error-container text-on-error-container'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          {/* Policy Name */}
          <div className="flex flex-col gap-unit">
            <label htmlFor="policy_name" className={labelClass}>Policy Name</label>
            <input id="policy_name" name="policy_name" type="text" required value={formData.policy_name} onChange={handleChange} className={inputClass} placeholder="e.g. Comprehensive Auto Insurance" />
          </div>

          {/* Policy Number */}
          <div className="flex flex-col gap-unit">
            <label htmlFor="policy_number" className={labelClass}>Policy Reference Number</label>
            <input id="policy_number" name="policy_number" type="text" required value={formData.policy_number} onChange={handleChange} className={inputClass} placeholder="e.g. POL-12345" />
          </div>

          {/* Policy Type ID */}
          <div className="flex flex-col gap-unit">
            <label htmlFor="policy_type_id" className={labelClass}>Policy Category</label>
            <select id="policy_type_id" name="policy_type_id" required value={formData.policy_type_id} onChange={handleChange} className={inputClass}>
              <option value="" disabled>Select a Category</option>
              {policyTypes.map(pt => (
                <option key={pt.policy_type_id} value={pt.policy_type_id}>{pt.name}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-unit">
            <label htmlFor="price" className={labelClass}>Premium Amount ($)</label>
            <input id="price" name="price" type="number" step="0.01" required value={formData.price} onChange={handleChange} className={inputClass} placeholder="e.g. 500.00" />
          </div>

          {/* Time Period */}
          <div className="flex flex-col gap-unit">
            <label htmlFor="time_period" className={labelClass}>Time Period</label>
            <select
              id="time_period"
              name="time_period"
              required
              value={formData.time_period}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="" disabled>Select Time Period</option>
              <option value="one_year">1 Year</option>
              <option value="two_years">2 Years</option>
            </select>
          </div>

          {/* Required Documents Count */}
          <div className="flex flex-col gap-unit">
            <label htmlFor="required_documents_count" className={labelClass}>Required Documents Count</label>
            <input id="required_documents_count" name="required_documents_count" type="number" min="0" required value={formData.required_documents_count} onChange={handleChange} className={inputClass} />
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-unit">
            <label htmlFor="start_date" className={labelClass}>Start Date</label>
            <input id="start_date" name="start_date" type="date" required value={formData.start_date} onChange={handleChange} className={inputClass} />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-unit">
            <label htmlFor="end_date" className={labelClass}>End Date</label>
            <input id="end_date" name="end_date" type="date" required value={formData.end_date} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        {/* Coverage Details */}
        <div className="flex flex-col gap-unit">
          <label htmlFor="coverage_details" className={labelClass}>Coverage Details</label>
          <textarea id="coverage_details" name="coverage_details" required rows="3" value={formData.coverage_details} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="Describe what this policy covers..."></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          {/* Documents List */}
          <div className="flex flex-col gap-unit">
            <label htmlFor="documents_list" className={labelClass}>Documents Required (One per line)</label>
            <textarea id="documents_list" name="documents_list" rows="3" value={formData.documents_list} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="ID Proof&#10;Vehicle Registration&#10;Photos"></textarea>
          </div>

          {/* Inspection Checklist */}
          <div className="flex flex-col gap-unit">
            <label htmlFor="inspection_checklist" className={labelClass}>Inspection Checklist (One per line)</label>
            <textarea id="inspection_checklist" name="inspection_checklist" rows="3" value={formData.inspection_checklist} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="Check engine&#10;Check tires&#10;Check interior"></textarea>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-gutter mt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" name="is_claimable" checked={formData.is_claimable} onChange={handleChange} className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded bg-surface-container-low checked:bg-primary checked:border-primary transition-all cursor-pointer" />
              <span className="material-symbols-outlined absolute text-on-primary text-[16px] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
            </div>
            <span className="text-body-sm text-on-surface select-none group-hover:text-primary transition-colors">Is Claimable</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" name="requires_inspection" checked={formData.requires_inspection} onChange={handleChange} className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded bg-surface-container-low checked:bg-primary checked:border-primary transition-all cursor-pointer" />
              <span className="material-symbols-outlined absolute text-on-primary text-[16px] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
            </div>
            <span className="text-body-sm text-on-surface select-none group-hover:text-primary transition-colors">Requires Inspection</span>
          </label>
        </div>

        <div className="flex justify-end pt-stack-sm border-t border-outline-variant/30 mt-4">
          <button type="submit" disabled={loading} className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2">
            {loading ? 'Processing...' : (initialData ? 'Update Policy' : 'Create Policy')}
            {!loading && <span className="material-symbols-outlined text-[18px]">add_task</span>}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PolicyForm;
