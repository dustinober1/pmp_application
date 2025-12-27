import api from './api';
import type { User, AuthResponse, UserStats, UserProgress } from '../types';

export type { User, AuthResponse };

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface ProfileUpdateData {
    firstName?: string;
    lastName?: string;
}

export interface PasswordChangeData {
    currentPassword: string;
    newPassword: string;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    token: string;
    newPassword: string;
}

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'authUser';

/**
 * Store authentication data
 */
const storeAuth = (token: string, refreshToken: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Clear authentication data
 */
const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

/**
 * Get stored token
 */
export const getStoredToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get stored refresh token
 */
export const getStoredRefreshToken = (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Get stored user
 */
export const getStoredUser = (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!getStoredToken();
};

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    storeAuth(response.data.token, response.data.refreshToken, response.data.user);
    return response.data;
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    storeAuth(response.data.token, response.data.refreshToken, response.data.user);
    return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
    try {
        const refreshToken = getStoredRefreshToken();
        await api.post('/auth/logout', { refreshToken });
    } finally {
        clearAuth();
    }
};

/**
 * Get current user profile
 */
export const getMe = async (): Promise<{ user: User; progress: UserProgress[]; stats: UserStats }> => {
    const response = await api.get('/auth/me');
    // Update stored user data
    if (response.data.user) {
        const token = getStoredToken();
        const refreshToken = getStoredRefreshToken();
        if (token && refreshToken) {
            storeAuth(token, refreshToken, response.data.user);
        }
    }
    return response.data;
};

/**
 * Refresh access token
 */
export const refresh = async (): Promise<{ token: string; refreshToken: string }> => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh', { refreshToken });
    const { token: newToken, refreshToken: newRefreshToken } = response.data;

    const user = getStoredUser();
    if (user) {
        storeAuth(newToken, newRefreshToken, user);
    }

    return { token: newToken, refreshToken: newRefreshToken };
};

/**
 * Update user profile
 */
export const updateProfile = async (data: ProfileUpdateData): Promise<{ user: User }> => {
    const response = await api.put('/auth/profile', data);
    // Update stored user data
    const token = getStoredToken();
    const refreshToken = getStoredRefreshToken();
    if (token && refreshToken && response.data.user) {
        storeAuth(token, refreshToken, response.data.user);
    }
    return response.data;
};

/**
 * Change password
 */
export const changePassword = async (data: PasswordChangeData): Promise<{ message: string }> => {
    const response = await api.put('/auth/password', data);
    return response.data;
};

/**
 * Request a password reset email
 */
export const requestPasswordReset = async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const response = await api.post('/auth/password/forgot', data);
    return response.data;
};

/**
 * Reset password using token
 */
export const resetPassword = async (data: ResetPasswordData): Promise<{ message: string }> => {
    const response = await api.post('/auth/password/reset', data);
    return response.data;
};

export default {
    register,
    login,
    logout,
    refresh,
    getMe,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    getStoredToken,
    getStoredRefreshToken,
    getStoredUser,
    isAuthenticated,
};
