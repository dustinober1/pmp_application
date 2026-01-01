import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FlaggedQuestionsPage from './page';
import { vi } from 'vitest';

const { mockPush, mockUseAuth, mockApiRequest, mockToastError } = vi.hoisted(() => {
  return {
    mockPush: vi.fn(),
    mockUseAuth: vi.fn(),
    mockApiRequest: vi.fn(),
    mockToastError: vi.fn(),
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/practice/flagged',
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => ({
    show: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    error: mockToastError,
  }),
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

describe('FlaggedQuestionsPage', () => {
  const mockQuestions = [
    {
      id: 'q1',
      text: 'Question 1',
      questionText: 'Question 1', // Component uses questionText
      difficulty: 'hard',
      options: [
        { id: 'o1', text: 'Option A', isCorrect: true },
        { id: 'o2', text: 'Option B', isCorrect: false },
      ],
      explanation: 'Explanation 1',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to auth login if unauthenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(<FlaggedQuestionsPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login?next=%2Fpractice%2Fflagged');
    });
  });

  it('displays empty state when no questions flagged', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'u1', emailVerified: true },
    });
    mockApiRequest.mockResolvedValue({ success: true, data: { questions: [] } });

    render(<FlaggedQuestionsPage />);

    await waitFor(() => {
      expect(screen.getByText(/no flagged questions/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/flags are a great way/i)).toBeInTheDocument();
  });

  it('displays list of flagged questions', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'u1', emailVerified: true },
    });
    mockApiRequest.mockResolvedValue({ success: true, data: { questions: mockQuestions } });

    render(<FlaggedQuestionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });
    expect(screen.getByText('hard')).toBeInTheDocument();
  });

  it('allows unflagging a question', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'u1', emailVerified: true },
    });
    mockApiRequest.mockImplementation((endpoint: string, options?: any) => {
      if (endpoint === '/practice/flagged') {
        return Promise.resolve({ success: true, data: { questions: mockQuestions } });
      }
      if (endpoint === '/practice/questions/q1/flag' && options?.method === 'DELETE') {
        return Promise.resolve({ success: true, data: {} });
      }
      return Promise.reject(new Error(`Unexpected request: ${endpoint}`));
    });

    render(<FlaggedQuestionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    const unflagButton = screen.getByTitle('Remove flag');
    fireEvent.click(unflagButton);

    await waitFor(() => {
      expect(screen.queryByText('Question 1')).not.toBeInTheDocument();
    });

    // Should revert to empty state if last one removed
    expect(screen.getByText(/no flagged questions/i)).toBeInTheDocument();
  });
});
