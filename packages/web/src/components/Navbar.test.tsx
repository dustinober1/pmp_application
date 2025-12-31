import { render, screen } from '@testing-library/react';
import { Navbar } from './Navbar';
import { vi } from 'vitest';

// Mock useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}));

// Mock SearchDialog since it might use other contexts
vi.mock('./SearchDialog', () => ({
    default: () => <div data-testid="search-dialog">Search Dialog</div>,
}));

import { useAuth } from '@/contexts/AuthContext';

describe('Navbar Component', () => {
    it('renders logo', () => {
        (useAuth as any).mockReturnValue({
            isAuthenticated: false,
            user: null,
        });
        render(<Navbar />);
        expect(screen.getByText('PMP Study Pro')).toBeInTheDocument();
    });

    it('renders login buttons when not authenticated', () => {
        (useAuth as any).mockReturnValue({
            isAuthenticated: false,
            user: null,
        });
        render(<Navbar />);
        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('renders user info when authenticated', () => {
        (useAuth as any).mockReturnValue({
            isAuthenticated: true,
            user: { name: 'Test User', tier: 'free' },
        });
        render(<Navbar />);
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('free Tier')).toBeInTheDocument();
    });
});
