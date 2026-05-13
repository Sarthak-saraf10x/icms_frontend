import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';

function ClaimOfficerDashboard() {
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimDetails, setClaimDetails] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    avgClaimAmount: 0,
    avgProcessingTime: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [approvalForm, setApprovalForm] = useState({
    status: 'approved',
    approved_amount: '',
    comments: ''
  });
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

        const userResponse = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userResponse.data.role !== 'claims_officer') {
          setError('Only claim officers can access this dashboard');
          navigate('/');
          return;
        }
        setUser(userResponse.data);

        // const policiesResponse = await axios.get(
        //   `http://localhost:5000/api/claims/${userResponse.data.user_id}/claims`,
        //   { headers: { Authorization: `Bearer ${token}` } }
        // );
        // setPolicies(policiesResponse.data);

        const claimsResponse = await axios.get('http://localhost:5000/api/claims/officer', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClaims(claimsResponse.data);

        const totalClaims = claimsResponse.data.length;
        const approvedClaims = claimsResponse.data.filter(c => c.status === 'approved').length;
        const rejectedClaims = claimsResponse.data.filter(c => c.status === 'rejected').length;
        const approvedAmounts = claimsResponse.data
          .filter(c => c.status === 'approved' && c.approved_amount)
          .map(c => parseFloat(c.approved_amount));
        const avgClaimAmount = approvedAmounts.length
          ? (approvedAmounts.reduce((a, b) => a + b, 0) / approvedAmounts.length).toFixed(2)
          : 0;
        const processingTimes = claimsResponse.data
          .filter(c => c.status === 'approved' || c.status === 'rejected')
          .map(c => (new Date(c.updated_at) - new Date(c.created_at)) / (1000 * 60 * 60 * 24));
        const avgProcessingTime = processingTimes.length
          ? (processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length).toFixed(2)
          : 0;
        setAnalytics({
          totalClaims,
          approvedClaims,
          rejectedClaims,
          avgClaimAmount,
          avgProcessingTime
        });

        const newInspections = claimsResponse.data.filter(c => c.appointment_status === 'completed' && !c.viewed);
        setNotifications(newInspections.map(c => ({
          id: c.claim_id,
          message: `New inspection report for Claim ${c.claim_id}`
        })));
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setError(err.response?.data?.error || 'Failed to fetch data');
      }
    };
    fetchData();
  }, [navigate]);

  const handleSelectClaim = async (claim) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/claims/officer/${claim.claim_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedClaim(claim);
      setClaimDetails(response.data);
      setNotifications(notifications.filter(n => n.id !== claim.claim_id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch claim details');
    }
  };

  const handleApprovalChange = (e) => {
    const { name, value } = e.target;
    setApprovalForm(prev => ({ ...prev, [name]: value }));
  };

  const handleApproveClaim = async () => {
    try {
      const token = localStorage.getItem('token');
      if (approvalForm.status === 'approved' && !approvalForm.approved_amount) {
        setError('Approved amount is required');
        return;
      }
      await axios.post(
        `http://localhost:5000/api/claims/${selectedClaim.claim_id}/approve`,
        approvalForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Claim ${approvalForm.status} successfully`);
      setSelectedClaim(null);
      setClaimDetails(null);
      setApprovalForm({ status: 'approved', approved_amount: '', comments: '' });
      const claimsResponse = await axios.get('http://localhost:5000/api/claims/officer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClaims(claimsResponse.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process claim');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Claim ID', 'Policy ID', 'Customer ID', 'Status', 'Approved Amount', 'Comments', 'Created At', 'Updated At'];
    const rows = claims.map(c => [
      c.claim_id,
      c.policy_id,
      c.customer_id,
      c.status,
      c.approved_amount || '',
      c.comments || '',
      c.created_at,
      c.updated_at
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'claims_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredClaims = claims.filter(c =>
    (c.claim_id.includes(searchTerm) || c.customer_id.includes(searchTerm)) &&
    (!filterStatus || c.status === filterStatus)
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <MainLayout title="Claim Officer Dashboard" role="claims_officer" user={user} notifications={notifications}>
      <div className="space-y-6">

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Analytics Section */}
        <section>
          <h2 className="text-lg font-medium text-slate-900 mb-4">Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
              <h3 className="text-sm font-medium text-slate-500">Total Claims</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.totalClaims}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
              <h3 className="text-sm font-medium text-slate-500">Approved</h3>
              <p className="mt-2 text-3xl font-bold text-green-600">{analytics.approvedClaims}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
              <h3 className="text-sm font-medium text-slate-500">Rejected</h3>
              <p className="mt-2 text-3xl font-bold text-red-600">{analytics.rejectedClaims}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
              <h3 className="text-sm font-medium text-slate-500">Avg Claim Amt</h3>
              <p className="mt-2 text-3xl font-bold text-indigo-600">${analytics.avgClaimAmount}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
              <h3 className="text-sm font-medium text-slate-500">Avg Processing</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.avgProcessingTime} <span className="text-sm font-normal text-slate-500">days</span></p>
            </div>
          </div>
        </section>


        {/* Claims Table Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-medium text-slate-900">Manage Claims</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search by ID..."
                className="block w-full sm:w-64 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="block w-full sm:w-48 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="inspection_scheduled">Inspection Scheduled</option>
                <option value="inspected">Inspected</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={handleExportCSV}
                className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 tracking-wider">Claim ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 tracking-wider">Customer ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 tracking-wider">Inspection</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500">No claims found.</td>
                  </tr>
                ) : (
                  filteredClaims.map(c => (
                    <tr key={c.claim_id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{c.claim_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{c.customer_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${c.status === 'approved' ? 'bg-green-100 text-green-800' :
                            c.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{c.appointment_status || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleSelectClaim(c)}
                          className="text-indigo-600 hover:text-indigo-900 font-semibold"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Selected Claim Modals / Details */}
        {selectedClaim && claimDetails && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-12">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-semibold text-slate-900">Claim Review: {selectedClaim.claim_id}</h2>
              <button onClick={() => { setSelectedClaim(null); setClaimDetails(null); }} className="text-slate-400 hover:text-slate-600">Close</button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b pb-2 mb-3">Policy Info</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-slate-700 w-32 inline-block">Policy Name:</span> <span className="text-slate-600">{claimDetails.policy.policy_name}</span></p>
                    <p><span className="font-medium text-slate-700 w-32 inline-block">Deductible:</span> <span className="text-slate-600">${claimDetails.policy.coverage_details.deductible}</span></p>
                    <p><span className="font-medium text-slate-700 w-32 inline-block">Limit:</span> <span className="text-slate-600">${claimDetails.policy.coverage_details.coverage_limit}</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b pb-2 mb-3">Customer Docs</h3>
                  {claimDetails.documents.length > 0 ? (
                    <ul className="space-y-2 text-sm text-slate-600">
                      {claimDetails.documents.map(d => (
                        <li key={d.document_id} className="flex items-center gap-2">
                          <a href={d.document_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex-1 truncate">
                            {d.document_url.split('/').pop()}
                          </a>
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{d.document_type}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-slate-500 italic">No documents provided.</p>}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b pb-2 mb-3">Inspection Report</h3>
                  {claimDetails.inspection_appointment?.inspection_report ? (
                    <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <ul className="mb-3 space-y-1">
                        {Object.entries(claimDetails.inspection_appointment.inspection_report.checklist_responses || {}).map(([id, response]) => (
                          <li key={id} className="flex justify-between border-b border-slate-100 py-1">
                            <span className="font-medium">{id}:</span> <span>{response}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3"><span className="font-semibold text-slate-700">Remarks:</span> {claimDetails.inspection_appointment.inspection_report.comments}</p>
                      {claimDetails.inspection_appointment.inspection_report.image_url && (
                        <a href={claimDetails.inspection_appointment.inspection_report.image_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-indigo-600 hover:underline">
                          View Damage Photo →
                        </a>
                      )}
                    </div>
                  ) : <p className="text-sm text-slate-500 italic">Pending inspection report.</p>}
                </div>

                {/* Decision Form */}
                {claimDetails.inspection_appointment?.status === 'inspected' && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-4">Official Decision</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                          name="status"
                          value={approvalForm.status}
                          onChange={handleApprovalChange}
                          className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border bg-white"
                        >
                          <option value="approved">Approve Claim</option>
                          <option value="rejected">Reject Claim</option>
                        </select>
                      </div>

                      {approvalForm.status === 'approved' && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Approved Amount ($)</label>
                          <input
                            type="number"
                            name="approved_amount"
                            value={approvalForm.approved_amount}
                            onChange={handleApprovalChange}
                            placeholder="0.00"
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border bg-white"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Final Comments</label>
                        <textarea
                          name="comments"
                          value={approvalForm.comments}
                          onChange={handleApprovalChange}
                          rows={3}
                          className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border bg-white"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleApproveClaim}
                          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-sm"
                        >
                          Submit Decision
                        </button>
                        <button
                          onClick={() => setSelectedClaim(null)}
                          className="flex-1 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-md font-medium text-sm hover:bg-slate-50 transition shadow-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}

export default ClaimOfficerDashboard;