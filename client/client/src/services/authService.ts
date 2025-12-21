import api from './api';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt?: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    token: string;
}

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

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

/**
 * Store authentication data
 */
const storeAuth = (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Clear authentication data
 */
const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

/**
 * Get stored token
 */
export const getStoredToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
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
    storeAuth(response.data.token, response.data.user);
    return response.data;
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    storeAuth(response.data.token, response.data.user);
    return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
    try {
        await api.post('/auth/logout');
    } finally {
        clearAuth();
    }
};

/**
 * Get current user profile
 */
export const getMe = async (): Promise<{ user: User; progress: any[]; stats: any }> => {
    const response = await api.get('/auth/me');
    // Update stored user data
    if (response.data.user) {
        const token = getStoredToken();
        if (token) {
            storeAuth(token, response.data.user);
        }
    }
    return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (data: ProfileUpdateData): Promise<{ user: User }> => {
    const response = await api.put('/auth/profile', data);
    // Update stored user data
    const token = getStoredToken();
    if (token && response.data.user) {
        storeAuth(token, response.data.user);
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

export default {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    changePassword,
    getStoredToken,
    getStoredUser,
    isAuthenticated,
};
