// Authentication utilities
// Dynamically detect API URL based on environment
const getAPIUrl = () => {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Development environment
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }
    
    // Production environment - use same domain
    const baseUrl = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
    return `${baseUrl}/api`;
};

const API_URL = getAPIUrl();

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

// Authentication status check using jQuery AJAX
const checkAuth = () => {
    const token = getToken();
    if (!token) {
        return Promise.resolve(false);
    }

    return $.ajax({
        url: `${API_URL}/auth/me`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then((data) => {
        if (data.success) {
            if (data.user) {
                setUserInfo(data.user);
            }
            return true;
        }
        return false;
    })
    .catch((error) => {
        console.error('Auth check failed:', error);
        removeToken();
        removeUserInfo();
        return false;
    });
};

// Login function using jQuery AJAX
const login = (email, password) => {
    return $.ajax({
        url: `${API_URL}/auth/login`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password })
    })
    .then((data) => {
        if (data.success && data.token) {
            setToken(data.token);
            if (data.user) {
                setUserInfo(data.user);
            }
            // Reload user-specific cart after login
            if (typeof window.reloadUserCart === 'function') {
                window.reloadUserCart();
            }
            return data;
        }
        return $.Deferred().reject({ responseJSON: { message: data.message || 'Login failed' } });
    })
    .fail((xhr) => {
        console.error('Login error:', xhr.responseJSON?.message || xhr.statusText);
    });
};

// Signup function using jQuery AJAX
const signup = (name, email, password, confirmPassword, birthdate) => {
    return $.ajax({
        url: `${API_URL}/auth/signup`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            name,
            email,
            password,
            confirmPassword,
            birthDate: birthdate
        })
    })
    .done((data) => {
        if (data.success) {
            return data;
        }
        throw new Error(data.message || 'Signup failed');
    })
    .fail((xhr, status, error) => {
        console.error('Signup error:', error);
        const errorMsg = xhr.responseJSON?.message || 'Signup failed';
        throw new Error(errorMsg);
    });
};

// Logout function
const logout = () => {
    // Clear guest cart data (prevents data leak between users)
    localStorage.removeItem('cartStore_guest');
    localStorage.removeItem('currentOrder_guest');
    
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
const requireAuth = () => {
    return checkAuth().then((isAuthenticated) => {
        if (!isAuthenticated) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    });
};