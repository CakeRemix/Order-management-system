import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, SignUpData, validateEmail, validatePassword } from '../utils/auth';
import { useAuth } from '../contexts/AuthContext';

interface SignUpFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
}

export const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const { setAuthInfo } = useAuth();
    const [formData, setFormData] = useState<SignUpFormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const signUpData: SignUpData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
            };

            const response = await signUp(signUpData);
            setAuthInfo(response);
            navigate('/dashboard'); // Redirect to dashboard after successful sign up
        } catch (error) {
            setErrors({
                general: error instanceof Error ? error.message : 'An error occurred during sign up'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {errors.general && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-700">{errors.general}</div>
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="name" className="sr-only">Full name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border 
                                    ${errors.name ? 'border-red-300' : 'border-gray-300'}
                                    placeholder-gray-500 text-gray-900 rounded-t-md 
                                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                                placeholder="Full name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border 
                                    ${errors.email ? 'border-red-300' : 'border-gray-300'}
                                    placeholder-gray-500 text-gray-900
                                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border 
                                    ${errors.password ? 'border-red-300' : 'border-gray-300'}
                                    placeholder-gray-500 text-gray-900
                                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Confirm password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border 
                                    ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}
                                    placeholder-gray-500 text-gray-900 rounded-b-md
                                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent 
                                text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Creating account...' : 'Sign up'}
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Already have an account? Sign in
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};