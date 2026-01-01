import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPasswordPage from './page';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

const { mockPush, mockApiRequest, mockSearchParamsGet, mockToast } = vi.hoisted(() => {
  const toastObj = {
    show: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  };
  return {
    mockPush: vi.fn(),
    mockApiRequest: vi.fn(),
    mockSearchParamsGet: vi.fn(() => null as string | null),
    mockToast: toastObj,
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockSearchParamsGet,
  }),
}));

vi.mock('@/lib/api', () => ({
  apiRequest: mockApiRequest,
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => mockToast,
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsGet.mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders invalid link message when no token', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByRole('heading', { name: 'Invalid Link' })).toBeInTheDocument();
    expect(
      screen.getByText(/This password reset link is invalid or has expired/)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request New Link' })).toBeInTheDocument();
  });

  it('renders reset password form when token is present', () => {
    mockSearchParamsGet.mockReturnValue('valid-token');
    render(<ResetPasswordPage />);
    expect(screen.getByRole('heading', { name: 'Set new password' })).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();
  });

  it('validates password length', async () => {
    mockSearchParamsGet.mockReturnValue('valid-token');
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long.')).toBeInTheDocument();
      expect(mockToast.error).toHaveBeenCalledWith('Password must be at least 8 characters long.');
    });
    expect(mockApiRequest).not.toHaveBeenCalled();
  });

  it('validates passwords match', async () => {
    mockSearchParamsGet.mockReturnValue('valid-token');
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password456' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
      expect(mockToast.error).toHaveBeenCalledWith('Passwords do not match.');
    });
    expect(mockApiRequest).not.toHaveBeenCalled();
  });

  it('shows loading state when submitting', async () => {
    mockSearchParamsGet.mockReturnValue('valid-token');
    let resolvePromise: (value: unknown) => void;
    mockApiRequest.mockImplementation(
      () =>
        new Promise(resolve => {
          resolvePromise = resolve;
        })
    );
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    expect(screen.getByRole('button', { name: 'Resetting...' })).toBeDisabled();

    // Cleanup: resolve the pending promise
    resolvePromise!({ success: true });
  });

  it('submits form and shows success message', async () => {
    mockSearchParamsGet.mockReturnValue('valid-token');
    mockApiRequest.mockResolvedValue({ success: true });
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('/auth/reset-password', {
        method: 'POST',
        body: { token: 'valid-token', newPassword: 'newpassword123' },
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Password Reset!' })).toBeInTheDocument();
      expect(screen.getByText(/Your password has been successfully reset/)).toBeInTheDocument();
    });
  });

  it('redirects to login after success', async () => {
    vi.useFakeTimers();
    mockSearchParamsGet.mockReturnValue('valid-token');
    mockApiRequest.mockResolvedValue({ success: true });
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    // Wait for success state using real timing first
    await vi.waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Password Reset!' })).toBeInTheDocument();
    });

    // Now advance the fake timer for redirect
    vi.advanceTimersByTime(3000);

    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('displays error on failed reset', async () => {
    mockSearchParamsGet.mockReturnValue('valid-token');
    mockApiRequest.mockRejectedValue(new Error('Token expired'));
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() => {
      expect(
        screen.getByText('Failed to reset password. The link may have expired.')
      ).toBeInTheDocument();
      expect(mockToast.error).toHaveBeenCalledWith(
        'Failed to reset password. The link may have expired.'
      );
    });
  });

  it('shows go to login link on success', async () => {
    mockSearchParamsGet.mockReturnValue('valid-token');
    mockApiRequest.mockResolvedValue({ success: true });
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Go to Login Now' })).toBeInTheDocument();
    });
  });
});
