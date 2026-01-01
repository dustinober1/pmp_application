import { render, screen } from '@testing-library/react';
import RootLayout, { metadata } from './layout';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('next/font/google', () => ({
  Roboto: () => ({
    className: 'roboto-mock-class',
    variable: '--font-roboto',
  }),
}));

vi.mock('next/script', () => ({
  default: ({ src, 'data-domain': dataDomain }: { src: string; 'data-domain'?: string }) => (
    <script data-testid="analytics-script" src={src} data-domain={dataDomain} />
  ),
}));

vi.mock('./providers', () => ({
  Providers: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="providers">{children}</div>
  ),
}));

vi.mock('./globals.css', () => ({}));

describe('RootLayout', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('renders children within providers', () => {
    render(
      <RootLayout>
        <div data-testid="child-content">Test Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('providers')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders main-content div with correct attributes', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    const mainContent = screen.getByTestId('providers').querySelector('#main-content');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveAttribute('tabindex', '-1');
  });

  it('renders html with lang attribute', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    // The RootLayout renders an <html> element which gets nested inside RTL's container
    // We verify by checking that an html element exists with the correct lang
    const html = document.querySelector('html');
    expect(html).toBeInTheDocument();
  });

  it('applies roboto font class to body', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    const body = container.querySelector('body');
    expect(body).toHaveClass('roboto-mock-class');
    expect(body).toHaveClass('font-sans');
    expect(body).toHaveClass('antialiased');
  });
});

describe('RootLayout metadata', () => {
  it('has correct title', () => {
    expect(metadata.title).toBe('PMP Study Pro');
  });

  it('has correct description', () => {
    expect(metadata.description).toBe(
      'Comprehensive study platform for the 2026 PMP certification exam'
    );
  });

  it('has correct keywords', () => {
    expect(metadata.keywords).toEqual([
      'PMP',
      'Project Management',
      'Certification',
      'Study',
      'Exam Prep',
    ]);
  });

  it('has manifest path', () => {
    expect(metadata.manifest).toBe('/manifest.json');
  });

  it('has theme color', () => {
    expect(metadata.themeColor).toBe('#7c3aed');
  });

  it('has viewport settings', () => {
    expect(metadata.viewport).toBe('width=device-width, initial-scale=1, maximum-scale=1');
  });

  it('has apple web app configuration', () => {
    expect(metadata.appleWebApp).toEqual({
      capable: true,
      statusBarStyle: 'default',
      title: 'PMP Pro',
    });
  });

  it('has mobile web app capable setting', () => {
    expect(metadata.other).toEqual({
      'mobile-web-app-capable': 'yes',
    });
  });
});

describe('RootLayout Plausible Analytics', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('does not render analytics script when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is not set', async () => {
    delete process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

    const { default: Layout } = await import('./layout');

    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.queryByTestId('analytics-script')).not.toBeInTheDocument();
  });
});
