import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import ErrorMessage from './ErrorMessage';

describe('LoadingSpinner', () => {
    it('renders with default medium size', () => {
        const { container } = render(<LoadingSpinner />);
        const spinner = container.firstChild;

        expect(spinner).toHaveClass('w-6', 'h-6');
    });

    it('renders with small size', () => {
        const { container } = render(<LoadingSpinner size="sm" />);
        const spinner = container.firstChild;

        expect(spinner).toHaveClass('w-4', 'h-4');
    });

    it('renders with large size', () => {
        const { container } = render(<LoadingSpinner size="lg" />);
        const spinner = container.firstChild;

        expect(spinner).toHaveClass('w-8', 'h-8');
    });

    it('applies custom className', () => {
        const { container } = render(<LoadingSpinner className="custom-class" />);
        const spinner = container.firstChild;

        expect(spinner).toHaveClass('custom-class');
    });

    it('has spinning animation class', () => {
        const { container } = render(<LoadingSpinner />);
        const spinner = container.firstChild;

        expect(spinner).toHaveClass('animate-spin');
    });
});

describe('EmptyState', () => {
    it('renders with default title and message', () => {
        render(<EmptyState />);

        expect(screen.getByText('No data found')).toBeInTheDocument();
        expect(screen.getByText("There's nothing to show here.")).toBeInTheDocument();
    });

    it('renders with custom title and message', () => {
        render(<EmptyState title="Custom Title" message="Custom message" />);

        expect(screen.getByText('Custom Title')).toBeInTheDocument();
        expect(screen.getByText('Custom message')).toBeInTheDocument();
    });

    it('renders action button when provided', () => {
        const mockOnClick = vi.fn();
        render(
            <EmptyState
                action={{ label: 'Take Action', onClick: mockOnClick }}
            />
        );

        const button = screen.getByRole('button', { name: /take action/i });
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not render action button when not provided', () => {
        render(<EmptyState />);

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders custom icon when provided', () => {
        render(
            <EmptyState
                icon={<span data-testid="custom-icon">🎯</span>}
            />
        );

        expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('renders default icon when no icon provided', () => {
        const { container } = render(<EmptyState />);

        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });
});

describe('LoadingState', () => {
    it('renders default loading message', () => {
        render(<LoadingState />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders custom loading message', () => {
        render(<LoadingState message="Fetching data..." />);

        expect(screen.getByText('Fetching data...')).toBeInTheDocument();
    });

    it('renders spinner component', () => {
        const { container } = render(<LoadingState />);

        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });
});

describe('ErrorMessage', () => {
    it('renders with default title and message', () => {
        render(<ErrorMessage />);

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Please try again later.')).toBeInTheDocument();
    });

    it('renders with custom title and message', () => {
        render(<ErrorMessage title="Custom Error" message="Custom error message" />);

        expect(screen.getByText('Custom Error')).toBeInTheDocument();
        expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('renders Try Again button when onRetry is provided', () => {
        const mockRetry = vi.fn();
        render(<ErrorMessage onRetry={mockRetry} />);

        const retryButton = screen.getByRole('button', { name: /try again/i });
        expect(retryButton).toBeInTheDocument();

        fireEvent.click(retryButton);
        expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('does not render button when onRetry is not provided', () => {
        render(<ErrorMessage />);

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders error icon', () => {
        const { container } = render(<ErrorMessage />);

        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });
});
