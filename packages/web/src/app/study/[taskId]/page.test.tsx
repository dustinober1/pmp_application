import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { ComponentType } from 'react';
import StudyGuidePage from './page';

const mockApiRequest = vi.fn();
const mockPush = vi.fn();

vi.mock('@/lib/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ taskId: 'task-1' }),
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

// Mock next/dynamic to immediately return the component
vi.mock('next/dynamic', () => ({
  default: (_importFn: () => Promise<{ default: ComponentType }>) => {
    // Return a mock component that renders children
    const MockComponent = ({ children }: { children?: string }) => <div>{children}</div>;
    MockComponent.displayName = 'DynamicComponent';
    return MockComponent;
  },
}));

vi.mock('rehype-sanitize', () => ({
  default: () => {},
}));

describe('StudyGuidePage', () => {
  const mockTask = {
    id: 'task-1',
    name: 'Project Management Fundamentals',
    code: 'PM-101',
    description: 'Learn the basics of project management',
  };

  const mockStudyGuide = {
    id: 'guide-1',
    sections: [
      { id: 'section-1', title: 'Introduction', content: 'This is the intro content.' },
      { id: 'section-2', title: 'Key Concepts', content: 'Important concepts to know.' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockApiRequest.mockImplementation((url: string) => {
      if (url === '/domains/tasks') {
        return Promise.resolve({ data: { tasks: [mockTask] } });
      }
      if (url.includes('/study-guide')) {
        return Promise.resolve({ data: { studyGuide: mockStudyGuide } });
      }
      return Promise.resolve({ data: null });
    });
  });

  it('renders loading skeleton initially', () => {
    render(<StudyGuidePage />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders task name and description after loading', async () => {
    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('Project Management Fundamentals')).toBeInTheDocument();
    });
    expect(screen.getByText('Learn the basics of project management')).toBeInTheDocument();
  });

  it('renders task code in breadcrumb', async () => {
    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('Task PM-101')).toBeInTheDocument();
    });
  });

  it('renders study guide sections in sidebar', async () => {
    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('Introduction')).toBeInTheDocument();
    });
    expect(screen.getByText('Key Concepts')).toBeInTheDocument();
  });

  it('renders section content', async () => {
    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('This is the intro content.')).toBeInTheDocument();
    });
    expect(screen.getByText('Important concepts to know.')).toBeInTheDocument();
  });

  it('handles navigation to study page via breadcrumb', async () => {
    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('Study Guide')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Study Guide'));
    expect(mockPush).toHaveBeenCalledWith('/study');
  });

  it('renders related resources buttons', async () => {
    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('Related Flashcards')).toBeInTheDocument();
    });
    expect(screen.getByText('Related Formulas')).toBeInTheDocument();
  });

  it('navigates to flashcards when button is clicked', async () => {
    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('Related Flashcards')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Related Flashcards'));
    expect(mockPush).toHaveBeenCalledWith('/flashcards');
  });

  it('navigates to formulas when button is clicked', async () => {
    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('Related Formulas')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Related Formulas'));
    expect(mockPush).toHaveBeenCalledWith('/formulas');
  });

  it('shows task not found when task does not exist', async () => {
    mockApiRequest.mockImplementation((url: string) => {
      if (url === '/domains/tasks') {
        return Promise.resolve({ data: { tasks: [] } });
      }
      return Promise.resolve({ data: null });
    });

    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('Task Not Found')).toBeInTheDocument();
    });
    expect(screen.getByText('The requested task could not be found.')).toBeInTheDocument();
  });

  it('navigates back to study on task not found button click', async () => {
    mockApiRequest.mockImplementation((url: string) => {
      if (url === '/domains/tasks') {
        return Promise.resolve({ data: { tasks: [] } });
      }
      return Promise.resolve({ data: null });
    });

    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('Back to Study Guide')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back to Study Guide'));
    expect(mockPush).toHaveBeenCalledWith('/study');
  });

  it('shows content coming soon when no study guide', async () => {
    mockApiRequest.mockImplementation((url: string) => {
      if (url === '/domains/tasks') {
        return Promise.resolve({ data: { tasks: [mockTask] } });
      }
      if (url.includes('/study-guide')) {
        return Promise.reject(new Error('Not found'));
      }
      return Promise.resolve({ data: null });
    });

    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('Content Coming Soon')).toBeInTheDocument();
    });
  });

  it('shows start flashcards button when content coming soon', async () => {
    mockApiRequest.mockImplementation((url: string) => {
      if (url === '/domains/tasks') {
        return Promise.resolve({ data: { tasks: [mockTask] } });
      }
      if (url.includes('/study-guide')) {
        return Promise.reject(new Error('Not found'));
      }
      return Promise.resolve({ data: null });
    });

    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('Start Flashcards')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Start Flashcards'));
    expect(mockPush).toHaveBeenCalledWith('/flashcards');
  });

  it('renders contents heading in sidebar', async () => {
    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('Contents')).toBeInTheDocument();
    });
  });

  it('renders resources heading in sidebar', async () => {
    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('Resources')).toBeInTheDocument();
    });
  });

  it('clicking section button updates active section styling', async () => {
    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('Key Concepts')).toBeInTheDocument();
    });

    // Click on the second section
    const keyConcepts = screen.getAllByText('Key Concepts')[0];
    fireEvent.click(keyConcepts);

    // Button should have primary styling after click
    expect(keyConcepts.className).toContain('text-primary-400');
  });

  it('shows no content sections message when sections empty', async () => {
    mockApiRequest.mockImplementation((url: string) => {
      if (url === '/domains/tasks') {
        return Promise.resolve({ data: { tasks: [mockTask] } });
      }
      if (url.includes('/study-guide')) {
        return Promise.resolve({ data: { studyGuide: { id: 'guide-1', sections: [] } } });
      }
      return Promise.resolve({ data: null });
    });

    render(<StudyGuidePage />);

    await waitFor(() => {
      expect(screen.getByText('No content sections available.')).toBeInTheDocument();
    });
  });
});
