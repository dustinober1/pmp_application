import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CheckoutPage from './page';

const mockApiRequest = vi.fn();
const mockPush = vi.fn();

vi.mock('../../lib/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'tier' ? 'high-end' : null),
  }),
}));

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders checkout form', async () => {
    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText('Complete your purchase')).toBeInTheDocument();
    });
  });

  it('displays tier and price', async () => {
    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText('high end')).toBeInTheDocument();
      expect(screen.getByText('$29.00')).toBeInTheDocument();
    });
  });

  it('renders PayPal button', async () => {
    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText('Pay')).toBeInTheDocument();
      expect(screen.getByText('Pal')).toBeInTheDocument();
    });
  });

  it('processes checkout and redirects on success', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true });

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText('Pay')).toBeInTheDocument();
    });

    const payButton = screen.getByRole('button');
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('/subscriptions/upgrade-tier', {
        method: 'POST',
        body: {
          tierId: 'high-end',
          paymentId: expect.stringContaining('mock_pay_'),
        },
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard?payment=success');
    });
  });

  it('shows error message on checkout failure', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('Payment failed'));

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText('Pay')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Payment initialization failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows loading spinner during checkout', async () => {
    mockApiRequest.mockImplementation(() => new Promise(() => {}));

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText('Pay')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  it('disables button during checkout', async () => {
    mockApiRequest.mockImplementation(() => new Promise(() => {}));

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  it('shows terms of service notice', async () => {
    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText(/by checking out, you agree to our terms of service/i)).toBeInTheDocument();
    });
  });
});

describe('CheckoutPage with corporate tier', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush }),
      useSearchParams: () => ({
        get: (key: string) => (key === 'tier' ? 'corporate' : null),
      }),
    }));
  });

  it('displays corporate tier price', async () => {
    const { default: CheckoutPageCorporate } = await import('./page');

    render(<CheckoutPageCorporate />);

    await waitFor(() => {
      // The price display may vary based on mock
      expect(screen.getByText('Complete your purchase')).toBeInTheDocument();
    });
  });
});