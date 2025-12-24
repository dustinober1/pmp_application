import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/utils';
import ProtectedRoute from './ProtectedRoute';

// Mock useLocation
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLocation: () => ({ pathname: '/dashboard', state: null }),
    };
});

describe('ProtectedRoute', () => {
    it('shows loading state when auth is loading', () => {
        render(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>,
            { authValue: { isLoading: true, isAuthenticated: false } }
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('renders children when user is authenticated', () => {
        render(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>,
            {
                authValue: {
                    isAuthenticated: true,
                    isLoading: false,
                    user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'USER' }
                }
            }
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('renders children when admin user accesses admin route', () => {
        render(
            <ProtectedRoute requireAdmin>
                <div>Admin Content</div>
            </ProtectedRoute>,
            {
                authValue: {
                    isAuthenticated: true,
                    isLoading: false,
                    user: { id: '1', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'ADMIN' }
                }
            }
        );

        expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('redirects non-admin users from admin routes', () => {
        render(
            <ProtectedRoute requireAdmin>
                <div>Admin Content</div>
            </ProtectedRoute>,
            {
                authValue: {
                    isAuthenticated: true,
                    isLoading: false,
                    user: { id: '1', email: 'user@example.com', firstName: 'Regular', lastName: 'User', role: 'USER' }
                }
            }
        );

        // Navigate component will redirect, so content should not be visible
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
});
