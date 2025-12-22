import { render, screen } from '../test/utils';
import MobileNav from './MobileNav';
import { describe, it, expect } from 'vitest';

describe('MobileNav', () => {
    it('renders navigation items for unauthenticated users', () => {
        render(<MobileNav />, { authValue: { isAuthenticated: false } });

        // Home should be visible
        expect(screen.getByText('Home')).toBeInTheDocument();

        // Auth protected items should NOT be visible
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
        expect(screen.queryByText('Practice')).not.toBeInTheDocument();

        // Login shows as "Profile" or similar? Let's check implementation
        // The MobileNav usually shows Profile icon which links to /login if not auth
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('renders all navigation items for authenticated users', () => {
        render(<MobileNav />, { authValue: { isAuthenticated: true } });

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Practice')).toBeInTheDocument();
        expect(screen.getByText('Cards')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });
});
