import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldCheck, Zap, LineChart, ChevronRight, LayoutDashboard, LogOut, ArrowRight,
  Wrench, SlidersHorizontal, Headphones, Award, Shield, Car, Heart, FileText, Key,
  Cog, CheckCircle2, XCircle, AlertTriangle, ShieldOff, Flame, FileWarning, Wine, History,
  Phone, Mail, Share2, ThumbsUp
} from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [availablePolicies, setAvailablePolicies] = useState([]);
  const [purchasedPolicies, setPurchasedPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState('');
  const [policyTypes, setPolicyTypes] = useState({});
  const [selectedType, setSelectedType] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');

  const handleVehicleSubmit = (e) => {
    e.preventDefault();
    const checkoutUrl = `/checkout?vehicle=${encodeURIComponent(vehicleNumber)}`;
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(checkoutUrl)}`);
    } else {
      navigate(checkoutUrl);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoggedIn(true);
        const userResponse = await axios.get('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const role = userResponse.data.role;
        setUserRole(role);

        if (role === 'customer') {
          const typesResponse = await axios.get('http://localhost:5000/api/policies/types', {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          const typesMap = typesResponse.data.reduce((map, type) => ({ ...map, [type.policy_type_id]: type.name }), {});
          setPolicyTypes(typesMap);

          const availableResponse = await axios.get('http://localhost:5000/api/policies/', {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          setAvailablePolicies(availableResponse.data);

          const purchasedResponse = await axios.get('http://localhost:5000/api/policies/customer', {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          setPurchasedPolicies(purchasedResponse.data);

          const claimsResponse = await axios.get('http://localhost:5000/api/claims/customer', {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          });

          const claimDetailsPromises = claimsResponse.data.map((claim) =>
            axios.get(`http://localhost:5000/api/claims/${claim.claim_id}`, {
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            })
          );
          const claimDetailsResponses = await Promise.all(claimDetailsPromises);
          setClaims(claimDetailsResponses.map((res) => res.data));
        }
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        }
        setError(err.response?.data?.error || 'Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  const handlePurchase = (policyId) => {
    const checkoutUrl = `/checkout?policy=${policyId}&step=2`;
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(checkoutUrl)}`);
    } else {
      navigate(checkoutUrl);
    }
  };

  const handleTypeClick = (typeId) => setSelectedType(typeId);
  const handleBack = () => setSelectedType(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/');
  };

  const handleClaim = (policyId) => {
    navigate(`/claim/${policyId}`);
  };

  const getProgressPercentage = (status) => {
    const statusMap = {
      pending: 20, documents_submitted: 40, inspection_scheduled: 60,
      inspected: 80, approved: 100, declined: 100,
    };
    return statusMap[status] || 0;
  };

  return (
    <div className="min-h-screen bg-[#f8faf3] text-[#191c18] font-sans selection:bg-[#d9e7cd] selection:text-[#131e0e]">

      {/* 🌿 Header (Glassmorphic Floating Nav) */}
      <header className="absolute inset-x-0 top-6 z-50">
        <nav className="mx-auto flex max-w-5xl items-center justify-between p-4 px-8 rounded-full bg-[#f8faf3]/70 backdrop-blur-[20px] shadow-[0_40px_40px_-20px_rgba(85,98,77,0.06)]" aria-label="Global">
          <div className="flex">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f2f4ed] text-[#55624d]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#55624d]" style={{ fontFamily: 'Manrope, sans-serif' }}>vehico</span>
            </Link>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            <a href="#" className="text-sm font-semibold leading-6 text-[#444841] hover:text-[#55624d] transition" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Product</a>
            <a href="#" className="text-sm font-semibold leading-6 text-[#444841] hover:text-[#55624d] transition" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Solutions</a>
            <a href="#" className="text-sm font-semibold leading-6 text-[#444841] hover:text-[#55624d] transition" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Pricing</a>
          </div>
          <div className="flex items-center justify-end gap-6">
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="hidden sm:block text-sm font-semibold leading-6 text-[#444841] hover:text-[#55624d] transition" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Log in
                </Link>
                <Link to="/register" className="rounded-full bg-gradient-to-br from-[#55624d] to-[#98a68e] px-6 py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_-10px_rgba(85,98,77,0.4)] hover:shadow-[0_15px_25px_-10px_rgba(85,98,77,0.5)] transition-all" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Start Free Trial
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <button onClick={handleLogout} className="rounded-full bg-[#f2f4ed] px-5 py-2 text-sm font-semibold text-[#444841] hover:bg-[#ecefe8] hover:text-[#191c18] transition-all flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* 🌿 Hero Section */}
      <div className="relative isolate pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden flex items-center">
        {/* Ambient Soft Shapes */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#98a68e] opacity-[0.1] blur-[100px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#d9e7cd] opacity-[0.2] blur-[120px] rounded-full pointer-events-none translate-x-1/2 translate-y-1/4"></div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left Column: Text */}
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold tracking-tight text-[#55624d] sm:text-6xl lg:text-[4.5rem] leading-[1.1] mb-8" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Breathe easy. <br /> Your claims, resolved.
              </h1>
              <p className="mt-6 text-xl leading-8 text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Experience the tranquility of modern auto insurance. From instant assessments to effortless payouts, we provide a seamless sanctuary for your journey.
              </p>

              {!isLoggedIn && (
                <div className="mt-12 flex flex-col sm:flex-row items-center gap-6">
                  <Link to="/register" className="w-full sm:w-auto rounded-full bg-gradient-to-br from-[#55624d] to-[#98a68e] px-8 py-4 text-lg font-bold text-white shadow-[0_15px_30px_-15px_rgba(85,98,77,0.5)] hover:shadow-[0_20px_40px_-15px_rgba(85,98,77,0.6)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Discover Protection <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/login" className="text-base font-semibold text-[#55624d] hover:text-[#191c18] transition flex items-center gap-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Access Portal <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Right Column: Vehicle Lookup Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <div className="bg-[#ffffff] p-8 rounded-[2rem] shadow-[0_20px_50px_-20px_rgba(85,98,77,0.12)] border border-[#ecefe8]">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[#191c18] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Quick Protection Check</h3>
                  <p className="text-sm text-[#444841] font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Enter your vehicle number to View Prices</p>
                </div>

                <form onSubmit={handleVehicleSubmit} className="space-y-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  <div>
                    <input
                      type="text"
                      placeholder="e.g. ABC 1234"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      required
                      className="block w-full rounded-xl bg-[#f8faf3] border border-[#ecefe8] py-4 px-5 text-[#191c18] placeholder:text-[#c5c8be] focus:outline-none focus:ring-2 focus:ring-[#55624d] font-bold text-lg uppercase tracking-wider transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#55624d] hover:bg-[#444841] text-white py-4 px-4 font-bold transition-colors"
                  >
                    <ShieldCheck className="w-5 h-5" /> View Prices
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🌿 Dashboard / Value Props Area */}
      <div className="relative z-20 pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          {isLoggedIn && userRole === 'customer' ? (
            // ==========================================
            // CUSTOMER DASHBOARD VIEW (Sanctuary Theme)
            // ==========================================
            <div className="space-y-16">
              {error && (
                <div className="bg-[#fed7d2] p-4 rounded-xl text-[#795b58] text-sm flex items-center gap-3 font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  <div className="w-2 h-2 rounded-full bg-[#ba1a1a]"></div> {error}
                </div>
              )}

              {/* YOUR POLICIES SECTION */}
              <div className="bg-[#f2f4ed] rounded-[2rem] p-8 lg:p-12">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-bold text-[#55624d]" style={{ fontFamily: 'Manrope, sans-serif' }}>Your Protection</h2>
                  <span className="text-[#444841] font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{purchasedPolicies.length} Active</span>
                </div>

                {purchasedPolicies.length === 0 ? (
                  <div className="bg-[#ffffff] rounded-2xl p-16 text-center shadow-[0_10px_40px_-20px_rgba(85,98,77,0.08)]">
                    <div className="w-16 h-16 mx-auto bg-[#f8faf3] rounded-full flex items-center justify-center text-[#98a68e] mb-6">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <p className="text-[#444841] text-lg font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No active protection plans found. Explore our offerings below.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {purchasedPolicies.map((policy) => {
                      const claim = claims.find((c) => c.claim.policy_id === policy.policy_id);
                      return (
                        <div key={policy.policy_id} className="bg-[#ffffff] rounded-2xl overflow-hidden shadow-[0_10px_40px_-20px_rgba(85,98,77,0.08)] flex flex-col hover:shadow-[0_20px_50px_-20px_rgba(85,98,77,0.12)] transition-shadow">
                          <div className="p-8 flex-1">
                            <div className="flex justify-between items-start mb-6">
                              <h3 className="text-2xl font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>{policy.policy_name}</h3>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#d9e7cd] text-[#131e0e]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                Active
                              </span>
                            </div>

                            <div className="space-y-6 text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                              <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-[#55624d]" style={{ fontFamily: 'Manrope, sans-serif' }}>${policy.price.toFixed(2)}</span>
                                <span className="text-sm font-medium">/ {policy.time_period.replace('_', ' ')}</span>
                              </div>

                              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#f2f4ed]">
                                <div>
                                  <p className="text-sm text-[#757870] mb-1">Type</p>
                                  <p className="font-semibold text-[#191c18]">{policyTypes[policy.policy_type_id] || 'Standard'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-[#757870] mb-1">Deductible</p>
                                  <p className="font-semibold text-[#191c18]">${policy.coverage_details.deductible}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-[#757870] mb-1">Coverage Limit</p>
                                  <p className="font-semibold text-[#191c18]">${policy.coverage_details.coverage_limit}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-[#757870] mb-1">Valid Through</p>
                                  <p className="font-semibold text-[#191c18]">{policy.end_date}</p>
                                </div>
                              </div>
                            </div>

                            {/* Claim Status Box */}
                            {claim && (
                              <div className="mt-8 pt-8 border-t border-[#f2f4ed]">
                                <div className="flex justify-between items-end mb-4">
                                  <h4 className="text-sm font-bold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Claim Progress</h4>
                                  <span className={`text-sm font-bold capitalize ${claim.claim.status === 'declined' ? 'text-[#ba1a1a]' : 'text-[#55624d]'}`}>
                                    {claim.claim.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="w-full bg-[#f2f4ed] rounded-full h-2 mb-6 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ${claim.claim.status === 'declined' ? 'bg-[#ba1a1a]' : 'bg-gradient-to-r from-[#55624d] to-[#98a68e]'}`}
                                    style={{ width: `${getProgressPercentage(claim.claim.status)}%` }}
                                  ></div>
                                </div>

                                <div className="bg-[#f8faf3] rounded-xl p-4 text-sm font-medium grid grid-cols-2 gap-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                  <div>
                                    <p className="text-[#757870] mb-1 text-xs">Documents</p>
                                    <p className="text-[#191c18]">{(claim.documents || []).length}/{policy.required_documents_count} submitted</p>
                                  </div>
                                  {(claim.appointments || []).length > 0 && (
                                    <div>
                                      <p className="text-[#757870] mb-1 text-xs">Inspection</p>
                                      <p className="text-[#191c18]">{claim.appointments[0].appointment_date}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="p-6 bg-[#f8faf3]">
                            {((policy.is_claimable && !claim) || (claim && claim.claim.status === 'pending')) ? (
                              <button
                                onClick={() => handleClaim(policy.policy_id)}
                                className="w-full justify-center rounded-full bg-[#ffffff] px-6 py-3.5 text-sm font-bold text-[#55624d] shadow-sm hover:shadow-md transition-shadow border border-[#ecefe8]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                              >
                                {claim ? 'Continue Claim' : 'File a Claim'}
                              </button>
                            ) : (
                              <button disabled className="w-full justify-center rounded-full bg-[#f2f4ed] px-6 py-3.5 text-sm font-bold text-[#c5c8be] cursor-not-allowed" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                {claim ? 'Claim Processing' : 'Not Eligible for Claim'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* AVAILABLE MODULES SECTION */}
              <div className="pt-8">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-bold text-[#55624d]" style={{ fontFamily: 'Manrope, sans-serif' }}>Explore Coverages</h2>
                  {selectedType !== null && (
                    <button
                      className="text-sm font-bold text-[#55624d] hover:text-[#191c18] transition flex items-center gap-2"
                      onClick={handleBack}
                      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    >
                      ← Back to Categories
                    </button>
                  )}
                </div>

                {selectedType === null ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(policyTypes).length === 0 ? (
                      <div className="col-span-full bg-[#ffffff] rounded-2xl p-12 text-center shadow-[0_10px_30px_-15px_rgba(85,98,77,0.05)]">
                        <p className="text-[#444841]">No categories available right now.</p>
                      </div>
                    ) : (
                      Object.entries(policyTypes).map(([typeId, typeName]) => (
                        <div
                          key={typeId}
                          className="bg-[#ffffff] rounded-2xl p-8 cursor-pointer hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(85,98,77,0.15)] transition-all text-center shadow-[0_10px_30px_-15px_rgba(85,98,77,0.05)]"
                          onClick={() => handleTypeClick(typeId)}
                        >
                          <div className="w-16 h-16 mx-auto bg-[#f2f4ed] text-[#55624d] rounded-full flex items-center justify-center mb-6">
                            <ShieldCheck className="w-8 h-8" />
                          </div>
                          <h3 className="text-lg font-bold text-[#191c18] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{typeName}</h3>
                          <p className="text-sm font-medium text-[#757870]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>View Plans</p>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {availablePolicies.filter((policy) => policy.policy_type_id === selectedType).length === 0 ? (
                      <div className="col-span-full bg-[#ffffff] rounded-2xl p-12 text-center shadow-[0_10px_30px_-15px_rgba(85,98,77,0.05)]">
                        <p className="text-[#444841] font-medium">No configurations available for this category.</p>
                      </div>
                    ) : (
                      availablePolicies
                        .filter((policy) => policy.policy_type_id === selectedType)
                        .map((policy) => (
                          <div key={policy.policy_id} className="bg-[#ffffff] rounded-2xl shadow-[0_10px_30px_-15px_rgba(85,98,77,0.05)] flex flex-col overflow-hidden">
                            <div className="p-8 flex-1">
                              <h3 className="text-2xl font-bold text-[#191c18] mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>{policy.policy_name}</h3>

                              <div className="text-4xl font-bold text-[#55624d] mb-8" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                ${policy.price.toFixed(2)}
                                <span className="text-base font-medium text-[#757870] ml-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>/ {policy.time_period.replace('_', ' ')}</span>
                              </div>

                              <div className="space-y-4 text-sm font-medium text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                <div className="flex justify-between items-center pb-4 border-b border-[#f2f4ed]">
                                  <span className="text-[#757870]">Type</span>
                                  <span className="text-[#191c18]">{policyTypes[policy.policy_type_id]}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-[#f2f4ed]">
                                  <span className="text-[#757870]">Deductible</span>
                                  <span className="text-[#191c18]">${policy.coverage_details.deductible}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[#757870]">Limit</span>
                                  <span className="text-[#191c18]">${policy.coverage_details.coverage_limit}</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-6 bg-[#f8faf3]">
                              <button
                                className="w-full justify-center rounded-full bg-gradient-to-br from-[#55624d] to-[#98a68e] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                onClick={() => handlePurchase(policy.policy_id)}
                              >
                                Select Plan
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // ==========================================
            // PUBLIC VALUE PROPS VIEW (Sanctuary Theme)
            // ==========================================
            <div className="max-w-7xl mx-auto pt-16">
              <div className="mx-auto max-w-2xl lg:text-center mb-20">
                <h2 className="text-sm font-bold leading-7 text-[#55624d] tracking-widest uppercase mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>The VEHICO Standard</h2>
                <p className="text-4xl font-bold tracking-tight text-[#191c18] sm:text-5xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Coverage without the friction
                </p>
                <p className="mt-6 text-lg leading-8 text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  We've removed the noise and paperwork from the insurance process, allowing you to focus on the journey ahead with absolute peace of mind.
                </p>
              </div>

              <div className="mx-auto max-w-2xl lg:max-w-none">
                <dl className="grid max-w-xl grid-cols-1 gap-12 lg:max-w-none lg:grid-cols-3">

                  <div className="flex flex-col bg-[#ffffff] p-10 rounded-[2rem] shadow-[0_15px_40px_-20px_rgba(85,98,77,0.08)] hover:-translate-y-2 transition-transform duration-500">
                    <dt className="flex flex-col gap-y-6 text-2xl font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-[#f2f4ed] text-[#55624d]">
                        <Zap className="h-8 w-8" aria-hidden="true" />
                      </div>
                      Instant Resolution
                    </dt>
                    <dd className="mt-6 flex flex-auto flex-col text-base leading-relaxed text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      <p className="flex-auto">Experience rapid incident logging and assessment. Our interconnected network ensures your claim reaches an officer immediately, minimizing wait times.</p>
                    </dd>
                  </div>

                  <div className="flex flex-col bg-[#ffffff] p-10 rounded-[2rem] shadow-[0_15px_40px_-20px_rgba(85,98,77,0.08)] hover:-translate-y-2 transition-transform duration-500">
                    <dt className="flex flex-col gap-y-6 text-2xl font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-[#f2f4ed] text-[#55624d]">
                        <LineChart className="h-8 w-8" aria-hidden="true" />
                      </div>
                      Smart Estimations
                    </dt>
                    <dd className="mt-6 flex flex-auto flex-col text-base leading-relaxed text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      <p className="flex-auto">Skip the repair shop wait list. Our photo-based intelligence system provides robust initial repair estimates before a physical inspection is required.</p>
                    </dd>
                  </div>

                  <div className="flex flex-col bg-[#ffffff] p-10 rounded-[2rem] shadow-[0_15px_40px_-20px_rgba(85,98,77,0.08)] hover:-translate-y-2 transition-transform duration-500">
                    <dt className="flex flex-col gap-y-6 text-2xl font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-[#f2f4ed] text-[#55624d]">
                        <ShieldCheck className="h-8 w-8" aria-hidden="true" />
                      </div>
                      Secure Network
                    </dt>
                    <dd className="mt-6 flex flex-auto flex-col text-base leading-relaxed text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      <p className="flex-auto">Rest assured with deep data integrations that automatically cross-reference VINs and vehicle histories to protect our community from fraud.</p>
                    </dd>
                  </div>

                </dl>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 🌿 Stitch Added Sections (Public View Only) */}
      {!isLoggedIn && (
        <>
          {/* Why VEHICO Section (Bento Inspired) */}
          <section className="px-6 py-20 bg-[#f2f4ed]">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-[#55624d] mb-12 text-center" style={{ fontFamily: 'Manrope, sans-serif' }}>Why VEHICO</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                {/* Feature 1 */}
                <div className="md:col-span-3 bg-[#ffffff] p-8 rounded-xl flex flex-col justify-between min-h-[220px] shadow-[0_10px_30px_-15px_rgba(85,98,77,0.05)]">
                  <Zap className="h-10 w-10 text-[#55624d] mb-4" />
                  <div>
                    <h4 className="text-xl font-bold text-[#191c18] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Super-Fast Claims</h4>
                    <p className="text-sm text-[#444841] leading-relaxed" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Settle your claims in record time with our AI-driven validation process.</p>
                  </div>
                </div>
                {/* Feature 2 */}
                <div className="md:col-span-3 bg-[#ffffff] p-8 rounded-xl flex flex-col justify-between min-h-[220px] shadow-[0_10px_30px_-15px_rgba(85,98,77,0.05)]">
                  <Wrench className="h-10 w-10 text-[#55624d] mb-4" />
                  <div>
                    <h4 className="text-xl font-bold text-[#191c18] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Cashless Repairs</h4>
                    <p className="text-sm text-[#444841] leading-relaxed" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Access to premium repair services without paying a single penny upfront.</p>
                  </div>
                </div>
                {/* Feature 3 */}
                <div className="md:col-span-2 bg-[#ffffff] p-6 rounded-xl space-y-4 shadow-[0_10px_30px_-15px_rgba(85,98,77,0.05)]">
                  <SlidersHorizontal className="h-8 w-8 text-[#755754]" />
                  <h4 className="text-lg font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Customizable IDV</h4>
                  <p className="text-xs text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Your car's value, your choice.</p>
                </div>
                {/* Feature 4 */}
                <div className="md:col-span-2 bg-[#ffffff] p-6 rounded-xl space-y-4 shadow-[0_10px_30px_-15px_rgba(85,98,77,0.05)]">
                  <Headphones className="h-8 w-8 text-[#755754]" />
                  <h4 className="text-lg font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>24/7 Support</h4>
                  <p className="text-xs text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Human-centric help, any time.</p>
                </div>
                {/* Feature 5 */}
                <div className="md:col-span-2 bg-[#ffffff] p-6 rounded-xl space-y-4 shadow-[0_10px_30px_-15px_rgba(85,98,77,0.05)]">
                  <Award className="h-8 w-8 text-[#755754]" />
                  <h4 className="text-lg font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>No Claim Bonus</h4>
                  <p className="text-xs text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Rewards for your safe driving.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Plan Types Section */}
          <section className="px-6 py-20 bg-[#f8faf3]">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-bold text-[#55624d]" style={{ fontFamily: 'Manrope, sans-serif' }}>Choose Your Shield</h3>
                <p className="text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Transparent plans designed for every journey.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Third-Party */}
                <div className="p-8 rounded-xl bg-[#ecefe8] text-center border border-transparent hover:border-[#55624d]/10 transition-all group shadow-[0_10px_30px_-15px_rgba(85,98,77,0.05)]">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Shield className="h-6 w-6 text-[#55624d]" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Third-Party</h4>
                  <p className="text-sm text-[#444841] mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Mandatory legal cover for liabilities against others.</p>
                  <button type="button" className="text-[#55624d] font-bold text-sm underline underline-offset-4">Learn More</button>
                </div>
                {/* Comprehensive */}
                <div className="p-8 rounded-xl bg-[#d9e7cd] text-center shadow-xl ring-2 ring-[#55624d]/20 scale-105 relative z-10">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#55624d] text-white px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Best Value</span>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="h-6 w-6 text-[#55624d]" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Comprehensive</h4>
                  <p className="text-sm text-[#3e4a37] mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Full protection for your car and third-party damages.</p>
                  <button type="button" className="bg-[#55624d] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#444841] transition-colors">Select Plan</button>
                </div>
                {/* Own Damage */}
                <div className="p-8 rounded-xl bg-[#ecefe8] text-center border border-transparent hover:border-[#55624d]/10 transition-all group shadow-[0_10px_30px_-15px_rgba(85,98,77,0.05)]">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Car className="h-6 w-6 text-[#55624d]" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Own Damage</h4>
                  <p className="text-sm text-[#444841] mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Exclusive cover for accidental damage to your vehicle.</p>
                  <button type="button" className="text-[#55624d] font-bold text-sm underline underline-offset-4">Learn More</button>
                </div>
              </div>
            </div>
          </section>

          {/* Add-Ons Scrollable Section */}
          <section className="py-20 bg-[#f2f4ed] overflow-hidden">
            <div className="max-w-4xl mx-auto px-6 mb-10">
              <h3 className="text-3xl font-bold text-[#55624d]" style={{ fontFamily: 'Manrope, sans-serif' }}>Precision Add-Ons</h3>
              <p className="text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Enhance your sanctuary with bespoke protection.</p>
            </div>
            <div className="flex gap-6 overflow-x-auto px-6 snap-x pb-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Add-on 1 */}
              <div className="min-w-[280px] bg-[#ffffff] p-8 rounded-xl snap-center flex flex-col justify-between aspect-square shadow-[0_10px_30px_-15px_rgba(85,98,77,0.05)]">
                <div className="bg-[#755754]/5 p-3 rounded-full self-start">
                  <Heart className="h-6 w-6 text-[#fed7d2]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Zero Depreciation</h4>
                  <p className="text-sm text-[#444841] mt-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Claim the full cost of replaced parts without aging deductions.</p>
                </div>
              </div>
              {/* Add-on 2 */}
              <div className="min-w-[280px] bg-[#ffffff] p-8 rounded-xl snap-center flex flex-col justify-between aspect-square shadow-[0_10px_30px_-15px_rgba(85,98,77,0.05)]">
                <div className="bg-[#755754]/5 p-3 rounded-full self-start">
                  <FileText className="h-6 w-6 text-[#fed7d2]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>RTI (Return to Invoice)</h4>
                  <p className="text-sm text-[#444841] mt-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Get the original invoice value in case of total car loss.</p>
                </div>
              </div>
              {/* Add-on 3 */}
              <div className="min-w-[280px] bg-[#ffffff] p-8 rounded-xl snap-center flex flex-col justify-between aspect-square shadow-[0_10px_30px_-15px_rgba(85,98,77,0.05)]">
                <div className="bg-[#755754]/5 p-3 rounded-full self-start">
                  <Key className="h-6 w-6 text-[#fed7d2]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Key Replacement</h4>
                  <p className="text-sm text-[#444841] mt-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Hassle-free recovery if your digital keys are lost or stolen.</p>
                </div>
              </div>
              {/* Add-on 4 */}
              <div className="min-w-[280px] bg-[#ffffff] p-8 rounded-xl snap-center flex flex-col justify-between aspect-square shadow-[0_10px_30px_-15px_rgba(85,98,77,0.05)]">
                <div className="bg-[#755754]/5 p-3 rounded-full self-start">
                  <Cog className="h-6 w-6 text-[#fed7d2]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Engine Protection</h4>
                  <p className="text-sm text-[#444841] mt-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Shield against hydro-static lock and oil leakage damage.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Inclusions & Exclusions Section */}
          <section className="px-6 py-20 bg-[#f8faf3]">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#d9e7cd] flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-[#55624d]" />
                    </span>
                    <h4 className="text-xl font-bold text-[#55624d]" style={{ fontFamily: 'Manrope, sans-serif' }}>Inclusions</h4>
                  </div>
                  <ul className="space-y-6">
                    <li className="flex gap-4">
                      <AlertTriangle className="h-6 w-6 text-[#98a68e] flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Accidents</p>
                        <p className="text-sm text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>External impact and collisions.</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <ShieldOff className="h-6 w-6 text-[#98a68e] flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Theft</p>
                        <p className="text-sm text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Full compensation for vehicle theft.</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <Flame className="h-6 w-6 text-[#98a68e] flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Fire & Explosion</p>
                        <p className="text-sm text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Damage from spontaneous combustion.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#fed7d2] flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-[#755754]" />
                    </span>
                    <h4 className="text-xl font-bold text-[#755754]" style={{ fontFamily: 'Manrope, sans-serif' }}>Exclusions</h4>
                  </div>
                  <ul className="space-y-6">
                    <li className="flex gap-4">
                      <FileWarning className="h-6 w-6 text-[#5b403d] flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Invalid license</p>
                        <p className="text-sm text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Driving without a valid legal permit.</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <Wine className="h-6 w-6 text-[#5b403d] flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>DUI</p>
                        <p className="text-sm text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Driving under any form of intoxication.</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <History className="h-6 w-6 text-[#5b403d] flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Aging & Wear</p>
                        <p className="text-sm text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Natural degradation over time.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Step-by-Step Guide Section */}
          <section className="px-6 py-20 bg-[#ecefe8]">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-[#55624d] mb-12 text-center" style={{ fontFamily: 'Manrope, sans-serif' }}>Your 5-Step Journey</h3>
              <div className="relative space-y-12">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#c5c8be]/30"></div>
                <div className="relative flex gap-8">
                  <div className="z-10 w-12 h-12 rounded-full bg-[#55624d] text-white flex items-center justify-center font-bold shadow-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>1</div>
                  <div className="pt-2">
                    <h4 className="font-bold text-lg text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Enter Details</h4>
                    <p className="text-sm text-[#444841] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Provide your registration and contact info.</p>
                  </div>
                </div>
                <div className="relative flex gap-8">
                  <div className="z-10 w-12 h-12 rounded-full bg-[#e7e9e2] text-[#55624d] flex items-center justify-center font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>2</div>
                  <div className="pt-2">
                    <h4 className="font-bold text-lg text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Compare Quotes</h4>
                    <p className="text-sm text-[#444841] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>View our tailored plans side-by-side.</p>
                  </div>
                </div>
                <div className="relative flex gap-8">
                  <div className="z-10 w-12 h-12 rounded-full bg-[#e7e9e2] text-[#55624d] flex items-center justify-center font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>3</div>
                  <div className="pt-2">
                    <h4 className="font-bold text-lg text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Choose Add-Ons</h4>
                    <p className="text-sm text-[#444841] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Select the extra layers your car deserves.</p>
                  </div>
                </div>
                <div className="relative flex gap-8">
                  <div className="z-10 w-12 h-12 rounded-full bg-[#e7e9e2] text-[#55624d] flex items-center justify-center font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>4</div>
                  <div className="pt-2">
                    <h4 className="font-bold text-lg text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Confirm Payment</h4>
                    <p className="text-sm text-[#444841] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Secure, one-click digital checkout.</p>
                  </div>
                </div>
                <div className="relative flex gap-8">
                  <div className="z-10 w-12 h-12 rounded-full bg-[#e7e9e2] text-[#55624d] flex items-center justify-center font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>5</div>
                  <div className="pt-2">
                    <h4 className="font-bold text-lg text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Instant Policy</h4>
                    <p className="text-sm text-[#444841] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Receive your digital sanctuary via Email/WhatsApp.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 🌿 Footer Section */}
      <footer className="bg-[#d8dbd4] px-6 py-20 text-[#191c18]">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h1 className="text-3xl font-extrabold text-[#55624d]" style={{ fontFamily: 'Manrope, sans-serif' }}>vehico</h1>
              <p className="text-[#444841] max-w-sm" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Designing digital insurance with a soul. Secure your vehicle, protect your peace.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-[#55624d]" />
                  <span className="font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>1800-VEHICO-LIFE</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[#55624d]" />
                  <span className="font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>hello@vehico.com</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h5 className="font-bold uppercase text-[10px] tracking-[0.2em] text-[#757870]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Additional Tools</h5>
                <ul className="space-y-3 text-sm font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  <li><a className="hover:text-[#55624d] transition-colors" href="#">Challans</a></li>
                  <li><a className="hover:text-[#55624d] transition-colors" href="#">VAHAN details</a></li>
                  <li><a className="hover:text-[#55624d] transition-colors" href="#">Premium Calc</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-bold uppercase text-[10px] tracking-[0.2em] text-[#757870]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Legal</h5>
                <ul className="space-y-3 text-sm font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  <li><a className="hover:text-[#55624d] transition-colors" href="#">Privacy</a></li>
                  <li><a className="hover:text-[#55624d] transition-colors" href="#">Terms</a></li>
                  <li><a className="hover:text-[#55624d] transition-colors" href="#">Grievance</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-[#c5c8be]/30 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-[#757870]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>© 2024 Vehico Vehicle Insurance Services Ltd. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-[#e7e9e2] flex items-center justify-center cursor-pointer hover:bg-[#ecefe8] transition-colors">
                <Share2 className="h-4 w-4 text-[#55624d]" />
              </span>
              <span className="w-8 h-8 rounded-full bg-[#e7e9e2] flex items-center justify-center cursor-pointer hover:bg-[#ecefe8] transition-colors">
                <ThumbsUp className="h-4 w-4 text-[#55624d]" />
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;