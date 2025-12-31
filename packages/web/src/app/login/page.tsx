'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
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
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-purple-600 to-indigo-800 opacity-5"></div>

      <div className="card w-full max-w-md animate-slideUp relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">PM</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-[var(--foreground-muted)] mt-2">
            Sign in to continue your PMP journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
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
            <label htmlFor="password" className="block text-sm font-medium mb-1">
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
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-[var(--border)]" />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-[var(--primary)] hover:underline">
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

        <p className="text-center text-sm text-[var(--foreground-muted)] mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-[var(--primary)] font-medium hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
