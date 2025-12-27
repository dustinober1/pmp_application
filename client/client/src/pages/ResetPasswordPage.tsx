import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const hasToken = token.length > 0;

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
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

        if (name === 'newPassword') {
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!hasToken) {
            setError('Reset link is missing or invalid. Please request a new one.');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await authService.resetPassword({
                token,
                newPassword: formData.newPassword,
            });
            setMessage(response.message || 'Password reset successfully.');
            setFormData({ newPassword: '', confirmPassword: '' });
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const responseData = err.response?.data;
                if (typeof responseData?.error === 'string') {
                    setError(responseData.error);
                } else if (responseData?.error?.message) {
                    setError(responseData.error.message);
                } else {
                    setError('Reset failed. Please try again.');
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
                        <h1>Set a New Password</h1>
                        <p>Create a new password to regain access</p>
                    </div>

                    {!hasToken && (
                        <div className="auth-note">
                            This reset link is missing a token.{' '}
                            <Link to="/forgot-password" className="auth-link">
                                Request a new link
                            </Link>
                            .
                        </div>
                    )}

                    {error && (
                        <div className="auth-error">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="error-icon">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {message && (
                        <div className="auth-success">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="success-icon">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            <span>{message}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                autoComplete="new-password"
                                disabled={!hasToken}
                            />
                            {formData.newPassword && (
                                <div className="password-strength">
                                    <div className="strength-bars">
                                        {[1, 2, 3, 4].map((i) => (
                                            <span
                                                key={i}
                                                className="strength-bar"
                                                style={{
                                                    backgroundColor: i <= passwordStrength ? getStrengthColor() : '#e5e7eb',
                                                }}
                                            ></span>
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
                                disabled={!hasToken}
                            />
                            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                <span className="field-error">Passwords do not match</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isSubmitting || !hasToken}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Resetting password...
                                </>
                            ) : (
                                'Reset password'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Ready to sign in?{' '}
                            <Link to="/login" className="auth-link">
                                Back to login
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="auth-features">
                    <h2>Secure Access</h2>
                    <ul>
                        <li>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            <span>Strong password protection</span>
                        </li>
                        <li>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            <span>One-time reset links</span>
                        </li>
                        <li>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            <span>Quickly get back to studying</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
