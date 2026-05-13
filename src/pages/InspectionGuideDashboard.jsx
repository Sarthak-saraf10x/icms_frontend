import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

function InspectionGuideDashboard() {
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [checklistResponses, setChecklistResponses] = useState({});
  const [comments, setComments] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view dashboard');
          navigate('/login');
          return;
        }

        // Verify user role
        const userResponse = await axios.get('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (userResponse.data.role !== 'inspection_guide') {
          setError('Only inspection guides can access this dashboard');
          navigate('/');
          return;
        }

        // Fetch claims assigned to inspection guide
        const claimsResponse = await axios.get('http://localhost:5000/api/claims/inspection_guide', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Fetch claim details
        const claimDetailsPromises = claimsResponse.data.map((claim) =>
          axios.get(`http://localhost:5000/api/claims/${claim.claim_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
        );
        const claimDetailsResponses = await Promise.all(claimDetailsPromises);
        const uniqueClaims = claimDetailsResponses
          .map((res) => res.data)
          .filter((claim, index, self) =>
            index === self.findIndex((c) => c.claim.claim_id === claim.claim.claim_id)
          );
        setClaims(uniqueClaims);
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setError(err.response?.data?.error || 'Failed to fetch claims');
      }
    };
    fetchData();
  }, [navigate]);

  const handleSelectClaim = async (claim) => {
    try {
      const token = localStorage.getItem('token');
      const checklistResponse = await axios.get(`http://localhost:5000/api/policies/${claim.claim.policy_id}/checklist`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // Transform checklist data to ensure id, question, and type
      const formattedChecklist = (checklistResponse.data || []).map((item, index) =>
        typeof item === 'string'
          ? { id: item, question: item, type: 'text' }
          : { id: item.question || `generated-${index + 1}`, question: item.question || '', type: item.type || 'text' }
      );
      setChecklist(formattedChecklist);
      setChecklistResponses({});
      setComments('');
      setImage(null);
      setSelectedClaim(claim);
      console.log('Formatted Checklist:', formattedChecklist);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch checklist');
    }
  };

  const handleChecklistResponse = (itemId, value) => {
    setChecklistResponses((prev) => {
      const newResponses = { ...prev, [itemId]: value };
      console.log('Checklist Responses:', newResponses);
      return newResponses;
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmitReport = async (appointmentId) => {
    try {
      if (!appointmentId) {
        throw new Error('No appointment selected');
      }
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
      setSelectedClaim(null);
      setChecklist([]);
      setChecklistResponses({});
      setComments('');
      setImage(null);

      // Refresh claims
      const claimsResponse = await axios.get('http://localhost:5000/api/claims/inspection_guide', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const claimDetailsPromises = claimsResponse.data.map((claim) =>
        axios.get(`http://localhost:5000/api/claims/${claim.claim_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      );
      const claimDetailsResponses = await Promise.all(claimDetailsPromises);
      const uniqueClaims = claimDetailsResponses
        .map((res) => res.data)
        .filter((claim, index, self) =>
          index === self.findIndex((c) => c.claim.claim_id === claim.claim.claim_id)
        );
      setClaims(uniqueClaims);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.error || 'Failed to submit report');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <MainLayout title="Inspection Guide Dashboard" role="inspection_guide">
      <div className="space-y-8 pb-12">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <section>
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Assigned Claims</h2>
          </div>

          {claims.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <p className="text-slate-500 font-medium">No claims assigned.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {claims.map((claim) => (
                <div key={claim.claim.claim_id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-slate-900">Claim #{claim.claim.claim_id}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${claim.claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                          claim.claim.status === 'declined' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                        {claim.claim.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mb-4">
                      <span className="font-medium text-slate-900">Policy ID:</span> {claim.claim.policy_id}
                    </p>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointments</h4>
                      {claim.appointments && claim.appointments.length > 0 ? (
                        claim.appointments.map((appointment) => (
                          <div key={appointment.appointment_id} className="text-sm">
                            <p className="text-slate-700"><strong>Date:</strong> {appointment.appointment_date}</p>
                            <p className="text-slate-700 capitalize"><strong>Status:</strong> {appointment.status}</p>
                            {appointment.status === 'scheduled' && (
                              <button
                                onClick={() => handleSelectClaim(claim)}
                                className="mt-3 w-full inline-flex justify-center items-center rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition"
                              >
                                Start Inspection
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No appointments scheduled.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {selectedClaim && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Inspection Report: Claim #{selectedClaim.claim.claim_id}</h2>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              {/* Checklist */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-4">Inspection Checklist</h3>
                {checklist.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No checklist available for this policy.</p>
                ) : (
                  <div className="space-y-5">
                    {checklist.map((item) => (
                      <div key={item.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <label className="block text-sm font-medium text-slate-900 mb-3">{item.question}</label>
                        {item.type === 'boolean' ? (
                          <div className="flex items-center space-x-6">
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name={`checklist-${item.id}`}
                                value="pass"
                                checked={checklistResponses[item.id] === 'pass'}
                                onChange={() => handleChecklistResponse(item.id, 'pass')}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                              />
                              <span className="ml-2 text-sm text-slate-700">Pass</span>
                            </label>
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name={`checklist-${item.id}`}
                                value="fail"
                                checked={checklistResponses[item.id] === 'fail'}
                                onChange={() => handleChecklistResponse(item.id, 'fail')}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300"
                              />
                              <span className="ml-2 text-sm text-slate-700">Fail</span>
                            </label>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={checklistResponses[item.id] || ''}
                            onChange={(e) => handleChecklistResponse(item.id, e.target.value)}
                            placeholder={`Enter response`}
                            className="block w-full rounded-md border-slate-300 py-2 pl-3 px-3 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm border"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments form */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-3">Overall Comments</h3>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter detailed inspection findings..."
                  rows="4"
                  className="block w-full rounded-md border-slate-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm border"
                />
              </div>

              {/* Image Upload */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-3">Photographic Evidence</h3>
                <div className="flex flex-col items-start gap-4">
                  {image && (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200">
                      <img src={URL.createObjectURL(image)} alt="Preview" className="h-48 w-48 object-cover" />
                    </div>
                  )}
                  <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-slate-300 px-6 pt-5 pb-6 w-full sm:w-1/2 hover:border-indigo-400 transition">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-slate-600 justify-center">
                        <label className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
                <button
                  onClick={() => handleSubmitReport(selectedClaim.appointments[0]?.appointment_id)}
                  disabled={checklist.length > 0 && Object.keys(checklistResponses).length < checklist.length}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Final Report
                </button>
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="inline-flex justify-center rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}

export default InspectionGuideDashboard;