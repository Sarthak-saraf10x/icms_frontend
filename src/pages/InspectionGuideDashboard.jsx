import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import MainLayout from '../layouts/MainLayout';

function InspectionGuideDashboard() {
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState('');
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

        // Verify role from token (no API call needed)
        const decoded = jwtDecode(token);
        if (decoded.role !== 'inspection_guide') {
          setError('Only inspection guides can access this dashboard');
          navigate('/');
          return;
        }

        // Single API call to get claims with appointments
        const response = await axios.get(`http://localhost:5000/api/claims/get_assigned_claims/${decoded.user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setClaims(response.data);
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setError(err.response?.data?.error || 'Failed to fetch claims');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-[#d9e7cd] text-[#131e0e]';
      case 'declined':
      case 'rejected':
        return 'bg-[#fed7d2] text-[#755754]';
      case 'inspected':
        return 'bg-[#dce5f3] text-[#3a4a6b]';
      case 'inspection_scheduled':
        return 'bg-[#fff3cd] text-[#856404]';
      default:
        return 'bg-[#f2f4ed] text-[#55624d]';
    }
  };

  const hasScheduledAppointment = (claim) => {
    return claim.appointments?.some(a => a.status === 'scheduled');
  };

  // Stats
  const totalClaims = claims.length;
  const pendingInspections = claims.filter(c => hasScheduledAppointment(c)).length;
  const completedInspections = claims.filter(c => c.claim.status === 'inspected' || c.claim.status === 'approved').length;

  return (
    <MainLayout title="Inspection Guide Dashboard" role="inspection_guide">
      <div className="space-y-8 pb-12">
        {error && (
          <div className="bg-[#fed7d2] border-l-4 border-[#ba1a1a] p-4 rounded-xl shadow-sm">
            <p className="text-sm text-[#755754] font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] p-6">
            <p className="text-xs font-semibold text-[#757870] uppercase tracking-wider mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Total Assigned</p>
            <p className="text-3xl font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>{totalClaims}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] p-6">
            <p className="text-xs font-semibold text-[#757870] uppercase tracking-wider mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Pending Inspection</p>
            <p className="text-3xl font-bold text-[#856404]" style={{ fontFamily: 'Manrope, sans-serif' }}>{pendingInspections}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] p-6">
            <p className="text-xs font-semibold text-[#757870] uppercase tracking-wider mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Completed</p>
            <p className="text-3xl font-bold text-[#55624d]" style={{ fontFamily: 'Manrope, sans-serif' }}>{completedInspections}</p>
          </div>
        </div>

        {/* Claims Table */}
        <section>
          <div className="border-b border-[#ecefe8] pb-4 mb-6">
            <h2 className="text-xl font-bold text-[#191c18] tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Assigned Claims
            </h2>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#55624d] mx-auto"></div>
              <p className="text-[#757870] font-medium mt-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Loading claims...</p>
            </div>
          ) : claims.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-[#c5c8be] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-[#757870] font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No claims assigned.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(85,98,77,0.06)] border border-[#ecefe8] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  <thead>
                    <tr className="bg-[#f2f4ed] border-b border-[#ecefe8]">
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#757870] uppercase tracking-wider">Claim ID</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#757870] uppercase tracking-wider">Customer</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#757870] uppercase tracking-wider">Policy</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#757870] uppercase tracking-wider">Claim Date</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#757870] uppercase tracking-wider">Appointment</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#757870] uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#757870] uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ecefe8]">
                    {claims.map((item) => {
                      const scheduledAppt = item.appointments?.find(a => a.status === 'scheduled');
                      const latestAppt = item.appointments?.[item.appointments.length - 1];
                      const displayAppt = scheduledAppt || latestAppt;

                      return (
                        <tr
                          key={item.claim.claim_id}
                          className="hover:bg-[#f8faf3] transition-colors cursor-pointer group"
                          onClick={() => navigate(`/inspection/${item.claim.claim_id}`)}
                        >
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-[#191c18]">#{item.claim.claim_id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-[#191c18]">{item.claim.customer_name || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-[#444841]">{item.claim.policy_name || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#757870]">
                              {item.claim.claim_date ? new Date(item.claim.claim_date).toLocaleDateString() : '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#757870]">
                              {displayAppt?.appointment_date
                                ? new Date(displayAppt.appointment_date).toLocaleDateString()
                                : '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(item.claim.status)}`}>
                              {item.claim.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {scheduledAppt ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/inspection/${item.claim.claim_id}`);
                                }}
                                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-br from-[#55624d] to-[#98a68e] text-white text-xs font-bold shadow-[0_4px_12px_rgba(85,98,77,0.3)] hover:shadow-[0_6px_16px_rgba(85,98,77,0.4)] transition-all"
                              >
                                Start Inspection
                              </button>
                            ) : (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/inspection/${item.claim.claim_id}`);
                                }}
                                className="inline-flex items-center text-xs font-semibold text-[#55624d] hover:text-[#191c18] transition-colors"
                              >
                                View Details →
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

export default InspectionGuideDashboard;