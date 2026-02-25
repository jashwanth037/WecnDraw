import { useEffect, useRef, useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useCanvasStore } from '../store/canvasStore';
import type { CanvasTool } from '../types';

export const useSocket = () => {
    const { socket, isConnected } = useSocketContext();

    const emit = useCallback(<T>(event: string, data: T) => {
        socket?.emit(event, data);
    }, [socket]);

    const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
        socket?.on(event, handler);
        return () => { socket?.off(event, handler); };
    }, [socket]);

    return { socket, isConnected, emit, on };
};
