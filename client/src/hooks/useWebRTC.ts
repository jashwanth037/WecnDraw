import { useRef, useState, useCallback, useEffect } from 'react';
import { useSocket } from './useSocket';
import { useRoomStore } from '../store/roomStore';

export interface PeerStream {
    socketId: string;
    username: string;
    stream: MediaStream;
    type: 'screen' | 'audio';
}

/**
 * Composite key for the peers map so screen and audio connections don't collide.
 */
const peerKey = (socketId: string, type: 'screen' | 'audio') => `${socketId}::${type}`;

export const useWebRTC = (roomId: string) => {
    const { socket, emit, on } = useSocket();
    const { roomUsers } = useRoomStore();

    // Use composite key (socketId::type) so screen & audio don't overwrite each other
    const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localScreenRef = useRef<MediaStream | null>(null);
    const localAudioRef = useRef<MediaStream | null>(null);

    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isAudioSharing, setIsAudioSharing] = useState(false);
    const [remoteStreams, setRemoteStreams] = useState<PeerStream[]>([]);
    const [screenShareUser, setScreenShareUser] = useState<string | null>(null);

    const iceConfig: RTCConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    };

    // Create a peer connection for a given target socket + type
    const createPeerConnection = useCallback((targetSocketId: string, stream: MediaStream, type: 'screen' | 'audio') => {
        const key = peerKey(targetSocketId, type);
        // Close existing connection for this key if any
        const existing = peersRef.current.get(key);
        if (existing) { existing.close(); peersRef.current.delete(key); }

        const pc = new RTCPeerConnection(iceConfig);

        // Add local tracks
        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
        });

        // ICE candidates
        pc.onicecandidate = (e) => {
            if (e.candidate) {
                emit('webrtc:ice-candidate', { roomId, targetSocketId, candidate: e.candidate, type });
            }
        };

        // Remote tracks
        pc.ontrack = (e) => {
            const remoteStream = e.streams[0];
            if (remoteStream) {
                setRemoteStreams((prev) => {
                    if (prev.find((p) => p.socketId === targetSocketId && p.type === type)) return prev;
                    const user = roomUsers.find((u) => u.socketId === targetSocketId);
                    return [...prev, {
                        socketId: targetSocketId,
                        username: user?.user?.username || 'User',
                        stream: remoteStream,
                        type,
                    }];
                });
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                pc.close();
                peersRef.current.delete(key);
                setRemoteStreams((prev) => prev.filter((p) => !(p.socketId === targetSocketId && p.type === type)));
            }
        };

        peersRef.current.set(key, pc);
        return pc;
    }, [roomId, emit, roomUsers]);

    // ─── Screen sharing ───
    const startScreenShare = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' } as any,
                audio: false,
            });
            localScreenRef.current = stream;
            setIsScreenSharing(true);

            emit('webrtc:screen-share-start', { roomId });

            const users = roomUsers.filter((u) => u.socketId !== socket?.id);
            for (const user of users) {
                const pc = createPeerConnection(user.socketId, stream, 'screen');
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                emit('webrtc:offer', { roomId, targetSocketId: user.socketId, offer, type: 'screen' });
            }

            stream.getVideoTracks()[0].onended = () => { stopScreenShare(); };
        } catch (err) {
            console.error('Screen share failed:', err);
        }
    }, [roomId, emit, socket, roomUsers, createPeerConnection]);

    const stopScreenShare = useCallback(() => {
        localScreenRef.current?.getTracks().forEach((t) => t.stop());
        localScreenRef.current = null;
        setIsScreenSharing(false);
        emit('webrtc:screen-share-stop', { roomId });

        // Only close screen-type peer connections
        peersRef.current.forEach((pc, key) => {
            if (key.endsWith('::screen')) { pc.close(); peersRef.current.delete(key); }
        });
    }, [roomId, emit]);

    // ─── Audio sharing ───
    const startAudioShare = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localAudioRef.current = stream;
            setIsAudioSharing(true);

            emit('webrtc:audio-start', { roomId });

            const users = roomUsers.filter((u) => u.socketId !== socket?.id);
            for (const user of users) {
                const pc = createPeerConnection(user.socketId, stream, 'audio');
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                emit('webrtc:offer', { roomId, targetSocketId: user.socketId, offer, type: 'audio' });
            }
        } catch (err) {
            console.error('Audio share failed:', err);
        }
    }, [roomId, emit, socket, roomUsers, createPeerConnection]);

    const stopAudioShare = useCallback(() => {
        localAudioRef.current?.getTracks().forEach((t) => t.stop());
        localAudioRef.current = null;
        setIsAudioSharing(false);
        emit('webrtc:audio-stop', { roomId });

        // Only close audio-type peer connections
        peersRef.current.forEach((pc, key) => {
            if (key.endsWith('::audio')) { pc.close(); peersRef.current.delete(key); }
        });
    }, [roomId, emit]);

    // ─── Signaling event handlers ───
    useEffect(() => {
        const cleanups: Array<() => void> = [];

        // Incoming offer (from someone sharing TO us)
        cleanups.push(on('webrtc:offer', async (data: any) => {
            const { from, offer, type: streamType } = data;
            const type = streamType || 'screen';
            const key = peerKey(from, type);

            // Close any existing connection for this key
            const existing = peersRef.current.get(key);
            if (existing) { existing.close(); peersRef.current.delete(key); }

            const pc = new RTCPeerConnection(iceConfig);
            peersRef.current.set(key, pc);

            // If we also have a local stream of the same type, add our tracks (bi-directional)
            const localStream = type === 'screen' ? localScreenRef.current : localAudioRef.current;
            if (localStream) {
                localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
            }

            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    emit('webrtc:ice-candidate', { roomId, targetSocketId: from, candidate: e.candidate, type });
                }
            };

            pc.ontrack = (e) => {
                const remoteStream = e.streams[0];
                if (remoteStream) {
                    setRemoteStreams((prev) => {
                        if (prev.find((p) => p.socketId === from && p.type === type)) return prev;
                        const user = roomUsers.find((u) => u.socketId === from);
                        return [...prev, {
                            socketId: from,
                            username: user?.user?.username || 'User',
                            stream: remoteStream,
                            type,
                        }];
                    });
                }
            };

            pc.onconnectionstatechange = () => {
                if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                    pc.close();
                    peersRef.current.delete(key);
                    setRemoteStreams((prev) => prev.filter((p) => !(p.socketId === from && p.type === type)));
                }
            };

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            emit('webrtc:answer', { roomId, targetSocketId: from, answer });
        }));

        cleanups.push(on('webrtc:answer', async (data: any) => {
            const { from, answer, type: streamType } = data;
            const type = streamType || 'screen';
            const key = peerKey(from, type);
            const pc = peersRef.current.get(key);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        }));

        cleanups.push(on('webrtc:ice-candidate', async (data: any) => {
            const { from, candidate, type: streamType } = data;
            const type = streamType || 'screen';
            const key = peerKey(from, type);
            const pc = peersRef.current.get(key);
            if (pc && candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => { });
            }
        }));

        cleanups.push(on('webrtc:screen-share-started', (data: any) => {
            setScreenShareUser(data.user?.username || 'Someone');
        }));

        cleanups.push(on('webrtc:screen-share-stopped', (data: any) => {
            setScreenShareUser(null);
            setRemoteStreams((prev) => prev.filter((p) => !(p.socketId === data.socketId && p.type === 'screen')));
            // Clean up screen peer connections from that user
            const key = peerKey(data.socketId, 'screen');
            const pc = peersRef.current.get(key);
            if (pc) { pc.close(); peersRef.current.delete(key); }
        }));

        cleanups.push(on('webrtc:audio-started', (_data: any) => {
            // Remote audio will arrive via ontrack
        }));

        cleanups.push(on('webrtc:audio-stopped', (data: any) => {
            setRemoteStreams((prev) => prev.filter((p) => !(p.socketId === data.socketId && p.type === 'audio')));
            const key = peerKey(data.socketId, 'audio');
            const pc = peersRef.current.get(key);
            if (pc) { pc.close(); peersRef.current.delete(key); }
        }));

        // Handle late-joiner request: someone joins and asks us for our active streams
        cleanups.push(on('webrtc:request-streams', async (data: any) => {
            const { from } = data;
            // If we are currently sharing screen, send an offer to the new joiner
            if (localScreenRef.current) {
                const pc = createPeerConnection(from, localScreenRef.current, 'screen');
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                emit('webrtc:offer', { roomId, targetSocketId: from, offer, type: 'screen' });
            }
            // If we are currently sharing audio, send an offer to the new joiner
            if (localAudioRef.current) {
                const pc = createPeerConnection(from, localAudioRef.current, 'audio');
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                emit('webrtc:offer', { roomId, targetSocketId: from, offer, type: 'audio' });
            }
        }));

        return () => { cleanups.forEach((fn) => fn()); };
    }, [on, emit, roomId, roomUsers, createPeerConnection]);

    // Request streams from existing peers when we first connect (late joiner support)
    useEffect(() => {
        if (!roomId || !socket?.id) return;
        // Small delay so we're fully joined before requesting
        const timer = setTimeout(() => {
            emit('webrtc:request-streams', { roomId });
        }, 1500);
        return () => clearTimeout(timer);
    }, [roomId, socket?.id, emit]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            localScreenRef.current?.getTracks().forEach((t) => t.stop());
            localAudioRef.current?.getTracks().forEach((t) => t.stop());
            peersRef.current.forEach((pc) => pc.close());
            peersRef.current.clear();
        };
    }, []);

    return {
        isScreenSharing,
        isAudioSharing,
        remoteStreams,
        screenShareUser,
        startScreenShare,
        stopScreenShare,
        startAudioShare,
        stopAudioShare,
    };
};
