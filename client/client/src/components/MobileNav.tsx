import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    requireAuth?: boolean;
}

const MobileNav: React.FC = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const navItems: NavItem[] = [
        {
            name: 'Home',
            href: '/',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: 'Dashboard',
            href: '/dashboard',
            requireAuth: true,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            name: 'Practice',
            href: '/practice',
            requireAuth: true,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
        },
        {
            name: 'Cards',
            href: '/flashcards',
            requireAuth: true,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
        },
        {
            name: 'Profile',
            href: isAuthenticated ? '/dashboard' : '/login',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
    ];

    // Filter based on auth
    const visibleItems = navItems.filter(item => {
        if (item.requireAuth && !isAuthenticated) return false;
        return true;
    });

    const isActive = (href: string) => {
        if (href === '/') return location.pathname === '/';
        return location.pathname.startsWith(href);
    };

    return (
        <nav className="mobile-nav md:hidden" aria-label="Mobile Navigation" role="navigation">
            <div className="mobile-nav-items">
                {visibleItems.slice(0, 5).map((item) => (
                    <Link
                        key={item.name}
                        to={item.href}
                        className={`mobile-nav-item ${isActive(item.href) ? 'active' : ''}`}
                        aria-label={item.name}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                        <span className={isActive(item.href) ? 'text-indigo-600' : 'text-gray-500'} aria-hidden="true">
                            {item.icon}
                        </span>
                        <span className={`text-xs mt-1 ${isActive(item.href) ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                            {item.name}
                        </span>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default MobileNav;
