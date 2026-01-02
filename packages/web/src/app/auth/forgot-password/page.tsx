'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import type { PasswordResetRequest } from '@pmp/shared';
import { useToast } from '@/components/ToastProvider';
import { validateEmail } from '@/lib/validation';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  // HIGH-002: Email validation state
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  // LOW-002: Countdown timer for auto-redirect
  const [countdown, setCountdown] = useState(10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // HIGH-002: Validate email on submit
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await apiRequest<void>('/auth/forgot-password', {
        method: 'POST',
        body: { email } as PasswordResetRequest,
      });
      setStatus('success');
    } catch (error: unknown) {
      console.error('Password reset request failed', error);
      const message = 'Failed to send password reset email. Please try again later.';
      setStatus('error');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  // HIGH-002: Email validation handler
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailTouched && value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    }
  };

  // LOW-002: Countdown timer effect for auto-redirect to login
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      router.push('/auth/login');
    }
  }, [status, countdown, router]);

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Organic Blur Shapes */}
        <div className="blur-shape bg-md-primary w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="blur-shape bg-md-tertiary w-96 h-96 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>

        <div className="card w-full max-w-md animate-slideUp relative z-10 bg-md-surface-container text-center">
          <div className="text-5xl mb-4" aria-hidden="true">
            📧
          </div>
          <h2 className="text-3xl font-extrabold text-md-on-surface">Check your email</h2>
          <p className="mt-2 text-sm text-md-on-surface-variant">
            We have sent a password reset link to{' '}
            <span className="font-medium text-md-primary">{email}</span>. Please check your inbox
            (and spam folder) and follow the instructions.
          </p>
          <div className="mt-6 space-y-3">
            {/* LOW-002: Show countdown timer and manual link */}
            <p className="text-sm text-md-on-surface-variant">
              Redirecting to login in{' '}
              <span className="font-mono font-bold text-md-primary">{countdown}</span>
              {countdown === 1 ? ' second' : ' seconds'}...
            </p>
            <Link
              href="/auth/login"
              className="font-medium text-md-primary hover:text-md-primary-hover transition inline-block"
            >
              Return to Login now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Organic Blur Shapes */}
      <div className="blur-shape bg-md-primary w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="blur-shape bg-md-tertiary w-96 h-96 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>

      <div className="card w-full max-w-md animate-slideUp relative z-10 bg-md-surface-container">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-md-on-surface">Reset your password</h1>
          <p className="text-md-on-surface-variant mt-2">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email-address"
              className="block text-sm font-medium mb-1 text-md-on-surface-variant"
            >
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => handleEmailChange(e.target.value)}
              onBlur={handleEmailBlur}
              className={`input ${emailError ? 'border-md-error focus:border-md-error focus:ring-md-error' : ''}`}
              placeholder="you@example.com"
              aria-invalid={emailError ? 'true' : 'false'}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && (
              <p id="email-error" className="mt-1 text-sm text-md-error" role="alert">
                {emailError}
              </p>
            )}
          </div>

          {status === 'error' && (
            <div className="p-3 rounded-lg bg-md-error-container text-md-on-error-container text-sm">
              {errorMessage}
            </div>
          )}

          <button type="submit" disabled={status === 'loading'} className="btn btn-primary w-full">
            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="font-medium text-md-primary hover:text-md-primary-hover transition text-sm"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
