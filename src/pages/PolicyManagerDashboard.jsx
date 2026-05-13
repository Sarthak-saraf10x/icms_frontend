import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import PolicyTypeForm from './PolicyTypeForm';
import PolicyForm from './PolicyForm';
import MainLayout from './MainLayout';function PolicyManagerDashboard() {
  const [activeTab, setActiveTab] = useState('policies'); // Default to policy list
  const [policies, setPolicies] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch policies on component mount
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const decoded = jwtDecode(token);
        const response = await axios.get(
          `http://localhost:5000/api/policies/created_by/${decoded.user_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPolicies(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load policies');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchPolicies();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <MainLayout title="Policy Manager Dashboard" role="policy_manager">
      <div className="space-y-6 pb-12">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Custom Tabs */}
        <div className="bg-white border-b border-slate-200 shadow-sm rounded-t-xl overflow-hidden">
          <nav className="flex -mb-px px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('policies')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'policies'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              View Policies
            </button>
            <button
              onClick={() => setActiveTab('category')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'category'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Create Category
            </button>
            <button
              onClick={() => setActiveTab('policy')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'policy'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Add Policy
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-slate-200 p-6 sm:p-8">
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">Policies Created by You</h2>
              {policies.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-500 font-medium">No policies found. Try adding a new policy.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {policies.map((policy) => {
                    const isExpired = new Date() > new Date(policy.end_date);
                    return (
                      <div key={policy.policy_id} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition bg-white flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-slate-900 line-clamp-1 flex-1 pr-4">{policy.policy_type_name}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {isExpired ? 'Expired' : 'Active'}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 space-y-1 mb-4 flex-1">
                          <p><span className="font-medium text-slate-900">Name:</span> {policy.policy_name}</p>
                          <p><span className="font-medium text-slate-900">Ends:</span> {new Date(policy.end_date).toLocaleDateString()}</p>
                        </div>
                        <button 
                          onClick={() => alert(`Coverage Details:\n\n${JSON.stringify(policy.coverage_details, null, 2)}`)}
                          className="w-full mt-auto py-2 px-4 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded text-sm font-medium transition"
                        >
                          Show Coverage Details
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {activeTab === 'category' && <PolicyTypeForm />}
          {activeTab === 'policy' && <PolicyForm />}
        </div>
      </div>
    </MainLayout>
  );
}

export default PolicyManagerDashboard;