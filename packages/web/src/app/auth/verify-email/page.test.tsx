import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerifyEmailPage from './page';
import { vi } from 'vitest';

const {
  mockApiRequest,
  mockSearchParamsGet,
  mockToastError,
  mockToastSuccess,
  mockUser,
  mockLogout,
  mockRefreshUser,
} = vi.hoisted(() => {
  return {
    mockApiRequest: vi.fn(),
    mockSearchParamsGet: vi.fn(() => null as string | null),
    mockToastError: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockUser: { current: null as { id: string; email: string } | null },
    mockLogout: vi.fn(),
    mockRefreshUser: vi.fn(),
  };
});

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockSearchParamsGet,
  }),
}));

vi.mock('@/lib/api', () => ({
  apiRequest: mockApiRequest,
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => ({
    show: vi.fn(),
    success: mockToastSuccess,
    info: vi.fn(),
    error: mockToastError,
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser.current,
    logout: mockLogout,
    refreshUser: mockRefreshUser,
  }),
}));

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsGet.mockReturnValue(null);
    mockUser.current = null;
  });

  describe('awaiting state (no token)', () => {
    it('renders verify email awaiting state', () => {
      render(<VerifyEmailPage />);
      expect(screen.getByRole('heading', { name: 'Verify Your Email' })).toBeInTheDocument();
      expect(screen.getByText(/Check your inbox for the verification link/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Resend Verification Email' })).toBeInTheDocument();
    });

    it('shows sign in link when user is not logged in', () => {
      render(<VerifyEmailPage />);
      expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    });

    it('shows log out button when user is logged in', () => {
      mockUser.current = { id: '1', email: 'test@example.com' };
      render(<VerifyEmailPage />);
      expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    });

    it('calls logout when log out button is clicked', async () => {
      mockUser.current = { id: '1', email: 'test@example.com' };
      render(<VerifyEmailPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });

    it('shows error when trying to resend without being logged in', async () => {
      render(<VerifyEmailPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Resend Verification Email' }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Please sign in to resend verification email.');
      });
    });

    it('resends verification email when logged in', async () => {
      mockUser.current = { id: '1', email: 'test@example.com' };
      mockApiRequest.mockResolvedValue({ success: true });
      render(<VerifyEmailPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Resend Verification Email' }));

      expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('/auth/resend-verification', {
          method: 'POST',
        });
        expect(mockToastSuccess).toHaveBeenCalledWith(
          'Verification email sent. Please check your inbox.'
        );
      });
    });

    it('shows error when resend fails', async () => {
      mockUser.current = { id: '1', email: 'test@example.com' };
      mockApiRequest.mockRejectedValue(new Error('Rate limited'));
      render(<VerifyEmailPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Resend Verification Email' }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Rate limited');
      });
    });
  });

  describe('verifying state (with token)', () => {
    it('shows verifying state when token is present', () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'token') return 'valid-token';
        return null;
      });
      mockApiRequest.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      render(<VerifyEmailPage />);

      expect(screen.getByRole('heading', { name: 'Verifying Email...' })).toBeInTheDocument();
      expect(
        screen.getByText('Please wait while we verify your email address.')
      ).toBeInTheDocument();
    });

    it('shows success state after verification', async () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'token') return 'valid-token';
        return null;
      });
      mockApiRequest.mockResolvedValue({ success: true });
      mockRefreshUser.mockResolvedValue(undefined);
      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('/auth/verify-email', {
          method: 'POST',
          body: { token: 'valid-token' },
        });
      });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Email Verified!' })).toBeInTheDocument();
        expect(
          screen.getByText(/Your email address has been successfully verified/)
        ).toBeInTheDocument();
      });

      expect(mockRefreshUser).toHaveBeenCalled();
    });

    it('shows continue button with default dashboard destination', async () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'token') return 'valid-token';
        return null;
      });
      mockApiRequest.mockResolvedValue({ success: true });
      mockRefreshUser.mockResolvedValue(undefined);
      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Email Verified!' })).toBeInTheDocument();
      });

      const continueLink = screen.getByRole('link', { name: 'Continue' });
      expect(continueLink).toHaveAttribute('href', '/dashboard');
    });

    it('shows continue button with custom next destination', async () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'token') return 'valid-token';
        if (key === 'next') return '/study';
        return null;
      });
      mockApiRequest.mockResolvedValue({ success: true });
      mockRefreshUser.mockResolvedValue(undefined);
      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Email Verified!' })).toBeInTheDocument();
      });

      const continueLink = screen.getByRole('link', { name: 'Continue' });
      expect(continueLink).toHaveAttribute('href', '/study');
    });

    it('shows error state when verification fails', async () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'token') return 'invalid-token';
        return null;
      });
      mockApiRequest.mockRejectedValue(new Error('Invalid token'));
      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Verification Failed' })).toBeInTheDocument();
        expect(screen.getByText('Invalid token')).toBeInTheDocument();
      });
    });

    it('shows resend button in error state', async () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'token') return 'invalid-token';
        return null;
      });
      mockApiRequest.mockRejectedValue(new Error('Invalid token'));
      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Resend Verification Email' })
        ).toBeInTheDocument();
      });
    });

    it('shows sign in link in error state when not logged in', async () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'token') return 'invalid-token';
        return null;
      });
      mockApiRequest.mockRejectedValue(new Error('Invalid token'));
      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
      });
    });

    it('shows back link in error state when logged in', async () => {
      mockUser.current = { id: '1', email: 'test@example.com' };
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'token') return 'invalid-token';
        return null;
      });
      mockApiRequest.mockRejectedValue(new Error('Invalid token'));
      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Back' })).toBeInTheDocument();
      });
    });
  });

  describe('security: next parameter validation', () => {
    it('ignores next parameter with external URL', async () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'token') return 'valid-token';
        if (key === 'next') return 'https://evil.com';
        return null;
      });
      mockApiRequest.mockResolvedValue({ success: true });
      mockRefreshUser.mockResolvedValue(undefined);
      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Email Verified!' })).toBeInTheDocument();
      });

      const continueLink = screen.getByRole('link', { name: 'Continue' });
      expect(continueLink).toHaveAttribute('href', '/dashboard');
    });

    it('ignores next parameter with protocol-relative URL', async () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'token') return 'valid-token';
        if (key === 'next') return '//evil.com';
        return null;
      });
      mockApiRequest.mockResolvedValue({ success: true });
      mockRefreshUser.mockResolvedValue(undefined);
      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Email Verified!' })).toBeInTheDocument();
      });

      const continueLink = screen.getByRole('link', { name: 'Continue' });
      expect(continueLink).toHaveAttribute('href', '/dashboard');
    });
  });
});
