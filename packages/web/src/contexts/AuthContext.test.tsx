import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the api module
vi.mock('@/lib/api', () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from '@/lib/api';

const mockedApiRequest = vi.mocked(apiRequest);

// Test component that uses useAuth
function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{auth.isLoading.toString()}</div>
      <div data-testid="authenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="user">{auth.user ? auth.user.name : 'null'}</div>
      <button onClick={() => auth.login('test@example.com', 'password')}>Login</button>
      <button onClick={() => auth.register('test@example.com', 'password', 'Test')}>
        Register
      </button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.refreshToken()}>Refresh</button>
      <button onClick={() => auth.refreshUser()}>RefreshUser</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error when useAuth is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });

  it('starts with loading state and hydrates from API', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      success: true,
      data: {
        user: { id: '1', name: 'Test User', email: 'test@example.com', emailVerified: true },
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Initially loading
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // After hydration
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });
  });

  it('sets unauthenticated state when hydration fails', async () => {
    mockedApiRequest.mockRejectedValueOnce(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  it('login updates auth state', async () => {
    mockedApiRequest
      .mockResolvedValueOnce({ success: true, data: { user: null } }) // hydrate
      .mockResolvedValueOnce({
        success: true,
        data: { user: { id: '1', name: 'Logged In User', email: 'test@example.com' } },
      }); // login

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByRole('button', { name: 'Login' }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('Logged In User');
    });

    expect(mockedApiRequest).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'test@example.com', password: 'password' },
    });
  });

  it('register updates auth state', async () => {
    mockedApiRequest
      .mockResolvedValueOnce({ success: true, data: { user: null } }) // hydrate
      .mockResolvedValueOnce({
        success: true,
        data: { user: { id: '1', name: 'New User', email: 'test@example.com' } },
      }); // register

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByRole('button', { name: 'Register' }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('New User');
    });

    expect(mockedApiRequest).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: { email: 'test@example.com', password: 'password', name: 'Test' },
    });
  });

  it('logout clears auth state and calls API', async () => {
    mockedApiRequest
      .mockResolvedValueOnce({
        success: true,
        data: { user: { id: '1', name: 'User', email: 'test@example.com' } },
      }) // hydrate
      .mockResolvedValueOnce({ success: true }); // logout

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    await act(async () => {
      screen.getByRole('button', { name: 'Logout' }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    expect(mockedApiRequest).toHaveBeenCalledWith('/auth/logout', { method: 'POST' });
  });

  it('logout clears state even if API call fails', async () => {
    mockedApiRequest.mockReset();
    mockedApiRequest
      .mockResolvedValueOnce({
        success: true,
        data: { user: { id: '1', name: 'User', email: 'test@example.com' } },
      }) // hydrate
      .mockResolvedValueOnce({ success: false }); // logout returns error but doesn't throw

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    await act(async () => {
      screen.getByRole('button', { name: 'Logout' }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('refreshToken re-hydrates on success', async () => {
    mockedApiRequest
      .mockResolvedValueOnce({ success: true, data: { user: null } }) // initial hydrate
      .mockResolvedValueOnce({ success: true }) // refresh
      .mockResolvedValueOnce({
        success: true,
        data: { user: { id: '1', name: 'Refreshed User', email: 'test@example.com' } },
      }); // hydrate after refresh

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByRole('button', { name: 'Refresh' }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Refreshed User');
    });

    expect(mockedApiRequest).toHaveBeenCalledWith('/auth/refresh', { method: 'POST' });
  });

  it('refreshToken logs out on failure', async () => {
    mockedApiRequest
      .mockResolvedValueOnce({
        success: true,
        data: { user: { id: '1', name: 'User', email: 'test@example.com' } },
      }) // hydrate
      .mockRejectedValueOnce(new Error('Refresh failed')) // refresh fails
      .mockResolvedValueOnce({ success: true }); // logout

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    await act(async () => {
      screen.getByRole('button', { name: 'Refresh' }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('refreshUser re-fetches user data', async () => {
    mockedApiRequest
      .mockResolvedValueOnce({
        success: true,
        data: { user: { id: '1', name: 'Original', email: 'test@example.com' } },
      }) // initial hydrate
      .mockResolvedValueOnce({
        success: true,
        data: { user: { id: '1', name: 'Updated', email: 'test@example.com' } },
      }); // refreshUser

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Original');
    });

    await act(async () => {
      screen.getByRole('button', { name: 'RefreshUser' }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Updated');
    });
  });
});
