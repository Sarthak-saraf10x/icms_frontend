import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

function ClaimForm() {
  const { policyId } = useParams();
  const [policy, setPolicy] = useState(null);
  const [claim, setClaim] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionGuideId, setInspectionGuideId] = useState('');
  const [inspectionGuides, setInspectionGuides] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolicyAndClaim = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch policy
        const policyResponse = await axios.get(`http://localhost:5000/api/policies/${policyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPolicy(policyResponse.data);
        // Fetch claims for customer
        const claimsResponse = await axios.get('http://localhost:5000/api/claims/customer', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const existingClaim = claimsResponse.data.find((c) => c.policy_id === policyId && c.status !== 'approved' && c.status !== 'declined');
        if (existingClaim) {
          const claimDetails = await axios.get(`http://localhost:5000/api/claims/${existingClaim.claim_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setClaim(claimDetails.data);
        }
        // Fetch inspection guides
        const guidesResponse = await axios.get('http://localhost:5000/api/users/inspection_guides', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInspectionGuides(guidesResponse.data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch data');
      }
    };
    fetchPolicyAndClaim();
  }, [policyId]);

  const handleCreateClaim = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/claims/', {
        policy_id: policyId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const claimDetails = await axios.get(`http://localhost:5000/api/claims/${response.data.claim_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaim(claimDetails.data);
      setError('');
    } catch (err) {
      console.error('Create claim error:', err);
      setError(err.response?.data?.error || 'Failed to create claim');
    }
  };

  const handleUploadDocument = async () => {
    if (!documentFile || !documentType) {
      setError('Document file and type are required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', documentFile);
      formData.append('document_type', documentType);
      await axios.post(`http://localhost:5000/api/claims/${claim.claim.claim_id}/documents`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const claimDetails = await axios.get(`http://localhost:5000/api/claims/${claim.claim.claim_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaim(claimDetails.data);
      setDocumentFile(null);
      setDocumentType('');
      setError('');
    } catch (err) {
      console.error('Upload document error:', err);
      setError(err.response?.data?.error || 'Failed to upload document');
    }
  };

  const handleScheduleInspection = async () => {
    if (!inspectionDate) {
      setError('Inspection date is required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/claims/${claim.claim.claim_id}/inspection`, {
        inspection_date: inspectionDate,
        inspection_guide_id: inspectionGuideId || null,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const claimDetails = await axios.get(`http://localhost:5000/api/claims/${claim.claim.claim_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaim(claimDetails.data);
      setInspectionDate('');
      setInspectionGuideId('');
      alert('Inspection scheduled successfully');
      navigate('/customerdashboard');
      setError('');
    } catch (err) {
      console.error('Schedule inspection error:', err);
      setError(err.response?.data?.error || 'Failed to schedule inspection');
    }
  };

  if (!policy) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout title={`Claim for: ${policy.policy_name}`} role="customer">
      <div className="max-w-3xl mx-auto space-y-8 pb-12">

        {/* Back navigation */}
        <button
          onClick={() => navigate('/')}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">Claim Application</h2>
            {claim && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                ${claim.claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                  claim.claim.status === 'declined' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'}`}>
                {claim.claim.status.replace('_', ' ')}
              </span>
            )}
          </div>

          <div className="p-6">
            {!claim ? (
              <div className="text-center py-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 mb-4">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-slate-900">No Active Claim Found</h3>
                <p className="mt-1 text-sm text-slate-500">You haven't filed a claim for this policy yet.</p>
                <div className="mt-6">
                  <button
                    onClick={handleCreateClaim}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition"
                  >
                    Initiate Claim Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">

                {/* Documents Section */}
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2 flex-1">
                      Required Documents
                    </h3>
                    <span className="text-sm font-medium text-slate-500 ml-4 pb-2 border-b border-slate-200">
                      {(claim.documents || []).length} / {policy.required_documents_count} Uploaded
                    </span>
                  </div>

                  {/* Upload Form */}
                  {(claim.claim.status === 'pending' || claim.claim.status === 'documents_submitted') && (
                    <div className="mb-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
                      <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="w-full">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                          <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            disabled={(claim.documents || []).length >= policy.required_documents_count}
                            className="block w-full rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm shadow-sm"
                          >
                            <option value="">Select Type</option>
                            {(policy.documents_list || []).map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-full">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Upload File</label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setDocumentFile(e.target.files[0])}
                            disabled={(claim.documents || []).length >= policy.required_documents_count}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition shadow-sm"
                          />
                        </div>
                        <button
                          onClick={handleUploadDocument}
                          disabled={(claim.documents || []).length >= policy.required_documents_count || !documentFile}
                          className="w-full sm:w-auto inline-flex justify-center items-center rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Upload
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Uploaded List */}
                  {(claim.documents || []).length > 0 ? (
                    <ul className="divide-y divide-slate-100 border border-slate-200 rounded-md">
                      {(claim.documents || []).map((doc) => (
                        <li key={doc.document_id} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                          <div className="flex w-0 flex-1 items-center">
                            <span className="truncate font-medium text-slate-700">{doc.document_type}</span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
                              View file
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No documents uploaded yet.</p>
                  )}
                </div>

                {/* Inspection Section */}
                {policy.requires_inspection && claim.claim.status !== 'approved' && claim.claim.status !== 'declined' && (claim.documents || []).length >= policy.required_documents_count && (
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                      Schedule Inspection
                    </h3>
                    {inspectionGuides.length === 0 && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <p className="text-sm text-yellow-700">No inspection guides available. Please select a date, and an admin will assign a guide.</p>
                      </div>
                    )}
                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                      <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="w-full">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Requested Date</label>
                          <input
                            type="date"
                            value={inspectionDate}
                            onChange={(e) => setInspectionDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="block w-full rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm shadow-sm bg-white"
                          />
                        </div>
                        <div className="w-full">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Guide (Optional)</label>
                          <select
                            value={inspectionGuideId}
                            onChange={(e) => setInspectionGuideId(e.target.value)}
                            disabled={inspectionGuides.length === 0}
                            className="block w-full rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm shadow-sm bg-white"
                          >
                            <option value="">Any Available Guide</option>
                            {inspectionGuides.map((guide) => (
                              <option key={guide.user_id} value={guide.user_id}>{guide.name}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={handleScheduleInspection}
                          className="w-full sm:w-auto inline-flex justify-center items-center rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition"
                        >
                          Schedule
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scheduled Appointments Preview */}
                {(claim.appointments || []).length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                      Inspection Log
                    </h3>
                    <ul className="space-y-3">
                      {(claim.appointments || []).map((appt) => (
                        <li key={appt.appointment_id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-slate-900">Date: {appt.appointment_date}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                              ${appt.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-800'}`}>
                              {appt.status}
                            </span>
                          </div>
                          {appt.inspection_report && (
                            <div className="mt-2 text-sm text-slate-600">
                              Report attached. Official comments: <span className="italic">{appt.inspection_report.comments || 'No remarks.'}</span>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ClaimForm;
