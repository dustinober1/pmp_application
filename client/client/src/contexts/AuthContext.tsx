import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import type { User, LoginData, RegisterData } from '../services/authService';

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
    const [isLoading, setIsLoading] = useState(true);

    // Validate token on mount
    useEffect(() => {
        const validateAuth = async () => {
            const token = authService.getStoredToken();
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const data = await authService.getMe();
                setUser(data.user);
            } catch (error) {
                // Token invalid, clear auth
                await authService.logout();
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        validateAuth();
    }, []);

    const login = useCallback(async (data: LoginData) => {
        const response = await authService.login(data);
        setUser(response.user);
    }, []);

    const register = useCallback(async (data: RegisterData) => {
        const response = await authService.register(data);
        setUser(response.user);
    }, []);

    const logout = useCallback(async () => {
        await authService.logout();
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const data = await authService.getMe();
            setUser(data.user);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    }, []);

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
