import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import StudyPage from './page';

const { mockApiRequest, mockToast } = vi.hoisted(() => {
  const toastObj = {
    show: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  };
  return {
    mockApiRequest: vi.fn(),
    mockToast: toastObj,
  };
});

vi.mock('@/lib/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: vi.fn(() => ({
    canAccess: true,
    isLoading: false,
  })),
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => mockToast,
}));

vi.mock('@/components/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock('@/components/FullPageSkeleton', () => ({
  FullPageSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

describe('StudyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton initially', async () => {
    mockApiRequest.mockImplementation(() => new Promise(() => {}));

    render(<StudyPage />);

    // The loading state is true initially
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders study guide heading after loading', async () => {
    mockApiRequest.mockResolvedValue({
      data: {
        domains: [
          {
            id: '1',
            name: 'People',
            code: 'PEOPLE',
            description: 'Managing and leading teams',
            weightPercentage: 42,
            tasks: [],
          },
        ],
      },
    });

    render(<StudyPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Study Guide' })).toBeInTheDocument();
    });
  });

  it('renders domain cards', async () => {
    mockApiRequest.mockResolvedValue({
      data: {
        domains: [
          {
            id: '1',
            name: 'People',
            code: 'PEOPLE',
            description: 'Managing and leading project teams effectively',
            weightPercentage: 42,
            tasks: [{ id: 't1', code: 'T1.1', name: 'Task 1', description: 'Desc' }],
          },
          {
            id: '2',
            name: 'Process',
            code: 'PROCESS',
            description: 'Technical aspects of project management',
            weightPercentage: 50,
            tasks: [],
          },
        ],
      },
    });

    render(<StudyPage />);

    await waitFor(() => {
      expect(screen.getByText('People')).toBeInTheDocument();
      expect(screen.getByText('Process')).toBeInTheDocument();
    });
  });

  it('shows weight percentage on domain cards', async () => {
    mockApiRequest.mockResolvedValue({
      data: {
        domains: [
          {
            id: '1',
            name: 'People',
            code: 'PEOPLE',
            description: 'Test',
            weightPercentage: 42,
            tasks: [],
          },
        ],
      },
    });

    render(<StudyPage />);

    await waitFor(() => {
      expect(screen.getByText('42%')).toBeInTheDocument();
    });
  });

  it('expands domain to show tasks when clicked', async () => {
    mockApiRequest.mockResolvedValue({
      data: {
        domains: [
          {
            id: '1',
            name: 'People',
            code: 'PEOPLE',
            description: 'Test',
            weightPercentage: 42,
            tasks: [
              { id: 't1', code: 'T1.1', name: 'Build High-Performing Team', description: 'Desc' },
            ],
          },
        ],
      },
    });

    render(<StudyPage />);

    await waitFor(() => {
      expect(screen.getByText('People')).toBeInTheDocument();
    });

    // Click to expand
    fireEvent.click(screen.getByRole('button', { name: /people/i }));

    await waitFor(() => {
      expect(screen.getByText('Build High-Performing Team')).toBeInTheDocument();
      expect(screen.getByText('T1.1')).toBeInTheDocument();
    });
  });

  it('collapses domain when clicked again', async () => {
    mockApiRequest.mockResolvedValue({
      data: {
        domains: [
          {
            id: '1',
            name: 'People',
            code: 'PEOPLE',
            description: 'Test',
            weightPercentage: 42,
            tasks: [{ id: 't1', code: 'T1.1', name: 'Task 1', description: 'Desc' }],
          },
        ],
      },
    });

    render(<StudyPage />);

    await waitFor(() => {
      expect(screen.getByText('People')).toBeInTheDocument();
    });

    const domainButton = screen.getByRole('button', { name: /people/i });

    // Expand
    fireEvent.click(domainButton);
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    // Collapse
    fireEvent.click(domainButton);
    await waitFor(() => {
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    });
  });

  it('shows no content message when domains are empty', async () => {
    mockApiRequest.mockResolvedValue({
      data: { domains: [] },
    });

    render(<StudyPage />);

    await waitFor(() => {
      expect(screen.getByText('No study content available yet.')).toBeInTheDocument();
    });
  });

  it('has aria-pressed attribute on domain buttons', async () => {
    mockApiRequest.mockResolvedValue({
      data: {
        domains: [
          {
            id: '1',
            name: 'People',
            code: 'PEOPLE',
            description: 'Test',
            weightPercentage: 42,
            tasks: [],
          },
        ],
      },
    });

    render(<StudyPage />);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /people/i });
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    fireEvent.click(screen.getByRole('button', { name: /people/i }));

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /people/i });
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('renders task links correctly', async () => {
    mockApiRequest.mockResolvedValue({
      data: {
        domains: [
          {
            id: '1',
            name: 'People',
            code: 'PEOPLE',
            description: 'Test',
            weightPercentage: 42,
            tasks: [{ id: 'task-123', code: 'T1.1', name: 'Task 1', description: 'Desc' }],
          },
        ],
      },
    });

    render(<StudyPage />);

    await waitFor(() => {
      expect(screen.getByText('People')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /people/i }));

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /task 1/i });
      expect(link).toHaveAttribute('href', '/study/task-123');
    });
  });
});
