import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setAccessToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setAccessToken: (accessToken) => set({ accessToken }),
            setLoading: (isLoading) => set({ isLoading }),
            login: (user, accessToken) =>
                set({ user, accessToken, isAuthenticated: true, isLoading: false }),
            logout: () =>
                set({ user: null, accessToken: null, isAuthenticated: false }),
            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),
        }),
        {
            name: 'wecndraw-auth',
            partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
        }
    )
);
