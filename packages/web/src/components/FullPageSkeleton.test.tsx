import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FullPageSkeleton } from './FullPageSkeleton';

describe('FullPageSkeleton Component', () => {
  it('renders without crashing', () => {
    render(<FullPageSkeleton />);
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('renders the header skeleton', () => {
    render(<FullPageSkeleton />);
    const header = document.querySelector('.h-16.border-b');
    expect(header).toBeInTheDocument();
  });

  it('renders main content area', () => {
    render(<FullPageSkeleton />);
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('max-w-7xl', 'mx-auto');
  });

  it('renders multiple skeleton elements', () => {
    render(<FullPageSkeleton />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders title skeleton', () => {
    render(<FullPageSkeleton />);
    const titleSkeleton = document.querySelector('.h-8.w-56');
    expect(titleSkeleton).toBeInTheDocument();
  });

  it('renders subtitle skeleton', () => {
    render(<FullPageSkeleton />);
    const subtitleSkeleton = document.querySelector('.h-4.w-96');
    expect(subtitleSkeleton).toBeInTheDocument();
  });

  it('renders grid of stat card skeletons', () => {
    render(<FullPageSkeleton />);
    const gridContainer = document.querySelector('.grid.grid-cols-2.lg\\:grid-cols-4');
    expect(gridContainer).toBeInTheDocument();

    const statSkeletons = gridContainer?.querySelectorAll('.h-24');
    expect(statSkeletons?.length).toBe(4);
  });

  it('renders main content grid with chart skeletons', () => {
    render(<FullPageSkeleton />);
    const contentGrid = document.querySelector('.grid.lg\\:grid-cols-3');
    expect(contentGrid).toBeInTheDocument();

    const chartSkeletons = contentGrid?.querySelectorAll('.h-72');
    expect(chartSkeletons?.length).toBe(2);
  });

  it('applies responsive padding classes', () => {
    render(<FullPageSkeleton />);
    const main = document.querySelector('main');
    expect(main).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
  });

  it('applies glass styling to header', () => {
    render(<FullPageSkeleton />);
    const header = document.querySelector('.h-16');
    expect(header).toHaveClass('glass');
  });

  it('has proper spacing in main content', () => {
    render(<FullPageSkeleton />);
    const main = document.querySelector('main');
    expect(main).toHaveClass('py-8', 'space-y-6');
  });

  it('renders large chart area with correct col-span', () => {
    render(<FullPageSkeleton />);
    const largeChart = document.querySelector('.h-72.lg\\:col-span-2');
    expect(largeChart).toBeInTheDocument();
  });
});
