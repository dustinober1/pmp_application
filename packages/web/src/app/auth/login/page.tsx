'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ToastProvider';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      const requestedNext = searchParams.get('next');
      const next =
        requestedNext && requestedNext.startsWith('/') && !requestedNext.startsWith('//')
          ? requestedNext
          : '/dashboard';
      router.push(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
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
          <h1 className="text-2xl font-bold text-md-on-surface">Welcome Back</h1>
          <p className="text-md-on-surface-variant mt-2">Sign in to continue your PMP journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-md-error-container text-md-on-error-container text-sm">
              {error}
            </div>
          )}

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
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-md-on-surface-variant">
              <input
                type="checkbox"
                className="rounded border-md-outline text-md-primary focus:ring-md-primary"
              />
              <span>Remember me</span>
            </label>
            <Link href="/auth/forgot-password" className="text-md-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting || isLoading}
            className="btn btn-primary w-full"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-md-on-surface-variant mt-6">
          Don’t have an account?{' '}
          <Link href="/auth/register" className="text-md-primary font-medium hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
