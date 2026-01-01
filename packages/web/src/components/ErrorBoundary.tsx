'use client';

import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error) {
    console.error('[ErrorBoundary] Unhandled error:', error);
  }

  private reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  override render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6">
            Please try again. If the problem persists, refresh the page.
          </p>
          <div className="flex justify-center gap-3">
            <button type="button" onClick={this.reset} className="btn btn-primary">
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }
}
