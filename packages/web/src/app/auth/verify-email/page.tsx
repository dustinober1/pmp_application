'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiRequest } from '../../../lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Missing token.');
        return;
      }

      try {
        await apiRequest('/auth/verify-email', {
          method: 'POST',
          body: { token },
        });
        setStatus('success');
      } catch (error: any) {
        console.error('Email verification failed', error);
        setStatus('error');
        setMessage(error.message || 'Verification failed. The link may have expired.');
      }
    }

    verify();
  }, [token]);

  return (
    <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl border border-gray-700 text-center shadow-xl">
      {status === 'verifying' && (
        <>
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verifying Email...</h2>
          <p className="text-gray-400">Please wait while we verify your email address.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
          <p className="text-gray-400 mb-6">
            Your email address has been successfully verified. You can now access all features of
            your account.
          </p>
          <Link
            href="/dashboard"
            className="block w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition shadow-lg"
          >
            Continue to Dashboard
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
          <p className="text-red-300 mb-6 bg-red-900/20 p-3 rounded-lg border border-red-800/50">
            {message}
          </p>
          <div className="space-y-3">
            <Link
              href="/auth/forgot-password" // Often verification links expire, so maybe request new one? Or contact support
              className="block w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
            >
              Resend Verification Email
            </Link>
            <Link
              href="/dashboard"
              className="block w-full text-sm text-gray-400 hover:text-white transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
