// Authentication utilities
const API_URL = 'http://localhost:5000/api';

// Token management
const getToken = () => {
    return localStorage.getItem('token');
};

const setToken = (token) => {
    localStorage.setItem('token', token);
};

const removeToken = () => {
    localStorage.removeItem('token');
};

// User information management
const setUserInfo = (userInfo) => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

const getUserInfo = () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
};

const removeUserInfo = () => {
    localStorage.removeItem('userInfo');
};

// API calls with error handling
const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
    }
    return data;
};

// Authentication status check
const checkAuth = async () => {
    const token = getToken();
    if (!token) {
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await handleResponse(response);
        if (data.success) {
            if (data.user) {
                setUserInfo(data.user);
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Auth check failed:', error);
        removeToken();
        removeUserInfo();
        return false;
    }
};

// Login function
const login = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await handleResponse(response);
        if (data.success && data.token) {
            setToken(data.token);
            if (data.user) {
                setUserInfo(data.user);
            }
            return data;
        }
        throw new Error(data.message || 'Login failed');
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Signup function
const signup = async (name, email, password, confirmPassword) => {
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                confirmPassword
            })
        });

        const data = await handleResponse(response);
        if (data.success && data.token) {
            setToken(data.token);
            if (data.user) {
                setUserInfo(data.user);
            }
            return data;
        }
        throw new Error(data.message || 'Signup failed');
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
};

// Logout function
const logout = () => {
    removeToken();
    removeUserInfo();
    window.location.href = '/login.html';
};

// Validation helpers
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};

// Protected route helper
const requireAuth = async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
};