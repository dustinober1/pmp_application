import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PracticeSessionPage from './page';

const mockApiRequest = vi.fn();
const mockPush = vi.fn();

vi.mock('@/lib/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ sessionId: 'session-123' }),
}));

vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: vi.fn(() => ({
    user: { tier: 'high-end' },
    canAccess: true,
    isLoading: false,
  })),
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    show: vi.fn(),
  }),
}));

vi.mock('@/components/FullPageSkeleton', () => ({
  FullPageSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

describe('PracticeSessionPage', () => {
  const mockSession = {
    sessionId: 'session-123',
    questions: [
      {
        id: 'q1',
        questionText: 'What is the critical path?',
        difficulty: 'medium',
        options: [
          { id: 'opt1', text: 'The longest path through a project network' },
          { id: 'opt2', text: 'The shortest path through a project network' },
          { id: 'opt3', text: 'A path with the most resources' },
          { id: 'opt4', text: 'A path with the least risk' },
        ],
        userAnswerId: undefined,
      },
      {
        id: 'q2',
        questionText: 'What is EVM?',
        difficulty: 'hard',
        options: [
          { id: 'opt5', text: 'Earned Value Management' },
          { id: 'opt6', text: 'Enterprise Value Metric' },
          { id: 'opt7', text: 'Expected Value Measurement' },
          { id: 'opt8', text: 'Estimated Value Method' },
        ],
        userAnswerId: undefined,
      },
    ],
    progress: { total: 2, answered: 0 },
  };

  beforeEach(() => {
    cleanup(); // Clean up React DOM between tests
    vi.clearAllMocks();
    mockApiRequest.mockImplementation((url: string) => {
      if (url.includes('/practice/sessions/session-123') && !url.includes('/answers')) {
        return Promise.resolve({ data: mockSession });
      }
      if (url.includes('/answers/')) {
        return Promise.resolve({
          data: {
            result: {
              isCorrect: true,
              explanation: 'The critical path is the longest sequence of activities.',
              correctOptionId: 'opt1',
            },
          },
        });
      }
      if (url.includes('/complete')) {
        return Promise.resolve({ data: { success: true } });
      }
      return Promise.resolve({ data: null });
    });
  });

  it('renders loading skeleton initially', () => {
    render(<PracticeSessionPage />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders question text after loading', async () => {
    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('What is the critical path?')).toBeInTheDocument();
    });
  });

  it('renders question options', async () => {
    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('The longest path through a project network')).toBeInTheDocument();
    });
    expect(screen.getByText('The shortest path through a project network')).toBeInTheDocument();
  });

  it('displays question progress indicator', async () => {
    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('Q1/2')).toBeInTheDocument();
    });
  });

  it('shows difficulty badge', async () => {
    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('medium')).toBeInTheDocument();
    });
  });

  it('selecting an option changes its styling', async () => {
    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('The longest path through a project network')).toBeInTheDocument();
    });

    const option = screen.getByText('The longest path through a project network');
    fireEvent.click(option);

    expect(option.closest('button')?.className).toContain('border-primary-500');
  });

  it('submit answer button appears when option selected', async () => {
    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('The longest path through a project network')).toBeInTheDocument();
    });

    const option = screen.getByText('The longest path through a project network');
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText('Submit Answer')).toBeInTheDocument();
    });
  });

  it('submitting answer shows feedback', async () => {
    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('The longest path through a project network')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('The longest path through a project network'));

    await waitFor(() => {
      expect(screen.getByText('Submit Answer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Submit Answer'));

    await waitFor(() => {
      expect(screen.getByText('✓ Correct')).toBeInTheDocument();
    });
    expect(
      screen.getByText('The critical path is the longest sequence of activities.')
    ).toBeInTheDocument();
  });

  it('shows next question button after answering', async () => {
    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('The longest path through a project network')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('The longest path through a project network'));

    await waitFor(() => {
      expect(screen.getByText('Submit Answer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Submit Answer'));

    await waitFor(() => {
      expect(screen.getByText('Next Question')).toBeInTheDocument();
    });
  });

  it('exit button navigates to practice page', async () => {
    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('← Exit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('← Exit'));
    expect(mockPush).toHaveBeenCalledWith('/practice');
  });

  it('shows session not found when session does not exist', async () => {
    mockApiRequest.mockImplementation(() => {
      return Promise.resolve({ data: null });
    });

    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('Session Not Found')).toBeInTheDocument();
    });
  });

  it('back to practice button works on session not found', async () => {
    mockApiRequest.mockImplementation(() => {
      return Promise.resolve({ data: null });
    });

    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('Back to Practice')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back to Practice'));
    expect(mockPush).toHaveBeenCalledWith('/practice');
  });

  it('shows session complete screen when all questions answered', async () => {
    const completedSession = {
      ...mockSession,
      questions: mockSession.questions.map(q => ({ ...q, userAnswerId: 'opt1' })),
      progress: { total: 2, answered: 2 },
    };

    mockApiRequest.mockImplementation((url: string) => {
      if (url.includes('/practice/sessions/session-123') && !url.includes('/answers')) {
        return Promise.resolve({ data: completedSession });
      }
      return Promise.resolve({ data: null });
    });

    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('Practice Complete!')).toBeInTheDocument();
    });
  });

  it('session complete screen has back to overview button', async () => {
    const completedSession = {
      ...mockSession,
      questions: mockSession.questions.map(q => ({ ...q, userAnswerId: 'opt1' })),
      progress: { total: 2, answered: 2 },
    };

    mockApiRequest.mockImplementation((url: string) => {
      if (url.includes('/practice/sessions/session-123') && !url.includes('/answers')) {
        return Promise.resolve({ data: completedSession });
      }
      return Promise.resolve({ data: null });
    });

    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('Back to Overview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back to Overview'));
    expect(mockPush).toHaveBeenCalledWith('/practice');
  });

  it('session complete screen has go to dashboard button', async () => {
    const completedSession = {
      ...mockSession,
      questions: mockSession.questions.map(q => ({ ...q, userAnswerId: 'opt1' })),
      progress: { total: 2, answered: 2 },
    };

    mockApiRequest.mockImplementation((url: string) => {
      if (url.includes('/practice/sessions/session-123') && !url.includes('/answers')) {
        return Promise.resolve({ data: completedSession });
      }
      return Promise.resolve({ data: null });
    });

    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Go to Dashboard'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('displays progress bar', async () => {
    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('What is the critical path?')).toBeInTheDocument();
    });

    // Progress bar should exist
    const progressBar = document.querySelector('.bg-primary-600');
    expect(progressBar).toBeInTheDocument();
  });

  it('shows finish session button on last question', async () => {
    // Start at first question, answer it, then navigate to second (last) question
    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('The longest path through a project network')).toBeInTheDocument();
    });

    // Select and submit first question
    fireEvent.click(screen.getByText('The longest path through a project network'));

    await waitFor(() => {
      expect(screen.getByText('Submit Answer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Submit Answer'));

    await waitFor(() => {
      expect(screen.getByText('Next Question')).toBeInTheDocument();
    });

    // Navigate to next (last) question
    fireEvent.click(screen.getByText('Next Question'));

    await waitFor(() => {
      expect(screen.getByText('What is EVM?')).toBeInTheDocument();
    });

    // Select and submit last question
    fireEvent.click(screen.getByText('Earned Value Management'));

    await waitFor(() => {
      expect(screen.getByText('Submit Answer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Submit Answer'));

    await waitFor(() => {
      expect(screen.getByText('Finish Session')).toBeInTheDocument();
    });
  });

  it('options are disabled after submitting answer', async () => {
    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('The longest path through a project network')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('The longest path through a project network'));

    await waitFor(() => {
      expect(screen.getByText('Submit Answer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Submit Answer'));

    await waitFor(() => {
      expect(screen.getByText('✓ Correct')).toBeInTheDocument();
    });

    // Options should be disabled after feedback
    const option = screen.getByText('The shortest path through a project network');
    expect(option.closest('button')).toBeDisabled();
  });

  it('shows incorrect feedback for wrong answer', async () => {
    mockApiRequest.mockImplementation((url: string) => {
      if (url.includes('/practice/sessions/session-123') && !url.includes('/answers')) {
        return Promise.resolve({ data: mockSession });
      }
      if (url.includes('/answers/')) {
        return Promise.resolve({
          data: {
            result: {
              isCorrect: false,
              explanation: 'The critical path is the longest sequence of activities.',
              correctOptionId: 'opt1',
            },
          },
        });
      }
      return Promise.resolve({ data: null });
    });

    render(<PracticeSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('The shortest path through a project network')).toBeInTheDocument();
    });

    // Select wrong answer
    fireEvent.click(screen.getByText('The shortest path through a project network'));

    await waitFor(() => {
      expect(screen.getByText('Submit Answer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Submit Answer'));

    await waitFor(() => {
      expect(screen.getByText('✗ Incorrect')).toBeInTheDocument();
    });
  });
});
