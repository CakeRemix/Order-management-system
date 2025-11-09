import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignUpData extends LoginCredentials {
    name: string;
    confirmPassword: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'vendor' | 'admin';
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
}

// Token management
export const getToken = (): string | null => {
    return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
    localStorage.setItem('token', token);
};

export const removeToken = (): void => {
    localStorage.removeItem('token');
};

// API calls
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        const { token, user, success } = response.data;
        if (success) {
            setToken(token);
            return { success, token, user };
        }
        throw new Error(response.data.message || 'Login failed');
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
        throw new Error('An unexpected error occurred');
    }
};

export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
    try {
        const response = await axios.post(`${API_URL}/auth/signup`, data);
        const { token, user, success } = response.data;
        if (success) {
            setToken(token);
            return { success, token, user };
        }
        throw new Error(response.data.message || 'Sign up failed');
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Sign up failed');
        }
        throw new Error('An unexpected error occurred');
    }
};

export const logout = (): void => {
    removeToken();
};

// Authorization header helper
export const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

// Validation helpers
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
};