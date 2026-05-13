import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { ShieldCheck } from 'lucide-react';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleRouting = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);

    const routes = {
      'customer': redirectUrl || '/',
      'policy_manager': '/policyManagerDashboard',
      'inspection_guide': '/inspectionGuideDashboard',
      'claims_officer': '/claimOfficerDashboard'
    };

    navigate(routes[decoded.role] || '/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', formData);
      handleRoleRouting(response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/users/google-login', {
        token: credentialResponse.credential
      });
      handleRoleRouting(response.data.token);
    } catch (err) {
      setError('Google Sign-In failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf3] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#d9e7cd] selection:text-[#131e0e]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center justify-center gap-3 mb-8 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#f2f4ed] text-[#55624d]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-[#55624d]" style={{ fontFamily: 'Manrope, sans-serif' }}>vehico</span>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-[#444841]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Please sign in to access your sanctuary.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#ffffff] py-10 px-6 sm:rounded-[2rem] sm:px-10 shadow-[0_15px_40px_-20px_rgba(85,98,77,0.08)]">
          {error && (
            <div className="mb-6 bg-[#fed7d2] p-4 rounded-xl text-[#795b58] text-sm flex items-center gap-3 font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              <div className="w-2 h-2 rounded-full bg-[#ba1a1a]"></div> {error}
            </div>
          )}

          <div className="flex flex-col items-center justify-center mb-8">
            <GoogleOAuthProvider clientId="369842549051-0272ghj311n8fgq55p6msgust2fo7ueq.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                theme="outline"
                size="large"
                shape="pill"
              />
            </GoogleOAuthProvider>
            
            <div className="relative flex justify-center text-sm mt-8 w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#ecefe8]"></div>
              </div>
              <span className="relative bg-[#ffffff] px-4 text-[#757870] font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Or use credentials
              </span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <div>
              <label className="block text-sm font-bold text-[#191c18] mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="block w-full rounded-xl bg-[#f8faf3] border-0 py-3.5 px-4 text-[#191c18] placeholder:text-[#c5c8be] focus:ring-2 focus:ring-[#55624d] sm:text-sm sm:leading-6 transition-shadow"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#191c18] mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="block w-full rounded-xl bg-[#f8faf3] border-0 py-3.5 px-4 text-[#191c18] placeholder:text-[#c5c8be] focus:ring-2 focus:ring-[#55624d] sm:text-sm sm:leading-6 transition-shadow"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 flex w-full justify-center rounded-full bg-gradient-to-br from-[#55624d] to-[#98a68e] py-3.5 px-4 text-sm font-bold text-white shadow-[0_10px_20px_-10px_rgba(85,98,77,0.4)] hover:shadow-[0_15px_25px_-10px_rgba(85,98,77,0.5)] disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Authenticating...' : 'Access Portal'}
            </button>

            <p className="text-center text-sm text-[#444841] mt-8 font-medium">
              New to vehico? <Link to="/register" className="font-bold text-[#55624d] hover:text-[#191c18] transition-colors">Create an account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;