import { create } from 'zustand';
import type { CanvasTool, BrushSettings, CursorPosition } from '../types';

interface CanvasHistoryItem {
    state: string;
}

interface CanvasState {
    tool: CanvasTool;
    brushSettings: BrushSettings;
    undoStack: CanvasHistoryItem[];
    redoStack: CanvasHistoryItem[];
    canUndo: boolean;
    canRedo: boolean;
    cursors: Map<string, CursorPosition>;
    zoom: number;
    isRecording: boolean;
    theme: 'dark' | 'light';

    setTool: (tool: CanvasTool) => void;
    updateBrush: (settings: Partial<BrushSettings>) => void;
    pushHistory: (state: string) => void;
    undo: () => string | null;
    redo: () => string | null;
    clearHistory: () => void;
    setCursor: (socketId: string, position: CursorPosition) => void;
    removeCursor: (socketId: string) => void;
    setZoom: (zoom: number) => void;
    setRecording: (isRecording: boolean) => void;
    setTheme: (theme: 'dark' | 'light') => void;
    addRecentColor: (color: string) => void;
}

const MAX_HISTORY = 50;

export const useCanvasStore = create<CanvasState>()((set, get) => ({
    tool: 'pencil',
    brushSettings: {
        color: '#7c3aed',
        size: 4,
        opacity: 1,
        fontFamily: 'Inter',
        fontSize: 18,
        fillColor: 'transparent',
        strokeStyle: 'solid' as const,
        recentColors: ['#7c3aed', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'],
    },
    undoStack: [],
    redoStack: [],
    canUndo: false,
    canRedo: false,
    cursors: new Map(),
    zoom: 1,
    isRecording: false,
    theme: (localStorage.getItem('wecndraw-theme') as 'dark' | 'light') || 'dark',

    setTool: (tool) => set({ tool }),

    updateBrush: (settings) =>
        set((state) => ({
            brushSettings: { ...state.brushSettings, ...settings },
        })),

    addRecentColor: (color) =>
        set((state) => {
            const colors = [color, ...state.brushSettings.recentColors.filter((c) => c !== color)].slice(0, 10);
            return { brushSettings: { ...state.brushSettings, recentColors: colors } };
        }),

    pushHistory: (canvasState) =>
        set((state) => {
            const newStack = [...state.undoStack, { state: canvasState }].slice(-MAX_HISTORY);
            return { undoStack: newStack, redoStack: [], canUndo: true, canRedo: false };
        }),

    undo: () => {
        const { undoStack, redoStack } = get();
        // Need at least 2 items: the current state + one previous state to go back to
        if (undoStack.length < 2) return null;
        const current = undoStack[undoStack.length - 1];
        const prev = undoStack[undoStack.length - 2];
        const newUndo = undoStack.slice(0, -1);
        set({
            undoStack: newUndo,
            redoStack: [...redoStack, current],
            canUndo: newUndo.length > 1,
            canRedo: true,
        });
        return prev.state;
    },

    redo: () => {
        const { undoStack, redoStack } = get();
        if (redoStack.length === 0) return null;
        const next = redoStack[redoStack.length - 1];
        const newRedo = redoStack.slice(0, -1);
        set({
            redoStack: newRedo,
            undoStack: [...undoStack, next],
            canRedo: newRedo.length > 0,
            canUndo: true,
        });
        return next.state;
    },

    clearHistory: () => set({ undoStack: [], redoStack: [], canUndo: false, canRedo: false }),

    setCursor: (socketId, position) =>
        set((state) => {
            const newMap = new Map(state.cursors);
            newMap.set(socketId, position);
            return { cursors: newMap };
        }),

    removeCursor: (socketId) =>
        set((state) => {
            const newMap = new Map(state.cursors);
            newMap.delete(socketId);
            return { cursors: newMap };
        }),


    setZoom: (zoom) => set({ zoom }),

    setRecording: (isRecording) => set({ isRecording }),

    setTheme: (theme) => {
        localStorage.setItem('wecndraw-theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
        }
        set({ theme });
    },
}));
