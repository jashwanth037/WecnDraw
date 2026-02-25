// ==========================================
// Core Types for WecnDraw
// ==========================================

export interface User {
    _id: string;
    username: string;
    email: string;
    avatar: string;
    role: 'admin' | 'user';
    createdAt: string;
}

export interface Participant {
    user: User;
    role: 'host' | 'participant';
}

export interface Room {
    _id: string;
    roomId: string;
    name: string;
    description: string;
    host: User;
    participants: Participant[];
    isActive: boolean;
    isPasswordProtected: boolean;
    maxUsers: number;
    tags: string[];
    template: 'blank' | 'wireframe' | 'flowchart' | 'kanban';
    lastSnapshot: string;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    _id: string;
    roomId: string;
    sender: User;
    text: string;
    type: 'text' | 'file' | 'system';
    fileUrl: string;
    fileName: string;
    mentions: string[];
    createdAt: string;
}

export interface CanvasObject {
    type: string;
    id?: string;
    [key: string]: unknown;
}

export interface Stroke {
    tool: string;
    color: string;
    size: number;
    points: Array<{ x: number; y: number }>;
    userId: string;
    timestamp: string;
}

export interface SessionFile {
    _id: string;
    name: string;
    url: string;
    type: string;
    uploadedBy: User;
    uploadedAt: string;
}

export interface Session {
    _id: string;
    roomId: string;
    strokes: Stroke[];
    canvasState: string;
    snapshot: string;
    files: SessionFile[];
    isRecording: boolean;
    analytics: SessionAnalytics;
    savedAt: string;
}

export interface SessionAnalytics {
    totalStrokes: number;
    totalMessages: number;
    totalFiles: number;
    activeTime: number;
    userContributions: Array<{
        userId: string;
        strokes: number;
        messages: number;
    }>;
}

// Socket event types
export interface SocketUser {
    _id: string;
    username: string;
    avatar: string;
}

export interface RoomUserEntry {
    socketId: string;
    user: SocketUser;
    color: string;
    joinedAt: number;
}

export interface CursorPosition {
    socketId: string;
    user: SocketUser;
    x: number;
    y: number;
}

export interface DrawData {
    tool: string;
    color: string;
    size: number;
    opacity: number;
    points?: Array<{ x: number; y: number }>;
    x?: number;
    y?: number;
}

export type CanvasTool =
    | 'select'
    | 'pencil'
    | 'eraser'
    | 'highlighter'
    | 'sketch'
    | 'rectangle'
    | 'circle'
    | 'triangle'
    | 'diamond'
    | 'arrow'
    | 'line'
    | 'text'
    | 'laser'
    | 'pan'
    | 'image';

export interface BrushSettings {
    color: string;
    size: number;
    opacity: number;
    fontFamily: string;
    fontSize: number;
    fillColor: string;
    strokeStyle: 'solid' | 'dashed';
    recentColors: string[];
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T;
}

export interface RecordingFrame {
    canvasState: string;
    timestamp: string;
}

export interface TimerState {
    duration: number;
    startedAt: number | null;
    isActive: boolean;
    by?: SocketUser;
}
