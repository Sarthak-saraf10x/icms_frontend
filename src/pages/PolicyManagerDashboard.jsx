import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import PolicyTypeForm from '../components/policy/PolicyTypeForm';
import PolicyForm from '../components/policy/PolicyForm';
import MainLayout from '../layouts/MainLayout';

function PolicyManagerDashboard() {
  const [activeTab, setActiveTab] = useState('policies'); // policies | category | policy
  const [policies, setPolicies] = useState([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPolicy, setEditingPolicy] = useState(null);
  const navigate = useNavigate();

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
        { headers: { Authorization: `Bearer ${token}` } }
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

  useEffect(() => {
    fetchPolicies();
  }, [navigate]);

  const activePolicies = policies.filter(p => new Date() <= new Date(p.end_date));
  const expiredPolicies = policies.filter(p => new Date() > new Date(p.end_date));

  const filteredPolicies = policies.filter(p => 
    (p.policy_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.policy_number || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditPolicy = (policy) => {
    setEditingPolicy(policy);
    setActiveTab('policy');
  };

  const handleAddPolicyClick = () => {
    setEditingPolicy(null);
    setActiveTab('policy');
  };

  const onPolicySaved = () => {
    fetchPolicies();
    setActiveTab('policies');
  };

  return (
    <MainLayout title="Policy Manager Dashboard" role="policy_manager">
      <div className="bg-background text-on-background min-h-screen pb-20">
        {/* Header / Tabs */}
        <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/30">
          <div className="flex justify-between items-center px-gutter py-unit w-full max-w-container-max mx-auto">
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Policy Management</h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleAddPolicyClick}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Create Policy
              </button>
            </div>
          </div>
          
          {/* Custom Tabs */}
          <nav className="flex px-gutter gap-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('policies')}
              className={`py-3 text-label-md font-semibold transition-colors duration-200 relative ${
                activeTab === 'policies' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Directory
              {activeTab === 'policies' && <div className="absolute bottom-0 left-0 right-0 height-[2px] border-b-2 border-primary rounded-t-sm" />}
            </button>
            <button
              onClick={() => setActiveTab('category')}
              className={`py-3 text-label-md font-semibold transition-colors duration-200 relative ${
                activeTab === 'category' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Create Category
              {activeTab === 'category' && <div className="absolute bottom-0 left-0 right-0 height-[2px] border-b-2 border-primary rounded-t-sm" />}
            </button>
            <button
              onClick={handleAddPolicyClick}
              className={`py-3 text-label-md font-semibold transition-colors duration-200 relative ${
                activeTab === 'policy' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {editingPolicy ? 'Edit Policy' : 'Create Policy'}
              {activeTab === 'policy' && <div className="absolute bottom-0 left-0 right-0 height-[2px] border-b-2 border-primary rounded-t-sm" />}
            </button>
          </nav>
        </header>

        <main className="max-w-container-max mx-auto px-gutter py-stack-lg">
          {error && (
            <div className="bg-error-container text-on-error-container p-4 rounded-xl mb-6 shadow-sm border border-error/20 flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <p className="text-body-sm">{error}</p>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="flex flex-col gap-stack-lg animate-fade-in">
              {/* Dashboard Stats Bento Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-md">
                <div className="bg-white p-stack-md rounded-xl border border-outline-variant/30 flex flex-col gap-unit hover:shadow-sm transition-shadow">
                  <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Total Active</span>
                  <span className="text-headline-md font-bold text-primary">{activePolicies.length}</span>
                </div>
                <div className="bg-white p-stack-md rounded-xl border border-outline-variant/30 flex flex-col gap-unit hover:shadow-sm transition-shadow">
                  <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Expired</span>
                  <span className="text-headline-md font-bold text-secondary">{expiredPolicies.length}</span>
                </div>
                <div className="bg-white p-stack-md rounded-xl border border-outline-variant/30 flex flex-col gap-unit hover:shadow-sm transition-shadow">
                  <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Total Policies</span>
                  <span className="text-headline-md font-bold text-on-surface">{policies.length}</span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative flex flex-1 w-full md:w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  placeholder="Search policies..." 
                />
              </div>

              {/* Policy List */}
              <section className="flex flex-col gap-stack-md">
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-unit">Central Directory</h2>
                
                {filteredPolicies.length === 0 ? (
                  <div className="text-center py-16 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-[48px] text-outline-variant">assignment_add</span>
                    <p className="text-on-surface-variant font-medium text-body-lg">No policies found.</p>
                    <button 
                      onClick={handleAddPolicyClick} 
                      className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-2 mt-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Create Policy
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md">
                    {filteredPolicies.map((policy) => {
                      const isExpired = new Date() > new Date(policy.end_date);
                      return (
                        <div key={policy.policy_id} className="bg-white p-gutter rounded-xl border border-outline-variant/30 flex flex-col justify-between items-start hover:shadow-md transition-shadow group h-full gap-4">
                          <div className="flex flex-col gap-unit w-full">
                            <div className="flex items-center justify-between gap-stack-sm w-full">
                              <span className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] uppercase ${isExpired ? 'bg-error-container text-on-error-container' : 'bg-primary/10 text-primary'}`}>
                                {isExpired ? 'Expired' : 'Active'}
                              </span>
                              <span className="text-label-sm text-on-surface-variant">${policy.price}</span>
                            </div>
                            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-2 w-full break-words" title={policy.policy_name}>
                              {policy.policy_name || 'Unnamed Policy'}
                            </h3>
                            <p className="text-body-sm text-on-surface-variant line-clamp-2">
                              {policy.policy_number} • {policy.time_period}
                            </p>
                          </div>
                          
                          <div className="flex w-full justify-between items-center border-t border-outline-variant/20 pt-4 mt-auto">
                            <button 
                              onClick={() => alert(`Coverage Details:\n\n${policy.coverage_details}`)}
                              className="text-label-md font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-1"
                            >
                              View Details
                              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditPolicy(policy)} 
                                className="bg-surface-variant text-on-surface px-3 py-1.5 rounded-lg hover:bg-outline-variant/30 transition-all active:scale-95 flex items-center gap-1.5 font-label-sm font-semibold"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Ethereal Decorative Card */}
              {policies.length > 0 && (
                <div className="mt-section-gap relative overflow-hidden rounded-2xl bg-primary/5 p-gutter border border-primary/10">
                  <div className="relative z-10 flex flex-col gap-unit">
                    <h4 className="font-headline-sm text-headline-sm text-primary font-bold">Policy Governance Tip</h4>
                    <p className="text-body-sm text-on-surface-variant max-w-2xl">
                      Scheduled audits reduce compliance risks by 40%. Ensure your active policies are reviewed periodically to stay aligned with evolving guidelines.
                    </p>
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'category' && (
            <div className="max-w-3xl mx-auto animate-fade-in">
              <PolicyTypeForm />
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <PolicyForm initialData={editingPolicy} onSaved={onPolicySaved} />
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  );
}

export default PolicyManagerDashboard;