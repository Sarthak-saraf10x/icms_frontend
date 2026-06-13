import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import MainLayout from '../layouts/MainLayout';
import InspectionReport from '../components/claim/InspectionReport';

function ClaimReviewPage() {
  const { claimId } = useParams();
  const [claimDetails, setClaimDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    status: 'approved',
    approved_amount: '',
    comments: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClaimDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const decoded = jwtDecode(token);
        if (decoded.role !== 'claims_officer') {
          navigate('/');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/claims/officer/${claimId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClaimDetails(response.data);
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setError(err.response?.data?.error || 'Failed to load claim details');
      } finally {
        setLoading(false);
      }
    };
    fetchClaimDetails();
  }, [claimId, navigate]);

  const handleApprovalChange = (e) => {
    const { name, value } = e.target;
    setApprovalForm(prev => ({ ...prev, [name]: value }));
  };

  const handleApproveClaim = async () => {
    try {
      if (approvalForm.status === 'approved' && !approvalForm.approved_amount) {
        setError('Approved amount is required');
        return;
      }
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/claims/${claimId}/approve`,
        approvalForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Claim ${approvalForm.status} successfully`);
      navigate('/claimOfficerDashboard');
    } catch (err) {
      console.error('Approve error:', err);
      setError(err.response?.data?.error || 'Failed to process claim');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'bg-[#d9e7cd] text-[#131e0e]';
      case 'rejected': case 'declined': return 'bg-[#fed7d2] text-[#755754]';
      case 'inspected': return 'bg-[#dce5f3] text-[#3a4a6b]';
      default: return 'bg-[#f2f4ed] text-[#55624d]';
    }
  };

  if (loading) {
    return (
      <MainLayout title="Claim Review" role="claims_officer">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#55624d]"></div>
          <span className="ml-3 text-[#757870] font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Loading claim details...</span>
        </div>
      </MainLayout>
    );
  }

  if (!claimDetails) {
    return (
      <MainLayout title="Claim Review" role="claims_officer">
        <div className="bg-[#fed7d2] border-l-4 border-[#ba1a1a] p-6 rounded-xl">
          <p className="text-[#755754] font-medium">{error || 'Claim not found'}</p>
          <button
            onClick={() => navigate('/claimOfficerDashboard')}
            className="mt-4 text-sm text-[#55624d] hover:text-[#191c18] font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </MainLayout>
    );
  }

  const { claim, policy, inspection_appointment, documents } = claimDetails;

  return (
    <MainLayout title="Claim Review" role="claims_officer">
      <div className="space-y-8 pb-12 max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/claimOfficerDashboard')}
          className="inline-flex items-center text-sm text-[#55624d] hover:text-[#191c18] font-semibold transition-colors"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {error && (
          <div className="bg-[#fed7d2] border-l-4 border-[#ba1a1a] p-4 rounded-xl shadow-sm">
            <p className="text-sm text-[#755754] font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{error}</p>
          </div>
        )}

        {/* Claim Header */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] overflow-hidden">
          <div className="px-8 py-6 bg-[#f2f4ed] border-b border-[#ecefe8] flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Claim Review — #{claim.claim_id}
            </h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(claim.status)}`}>
              {claim.status.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#f8faf3] rounded-xl p-4 border border-[#ecefe8]">
                <p className="text-xs font-semibold text-[#757870] uppercase tracking-wider mb-1">Customer</p>
                <p className="text-base font-bold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {claim.customer_name || `ID: ${claim.customer_id}`}
                </p>
              </div>
              <div className="bg-[#f8faf3] rounded-xl p-4 border border-[#ecefe8]">
                <p className="text-xs font-semibold text-[#757870] uppercase tracking-wider mb-1">Policy</p>
                <p className="text-base font-bold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {policy?.policy_name || 'N/A'}
                </p>
              </div>
              <div className="bg-[#f8faf3] rounded-xl p-4 border border-[#ecefe8]">
                <p className="text-xs font-semibold text-[#757870] uppercase tracking-wider mb-1">Claim Date</p>
                <p className="text-base font-bold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {claim.claim_date ? new Date(claim.claim_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="bg-[#f8faf3] rounded-xl p-4 border border-[#ecefe8]">
                <p className="text-xs font-semibold text-[#757870] uppercase tracking-wider mb-1">Approved Amount</p>
                <p className="text-base font-bold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {claim.approved_amount ? `$${parseFloat(claim.approved_amount).toFixed(2)}` : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Policy Details */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] overflow-hidden">
            <div className="px-8 py-6 border-b border-[#ecefe8]">
              <h3 className="text-lg font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Policy Details</h3>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex justify-between py-2 border-b border-[#ecefe8]">
                <span className="text-sm font-medium text-[#757870]">Policy Name</span>
                <span className="text-sm font-semibold text-[#191c18]">{policy?.policy_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#ecefe8]">
                <span className="text-sm font-medium text-[#757870]">Policy Number</span>
                <span className="text-sm font-semibold text-[#191c18]">{policy?.policy_number || 'N/A'}</span>
              </div>
              {policy?.coverage_details && (
                <>
                  <div className="flex justify-between py-2 border-b border-[#ecefe8]">
                    <span className="text-sm font-medium text-[#757870]">Deductible</span>
                    <span className="text-sm font-semibold text-[#191c18]">${policy.coverage_details.deductible || '0'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#ecefe8]">
                    <span className="text-sm font-medium text-[#757870]">Coverage Limit</span>
                    <span className="text-sm font-semibold text-[#191c18]">${policy.coverage_details.coverage_limit || '0'}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-2">
                <span className="text-sm font-medium text-[#757870]">Price</span>
                <span className="text-sm font-semibold text-[#191c18]">${policy?.price || '0'}</span>
              </div>
            </div>
          </div>

          {/* Customer Documents */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] overflow-hidden">
            <div className="px-8 py-6 border-b border-[#ecefe8]">
              <h3 className="text-lg font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Customer Documents</h3>
            </div>
            <div className="p-8">
              {documents && documents.length > 0 ? (
                <ul className="space-y-3">
                  {documents.map(d => (
                    <li key={d.document_id} className="flex items-center justify-between bg-[#f8faf3] rounded-xl p-4 border border-[#ecefe8]">
                      <a
                        href={d.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-[#55624d] hover:text-[#191c18] truncate flex-1 transition-colors"
                      >
                        📄 {d.document_url.split('/').pop()}
                      </a>
                      <span className="text-xs font-semibold text-[#757870] bg-[#ecefe8] px-3 py-1 rounded-full ml-3 capitalize">
                        {d.document_type}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#757870] italic" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  No documents provided.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Inspection Report */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] overflow-hidden p-8">
          <h3 className="text-lg font-bold text-[#191c18] border-b border-[#ecefe8] pb-4 mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Inspection Report Details
          </h3>
          {inspection_appointment?.inspection_report ? (
            <InspectionReport 
              report={inspection_appointment.inspection_report} 
              appointmentDate={inspection_appointment.appointment_date}
            />
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-[#c5c8be] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-[#757870] italic" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Pending inspection report.
              </p>
            </div>
          )}
        </div>

        {/* Decision Form — only show if inspected or inspection not required */}
        {((policy?.requires_inspection && claim.status === 'inspected') || (!policy?.requires_inspection && claim.status !== 'approved' && claim.status !== 'rejected' && claim.status !== 'declined')) && claim.status !== 'approved' && claim.status !== 'rejected' && claim.status !== 'declined' && (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] overflow-hidden">
            <div className="px-8 py-6 border-b border-[#ecefe8] bg-[#f2f4ed]">
              <h3 className="text-lg font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Official Decision</h3>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#191c18] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Decision</label>
                <select
                  name="status"
                  value={approvalForm.status}
                  onChange={handleApprovalChange}
                  className="w-full sm:w-64 rounded-xl bg-[#f8faf3] border border-[#c5c8be] py-3 px-4 text-[#191c18] focus:ring-2 focus:ring-[#55624d] focus:border-transparent sm:text-sm transition-shadow"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  <option value="approved">✓ Approve Claim</option>
                  <option value="rejected">✗ Reject Claim</option>
                </select>
              </div>

              {approvalForm.status === 'approved' && (
                <div>
                  <label className="block text-sm font-semibold text-[#191c18] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Approved Amount ($)</label>
                  <input
                    type="number"
                    name="approved_amount"
                    value={approvalForm.approved_amount}
                    onChange={handleApprovalChange}
                    placeholder="0.00"
                    className="w-full sm:w-64 rounded-xl bg-[#f8faf3] border border-[#c5c8be] py-3 px-4 text-[#191c18] placeholder:text-[#c5c8be] focus:ring-2 focus:ring-[#55624d] focus:border-transparent sm:text-sm transition-shadow"
                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#191c18] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Final Comments</label>
                <textarea
                  name="comments"
                  value={approvalForm.comments}
                  onChange={handleApprovalChange}
                  rows={4}
                  placeholder="Enter your reasoning for this decision..."
                  className="block w-full rounded-xl bg-[#f8faf3] border border-[#c5c8be] py-3 px-4 text-[#191c18] placeholder:text-[#c5c8be] focus:ring-2 focus:ring-[#55624d] focus:border-transparent sm:text-sm transition-shadow"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                />
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-[#ecefe8]">
                <button
                  onClick={handleApproveClaim}
                  disabled={submitting}
                  className="inline-flex justify-center items-center rounded-full bg-gradient-to-br from-[#55624d] to-[#98a68e] py-3 px-8 text-sm font-bold text-white shadow-[0_10px_20px_-10px_rgba(85,98,77,0.4)] hover:shadow-[0_15px_25px_-10px_rgba(85,98,77,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Submit Decision'
                  )}
                </button>
                <button
                  onClick={() => navigate('/claimOfficerDashboard')}
                  className="inline-flex justify-center rounded-full border border-[#c5c8be] bg-white py-3 px-8 text-sm font-bold text-[#444841] hover:bg-[#f2f4ed] transition-all"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Already decided notice */}
        {(claim.status === 'approved' || claim.status === 'rejected' || claim.status === 'declined') && (
          <div className={`rounded-2xl p-6 border ${claim.status === 'approved' ? 'bg-[#d9e7cd]/30 border-[#d9e7cd]' : 'bg-[#fed7d2]/30 border-[#fed7d2]'}`}>
            <p className="text-sm font-semibold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              This claim has been <span className="capitalize font-bold">{claim.status}</span>
              {claim.approved_amount ? ` with an amount of $${parseFloat(claim.approved_amount).toFixed(2)}` : ''}.
            </p>
            {claim.comments && (
              <p className="text-sm mt-2 text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <span className="font-semibold">Comments:</span> {claim.comments}
              </p>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default ClaimReviewPage;
