/* eslint-disable @typescript-eslint/no-explicit-any -- Test files use any for mocking */
import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tick } from 'svelte';
import Navbar from './Navbar.svelte';

describe('Navbar Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock document.documentElement.classList
		Object.defineProperty(document.documentElement, 'classList', {
			value: {
				contains: vi.fn(() => false),
				toggle: vi.fn()
			},
			writable: true
		});
	});

	describe('Basic Rendering', () => {
		it('renders logo and brand name', () => {
			render(Navbar);
			expect(screen.getByText('PMP Study Pro')).toBeInTheDocument();
			expect(screen.getByText('PM')).toBeInTheDocument();
		});

		it('renders login and get started buttons when not authenticated', () => {
			render(Navbar);
			expect(screen.getByText('Login')).toBeInTheDocument();
			expect(screen.getByText('Get Started')).toBeInTheDocument();
		});

		it('does not render navigation links when not authenticated', () => {
			render(Navbar);
			expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
			expect(screen.queryByText('Study')).not.toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has proper ARIA labels for interactive elements', () => {
			render(Navbar);
			expect(screen.getByLabelText('Change language')).toBeInTheDocument();
			expect(screen.getByLabelText(/Switch to .* mode/i)).toBeInTheDocument();
		});
	});
});
