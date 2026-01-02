/* eslint-disable @typescript-eslint/no-explicit-any -- Test files use any for mocking */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormulasPage from './page';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const { mockPush, mockUseAuth, mockApiRequest, mockToast } = vi.hoisted(() => {
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
    mockToast: toastObj,
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/formulas',
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
}));

describe('FormulasPage', () => {
  const mockFormulas = [
    {
      id: 'f1',
      name: 'CPI',
      category: 'earned_value',
      expression: 'CPI=EV/AC',
      description: 'Cost Performance Index',
      whenToUse: 'Measure cost efficiency',
    },
    {
      id: 'f2',
      name: 'SPI',
      category: 'earned_value',
      expression: 'SPI=EV/PV',
      description: 'Schedule Performance Index',
      whenToUse: 'Measure schedule efficiency',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to auth login if unauthenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(<FormulasPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login?next=%2Fformulas');
    });
  });

  it('fetches and displays formulas when authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: { tier: 'free', emailVerified: true },
      isAuthenticated: true,
      isLoading: false,
    });
    mockApiRequest.mockResolvedValue({ success: true, data: { formulas: mockFormulas } });

    render(<FormulasPage />);

    await waitFor(() => {
      expect(screen.getByText('CPI')).toBeInTheDocument();
      expect(screen.getByText('SPI')).toBeInTheDocument();
    });
  });

  it('selects a formula and shows inputs', async () => {
    mockUseAuth.mockReturnValue({
      user: { tier: 'corporate', emailVerified: true },
      isAuthenticated: true,
      isLoading: false,
    });
    mockApiRequest.mockResolvedValue({ success: true, data: { formulas: mockFormulas } });

    render(<FormulasPage />);

    await waitFor(() => {
      expect(screen.getByText('CPI')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('CPI'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter EV')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter AC')).toBeInTheDocument();
    });
  });

  it('calculates result when inputs provided', async () => {
    mockUseAuth.mockReturnValue({
      user: { tier: 'corporate', emailVerified: true },
      isAuthenticated: true,
      isLoading: false,
    });

    mockApiRequest.mockImplementation((endpoint: string) => {
      if (endpoint === '/formulas') {
        return Promise.resolve({ success: true, data: { formulas: mockFormulas } });
      }
      if (endpoint === '/formulas/f1/calculate') {
        return Promise.resolve({
          success: true,
          data: {
            result: {
              result: 1.2,
              interpretation: 'Under Budget',
              steps: [],
            },
          },
        });
      }
      return Promise.reject(new Error(`Unexpected endpoint: ${endpoint}`));
    });

    render(<FormulasPage />);

    await waitFor(() => {
      expect(screen.getByText('CPI')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('CPI'));

    fireEvent.change(screen.getByPlaceholderText('Enter EV'), { target: { value: '120' } });
    fireEvent.change(screen.getByPlaceholderText('Enter AC'), { target: { value: '100' } });

    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));

    await waitFor(() => {
      expect(screen.getByText('1.20')).toBeInTheDocument();
      expect(screen.getByText('Under Budget')).toBeInTheDocument();
    });

    expect(mockApiRequest).toHaveBeenCalledWith(
      '/formulas/f1/calculate',
      expect.objectContaining({
        method: 'POST',
        body: { inputs: { EV: 120, AC: 100 } },
      })
    );
  });

  it('shows upgrade message for free tier users', async () => {
    mockUseAuth.mockReturnValue({
      user: { tier: 'free', emailVerified: true },
      isAuthenticated: true,
      isLoading: false,
    });
    mockApiRequest.mockResolvedValue({ success: true, data: { formulas: mockFormulas } });

    render(<FormulasPage />);

    await waitFor(() => {
      expect(screen.getByText('CPI')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Interactive calculator is available for High-End and Corporate tiers/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /calculate/i })).not.toBeInTheDocument();
  });
});
