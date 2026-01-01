import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import FlashcardsPage from './page';

const mockApiRequest = vi.fn();
const mockPush = vi.fn();

vi.mock('@/lib/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    canAccess: true,
    isLoading: false,
  }),
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    show: vi.fn(),
  }),
}));

vi.mock('@/components/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock('@/components/FullPageSkeleton', () => ({
  FullPageSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

describe('FlashcardsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiRequest.mockResolvedValue({
      data: {
        stats: {
          mastered: 50,
          learning: 30,
          dueForReview: 10,
          totalCards: 100,
        },
        flashcards: Array(5).fill({ id: '1' }),
      },
    });
  });

  it('renders flashcards heading', async () => {
    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Flashcards' })).toBeInTheDocument();
    });
  });

  it('displays flashcard stats', async () => {
    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument(); // Mastered
      expect(screen.getByText('30')).toBeInTheDocument(); // Learning
      expect(screen.getByText('5')).toBeInTheDocument(); // Due today (from flashcards array length)
      expect(screen.getByText('100')).toBeInTheDocument(); // Total
    });
  });

  it('renders stat labels', async () => {
    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mastered')).toBeInTheDocument();
      // Learning appears multiple times, just check one exists
      expect(screen.getAllByText('Learning').length).toBeGreaterThan(0);
      expect(screen.getByText('Due Today')).toBeInTheDocument();
      expect(screen.getByText('Total Cards')).toBeInTheDocument();
    });
  });

  it('renders Review Due Cards section', async () => {
    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Review Due Cards')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start Review' })).toBeInTheDocument();
    });
  });

  it('renders Study Session section', async () => {
    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Study Session')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start Session' })).toBeInTheDocument();
    });
  });

  it('renders Create Custom Card section', async () => {
    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Create Custom Card')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Create Card' })).toHaveAttribute(
        'href',
        '/flashcards/create'
      );
    });
  });

  it('starts review session when clicking Start Review', async () => {
    mockApiRequest
      .mockResolvedValueOnce({
        data: {
          stats: { mastered: 50, learning: 30, dueForReview: 10, totalCards: 100 },
          flashcards: [{ id: '1' }],
        },
      })
      .mockResolvedValueOnce({
        data: { flashcards: [{ id: '1' }] },
      })
      .mockResolvedValueOnce({
        data: { sessionId: 'review-session-123' },
      });

    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Start Review' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Start Review' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/flashcards/session/review-session-123');
    });
  });

  it('starts study session when clicking Start Session', async () => {
    mockApiRequest
      .mockResolvedValueOnce({
        data: {
          stats: { mastered: 50, learning: 30, dueForReview: 10, totalCards: 100 },
          flashcards: [{ id: '1' }],
        },
      })
      .mockResolvedValueOnce({
        data: { flashcards: [{ id: '1' }] },
      })
      .mockResolvedValueOnce({
        data: { sessionId: 'study-session-123' },
      });

    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Start Session' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Start Session' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/flashcards/session/study-session-123');
    });
  });

  it('disables Start Review when no cards due', async () => {
    mockApiRequest.mockResolvedValue({
      data: {
        stats: { mastered: 50, learning: 30, dueForReview: 0, totalCards: 100 },
        flashcards: [],
      },
    });

    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Start Review' })).toBeDisabled();
    });
  });

  it('shows message when no cards due', async () => {
    mockApiRequest.mockResolvedValue({
      data: {
        stats: { mastered: 50, learning: 30, dueForReview: 0, totalCards: 100 },
        flashcards: [],
      },
    });

    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByText(/no cards due right now/i)).toBeInTheDocument();
    });
  });

  it('renders How Spaced Repetition Works section', async () => {
    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByText('How Spaced Repetition Works')).toBeInTheDocument();
      expect(screen.getByText('Know It')).toBeInTheDocument();
      // Learning appears multiple times, just check one exists
      expect(screen.getAllByText('Learning').length).toBeGreaterThan(0);
    });
  });
});
