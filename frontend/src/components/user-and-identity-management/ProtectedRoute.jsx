import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute component enforces authentication and role-based access control.
 * If unauthorized, it redirects to /login.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles allowed to access the route
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    const location = useLocation();

    // 1. Authentication Check
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const role = user.role?.toLowerCase()?.trim();
    const ownerStatus = user.ownerStatus?.toLowerCase()?.trim();
    
    // Normalize owner detection
    const isOwner = ownerStatus === 'approved' || 
                   ['owner', 'campsite_owner', 'campsite-owner', 'campsite owner'].includes(role);

    // 2. Authorization Check
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase().trim());
    
    // Check if user's role is in the allowed list
    const hasRoleAccess = normalizedAllowed.includes(role);
    
    // Special check for owner variations if 'owner' is in allowedRoles
    const hasOwnerAccess = normalizedAllowed.includes('owner') && isOwner;

    if (!hasRoleAccess && !hasOwnerAccess) {
        // Redirect to their own specific dashboard instead of login to avoid "double sign-in" feel
        if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
        if (isOwner) return <Navigate to="/owner-profile" replace />;
        if (role === 'guide') return <Navigate to="/guide-profile" replace />;
        if (role === 'camper') return <Navigate to="/" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
