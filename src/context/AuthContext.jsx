import React, { createContext, useContext, useEffect, useState } from "react";
import { subscribeToAuthChanges, logout } from "../services/authService";
import { getUserRole } from "../services/firestoreService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges(async (currentUser) => {
            setLoading(true);
            console.log("Auth state changed:", currentUser?.email);
            if (currentUser) {
                setUser(currentUser);
                const userRole = await getUserRole(currentUser.uid);
                console.log("User role fetched:", userRole);
                setRole(userRole);
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        role,
        loading,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
