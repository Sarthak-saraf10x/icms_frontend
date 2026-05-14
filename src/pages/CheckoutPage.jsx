import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, ShieldCheck, CheckCircle2, ChevronRight, CreditCard, User, ChevronLeft, Car } from 'lucide-react';

function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const vehicleNumber = searchParams.get('vehicle') || '';

  const [step, setStep] = useState(1);
  const [availablePolicies, setAvailablePolicies] = useState([]);
  const [policyTypes, setPolicyTypes] = useState({});
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [personalDetails, setPersonalDetails] = useState({ fullName: '', email: '', phone: '', address: '' });
  const [paymentDetails, setPaymentDetails] = useState({ cardNumber: '', expiry: '', cvv: '', nameOnCard: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(`/checkout?vehicle=${vehicleNumber}`)}`);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch User details for pre-filling
        const userRes = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPersonalDetails(prev => ({
          ...prev,
          fullName: userRes.data.username || '',
          email: userRes.data.email || ''
        }));

        // Fetch Policy Types
        const typesRes = await axios.get('http://localhost:5000/api/policies/types', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const typesMap = typesRes.data.reduce((map, type) => ({ ...map, [type.policy_type_id]: type.name }), {});
        setPolicyTypes(typesMap);

        // Fetch Available Policies
        const policiesRes = await axios.get('http://localhost:5000/api/policies/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailablePolicies(policiesRes.data);
      } catch (err) {
        console.error('Error fetching checkout data:', err);
        setError('Failed to load required data. Please try again.');
      }
    };

    fetchData();
  }, [navigate, vehicleNumber]);

  const handleNextStep = () => {
    if (step === 1 && !selectedPolicy) {
      setError('Please select a policy to continue.');
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const displayRazorpay = async () => {
    if (!selectedPolicy) return;

    setIsLoading(true);
    setError('');

    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      setError('Razorpay SDK failed to load. Are you online?');
      setIsLoading(false);
      return;
    }

    const options = {
      key: "rzp_test_Sp3NECNkRe0XgY", // Dummy test key for demonstration
      amount: selectedPolicy.base_premium * 100, // Amount in paise
      currency: "INR",
      name: "Vehico Insurance",
      description: `Payment for ${selectedPolicy.policy_name}`,
      handler: async function (response) {
        // Payment successful, now hit our backend purchase endpoint
        try {
          const token = localStorage.getItem('token');
          await axios.post(`http://localhost:5000/api/policies/${selectedPolicy.policy_id}/purchase`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          navigate('/');
        } catch (err) {
          setError(err.response?.data?.error || 'Purchase failed to record on server');
        }
      },
      prefill: {
        name: personalDetails.fullName,
        email: personalDetails.email,
        contact: personalDetails.phone
      },
      theme: {
        color: "#55624d"
      }
    };

    const paymentObject = new window.Razorpay(options);

    paymentObject.on('payment.failed', function (response) {
      setError('Payment failed. Please try again.');
      setIsLoading(false);
    });

    paymentObject.open();
    // Stop loading state once popup is open
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8faf3] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Progress Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#191c18] mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Secure Your Protection
          </h1>
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${step === s ? 'bg-[#55624d] text-white shadow-lg' : step > s ? 'bg-[#98a68e] text-white' : 'bg-[#e5e9de] text-[#a4a99d]'}`}>
                  {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                </div>
                {s < 3 && <div className={`w-16 h-1 rounded ${step > s ? 'bg-[#98a68e]' : 'bg-[#e5e9de]'}`}></div>}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-4 text-[#444841] font-medium flex justify-center gap-[4.5rem] text-sm" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <span>Select Policy</span>
            <span>Your Details</span>
            <span>Payment</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
            <Shield className="w-5 h-5" /> {error}
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-20px_rgba(85,98,77,0.12)] border border-[#ecefe8] p-8 md:p-12">

          {/* STEP 1: Select Policy */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 flex items-center gap-3">
                <div className="p-3 bg-[#f2f4ed] rounded-xl text-[#55624d]">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Vehicle: {vehicleNumber || 'Not provided'}</h2>
                  <p className="text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Select a coverage plan that fits your needs.</p>
                </div>
              </div>

              <div className="space-y-4">
                {availablePolicies.map(policy => (
                  <div
                    key={policy.policy_id}
                    onClick={() => setSelectedPolicy(policy)}
                    className={`cursor-pointer border-2 rounded-2xl p-6 transition-all duration-300 ${selectedPolicy?.policy_id === policy.policy_id ? 'border-[#55624d] bg-[#f8faf3] shadow-md' : 'border-[#ecefe8] hover:border-[#d9e7cd]'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#d9e7cd] text-[#444841] text-xs font-bold uppercase tracking-wider mb-3">
                          {policyTypes[policy.policy_type_id] || 'Standard'}
                        </span>
                        <h3 className="text-xl font-bold text-[#191c18] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{policy.policy_name}</h3>
                        <p className="text-[#444841] text-sm leading-relaxed max-w-md" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{policy.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-2xl font-black text-[#55624d] mb-1">${policy.base_premium}</span>
                        <span className="text-xs text-[#a4a99d] font-bold uppercase tracking-wider">/ year</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 rounded-xl bg-[#55624d] hover:bg-[#444841] px-8 py-4 text-white font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  Continue to Details <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Personal Details */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 flex items-center gap-3">
                <div className="p-3 bg-[#f2f4ed] rounded-xl text-[#55624d]">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Personal Details</h2>
                  <p className="text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Ensure your information is up to date.</p>
                </div>
              </div>

              <div className="space-y-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#444841] mb-2">Full Name</label>
                    <input
                      type="text"
                      value={personalDetails.fullName}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, fullName: e.target.value })}
                      className="w-full rounded-xl bg-[#f8faf3] border border-[#ecefe8] py-3 px-4 text-[#191c18] focus:outline-none focus:ring-2 focus:ring-[#55624d]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#444841] mb-2">Email Address</label>
                    <input
                      type="email"
                      value={personalDetails.email}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, email: e.target.value })}
                      className="w-full rounded-xl bg-[#f8faf3] border border-[#ecefe8] py-3 px-4 text-[#191c18] focus:outline-none focus:ring-2 focus:ring-[#55624d]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#444841] mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={personalDetails.phone}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, phone: e.target.value })}
                      className="w-full rounded-xl bg-[#f8faf3] border border-[#ecefe8] py-3 px-4 text-[#191c18] focus:outline-none focus:ring-2 focus:ring-[#55624d]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#444841] mb-2">Residential Address</label>
                    <input
                      type="text"
                      value={personalDetails.address}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, address: e.target.value })}
                      className="w-full rounded-xl bg-[#f8faf3] border border-[#ecefe8] py-3 px-4 text-[#191c18] focus:outline-none focus:ring-2 focus:ring-[#55624d]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-between items-center">
                <button
                  onClick={handlePrevStep}
                  className="flex items-center gap-2 rounded-xl border-2 border-[#ecefe8] bg-transparent hover:bg-[#f8faf3] px-6 py-4 text-[#444841] font-bold transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 rounded-xl bg-[#55624d] hover:bg-[#444841] px-8 py-4 text-white font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Continue to Payment <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#ecefe8] pb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#f2f4ed] rounded-xl text-[#55624d]">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Payment</h2>
                    <p className="text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Secure transaction via your preferred method.</p>
                  </div>
                </div>
                <div className="bg-[#f8faf3] p-4 rounded-xl border border-[#ecefe8] text-right">
                  <p className="text-sm font-bold text-[#444841] uppercase tracking-wider mb-1">Total Due</p>
                  <p className="text-3xl font-black text-[#55624d]">${selectedPolicy?.base_premium}</p>
                </div>
              </div>

              <div className="space-y-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <div className="bg-[#f8faf3] p-8 rounded-xl border border-[#ecefe8] text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-8 h-8 text-[#55624d]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>Secure Payment via Razorpay</h3>
                  <p className="text-[#444841]">Click the button below to open the Razorpay payment gateway and complete your purchase securely.</p>
                </div>

                <div className="mt-10 pt-6 border-t border-[#ecefe8] flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-2 rounded-xl border-2 border-[#ecefe8] bg-transparent hover:bg-[#f8faf3] px-6 py-4 text-[#444841] font-bold transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={displayRazorpay}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-xl bg-[#55624d] hover:bg-[#444841] disabled:bg-[#98a68e] px-10 py-4 text-white font-bold transition-all shadow-[0_15px_30px_-15px_rgba(85,98,77,0.5)] hover:shadow-[0_20px_40px_-15px_rgba(85,98,77,0.6)] hover:-translate-y-0.5"
                  >
                    {isLoading ? 'Loading...' : `Pay $${selectedPolicy?.base_premium} via Razorpay`}
                    {!isLoading && <ShieldCheck className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
