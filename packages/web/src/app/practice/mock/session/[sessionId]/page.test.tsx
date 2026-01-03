import React from 'react';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockExamSessionPage from './page';

const { mockPush, mockApiRequest, mockToast } = vi.hoisted(() => {
  const toastObj = {
    show: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  };
  return {
    mockPush: vi.fn(),
    mockApiRequest: vi.fn(),
    mockToast: toastObj,
  };
});

vi.mock('@/lib/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ sessionId: 'mock-session-123' }),
}));

vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: vi.fn(() => ({
    user: { tier: 'pro' },
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

describe('MockExamSessionPage', () => {
  const mockSession = {
    sessionId: 'mock-session-123',
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
    timeRemainingMs: 150000, // 2.5 minutes
    timeLimitMs: 300000, // 5 minutes total
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockApiRequest.mockImplementation((url: string) => {
      if (url.includes('/practice/sessions/mock-session-123') && !url.includes('/answers')) {
        return Promise.resolve({ data: mockSession });
      }
      if (url.includes('/answers/')) {
        return Promise.resolve({ data: { success: true } });
      }
      if (url.includes('/complete')) {
        return Promise.resolve({ data: { success: true } });
      }
      return Promise.resolve({ data: null });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders loading skeleton initially', () => {
    render(<MockExamSessionPage />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders question text after loading', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('What is the critical path?')).toBeInTheDocument();
    });
  });

  it('renders question options', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('The longest path through a project network')).toBeInTheDocument();
    });
    expect(screen.getByText('The shortest path through a project network')).toBeInTheDocument();
  });

  it('displays question count in header', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText(/Question 1/)).toBeInTheDocument();
    });
    expect(screen.getByText(/\/ 2/)).toBeInTheDocument();
  });

  it('displays timer', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('02:30')).toBeInTheDocument();
    });
  });

  it('timer counts down', async () => {
    render(<MockExamSessionPage />);

    // Wait for initial timer display
    await waitFor(() => {
      expect(screen.getByText('02:30')).toBeInTheDocument();
    });

    // Wait for real time to pass (1+ seconds)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    // Verify timer has decreased
    await waitFor(
      () => {
        expect(screen.getByText('02:29')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('selecting an option changes its styling', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('The longest path through a project network')).toBeInTheDocument();
    });

    const option = screen.getByText('The longest path through a project network');
    fireEvent.click(option);

    expect(option.closest('button')?.className).toContain('border-primary-500');
  });

  it('next question button advances to next question', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('What is the critical path?')).toBeInTheDocument();
    });

    // Select an answer
    fireEvent.click(screen.getByText('The longest path through a project network'));

    // Click next
    fireEvent.click(screen.getByText('Next Question'));

    await waitFor(() => {
      expect(screen.getByText('What is EVM?')).toBeInTheDocument();
    });
  });

  it('previous button goes back to previous question', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('What is the critical path?')).toBeInTheDocument();
    });

    // Navigate to question 2
    fireEvent.click(screen.getByText('Next Question'));

    await waitFor(() => {
      expect(screen.getByText('What is EVM?')).toBeInTheDocument();
    });

    // Go back to question 1
    fireEvent.click(screen.getByText('← Previous'));

    await waitFor(() => {
      expect(screen.getByText('What is the critical path?')).toBeInTheDocument();
    });
  });

  it('previous button is disabled on first question', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('What is the critical path?')).toBeInTheDocument();
    });

    const prevButton = screen.getByText('← Previous');
    expect(prevButton).toBeDisabled();
  });

  it('review all button shows review screen', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('Review All')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Review All'));

    await waitFor(() => {
      expect(screen.getByText('Review Your Answers')).toBeInTheDocument();
    });
  });

  it('review screen shows question numbers', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('Review All')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Review All'));

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('clicking question in review jumps to that question', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('Review All')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Review All'));

    await waitFor(() => {
      expect(screen.getByText('Review Your Answers')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('2'));

    await waitFor(() => {
      expect(screen.getByText('What is EVM?')).toBeInTheDocument();
    });
  });

  it('return to exam button closes review screen', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('Review All')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Review All'));

    await waitFor(() => {
      expect(screen.getByText('Return to Exam')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Return to Exam'));

    await waitFor(() => {
      expect(screen.getByText('What is the critical path?')).toBeInTheDocument();
    });
  });

  it('submit exam button exists in review screen', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('Review All')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Review All'));

    await waitFor(() => {
      expect(screen.getByText('Submit Exam')).toBeInTheDocument();
    });
  });

  it('shows review exam on last question', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('What is the critical path?')).toBeInTheDocument();
    });

    // Navigate to last question
    fireEvent.click(screen.getByText('Next Question'));

    await waitFor(() => {
      expect(screen.getByText('Review Exam')).toBeInTheDocument();
    });
  });

  it('shows session not found when session does not exist', async () => {
    mockApiRequest.mockImplementation(() => {
      return Promise.resolve({ data: null });
    });

    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('Session not found.')).toBeInTheDocument();
    });
  });

  it('back link works on session not found', async () => {
    mockApiRequest.mockImplementation(() => {
      return Promise.resolve({ data: null });
    });

    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back'));
    expect(mockPush).toHaveBeenCalledWith('/practice');
  });

  it('flag for review button is present', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('Flag for Review')).toBeInTheDocument();
    });
  });

  it('side navigation shows question numbers', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('What is the critical path?')).toBeInTheDocument();
    });

    // Side nav buttons with numbers
    const buttons = screen.getAllByRole('button');
    const sideNavButton = buttons.find(
      b => b.textContent === '1' && b.className.includes('aspect-square')
    );
    expect(sideNavButton).toBeDefined();
  });

  it('answered questions are highlighted in side nav', async () => {
    const sessionWithAnswer = {
      ...mockSession,
      questions: [{ ...mockSession.questions[0], userAnswerId: 'opt1' }, mockSession.questions[1]],
      progress: { total: 2, answered: 1 },
    };

    mockApiRequest.mockImplementation((url: string) => {
      if (url.includes('/practice/sessions/mock-session-123') && !url.includes('/answers')) {
        return Promise.resolve({ data: sessionWithAnswer });
      }
      return Promise.resolve({ data: null });
    });

    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('What is the critical path?')).toBeInTheDocument();
    });

    // The first question button in side nav should have answered styling
    const buttons = screen.getAllByRole('button');
    const answeredButton = buttons.find(
      b => b.textContent === '1' && b.className.includes('bg-primary-600')
    );
    expect(answeredButton).toBeDefined();
  });

  it('progress bar shows correct percentage', async () => {
    const sessionWithAnswer = {
      ...mockSession,
      questions: [{ ...mockSession.questions[0], userAnswerId: 'opt1' }, mockSession.questions[1]],
      progress: { total: 2, answered: 1 },
    };

    mockApiRequest.mockImplementation((url: string) => {
      if (url.includes('/practice/sessions/mock-session-123') && !url.includes('/answers')) {
        return Promise.resolve({ data: sessionWithAnswer });
      }
      return Promise.resolve({ data: null });
    });

    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('What is the critical path?')).toBeInTheDocument();
    });

    // Progress should be 50% (1 of 2 answered)
    const progressBar = document.querySelector('.bg-primary-600[style*="width"]');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar?.getAttribute('style')).toContain('50%');
  });

  it('clicking side nav question number changes current question', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('What is the critical path?')).toBeInTheDocument();
    });

    // Find the side nav button for question 2
    const buttons = screen.getAllByRole('button');
    const question2Button = buttons.find(
      b => b.textContent === '2' && b.className.includes('aspect-square')
    );

    if (question2Button) {
      fireEvent.click(question2Button);
    }

    await waitFor(() => {
      expect(screen.getByText('What is EVM?')).toBeInTheDocument();
    });
  });

  it('selecting option syncs with backend', async () => {
    render(<MockExamSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('The longest path through a project network')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('The longest path through a project network'));

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.stringContaining('/answers/q1'),
        expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining({
            selectedOptionId: 'opt1',
          }),
        })
      );
    });
  });

  it('uses fallback time when timeRemainingMs not provided', async () => {
    const sessionWithoutTime = {
      ...mockSession,
      timeRemainingMs: undefined,
    };

    mockApiRequest.mockImplementation((url: string) => {
      if (url.includes('/practice/sessions/mock-session-123') && !url.includes('/answers')) {
        return Promise.resolve({ data: sessionWithoutTime });
      }
      return Promise.resolve({ data: null });
    });

    render(<MockExamSessionPage />);

    // Should use fallback of 75 seconds per question * 2 questions = 150 seconds = 2:30
    await waitFor(() => {
      expect(screen.getByText('02:30')).toBeInTheDocument();
    });
  });
});
