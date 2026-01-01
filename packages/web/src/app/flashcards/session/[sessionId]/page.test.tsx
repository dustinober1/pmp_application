import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FlashcardSessionPage from './page';
import { vi } from 'vitest';

// Mocks
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
  usePathname: () => '/flashcards/session/session-123',
  useParams: () => ({
    sessionId: 'session-123',
  }),
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

vi.mock('@/lib/api', () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

describe('FlashcardSessionPage', () => {
  const mockCards = [
    { id: '1', front: 'Question 1', back: 'Answer 1' },
    { id: '2', front: 'Question 2', back: 'Answer 2' },
  ];

  const mockSessionData = {
    sessionId: 'session-123',
    cards: mockCards,
    progress: {
      total: 2,
      answered: 0,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders session data and flips card', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', emailVerified: true },
      isAuthenticated: true,
      isLoading: false,
    });
    mockApiRequest.mockResolvedValue({ success: true, data: mockSessionData });

    render(<FlashcardSessionPage />);

    await waitFor(() => {
      // Front of first card
      expect(screen.getByText('Question 1')).toBeInTheDocument();
      // Progress
      expect(screen.getByText('Card 1 of 2')).toBeInTheDocument();
    });

    const flipButton = screen.getByRole('button', { name: /show answer/i });
    fireEvent.click(flipButton);

    expect(screen.getByText('Answer 1')).toBeInTheDocument();

    // Rating buttons should appear
    expect(screen.getByRole('button', { name: /easy/i })).toBeInTheDocument();
  });

  it('submits rating and advances to next card', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', emailVerified: true },
      isAuthenticated: true,
      isLoading: false,
    });
    mockApiRequest.mockResolvedValue({ success: true, data: mockSessionData });

    render(<FlashcardSessionPage />);

    // Wait for load
    await waitFor(() => expect(screen.getByText('Question 1')).toBeInTheDocument());

    // Flip
    fireEvent.click(screen.getByRole('button', { name: /show answer/i }));

    // Rate "Easy"
    fireEvent.click(screen.getByRole('button', { name: /easy/i }));

    await waitFor(() => {
      // Assert API call for rating
      expect(mockApiRequest).toHaveBeenCalledWith(
        '/flashcards/sessions/session-123/responses/1',
        expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining({ rating: 'know_it' }),
        })
      );
    });

    // Should verify next card appears
    await waitFor(() => {
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });
  });

  it('completes session after last card', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', emailVerified: true },
      isAuthenticated: true,
      isLoading: false,
    });
    mockApiRequest.mockImplementation(url => {
      if (url.includes('/sessions/session-123/complete')) {
        return Promise.resolve({ success: true, data: {} });
      }
      if (url.includes('/sessions/session-123/responses')) {
        return Promise.resolve({ success: true, data: {} });
      }
      return Promise.resolve({ success: true, data: mockSessionData });
    });

    render(<FlashcardSessionPage />);

    // Card 1
    await waitFor(() => expect(screen.getByText('Question 1')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /show answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /easy/i }));

    // Card 2
    await waitFor(() => expect(screen.getByText('Question 2')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /show answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /easy/i }));

    await waitFor(() => {
      expect(screen.getByText('Session Complete!')).toBeInTheDocument();
    });

    // Check completion API call
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/flashcards/sessions/session-123/complete',
      expect.objectContaining({ method: 'POST' })
    );

    // Navigation buttons
    expect(screen.getByRole('button', { name: /back to overview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();
  });
});
