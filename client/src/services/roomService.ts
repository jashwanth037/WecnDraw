import api from './api';
import type { Room, Session, Message, SessionFile, ApiResponse } from '../types';

export const roomService = {
    createRoom: async (data: {
        name: string;
        description?: string;
        password?: string;
        maxUsers?: number;
        tags?: string[];
        template?: string;
    }) => {
        const res = await api.post<ApiResponse<{ room: Room }>>('/rooms/create', data);
        return res.data;
    },

    getMyRooms: async () => {
        const res = await api.get<ApiResponse<{ rooms: Room[] }>>('/rooms/my-rooms');
        return res.data;
    },

    getRoom: async (roomId: string) => {
        const res = await api.get<ApiResponse<{ room: Room }>>(`/rooms/${roomId}`);
        return res.data;
    },

    joinRoom: async (roomId: string, password?: string) => {
        const res = await api.post<ApiResponse<{ room: Room }>>(`/rooms/${roomId}/join`, { password });
        return res.data;
    },

    deleteRoom: async (roomId: string) => {
        const res = await api.delete(`/rooms/${roomId}`);
        return res.data;
    },

    updateSettings: async (roomId: string, data: Partial<Room>) => {
        const res = await api.put<ApiResponse<{ room: Room }>>(`/rooms/${roomId}/settings`, data);
        return res.data;
    },

    kickUser: async (roomId: string, userId: string) => {
        const res = await api.post(`/rooms/${roomId}/kick/${userId}`);
        return res.data;
    },

    getSession: async (roomId: string) => {
        const res = await api.get<ApiResponse<{ session: Session }>>(`/sessions/${roomId}`);
        return res.data;
    },

    saveSession: async (roomId: string, canvasState: string) => {
        const res = await api.post(`/sessions/${roomId}/save`, { canvasState });
        return res.data;
    },

    saveSnapshot: async (roomId: string, imageData: string) => {
        const res = await api.post<ApiResponse<{ url: string }>>(`/sessions/${roomId}/snapshot`, { imageData });
        return res.data;
    },

    getMessages: async (roomId: string) => {
        const res = await api.get<ApiResponse<{ messages: Message[] }>>(`/sessions/${roomId}/messages`);
        return res.data;
    },

    getHistory: async (roomId: string) => {
        const res = await api.get<ApiResponse<{ history: Session }>>(`/sessions/${roomId}/history`);
        return res.data;
    },

    toggleRecording: async (roomId: string, action: 'start' | 'stop') => {
        const res = await api.post(`/sessions/${roomId}/record`, { action });
        return res.data;
    },

    uploadFile: async (file: File, roomId: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('roomId', roomId);
        const res = await api.post<ApiResponse<{ file: SessionFile }>>('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    getRoomFiles: async (roomId: string) => {
        const res = await api.get<ApiResponse<{ files: SessionFile[] }>>(`/files/${roomId}`);
        return res.data;
    },

    deleteFile: async (fileId: string, roomId: string) => {
        const res = await api.delete(`/files/${fileId}`, { data: { roomId } });
        return res.data;
    },
};
