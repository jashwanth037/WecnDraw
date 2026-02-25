import api from './api';
import type { User, ApiResponse } from '../types';

interface AuthData {
    user: User;
    accessToken: string;
}

export const authService = {
    register: async (data: { username: string; email: string; password: string }) => {
        const res = await api.post<ApiResponse<AuthData>>('/auth/register', data);
        return res.data;
    },

    login: async (data: { email: string; password: string }) => {
        const res = await api.post<ApiResponse<AuthData>>('/auth/login', data);
        return res.data;
    },

    logout: async () => {
        const res = await api.post('/auth/logout');
        return res.data;
    },

    refreshToken: async () => {
        const res = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh-token');
        return res.data;
    },

    getMe: async () => {
        const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
        return res.data;
    },

    updateProfile: async (data: { username?: string }) => {
        const res = await api.put<ApiResponse<{ user: User }>>('/auth/update-profile', data);
        return res.data;
    },

    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const res = await api.post<ApiResponse<{ user: User }>>('/auth/upload-avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },
};
