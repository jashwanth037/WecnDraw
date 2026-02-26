import axios from 'axios';
import { useAuthStore } from '../store/authStore';

/**
 * Sanitize the API base URL to ensure it is always an absolute URL.
 * - Adds https:// if no protocol is present (prevents relative-path bug on Vercel)
 * - Strips trailing slashes for consistency
 */
const sanitizeUrl = (url: string): string => {
    let sanitized = url.trim();
    if (sanitized && !/^https?:\/\//i.test(sanitized)) {
        sanitized = `https://${sanitized}`;
    }
    return sanitized.replace(/\/+$/, '');
};

const API_BASE_URL = sanitizeUrl(
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
);

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 30000,
});

// Request interceptor — attach access token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(
                    `${API_BASE_URL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );
                const { accessToken } = response.data.data;
                useAuthStore.getState().setAccessToken(accessToken);
                processQueue(null, accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                useAuthStore.getState().logout();
                window.location.href = '/auth';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
