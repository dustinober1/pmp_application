import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsSubmitting(true);

        try {
            const response = await authService.requestPasswordReset({ email });
            setMessage(response.message || 'Check your email for a reset link.');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || 'Request failed. Please try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
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
                        <h1>Reset Your Password</h1>
                        <p>Enter your email and we will send you a reset link</p>
                    </div>

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
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Sending reset link...
                                </>
                            ) : (
                                'Send reset link'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Remembered your password?{' '}
                            <Link to="/login" className="auth-link">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="auth-features">
                    <h2>Stay on Track</h2>
                    <ul>
                        <li>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            <span>Pick up where you left off</span>
                        </li>
                        <li>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            <span>Your progress stays safe</span>
                        </li>
                        <li>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            <span>Secure account recovery</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
