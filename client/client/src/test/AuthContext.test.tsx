import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import React, { useState } from 'react';

// Create a fresh QueryClient for each test
const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

// Wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = createTestQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <BrowserRouter>{children}</BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
};

describe('Component rendering', () => {
    it('should render test wrapper without errors', () => {
        render(
            <TestWrapper>
                <div>Test content</div>
            </TestWrapper>
        );

        expect(screen.getByText('Test content')).toBeInTheDocument();
    });
});

describe('Error handling UI', () => {
    it('should display error messages correctly', async () => {
        const ErrorComponent = () => {
            const [error, setError] = useState<string | null>(null);

            const handleError = () => {
                setError('An error occurred');
            };

            return (
                <div>
                    <button onClick={handleError}>Trigger Error</button>
                    {error && <div role="alert">{error}</div>}
                </div>
            );
        };

        render(<ErrorComponent />);

        fireEvent.click(screen.getByText('Trigger Error'));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('An error occurred');
        });
    });

    it('should handle async errors gracefully', async () => {
        const AsyncErrorComponent = () => {
            const [error, setError] = useState<string | null>(null);
            const [loading, setLoading] = useState(false);

            const handleAsyncAction = async () => {
                setLoading(true);
                try {
                    await new Promise((_, reject) => setTimeout(() => reject(new Error('Network error')), 100));
                } catch (e) {
                    setError('Network error occurred');
                } finally {
                    setLoading(false);
                }
            };

            return (
                <div>
                    <button onClick={handleAsyncAction} disabled={loading}>
                        {loading ? 'Loading...' : 'Fetch Data'}
                    </button>
                    {error && <div role="alert">{error}</div>}
                </div>
            );
        };

        render(<AsyncErrorComponent />);

        fireEvent.click(screen.getByText('Fetch Data'));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Network error occurred');
        });
    });
});

describe('Accessibility', () => {
    it('should have proper ARIA attributes on interactive elements', () => {
        const AccessibleComponent = () => (
            <div>
                <button aria-label="Submit form" type="submit">Submit</button>
                <input aria-label="Email input" type="email" placeholder="Email" />
                <div role="status" aria-live="polite">Status message</div>
            </div>
        );

        render(<AccessibleComponent />);

        expect(screen.getByLabelText('Submit form')).toBeInTheDocument();
        expect(screen.getByLabelText('Email input')).toBeInTheDocument();
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
        const KeyboardComponent = () => {
            const [focused, setFocused] = useState(false);

            return (
                <button
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    data-focused={focused}
                >
                    Focusable Button
                </button>
            );
        };

        render(<KeyboardComponent />);

        const button = screen.getByText('Focusable Button');
        button.focus();

        expect(document.activeElement).toBe(button);
    });
});
