'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '../../../lib/api';
import type { PasswordResetRequest } from '@pmp/shared';
import { useToast } from '@/components/ToastProvider';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

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

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
          <div className="text-5xl mb-4" aria-hidden="true">
            📧
          </div>
          <h2 className="text-3xl font-extrabold text-white">Check your email</h2>
          <p className="mt-2 text-sm text-gray-400">
            We have sent a password reset link to{' '}
            <span className="text-white font-medium">{email}</span>. Please check your inbox (and
            spam folder) and follow the instructions.
          </p>
          <div className="mt-6">
            <Link
              href="/auth/login"
              className="font-medium text-primary-400 hover:text-primary-300 transition"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your email address and we’ll send you a link to reset your password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors"
                placeholder="Email address"
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="rounded-md bg-red-900/30 p-4 border border-red-800">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-400">Error</h3>
                  <div className="mt-2 text-sm text-red-300">
                    <p>{errorMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                status === 'loading'
                  ? 'bg-primary-700 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary-500'
              } transition-colors shadow-lg hover:shadow-primary-900/20`}
            >
              {status === 'loading' ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="font-medium text-primary-400 hover:text-primary-300 transition text-sm"
            >
              &larr; Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
