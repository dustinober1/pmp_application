import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/utils';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/login', state: null }),
    };
});

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form with email and password fields', () => {
        render(<LoginPage />, { authValue: { isLoading: false } });

        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders welcome message and features', () => {
        render(<LoginPage />, { authValue: { isLoading: false } });

        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByText(/sign in to continue/i)).toBeInTheDocument();
        expect(screen.getByText('Start Your PMP Journey')).toBeInTheDocument();
    });

    it('displays loading state when auth is loading', () => {
        render(<LoginPage />, { authValue: { isLoading: true } });

        // The spinner should be visible
        expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument();
    });

    it('shows link to registration page', () => {
        render(<LoginPage />, { authValue: { isLoading: false } });

        const registerLink = screen.getByRole('link', { name: /create one/i });
        expect(registerLink).toBeInTheDocument();
        expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('updates email field on user input', async () => {
        const user = userEvent.setup();
        render(<LoginPage />, { authValue: { isLoading: false } });

        const emailInput = screen.getByLabelText(/email address/i);
        await user.type(emailInput, 'test@example.com');

        expect(emailInput).toHaveValue('test@example.com');
    });

    it('updates password field on user input', async () => {
        const user = userEvent.setup();
        render(<LoginPage />, { authValue: { isLoading: false } });

        const passwordInput = screen.getByLabelText(/password/i);
        await user.type(passwordInput, 'password123');

        expect(passwordInput).toHaveValue('password123');
    });

    it('calls login function on form submission', async () => {
        const mockLogin = vi.fn().mockResolvedValue({});
        const user = userEvent.setup();

        render(<LoginPage />, {
            authValue: {
                isLoading: false,
                login: mockLogin
            }
        });

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });
    });

    it('displays error message on login failure', async () => {
        const mockLogin = vi.fn().mockRejectedValue({
            response: { data: { error: 'Invalid credentials' } }
        });
        const user = userEvent.setup();

        render(<LoginPage />, {
            authValue: {
                isLoading: false,
                login: mockLogin
            }
        });

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'wrongpassword');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    it('disables submit button while submitting', async () => {
        const mockLogin = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        const user = userEvent.setup();

        render(<LoginPage />, {
            authValue: {
                isLoading: false,
                login: mockLogin
            }
        });

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);

        // Button should show loading state
        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });

    it('displays all PMP features in the sidebar', () => {
        render(<LoginPage />, { authValue: { isLoading: false } });

        expect(screen.getByText(/995\+ practice questions/i)).toBeInTheDocument();
        expect(screen.getByText(/domain-specific flashcards/i)).toBeInTheDocument();
        expect(screen.getByText(/progress tracking/i)).toBeInTheDocument();
        expect(screen.getByText(/detailed explanations/i)).toBeInTheDocument();
    });
});
