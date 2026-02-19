import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, role, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a proper spinner
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // If user is logged in but doesn't have the required role,
        // redirect them to their specific dashboard if it exists.
        if (role === "admin") return <Navigate to="/services/portal/admin" replace />;
        if (role === "teacher") return <Navigate to="/services/portal/teacher" replace />;
        if (role === "parent") return <Navigate to="/services/portal/parent" replace />;

        // Fallback if no specific role dashboard or unauthorized
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
