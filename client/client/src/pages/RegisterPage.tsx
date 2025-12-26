import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, isLoading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const checkPasswordStrength = (password: string): number => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return Math.min(strength, 4);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');

        if (name === 'password') {
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
            });
            navigate('/', { replace: true });
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const responseData = err.response?.data;

                // Handle Zod validation errors (array of details)
                if (responseData?.details && Array.isArray(responseData.details)) {
                    const messages = responseData.details.map(
                        (d: { path?: string; message?: string }) => d.message || 'Validation error'
                    );
                    setError(messages.join('. '));
                } else if (typeof responseData?.error === 'string') {
                    setError(responseData.error);
                } else if (responseData?.error?.message) {
                    setError(responseData.error.message);
                } else {
                    setError('Registration failed. Please try again.');
                }
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStrengthLabel = () => {
        const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
        return labels[passwordStrength];
    };

    const getStrengthColor = () => {
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
        return colors[passwordStrength];
    };

    if (authLoading) {
        return (
            <div className="auth-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="logo-icon">
                                <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L19.85 7 12 9.72 4.15 7 12 4.18zM4 8.5l7 3.5v7.5l-7-3.5V8.5zm9 11V12l7-3.5v7.5l-7 3.5z" />
                            </svg>
                        </div>
                        <h1>Create Account</h1>
                        <p>Start your PMP certification journey today</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="error-icon">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="John"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="At least 8 characters"
                                required
                                autoComplete="new-password"
                            />
                            {formData.password && (
                                <div className="password-strength">
                                    <div className="strength-bars">
                                        {[0, 1, 2, 3].map(i => (
                                            <div
                                                key={i}
                                                className="strength-bar"
                                                style={{
                                                    backgroundColor: i <= passwordStrength ? getStrengthColor() : '#e5e7eb',
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span style={{ color: getStrengthColor() }}>{getStrengthLabel()}</span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                                autoComplete="new-password"
                            />
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <span className="field-error">Passwords do not match</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isSubmitting || formData.password !== formData.confirmPassword}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="auth-features">
                    <h2>Why Choose Us?</h2>
                    <ul>
                        <li>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            <span>Based on Latest PMP 2026 Exam</span>
                        </li>
                        <li>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            <span>Realistic Scenarios & Questions</span>
                        </li>
                        <li>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            <span>Track Your Progress</span>
                        </li>
                        <li>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            <span>Study Anytime, Anywhere</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
