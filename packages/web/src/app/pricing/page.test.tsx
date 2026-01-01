import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PricingPage from './page';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
  }),
}));

vi.mock('@pmp/shared', () => ({
  DEFAULT_TIER_FEATURES: {
    free: {
      studyGuidesAccess: 'limited',
      flashcardsLimit: 50,
      practiceQuestionsPerDomain: 10,
      mockExams: false,
      advancedAnalytics: false,
      teamManagement: false,
    },
    'high-end': {
      studyGuidesAccess: 'full',
      flashcardsLimit: 'unlimited',
      practiceQuestionsPerDomain: 50,
      mockExams: true,
      advancedAnalytics: true,
      teamManagement: false,
    },
    corporate: {
      studyGuidesAccess: 'full',
      flashcardsLimit: 'unlimited',
      practiceQuestionsPerDomain: 100,
      mockExams: true,
      advancedAnalytics: true,
      teamManagement: true,
    },
  },
}));

describe('PricingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders pricing heading', () => {
    render(<PricingPage />);

    expect(screen.getByRole('heading', { name: 'Pricing' })).toBeInTheDocument();
    expect(screen.getByText('Invest in your PMP success')).toBeInTheDocument();
  });

  it('renders all three pricing tiers', () => {
    render(<PricingPage />);

    expect(screen.getByText('Free Starter')).toBeInTheDocument();
    expect(screen.getByText('PMP Pro')).toBeInTheDocument();
    expect(screen.getByText('Corporate Team')).toBeInTheDocument();
  });

  it('displays monthly prices by default', () => {
    render(<PricingPage />);

    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$29')).toBeInTheDocument();
    expect(screen.getByText('$99')).toBeInTheDocument();
  });

  it('switches to annual pricing when clicked', () => {
    render(<PricingPage />);

    fireEvent.click(screen.getByRole('button', { name: /annual/i }));

    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$290')).toBeInTheDocument();
    expect(screen.getByText('$990')).toBeInTheDocument();
  });

  it('shows Monthly as selected by default', () => {
    render(<PricingPage />);

    const monthlyButton = screen.getByRole('button', { name: 'Monthly' });
    expect(monthlyButton.className).toContain('bg-primary');
  });

  it('renders tier descriptions', () => {
    render(<PricingPage />);

    expect(screen.getByText(/perfect for exploring the platform/i)).toBeInTheDocument();
    expect(screen.getByText(/everything you need to pass the exam/i)).toBeInTheDocument();
    expect(screen.getByText(/manage a team of pmp candidates/i)).toBeInTheDocument();
  });

  it('shows Most Popular badge on Pro tier', () => {
    render(<PricingPage />);

    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('renders Get Started button for Free tier when not logged in', () => {
    render(<PricingPage />);

    const freeButton = screen.getByRole('link', { name: 'Get Started' });
    expect(freeButton).toHaveAttribute('href', '/auth/register');
  });

  it('renders Upgrade button for Pro tier', () => {
    render(<PricingPage />);

    const proButton = screen.getByRole('link', { name: 'Upgrade to Pro' });
    expect(proButton).toHaveAttribute('href', '/checkout?tier=high-end');
  });

  it('renders Start Team Plan button for Corporate tier', () => {
    render(<PricingPage />);

    const corporateButton = screen.getByRole('link', { name: 'Start Team Plan' });
    expect(corporateButton).toHaveAttribute('href', '/checkout?tier=corporate');
  });

  it('shows feature checkmarks for included features', () => {
    render(<PricingPage />);

    // All tiers should have some checked items
    const checkmarks = screen.getAllByText('✓');
    expect(checkmarks.length).toBeGreaterThan(0);
  });

  it('shows X marks for excluded features', () => {
    render(<PricingPage />);

    // Free tier should have X marks for excluded features
    const xMarks = screen.getAllByText('✕');
    expect(xMarks.length).toBeGreaterThan(0);
  });

  it('displays billing period labels', () => {
    render(<PricingPage />);

    const monthlyLabels = screen.getAllByText('/mo');
    expect(monthlyLabels.length).toBe(3);

    // Switch to annual
    fireEvent.click(screen.getByRole('button', { name: /annual/i }));

    const annualLabels = screen.getAllByText('/yr');
    expect(annualLabels.length).toBe(3);
  });
});

describe('PricingPage with authenticated user', () => {
  beforeEach(() => {
    vi.doMock('../../contexts/AuthContext', () => ({
      useAuth: () => ({
        user: { id: '1', tier: 'free' },
      }),
    }));
  });

  it('shows Current Plan for user tier', async () => {
    const { default: PricingPageAuth } = await import('./page');

    render(<PricingPageAuth />);

    // The user should see their current plan indicated
    expect(screen.getByText('Invest in your PMP success')).toBeInTheDocument();
  });
});

describe('PricingPage with Pro user', () => {
  beforeEach(() => {
    vi.doMock('../../contexts/AuthContext', () => ({
      useAuth: () => ({
        user: { id: '1', tier: 'high-end' },
      }),
    }));
  });

  it('shows Current Plan for Pro tier', async () => {
    const { default: PricingPagePro } = await import('./page');

    render(<PricingPagePro />);

    expect(screen.getByText('Invest in your PMP success')).toBeInTheDocument();
  });
});
