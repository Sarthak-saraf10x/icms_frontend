import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// 📄 Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';           // Renamed from Login.jsx
import RegisterPage from '../pages/RegisterPage';     // Renamed from Register.jsx
import CheckoutPage from '../pages/CheckoutPage';

import PolicyManagerDashboard from '../pages/PolicyManagerDashboard';
import InspectionGuideDashboard from '../pages/InspectionGuideDashboard';
import ClaimOfficerDashboard from '../pages/ClaimOfficerDashboard';


import ClaimForm from '../components/claim/ClaimForm';
import PolicyForm from '../components/policy/PolicyForm';
import PolicyTypeForm from '../components/policy/PolicyTypeForm';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />



            <Route
                path="/claim/:policyId"
                element={
                    <PrivateRoute allowedRoles={['customer']}>
                        <ClaimForm />
                    </PrivateRoute>
                }
            />


            <Route
                path="/policyManagerDashboard"
                element={
                    <PrivateRoute allowedRoles={['policy_manager']}>
                        <PolicyManagerDashboard />
                    </PrivateRoute>
                }
            />
            <Route
                path="/policies/create"
                element={
                    <PrivateRoute allowedRoles={['policy_manager']}>
                        <PolicyForm />
                    </PrivateRoute>
                }
            />
            <Route
                path="/policy-types/create"
                element={
                    <PrivateRoute allowedRoles={['policy_manager']}>
                        <PolicyTypeForm />
                    </PrivateRoute>
                }
            />


            <Route
                path="/inspectionGuideDashboard"
                element={
                    <PrivateRoute allowedRoles={['inspection_guide']}>
                        <InspectionGuideDashboard />
                    </PrivateRoute>
                }
            />


            <Route
                path="/claimOfficerDashboard"
                element={
                    <PrivateRoute allowedRoles={['claims_officer']}>
                        <ClaimOfficerDashboard />
                    </PrivateRoute>
                }
            />
        </Routes>
    );
};

export default AppRoutes;