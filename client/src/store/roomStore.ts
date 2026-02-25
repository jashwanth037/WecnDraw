import { create } from 'zustand';
import type { Room, RoomUserEntry } from '../types';

interface RoomState {
    currentRoom: Room | null;
    myRooms: Room[];
    roomUsers: RoomUserEntry[];
    isHost: boolean;
    setCurrentRoom: (room: Room | null) => void;
    setMyRooms: (rooms: Room[]) => void;
    setRoomUsers: (users: RoomUserEntry[]) => void;
    addRoomUser: (user: RoomUserEntry) => void;
    removeRoomUser: (socketId: string) => void;
    setIsHost: (isHost: boolean) => void;
    addRoom: (room: Room) => void;
    removeRoom: (roomId: string) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
    currentRoom: null,
    myRooms: [],
    roomUsers: [],
    isHost: false,

    setCurrentRoom: (room) => set({ currentRoom: room }),
    setMyRooms: (rooms) => set({ myRooms: rooms }),
    setRoomUsers: (users) => set({ roomUsers: users }),
    addRoomUser: (user) =>
        set((state) => ({
            roomUsers: state.roomUsers.some((u) => u.socketId === user.socketId)
                ? state.roomUsers
                : [...state.roomUsers, user],
        })),
    removeRoomUser: (socketId) =>
        set((state) => ({
            roomUsers: state.roomUsers.filter((u) => u.socketId !== socketId),
        })),
    setIsHost: (isHost) => set({ isHost }),
    addRoom: (room) => set((state) => ({ myRooms: [room, ...state.myRooms] })),
    removeRoom: (roomId) =>
        set((state) => ({ myRooms: state.myRooms.filter((r) => r.roomId !== roomId) })),
}));
