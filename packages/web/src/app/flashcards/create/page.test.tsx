import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateFlashcardPage from './page';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const { mockPush, mockUseAuth, mockApiRequest, mockCreateCustom, mockToast } = vi.hoisted(() => {
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
    mockCreateCustom: vi.fn(),
    mockToast: toastObj,
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/flashcards/create',
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
  flashcardApi: {
    createCustom: mockCreateCustom,
  },
}));

describe('CreateFlashcardPage', () => {
  const mockDomains = [
    { id: 'd1', name: 'People' },
    { id: 'd2', name: 'Process' },
  ];
  const mockTasks = [{ id: 't1', code: '1.1', name: 'Manage Conflict' }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to auth login if unauthenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(<CreateFlashcardPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login?next=%2Fflashcards%2Fcreate');
    });
  });

  it('shows upgrade message for basic tier users', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { tier: 'free', emailVerified: true },
    });
    mockApiRequest.mockResolvedValue({ success: true, data: { domains: mockDomains } });

    render(<CreateFlashcardPage />);

    await waitFor(() => {
      expect(screen.getByText(/upgrade required/i)).toBeInTheDocument();
    });

    // Form inputs should be disabled
    expect(screen.getByRole('button', { name: /create flashcard/i })).toBeDisabled();
  });

  it('allows pro users to create flashcards', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { tier: 'high-end', emailVerified: true },
    });
    mockApiRequest.mockImplementation((endpoint: string) => {
      if (endpoint === '/domains') {
        return Promise.resolve({ success: true, data: { domains: mockDomains } });
      }
      if (endpoint === '/domains/d1/tasks') {
        return Promise.resolve({ success: true, data: { tasks: mockTasks } });
      }
      return Promise.reject(new Error(`Unexpected endpoint: ${endpoint}`));
    });
    mockCreateCustom.mockResolvedValue({ data: {} });

    render(<CreateFlashcardPage />);

    // Wait for domains to load
    await waitFor(() => {
      expect(screen.getByText('People')).toBeInTheDocument();
    });

    // Select domain
    fireEvent.change(screen.getByRole('combobox', { name: /domain/i }), {
      target: { value: 'd1' },
    });

    // Wait for tasks to load and select task
    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('/domains/d1/tasks');
    });
    await waitFor(() => {
      expect(screen.getByText(/1.1 manage conflict/i)).toBeInTheDocument();
    });
    fireEvent.change(screen.getByRole('combobox', { name: /task/i }), { target: { value: 't1' } });

    // Fill content
    fireEvent.change(screen.getByLabelText(/front/i), { target: { value: 'Question?' } });
    fireEvent.change(screen.getByLabelText(/back/i), { target: { value: 'Answer!' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /create flashcard/i }));

    await waitFor(() => {
      expect(mockCreateCustom).toHaveBeenCalledWith({
        domainId: 'd1',
        taskId: 't1',
        front: 'Question?',
        back: 'Answer!',
      });
      expect(mockPush).toHaveBeenCalledWith('/flashcards');
    });
  });

  it('displays validation error if fields are missing', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { tier: 'high-end', emailVerified: true },
    });
    mockApiRequest.mockResolvedValue({ success: true, data: { domains: mockDomains } });

    render(<CreateFlashcardPage />);
    await waitFor(() => expect(screen.getByText('People')).toBeInTheDocument());

    // Submit empty
    fireEvent.click(screen.getByRole('button', { name: /create flashcard/i }));

    await waitFor(() => {
      expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
    });
    expect(mockCreateCustom).not.toHaveBeenCalled();
  });
});
