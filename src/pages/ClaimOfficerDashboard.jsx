import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import MainLayout from '../layouts/MainLayout';

function ClaimOfficerDashboard() {
  const [claims, setClaims] = useState([]);
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
  const [loading, setLoading] = useState(true);
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

        const decoded = jwtDecode(token);
        if (decoded.role !== 'claims_officer') {
          setError('Only claim officers can access this dashboard');
          navigate('/');
          return;
        }
        setUser({ user_id: decoded.user_id, role: decoded.role });

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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleExportCSV = () => {
    const headers = ['Claim ID', 'Customer', 'Policy', 'Status', 'Approved Amount', 'Comments', 'Created At', 'Updated At'];
    const rows = claims.map(c => [
      c.claim_id,
      c.customer_name || c.customer_id,
      c.policy_name || c.policy_id,
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

  const filteredClaims = claims.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = c.claim_id.toLowerCase().includes(term) ||
      (c.customer_name || '').toLowerCase().includes(term) ||
      (c.policy_name || '').toLowerCase().includes(term);
    return matchesSearch && (!filterStatus || c.status === filterStatus);
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'bg-[#d9e7cd] text-[#131e0e]';
      case 'rejected': case 'declined': return 'bg-[#fed7d2] text-[#755754]';
      case 'inspected': return 'bg-[#dce5f3] text-[#3a4a6b]';
      case 'inspection_scheduled': return 'bg-[#fff3cd] text-[#856404]';
      default: return 'bg-[#f2f4ed] text-[#55624d]';
    }
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
                placeholder="Search by name or ID..."
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 tracking-wider">Policy</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 tracking-wider">Inspection</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-500">No claims found.</td>
                  </tr>
                ) : (
                  filteredClaims.map(c => (
                    <tr
                      key={c.claim_id}
                      className="hover:bg-slate-50 transition cursor-pointer"
                      onClick={() => navigate(`/review/${c.claim_id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{c.claim_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{c.customer_name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{c.policy_name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusStyle(c.status)}`}>
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{c.appointment_status || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/review/${c.claim_id}`);
                          }}
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
      </div>
    </MainLayout>
  );
}

export default ClaimOfficerDashboard;