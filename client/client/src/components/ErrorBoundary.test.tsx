import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <div>No error</div>;
};

describe('ErrorBoundary', () => {
    // Suppress console.error for error boundary tests
    const originalError = console.error;
    beforeAll(() => {
        console.error = vi.fn();
    });
    afterAll(() => {
        console.error = originalError;
    });

    it('renders children when no error occurs', () => {
        render(
            <ErrorBoundary>
                <div>Child Content</div>
            </ErrorBoundary>
        );

        expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('renders error UI when an error is thrown', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
        expect(screen.getByText('Please refresh the page or try again later.')).toBeInTheDocument();
    });

    it('renders refresh button when error occurs', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        const refreshButton = screen.getByRole('button', { name: /refresh the page/i });
        expect(refreshButton).toBeInTheDocument();
    });

    it('has proper accessibility attributes in error state', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        const alertContainer = screen.getByRole('alert');
        expect(alertContainer).toBeInTheDocument();
        expect(alertContainer).toHaveAttribute('aria-live', 'assertive');
    });
});
