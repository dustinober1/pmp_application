import React from 'react';
import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthContext, { type AuthContextType } from '../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Default mock auth values
const mockAuthDefaults: AuthContextType = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
};

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

interface CustomRenderOptions extends RenderOptions {
    authValue?: Partial<AuthContextType>;
}

const customRender = (
    ui: ReactElement,
    { authValue, ...options }: CustomRenderOptions = {}
) => {
    const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
        return (
            <QueryClientProvider client={queryClient}>
                <AuthContext.Provider value={{ ...mockAuthDefaults, ...authValue }}>
                    <BrowserRouter>{children}</BrowserRouter>
                </AuthContext.Provider>
            </QueryClientProvider>
        );
    };

    return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
