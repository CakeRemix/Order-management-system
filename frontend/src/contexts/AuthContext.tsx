import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { getToken, removeToken, AuthResponse, User, getAuthHeader } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuthInfo: (authResponse: AuthResponse) => void;
    clearAuth: () => void;
    checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const checkAuth = async (): Promise<boolean> => {
        try {
            const token = getToken();
            if (!token) {
                setIsLoading(false);
                return false;
            }

            const response = await axios.get(`${API_URL}/auth/me`, getAuthHeader());
            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                setIsLoading(false);
                return true;
            }

            clearAuth();
            return false;
        } catch (error) {
            clearAuth();
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const setAuthInfo = (authResponse: AuthResponse) => {
        if (authResponse.success) {
            setUser(authResponse.user);
            setIsAuthenticated(true);
        }
    };

    const clearAuth = () => {
        removeToken();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                setAuthInfo,
                clearAuth,
                checkAuth
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};