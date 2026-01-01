import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FlaggedQuestionsPage from './page';
import { vi } from 'vitest';

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
  usePathname: () => '/practice/flagged',
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

    let questionRemoved = false;
    mockApiRequest.mockImplementation((endpoint: string, options?: any) => {
      if (endpoint === '/practice/flagged') {
        // Return empty array after question has been removed
        return Promise.resolve({
          success: true,
          data: { questions: questionRemoved ? [] : mockQuestions },
        });
      }
      if (endpoint.includes('/practice/questions/q1/flag') && options?.method === 'DELETE') {
        questionRemoved = true;
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

    // Wait for the async operation to complete and state to update
    await waitFor(
      () => {
        expect(screen.queryByText('Question 1')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Should revert to empty state if last one removed
    expect(screen.getByText(/no flagged questions/i)).toBeInTheDocument();
  });
});
