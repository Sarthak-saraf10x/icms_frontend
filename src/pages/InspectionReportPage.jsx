import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import MainLayout from '../layouts/MainLayout';
import InspectionReport from '../components/claim/InspectionReport';

function InspectionReportPage() {
  const { claimId } = useParams();
  const [claimData, setClaimData] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [checklistResponses, setChecklistResponses] = useState({});
  const [comments, setComments] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClaimData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const decoded = jwtDecode(token);
        if (decoded.role !== 'inspection_guide') {
          navigate('/');
          return;
        }

        // Fetch this claim's details directly
        const response = await axios.get(`http://localhost:5000/api/claims/${claimId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const found = response.data;
        if (!found || !found.claim) {
          setError('Claim not found or not assigned to you');
          setLoading(false);
          return;
        }
        setClaimData(found);

        // Fetch checklist for this policy
        const checklistResponse = await axios.get(`http://localhost:5000/api/policies/${found.claim.policy_id}/checklist`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const formattedChecklist = (checklistResponse.data || []).map((item, index) =>
          typeof item === 'string'
            ? { id: item, question: item, type: 'text' }
            : { id: item.question || `generated-${index + 1}`, question: item.question || '', type: item.type || 'text' }
        );
        setChecklist(formattedChecklist);
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setError(err.response?.data?.error || 'Failed to load claim data');
      } finally {
        setLoading(false);
      }
    };
    fetchClaimData();
  }, [claimId, navigate]);

  const handleChecklistResponse = (itemId, value) => {
    setChecklistResponses((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmitReport = async () => {
    try {
      const appointmentId = claimData?.appointments?.find(a => a.status === 'scheduled')?.appointment_id;
      if (!appointmentId) {
        setError('No scheduled appointment found for this claim');
        return;
      }

      setSubmitting(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('checklist_responses', JSON.stringify(checklistResponses));
      formData.append('comments', comments);
      if (image) {
        formData.append('file', image);
      }

      await axios.post(`http://localhost:5000/api/claims/${appointmentId}/inspection/report`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Inspection report submitted successfully');
      navigate('/inspectionGuideDashboard');
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Inspection Report" role="inspection_guide">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-slate-500 font-medium">Loading claim data...</span>
        </div>
      </MainLayout>
    );
  }

  if (!claimData) {
    return (
      <MainLayout title="Inspection Report" role="inspection_guide">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-md">
          <p className="text-red-700 font-medium">{error || 'Claim not found'}</p>
          <button
            onClick={() => navigate('/inspectionGuideDashboard')}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </MainLayout>
    );
  }

  const scheduledAppointment = claimData.appointments?.find(a => a.status === 'scheduled');
  const completedAppointment = claimData.appointments?.find(a => a.status === 'completed' || a.inspection_report);
  const showReport = ['inspected', 'approved', 'declined', 'rejected'].includes(claimData.claim.status) || !!completedAppointment;

  return (
    <MainLayout title={showReport ? "Inspection Report Details" : "Inspection Report"} role="inspection_guide">
      <div className="space-y-8 pb-12 max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/inspectionGuideDashboard')}
          className="inline-flex items-center text-sm text-[#55624d] hover:text-[#191c18] font-semibold transition-colors"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Claim Summary Card */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] overflow-hidden">
          <div className="px-8 py-6 bg-[#f2f4ed] border-b border-[#ecefe8]">
            <h2 className="text-xl font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Inspection Details — Claim #{claimData.claim.claim_id}
            </h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#f8faf3] rounded-xl p-4 border border-[#ecefe8]">
                <p className="text-xs font-semibold text-[#757870] uppercase tracking-wider mb-1">Customer</p>
                <p className="text-base font-bold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {claimData.claim.customer_name || 'N/A'}
                </p>
              </div>
              <div className="bg-[#f8faf3] rounded-xl p-4 border border-[#ecefe8]">
                <p className="text-xs font-semibold text-[#757870] uppercase tracking-wider mb-1">Policy</p>
                <p className="text-base font-bold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {claimData.claim.policy_name || 'N/A'}
                </p>
              </div>
              <div className="bg-[#f8faf3] rounded-xl p-4 border border-[#ecefe8]">
                <p className="text-xs font-semibold text-[#757870] uppercase tracking-wider mb-1">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${claimData.claim.status === 'approved' ? 'bg-[#d9e7cd] text-[#131e0e]' :
                  claimData.claim.status === 'declined' || claimData.claim.status === 'rejected' ? 'bg-[#fed7d2] text-[#755754]' :
                    'bg-[#f2f4ed] text-[#55624d]'
                  }`}>
                  {claimData.claim.status.replace('_', ' ')}
                </span>
              </div>
              <div className="bg-[#f8faf3] rounded-xl p-4 border border-[#ecefe8]">
                <p className="text-xs font-semibold text-[#757870] uppercase tracking-wider mb-1">Claim Date</p>
                <p className="text-base font-bold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {claimData.claim.claim_date ? new Date(claimData.claim.claim_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              {(scheduledAppointment || completedAppointment) && (
                <div className="bg-[#f8faf3] rounded-xl p-4 border border-[#ecefe8]">
                  <p className="text-xs font-semibold text-[#757870] uppercase tracking-wider mb-1">Appointment Date</p>
                  <p className="text-base font-bold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {new Date(scheduledAppointment?.appointment_date || completedAppointment?.appointment_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {showReport ? (
          /* Render submitted report details */
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] overflow-hidden p-8">
            <h3 className="text-lg font-bold text-[#191c18] border-b border-[#ecefe8] pb-4 mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Submitted Inspection Report Details
            </h3>
            <InspectionReport
              report={completedAppointment?.inspection_report || claimData.claim.inspection_report}
              appointmentDate={completedAppointment?.appointment_date}
            />
          </div>
        ) : (
          /* Render checklist input form */
          <>
            {/* Checklist Section */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] overflow-hidden">
              <div className="px-8 py-6 border-b border-[#ecefe8]">
                <h3 className="text-lg font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Inspection Checklist
                </h3>
              </div>
              <div className="p-8">
                {checklist.length === 0 ? (
                  <p className="text-sm text-[#757870] italic" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    No checklist available for this policy.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {checklist.map((item) => (
                      <div key={item.id} className="bg-[#f8faf3] rounded-xl p-5 border border-[#ecefe8]">
                        <label className="block text-sm font-semibold text-[#191c18] mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          {item.question}
                        </label>
                        {item.type === 'boolean' ? (
                          <div className="flex items-center space-x-6">
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name={`checklist-${item.id}`}
                                value="pass"
                                checked={checklistResponses[item.id] === 'pass'}
                                onChange={() => handleChecklistResponse(item.id, 'pass')}
                                className="h-4 w-4 text-[#55624d] focus:ring-[#55624d] border-[#c5c8be]"
                              />
                              <span className="ml-2 text-sm text-[#444841]">Pass</span>
                            </label>
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name={`checklist-${item.id}`}
                                value="fail"
                                checked={checklistResponses[item.id] === 'fail'}
                                onChange={() => handleChecklistResponse(item.id, 'fail')}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-[#c5c8be]"
                              />
                              <span className="ml-2 text-sm text-[#444841]">Fail</span>
                            </label>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={checklistResponses[item.id] || ''}
                            onChange={(e) => handleChecklistResponse(item.id, e.target.value)}
                            placeholder="Enter response"
                            className="block w-full rounded-xl bg-white border border-[#c5c8be] py-3 px-4 text-[#191c18] placeholder:text-[#c5c8be] focus:ring-2 focus:ring-[#55624d] focus:border-transparent sm:text-sm transition-shadow"
                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] overflow-hidden">
              <div className="px-8 py-6 border-b border-[#ecefe8]">
                <h3 className="text-lg font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Overall Comments
                </h3>
              </div>
              <div className="p-8">
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter detailed inspection findings..."
                  rows="5"
                  className="block w-full rounded-xl bg-[#f8faf3] border border-[#c5c8be] py-3 px-4 text-[#191c18] placeholder:text-[#c5c8be] focus:ring-2 focus:ring-[#55624d] focus:border-transparent sm:text-sm transition-shadow"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] overflow-hidden">
              <div className="px-8 py-6 border-b border-[#ecefe8]">
                <h3 className="text-lg font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Photographic Evidence
                </h3>
              </div>
              <div className="p-8">
                <div className="flex flex-col items-start gap-4">
                  {image && (
                    <div className="relative rounded-xl overflow-hidden border border-[#ecefe8] shadow-sm">
                      <img src={URL.createObjectURL(image)} alt="Preview" className="h-48 w-48 object-cover" />
                      <button
                        onClick={() => setImage(null)}
                        className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1 text-[#755754] hover:bg-[#fed7d2] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div className="flex justify-center rounded-2xl border-2 border-dashed border-[#c5c8be] px-8 py-8 w-full sm:w-1/2 hover:border-[#55624d] transition-colors cursor-pointer">
                    <div className="space-y-2 text-center">
                      <svg className="mx-auto h-12 w-12 text-[#c5c8be]" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-[#757870] justify-center">
                        <label className="relative cursor-pointer rounded-md font-semibold text-[#55624d] hover:text-[#191c18] transition-colors">
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                        </label>
                      </div>
                      <p className="text-xs text-[#c5c8be]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={handleSubmitReport}
                disabled={submitting || (checklist.length > 0 && Object.keys(checklistResponses).length < checklist.length)}
                className="inline-flex justify-center items-center rounded-full bg-gradient-to-br from-[#55624d] to-[#98a68e] py-3 px-8 text-sm font-bold text-white shadow-[0_10px_20px_-10px_rgba(85,98,77,0.4)] hover:shadow-[0_15px_25px_-10px_rgba(85,98,77,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Final Report'
                )}
              </button>
              <button
                onClick={() => navigate('/inspectionGuideDashboard')}
                className="inline-flex justify-center rounded-full border border-[#c5c8be] bg-white py-3 px-8 text-sm font-bold text-[#444841] hover:bg-[#f2f4ed] transition-all"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default InspectionReportPage;
