import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FlaggedQuestionsPage from './page';
import { vi } from 'vitest';

// Mocks
const { mockPush, mockUseAuth, mockGetFlagged, mockUnflagQuestion } = vi.hoisted(() => {
  return {
    mockPush: vi.fn(),
    mockUseAuth: vi.fn(),
    mockGetFlagged: vi.fn(),
    mockUnflagQuestion: vi.fn(),
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
  practiceApi: {
    getFlagged: mockGetFlagged,
    unflagQuestion: mockUnflagQuestion,
    startSession: vi.fn(),
  },
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

  it('redirects to login if unauthenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(<FlaggedQuestionsPage />);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('displays empty state when no questions flagged', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'u1' },
    });
    mockGetFlagged.mockResolvedValue({ data: { questions: [] } });

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
      user: { id: 'u1' },
    });
    mockGetFlagged.mockResolvedValue({ data: { questions: mockQuestions } });

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
      user: { id: 'u1' },
    });
    mockGetFlagged.mockResolvedValue({ data: { questions: mockQuestions } });
    mockUnflagQuestion.mockResolvedValue({ data: {} });

    render(<FlaggedQuestionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    const unflagButton = screen.getByTitle('Remove flag');
    fireEvent.click(unflagButton);

    expect(mockUnflagQuestion).toHaveBeenCalledWith('q1');

    await waitFor(() => {
      expect(screen.queryByText('Question 1')).not.toBeInTheDocument();
    });

    // Should revert to empty state if last one removed
    expect(screen.getByText(/no flagged questions/i)).toBeInTheDocument();
  });
});
