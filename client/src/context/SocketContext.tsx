import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useCanvasStore } from '../store/canvasStore';
import { useRoomStore } from '../store/roomStore';
import type { RoomUserEntry, CursorPosition } from '../types';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    connect: () => { },
    disconnect: () => { },
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { accessToken, isAuthenticated } = useAuthStore();
    const { setCursor, removeCursor } = useCanvasStore();
    const { setRoomUsers } = useRoomStore();

    const connect = () => {
        if (socketRef.current?.connected) return;
        if (!accessToken) return;

        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
            auth: { token: accessToken },
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('cursor:update', (data: CursorPosition) => {
            setCursor(data.socketId, data);
        });

        socket.on('room:user-joined', ({ user: _user, users }: { user: RoomUserEntry; users: RoomUserEntry[] }) => {
            setRoomUsers(users);
        });

        socket.on('room:user-left', ({ socketId, users }: { socketId: string; users: RoomUserEntry[] }) => {
            setRoomUsers(users);
            removeCursor(socketId);
        });

        socketRef.current = socket;
    };

    const disconnect = () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
        setIsConnected(false);
    };

    useEffect(() => {
        if (isAuthenticated && accessToken) {
            connect();
        } else {
            disconnect();
        }
        return () => {
            disconnect();
        };
    }, [isAuthenticated, accessToken]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, isConnected, connect, disconnect }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
