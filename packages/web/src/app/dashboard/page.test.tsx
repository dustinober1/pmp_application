import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from './page';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const { mockPush, mockUseAuth, mockApiRequest, mockToast } = vi.hoisted(() => {
  const toastObj = {
    show: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  };
  return {
    mockPush: vi.fn(),
    mockUseAuth: vi.fn(),
    mockApiRequest: vi.fn(),
    mockToast: toastObj,
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/dashboard',
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => mockToast,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/components/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('@/lib/api', () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

describe('DashboardPage', () => {
  const mockDashboardData = {
    streak: { currentStreak: 5, longestStreak: 10, lastStudyDate: '2023-01-01' },
    overallProgress: 45,
    domainProgress: [
      {
        domainId: 'd1',
        domainName: 'People',
        domainCode: 'PEO',
        progress: 50,
        questionsAnswered: 20,
        accuracy: 80,
      },
    ],
    recentActivity: [
      {
        id: 'a1',
        type: 'study',
        description: 'Completed a quiz',
        timestamp: '2023-01-02T10:00:00Z',
      },
    ],
    upcomingReviews: [],
    weakAreas: [
      {
        taskId: 't1',
        taskName: 'Manage Conflict',
        domainName: 'People',
        accuracy: 40,
        recommendation: 'Review flashcards',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to auth login if unauthenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login?next=%2Fdashboard');
    });
  });

  it('displays dashboard data when authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'Test User', emailVerified: true },
      isAuthenticated: true,
      isLoading: false,
    });
    mockApiRequest.mockResolvedValue({ success: true, data: { dashboard: mockDashboardData } });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome back, test!/i })).toBeInTheDocument();
      expect(screen.getByText('Manage Conflict')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'Test User', emailVerified: true },
      isAuthenticated: true,
      isLoading: false,
    });
    mockApiRequest.mockRejectedValue(new Error('API Error'));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome back, test!/i })).toBeInTheDocument();
    });

    expect(mockToast.error).toHaveBeenCalled();
  });

  it('renders quick action links', async () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'Test User', emailVerified: true },
      isAuthenticated: true,
      isLoading: false,
    });
    mockApiRequest.mockResolvedValue({ success: true, data: { dashboard: mockDashboardData } });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Continue Studying')).toHaveAttribute('href', '/study');
    });
  });
});
