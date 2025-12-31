import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import DashboardPage from './page';
import { vi } from 'vitest';

// Mocks
const { mockPush, mockUseAuth, mockGetDashboard } = vi.hoisted(() => {
    return {
        mockPush: vi.fn(),
        mockUseAuth: vi.fn(),
        mockGetDashboard: vi.fn(),
    };
});

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('@/contexts/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock('@/components/Navbar', () => ({
    Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('@/lib/api', () => ({
    dashboardApi: {
        getDashboard: (...args: any[]) => {
            console.log('PROXY: getDashboard called');
            return mockGetDashboard(...args);
        },
    },
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

    it('redirects to login if unauthenticated', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });

        render(<DashboardPage />);
        expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('displays dashboard data when authenticated', async () => {
        console.log('TEST: Setting up authenticated user');
        mockUseAuth.mockReturnValue({
            user: { name: 'Test User' },
            isAuthenticated: true,
            isLoading: false,
        });
        console.log('TEST: Setting up getDashboard mock');
        mockGetDashboard.mockResolvedValue({ data: { dashboard: mockDashboardData } });

        render(<DashboardPage />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        // Wait for loading to disappear
        await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

        await waitFor(() => {
            expect(screen.getByText('Welcome back, Test! 👋')).toBeInTheDocument();
            expect(screen.getByText('5 🔥')).toBeInTheDocument();
            expect(screen.getByText('Manage Conflict')).toBeInTheDocument();
        });
    });

    it('handles API errors gracefully', async () => {
        mockUseAuth.mockReturnValue({
            user: { name: 'Test User' },
            isAuthenticated: true,
            isLoading: false,
        });
        mockGetDashboard.mockRejectedValue(new Error('API Error'));

        // Console error suppression
        const originalError = console.error;
        console.error = vi.fn();

        render(<DashboardPage />);

        await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

        await waitFor(() => {
            // Should still render partial/empty state or at least not crash
            expect(screen.getByText('Welcome back, Test! 👋')).toBeInTheDocument();
        });

        console.error = originalError;
    });

    it('renders quick action links', async () => {
        mockUseAuth.mockReturnValue({
            user: { name: 'Test User' },
            isAuthenticated: true,
            isLoading: false,
        });
        mockGetDashboard.mockResolvedValue({ data: { dashboard: mockDashboardData } });

        render(<DashboardPage />);

        await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

        await waitFor(() => {
            expect(screen.getByText('Continue Studying')).toHaveAttribute('href', '/study');
        });
    });
});
