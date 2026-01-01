'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ToastProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);

    try {
      await register(email, password, name);
      router.push('/auth/verify-email');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Organic Blur Shapes */}
      <div className="blur-shape bg-md-primary w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="blur-shape bg-md-tertiary w-96 h-96 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>

      <div className="card w-full max-w-md animate-slideUp relative z-10 bg-md-surface-container">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-md-primary flex items-center justify-center">
              <span className="text-md-on-primary font-bold" aria-hidden="true">
                PM
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-md-on-surface">Create Your Account</h1>
          <p className="text-md-on-surface-variant mt-2">
            Start your PMP certification journey today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-md-error-container text-md-on-error-container text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1 text-md-on-surface-variant"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1 text-md-on-surface-variant"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1 text-md-on-surface-variant"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              minLength={8}
            />
            <p className="text-xs text-md-on-surface-variant mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-1 text-md-on-surface-variant"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-start gap-2 text-sm text-md-on-surface-variant">
            <input
              type="checkbox"
              className="rounded border-md-outline mt-1 text-md-primary focus:ring-md-primary"
              required
            />
            <span>
              I agree to the{' '}
              <Link href="/terms" className="text-md-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-md-primary hover:underline">
                Privacy Policy
              </Link>
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting || isLoading}
            className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating account...' : isLoading ? 'Loading...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-md-on-surface-variant mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-md-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
