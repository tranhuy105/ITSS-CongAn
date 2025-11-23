import type {
    ApiResponse,
    AuthResponse,
    LoginCredentials,
    RegisterData
} from '../../../shared/types';
import api from './api';

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
};

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
    await api.post('/auth/logout');
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.data.tokens;
};
