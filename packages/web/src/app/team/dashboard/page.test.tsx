import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TeamDashboardPage from './page';

const { mockApiRequest, mockPush, mockToast } = vi.hoisted(() => {
  const toastObj = {
    show: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  };
  return {
    mockApiRequest: vi.fn(),
    mockPush: vi.fn(),
    mockToast: toastObj,
  };
});

vi.mock('@/lib/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: vi.fn(() => ({
    user: { id: 'user-1', tier: 'corporate' },
    canAccess: true,
    isLoading: false,
  })),
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => mockToast,
}));

vi.mock('@/components/FullPageSkeleton', () => ({
  FullPageSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

describe('TeamDashboardPage', () => {
  const mockTeam = {
    id: 'team-1',
    name: 'Acme Corp',
    adminId: 'user-1',
  };

  const mockDashboard = {
    teamName: 'Acme Corp',
    totalMembers: 5,
    activeMembers: 4,
    averageProgress: 65,
    averageReadinessScore: 72,
    alerts: [
      { id: 'alert-1', type: 'inactive', message: 'John Doe has been inactive for 7 days' },
      {
        id: 'alert-2',
        type: 'struggling',
        message: 'Jane Smith is struggling with Process domain',
      },
    ],
    memberStats: [
      {
        memberId: 'member-1',
        userId: 'user-2',
        userName: 'John Doe',
        progress: 80,
        lastActiveDate: '2024-01-15T10:30:00Z',
      },
      {
        memberId: 'member-2',
        userId: 'user-3',
        userName: 'Jane Smith',
        progress: 45,
        lastActiveDate: '2024-01-10T14:00:00Z',
      },
      {
        memberId: 'member-3',
        userId: 'user-1',
        userName: 'Admin User',
        progress: 90,
        lastActiveDate: '2024-01-16T09:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error - mock doesn't have correct type signature
    window.confirm = vi.fn(() => true);
    mockApiRequest.mockImplementation((url: string, options?: { method?: string }) => {
      if (url === '/teams' && !options?.method) {
        return Promise.resolve({ data: { teams: [mockTeam] } });
      }
      if (url.includes('/dashboard')) {
        return Promise.resolve({ data: { dashboard: mockDashboard } });
      }
      if (url.includes('/invitations')) {
        return Promise.resolve({ data: { success: true } });
      }
      if (url.includes('/preserve')) {
        return Promise.resolve({ data: { success: true } });
      }
      if (url.includes('/acknowledge')) {
        return Promise.resolve({ data: { success: true } });
      }
      return Promise.resolve({ data: null });
    });
  });

  it('renders loading skeleton initially', () => {
    render(<TeamDashboardPage />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders team name after loading', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });
  });

  it('displays member count', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('displays active member count', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  it('displays average progress', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('65%')).toBeInTheDocument();
    });
  });

  it('displays average readiness score', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('72%')).toBeInTheDocument();
    });
  });

  it('renders alerts section', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
    });
    expect(screen.getByText('John Doe has been inactive for 7 days')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith is struggling with Process domain')).toBeInTheDocument();
  });

  it('dismissing alert removes it from list', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe has been inactive for 7 days')).toBeInTheDocument();
    });

    const dismissButtons = screen.getAllByText('Dismiss');
    fireEvent.click(dismissButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('John Doe has been inactive for 7 days')).not.toBeInTheDocument();
    });
  });

  it('renders team members table', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Team Members')).toBeInTheDocument();
    });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('displays member progress percentages', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('80%')).toBeInTheDocument();
    });
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('renders invite member form', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Invite Member')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Send Invitation')).toBeInTheDocument();
  });

  it('submitting invite form sends invitation', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email Address');
    fireEvent.change(emailInput, { target: { value: 'newuser@company.com' } });

    const submitButton = screen.getByText('Send Invitation');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith(
        '/teams/team-1/invitations',
        expect.objectContaining({
          method: 'POST',
          body: { email: 'newuser@company.com' },
        })
      );
    });
  });

  it('shows success message after successful invitation', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email Address');
    fireEvent.change(emailInput, { target: { value: 'newuser@company.com' } });

    fireEvent.click(screen.getByText('Send Invitation'));

    await waitFor(() => {
      expect(screen.getByText('Invitation sent to newuser@company.com')).toBeInTheDocument();
    });
  });

  it('shows remove button for non-admin members', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByText('Remove');
    // Should have remove buttons for non-admin members (2 of 3)
    expect(removeButtons.length).toBe(2);
  });

  it('clicking remove button calls API to remove member', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith(
        '/teams/team-1/members/user-2/preserve',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('shows license usage information', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('You have used 5 of 10 licenses.')).toBeInTheDocument();
    });
  });

  it('shows no team found when user has no teams', async () => {
    mockApiRequest.mockImplementation((url: string) => {
      if (url === '/teams') {
        return Promise.resolve({ data: { teams: [] } });
      }
      return Promise.resolve({ data: null });
    });

    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('No Team Found')).toBeInTheDocument();
    });
    expect(
      screen.getByText('You do not seem to have a corporate team set up yet.')
    ).toBeInTheDocument();
  });

  it('back to dashboard button works on no team found', async () => {
    mockApiRequest.mockImplementation((url: string) => {
      if (url === '/teams') {
        return Promise.resolve({ data: { teams: [] } });
      }
      return Promise.resolve({ data: null });
    });

    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back to Dashboard'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('renders table headers correctly', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Member')).toBeInTheDocument();
    });
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Last Active')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('displays last active date for members', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('1/15/2024')).toBeInTheDocument();
    });
  });

  it('shows team goals coming soon section', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Team Goals')).toBeInTheDocument();
    });
    expect(screen.getByText('Goals feature coming soon')).toBeInTheDocument();
  });

  it('renders alert type badges', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('inactive')).toBeInTheDocument();
    });
    expect(screen.getByText('struggling')).toBeInTheDocument();
  });

  it('shows sending state during invite submission', async () => {
    // Make the invite API call slow
    mockApiRequest.mockImplementation((url: string, options?: { method?: string }) => {
      if (url === '/teams' && !options?.method) {
        return Promise.resolve({ data: { teams: [mockTeam] } });
      }
      if (url.includes('/dashboard')) {
        return Promise.resolve({ data: { dashboard: mockDashboard } });
      }
      if (url.includes('/invitations')) {
        return new Promise(resolve => setTimeout(() => resolve({ data: { success: true } }), 100));
      }
      return Promise.resolve({ data: null });
    });

    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByText('Send Invitation'));

    expect(screen.getByText('Sending...')).toBeInTheDocument();
  });

  it('shows error message on failed invitation', async () => {
    mockApiRequest.mockImplementation((url: string, options?: { method?: string }) => {
      if (url === '/teams' && !options?.method) {
        return Promise.resolve({ data: { teams: [mockTeam] } });
      }
      if (url.includes('/dashboard')) {
        return Promise.resolve({ data: { dashboard: mockDashboard } });
      }
      if (url.includes('/invitations')) {
        return Promise.reject(new Error('User already exists'));
      }
      return Promise.resolve({ data: null });
    });

    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'existing@company.com' },
    });

    fireEvent.click(screen.getByText('Send Invitation'));

    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });

  it('shows no members message when member list is empty', async () => {
    const emptyDashboard = {
      ...mockDashboard,
      memberStats: [],
      alerts: [],
    };

    mockApiRequest.mockImplementation((url: string, options?: { method?: string }) => {
      if (url === '/teams' && !options?.method) {
        return Promise.resolve({ data: { teams: [mockTeam] } });
      }
      if (url.includes('/dashboard')) {
        return Promise.resolve({ data: { dashboard: emptyDashboard } });
      }
      return Promise.resolve({ data: null });
    });

    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText('No members found. Invite someone to get started!')
      ).toBeInTheDocument();
    });
  });

  it('does not show alerts section when there are no alerts', async () => {
    const noAlertsDashboard = {
      ...mockDashboard,
      alerts: [],
    };

    mockApiRequest.mockImplementation((url: string, options?: { method?: string }) => {
      if (url === '/teams' && !options?.method) {
        return Promise.resolve({ data: { teams: [mockTeam] } });
      }
      if (url.includes('/dashboard')) {
        return Promise.resolve({ data: { dashboard: noAlertsDashboard } });
      }
      return Promise.resolve({ data: null });
    });

    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Team Members')).toBeInTheDocument();
    });

    expect(screen.queryByText('Needs Attention')).not.toBeInTheDocument();
  });

  it('clears email input after successful invitation', async () => {
    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'newuser@company.com' } });

    fireEvent.click(screen.getByText('Send Invitation'));

    await waitFor(() => {
      expect(screen.getByText('Invitation sent to newuser@company.com')).toBeInTheDocument();
    });

    expect(emailInput.value).toBe('');
  });

  it('displays member never active when lastActiveDate is null', async () => {
    const dashboardWithNeverActive = {
      ...mockDashboard,
      memberStats: [
        {
          memberId: 'member-1',
          userId: 'user-2',
          userName: 'New User',
          progress: 0,
          lastActiveDate: null,
        },
      ],
    };

    mockApiRequest.mockImplementation((url: string, options?: { method?: string }) => {
      if (url === '/teams' && !options?.method) {
        return Promise.resolve({ data: { teams: [mockTeam] } });
      }
      if (url.includes('/dashboard')) {
        return Promise.resolve({ data: { dashboard: dashboardWithNeverActive } });
      }
      return Promise.resolve({ data: null });
    });

    render(<TeamDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Never')).toBeInTheDocument();
    });
  });
});
