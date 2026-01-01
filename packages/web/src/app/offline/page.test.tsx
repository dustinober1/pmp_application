import { render, screen, fireEvent } from '@testing-library/react';
import OfflinePage from './page';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('OfflinePage', () => {
  const mockReload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });
  });

  it('renders offline heading', () => {
    render(<OfflinePage />);

    expect(screen.getByRole('heading', { name: /you are offline/i })).toBeInTheDocument();
  });

  it('renders offline description text', () => {
    render(<OfflinePage />);

    expect(screen.getByText(/it seems you.ve lost your internet connection/i)).toBeInTheDocument();
  });

  it('renders link to study guides', () => {
    render(<OfflinePage />);

    const studyLink = screen.getByRole('link', { name: /study guides/i });
    expect(studyLink).toBeInTheDocument();
    expect(studyLink).toHaveAttribute('href', '/study');
    expect(screen.getByText(/access previously opened guides/i)).toBeInTheDocument();
  });

  it('renders link to flashcards', () => {
    render(<OfflinePage />);

    const flashcardsLink = screen.getByRole('link', { name: /flashcards/i });
    expect(flashcardsLink).toBeInTheDocument();
    expect(flashcardsLink).toHaveAttribute('href', '/flashcards');
    expect(screen.getByText(/review cached cards/i)).toBeInTheDocument();
  });

  it('renders try reconnecting button', () => {
    render(<OfflinePage />);

    const button = screen.getByRole('button', { name: /try reconnecting/i });
    expect(button).toBeInTheDocument();
  });

  it('reloads page when try reconnecting button is clicked', () => {
    render(<OfflinePage />);

    const button = screen.getByRole('button', { name: /try reconnecting/i });
    fireEvent.click(button);

    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it('renders with correct layout structure', () => {
    const { container } = render(<OfflinePage />);

    expect(container.querySelector('.min-h-\\[80vh\\]')).toBeInTheDocument();
    expect(container.querySelector('.flex.flex-col')).toBeInTheDocument();
  });

  it('renders emojis with aria-hidden for accessibility', () => {
    const { container } = render(<OfflinePage />);

    const hiddenSpans = container.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenSpans.length).toBeGreaterThanOrEqual(2);
  });

  it('renders grid of navigation options', () => {
    const { container } = render(<OfflinePage />);

    expect(container.querySelector('.grid.gap-4')).toBeInTheDocument();
  });
});
