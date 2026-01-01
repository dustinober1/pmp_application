import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from './ToastProvider';

// Simple test consumer
function TestConsumer() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success('Success message')}>Show Success</button>
      <button onClick={() => toast.error('Error message')}>Show Error</button>
      <button onClick={() => toast.info('Info message')}>Show Info</button>
    </div>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows success toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('shows error toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows info toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Info'));
    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('auto-dismisses toast after duration', async () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('dismisses toast when clicking dismiss button', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Dismiss notification'));
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('responds to sync-failed custom event', () => {
    render(
      <ToastProvider>
        <div>Content</div>
      </ToastProvider>
    );

    act(() => {
      window.dispatchEvent(new CustomEvent('pmp-sync-failed', { detail: { count: 3 } }));
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Some offline actions failed to sync \(3\)/)).toBeInTheDocument();
  });

  it('handles sync-failed event without count', () => {
    render(
      <ToastProvider>
        <div>Content</div>
      </ToastProvider>
    );

    act(() => {
      window.dispatchEvent(new CustomEvent('pmp-sync-failed', { detail: {} }));
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Some offline actions failed to sync \(1\)/)).toBeInTheDocument();
  });

  it('throws error when useToast is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useToast must be used within a ToastProvider');
    consoleError.mockRestore();
  });
});