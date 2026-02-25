import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Share2, Settings, LogOut, Download,
    Video, VideoOff, MoreVertical, Smile,
    ZoomIn, ZoomOut, Maximize, Undo2, Redo2,
    Monitor, MonitorOff, Mic, MicOff, Users, X,
} from 'lucide-react';
import Canvas from '../components/whiteboard/Canvas';
import Toolbar from '../components/whiteboard/Toolbar';
import ToolSettings from '../components/whiteboard/ToolSettings';
import ChatPanel from '../components/whiteboard/ChatPanel';
import MembersPanel from '../components/whiteboard/MembersPanel';
import PresenceBar from '../components/whiteboard/PresenceBar';
import Loader from '../components/shared/Loader';
import Modal from '../components/shared/Modal';
import ThemeToggle from '../components/shared/ThemeToggle';
import { useSocket } from '../hooks/useSocket';
import { useAuthStore } from '../store/authStore';
import { useRoomStore } from '../store/roomStore';
import { useCanvasStore } from '../store/canvasStore';
import { useWebRTC } from '../hooks/useWebRTC';
import { roomService } from '../services/roomService';
import { downloadCanvasAsImage } from '../utils/canvasHelpers';
import toast from 'react-hot-toast';

const REACTION_EMOJIS = ['👏', '🔥', '💡', '❓', '✅', '❤️', '😂', '🚀'];

const WhiteboardPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { currentRoom, setCurrentRoom, setRoomUsers, setIsHost } = useRoomStore();
    const { isConnected, emit, on } = useSocket();
    const { setRecording, zoom, setZoom, canUndo, canRedo } = useCanvasStore();

    // WebRTC for screen & audio sharing
    const {
        isScreenSharing, isAudioSharing, remoteStreams, screenShareUser,
        startScreenShare, stopScreenShare, startAudioShare, stopAudioShare,
    } = useWebRTC(roomId || '');

    const [isLoading, setIsLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [unreadChat, setUnreadChat] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [isRecordingLocal, setIsRecordingLocal] = useState(false);
    const [emojiQueue, setEmojiQueue] = useState<Array<{ emoji: string; id: number }>>([]);
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    // Opt-in states for watching/listening
    const [isWatchingScreen, setIsWatchingScreen] = useState(false);
    const [isListeningAudio, setIsListeningAudio] = useState(true); // audio defaults to on for convenience
    const [audioSpeakers, setAudioSpeakers] = useState<string[]>([]);

    const actionMenuRef = useRef<HTMLDivElement>(null);
    const reactionRef = useRef<HTMLDivElement>(null);
    const screenVideoRef = useRef<HTMLVideoElement>(null);

    // Close menus on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
                setShowActionMenu(false);
            }
            if (reactionRef.current && !reactionRef.current.contains(e.target as Node)) {
                setShowReactionPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Join room
    useEffect(() => {
        if (!roomId || !isConnected || !user) return;
        const init = async () => {
            try {
                const res = await roomService.getRoom(roomId);
                const room = res.data.room;
                setCurrentRoom(room);
                setIsHost(room.host._id === user._id);
                document.title = `${room.name} — WecnDraw`;
            } catch {
                toast.error('Room not found');
                navigate('/dashboard');
                return;
            }
            emit('room:join', { roomId, user: { _id: user._id, username: user.username, avatar: user.avatar } });
            setIsLoading(false);
        };
        init();
        return () => {
            emit('room:leave', { roomId });
            setCurrentRoom(null);
            setRoomUsers([]);
        };
    }, [roomId, isConnected, user]);

    // Socket listeners
    useEffect(() => {
        const cleanups: Array<() => void> = [];
        cleanups.push(on('room:kicked', () => { toast.error('You were removed by the host'); navigate('/dashboard'); }));
        cleanups.push(on('room:closed', () => { toast.error('Room closed by host'); navigate('/dashboard'); }));
        cleanups.push(on('draw:emoji', (args: any) => {
            const emoji = args.emoji || args;
            const id = Date.now();
            setEmojiQueue((prev) => [...prev, { emoji, id }]);
            setTimeout(() => setEmojiQueue((prev) => prev.filter((e) => e.id !== id)), 3000);
        }));
        return () => cleanups.forEach((fn) => fn());
    }, [on]);

    // Attach remote screen share stream to video element
    useEffect(() => {
        const screenStream = remoteStreams.find((s) => s.type === 'screen');
        if (screenVideoRef.current && screenStream) {
            screenVideoRef.current.srcObject = screenStream.stream;
        }
    }, [remoteStreams]);

    // Track who is sharing audio for the indicator
    useEffect(() => {
        const audioStreams = remoteStreams.filter((s) => s.type === 'audio');
        setAudioSpeakers(audioStreams.map((s) => s.username));
    }, [remoteStreams]);

    // Play remote audio streams (opt-in via isListeningAudio)
    useEffect(() => {
        const audioStreams = remoteStreams.filter((s) => s.type === 'audio');
        if (isListeningAudio) {
            audioStreams.forEach((s) => {
                const existingEl = document.getElementById(`audio-${s.socketId}`) as HTMLAudioElement;
                if (!existingEl) {
                    const audio = document.createElement('audio');
                    audio.id = `audio-${s.socketId}`;
                    audio.srcObject = s.stream;
                    audio.autoplay = true;
                    audio.style.display = 'none';
                    document.body.appendChild(audio);
                }
            });
        }
        // Cleanup: remove audio elements for streams that are gone OR when muted
        return () => {
            if (!isListeningAudio) {
                // Muted: remove all remote audio elements
                document.querySelectorAll('audio[id^="audio-"]').forEach((el) => el.remove());
            } else {
                // Remove elements for disconnected streams
                document.querySelectorAll('audio[id^="audio-"]').forEach((el) => {
                    const sid = el.id.replace('audio-', '');
                    if (!audioStreams.find((s) => s.socketId === sid)) el.remove();
                });
            }
        };
    }, [remoteStreams, isListeningAudio]);

    const handleLeave = () => { emit('room:leave', { roomId }); setCurrentRoom(null); navigate('/dashboard'); };

    const handleToggleRecord = async () => {
        try {
            const action = isRecordingLocal ? 'stop' : 'start';
            await roomService.toggleRecording(roomId!, action);
            setIsRecordingLocal(!isRecordingLocal);
            setRecording(!isRecordingLocal);
            toast.success(action === 'start' ? '🔴 Recording started' : '⏹ Recording saved');
        } catch { toast.error('Recording failed'); }
    };

    const sendEmoji = (emoji: string) => {
        emit('draw:emoji', { roomId, emoji });
        const id = Date.now();
        setEmojiQueue((prev) => [...prev, { emoji, id }]);
        setTimeout(() => setEmojiQueue((prev) => prev.filter((e) => e.id !== id)), 3000);
    };

    const handleShare = () => { navigator.clipboard.writeText(window.location.href); toast.success('Room link copied!'); };

    const handleDownload = () => {
        const canvas = (window as any).__fabricCanvas;
        if (canvas) downloadCanvasAsImage(canvas, `canvas-${roomId}.png`);
    };

    const handleUndo = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const canvas = (window as any).__fabricCanvas;
        const state = useCanvasStore.getState().undo();
        if (state !== null && canvas) {
            canvas._isLoadingState = true;
            canvas.loadFromJSON(state).then(() => { canvas._isLoadingState = false; canvas.renderAll(); });
            emit('canvas:undo', { roomId, canvasState: state });
        }
    };

    const handleRedo = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const canvas = (window as any).__fabricCanvas;
        const state = useCanvasStore.getState().redo();
        if (state !== null && canvas) {
            canvas._isLoadingState = true;
            canvas.loadFromJSON(state).then(() => { canvas._isLoadingState = false; canvas.renderAll(); });
            emit('canvas:redo', { roomId, canvasState: state });
        }
    };

    const handleZoom = (delta: number) => {
        const newZoom = Math.min(3, Math.max(0.25, zoom + delta));
        setZoom(newZoom);
        const canvas = (window as any).__fabricCanvas;
        if (canvas) {
            canvas.setZoom(newZoom);
            canvas.renderAll();
        }
    };

    const handleFitToScreen = () => {
        setZoom(1);
        const canvas = (window as any).__fabricCanvas;
        if (canvas) { canvas.setZoom(1); canvas.setViewportTransform([1, 0, 0, 1, 0, 0]); canvas.renderAll(); }
    };

    const handleToggleScreenShare = () => {
        if (isScreenSharing) stopScreenShare();
        else startScreenShare();
    };

    const handleToggleAudioShare = () => {
        if (isAudioSharing) stopAudioShare();
        else startAudioShare();
    };

    if (isLoading) return <Loader text="Joining room..." />;

    const screenStream = remoteStreams.find((s) => s.type === 'screen');
    const panelOpen = showChat || showMembers;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>
            {/* ─── Full-bleed Canvas Area ─── */}
            <div className="canvas-bg-dots" style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
                {/* Floating toolbar + settings */}
                <Toolbar roomId={roomId!} />
                <ToolSettings />

                {/* Canvas */}
                <Canvas roomId={roomId!} template={currentRoom?.template} />

                {/* ── Screen share video overlay (opt-in: only when watching) ── */}
                <AnimatePresence>
                    {isWatchingScreen && screenStream && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{
                                position: 'absolute', bottom: 72, left: 16, zIndex: 25,
                                borderRadius: 12, overflow: 'hidden',
                                border: '2px solid var(--accent-purple)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                maxWidth: 480, maxHeight: 300,
                            }}
                        >
                            <div style={{
                                padding: '4px 10px', background: 'var(--accent-purple)', color: 'white',
                                fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Monitor size={12} /> {screenStream.username}'s screen
                                </span>
                                <button
                                    onClick={() => setIsWatchingScreen(false)}
                                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 2, display: 'flex' }}
                                >
                                    <X size={12} />
                                </button>
                            </div>
                            <video
                                ref={screenVideoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{ width: '100%', display: 'block', background: '#000' }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── User avatars (top-center) ── */}
                <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 30 }}>
                    <PresenceBar />
                </div>

                {/* ── Top-right floating options ── */}
                <div style={{ position: 'absolute', top: 12, right: 14, zIndex: 30, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ThemeToggle />

                    {/* Screen share toggle */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleToggleScreenShare}
                        className={`floating-btn ${isScreenSharing ? 'active' : ''}`}
                        title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
                        style={{ color: isScreenSharing ? '#ef4444' : undefined }}
                    >
                        {isScreenSharing ? <MonitorOff size={16} /> : <Monitor size={16} />}
                    </motion.button>

                    {/* Audio share toggle */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleToggleAudioShare}
                        className={`floating-btn ${isAudioSharing ? 'active' : ''}`}
                        title={isAudioSharing ? 'Stop sharing audio' : 'Share audio'}
                        style={{ color: isAudioSharing ? '#ef4444' : undefined }}
                    >
                        {isAudioSharing ? <MicOff size={16} /> : <Mic size={16} />}
                    </motion.button>

                    {/* Reactions popover */}
                    <div ref={reactionRef} style={{ position: 'relative' }}>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowReactionPicker(!showReactionPicker)}
                            className={`floating-btn ${showReactionPicker ? 'active' : ''}`}
                            title="Reactions"
                        >
                            <Smile size={16} />
                        </motion.button>

                        <AnimatePresence>
                            {showReactionPicker && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    transition={{ duration: 0.12 }}
                                    style={{
                                        position: 'absolute', top: 42, right: 0,
                                        padding: '6px', borderRadius: 12,
                                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                                        display: 'flex', gap: 2,
                                        zIndex: 40,
                                    }}
                                >
                                    {REACTION_EMOJIS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            className="reaction-btn"
                                            onClick={() => { sendEmoji(emoji); setShowReactionPicker(false); }}
                                            style={{ fontSize: '1.1rem', padding: '4px 6px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 6, transition: 'background 0.1s' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Members toggle */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setShowMembers(!showMembers); if (!showMembers) setShowChat(false); }}
                        className={`floating-btn ${showMembers ? 'active' : ''}`}
                        title="Members"
                    >
                        <Users size={16} />
                    </motion.button>

                    {/* Chat toggle */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setShowChat(!showChat); setUnreadChat(0); if (!showChat) setShowMembers(false); }}
                        className={`floating-btn ${showChat ? 'active' : ''}`}
                        title="Chat"
                        style={{ position: 'relative' }}
                    >
                        <MessageCircle size={16} />
                        {unreadChat > 0 && (
                            <span style={{ position: 'absolute', top: -2, right: -2, width: 14, height: 14, borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: '0.55rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadChat}</span>
                        )}
                    </motion.button>

                    {/* Action menu trigger */}
                    <div ref={actionMenuRef} style={{ position: 'relative' }}>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowActionMenu(!showActionMenu)}
                            className={`floating-btn ${showActionMenu ? 'active' : ''}`}
                            title="Actions"
                        >
                            <MoreVertical size={16} />
                        </motion.button>

                        <AnimatePresence>
                            {showActionMenu && (
                                <motion.div
                                    className="action-menu"
                                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                                    transition={{ duration: 0.12 }}
                                >
                                    <button className="action-menu-item" onClick={() => { handleShare(); setShowActionMenu(false); }}>
                                        <Share2 size={15} /> Share Room Link
                                    </button>
                                    <button className="action-menu-item" onClick={() => { handleToggleRecord(); setShowActionMenu(false); }}>
                                        {isRecordingLocal ? <VideoOff size={15} style={{ color: '#ef4444' }} /> : <Video size={15} />}
                                        {isRecordingLocal ? 'Stop Recording' : 'Start Recording'}
                                    </button>
                                    <button className="action-menu-item" onClick={() => { handleDownload(); setShowActionMenu(false); }}>
                                        <Download size={15} /> Download Canvas
                                    </button>
                                    <button className="action-menu-item" onClick={() => { setShowSettings(true); setShowActionMenu(false); }}>
                                        <Settings size={15} /> Room Settings
                                    </button>
                                    <div className="action-menu-sep" />
                                    <button className="action-menu-item danger" onClick={() => { handleLeave(); setShowActionMenu(false); }}>
                                        <LogOut size={15} /> Leave Room
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Chat Panel */}
                <ChatPanel
                    roomId={roomId!}
                    isOpen={showChat}
                    onClose={() => setShowChat(false)}
                    screenShareUser={screenShareUser}
                    onWatchScreen={() => setIsWatchingScreen(true)}
                />

                {/* Members Panel */}
                <MembersPanel
                    roomId={roomId!}
                    isOpen={showMembers}
                    onClose={() => setShowMembers(false)}
                />

                {/* ── Zoom Controls (bottom-left) ── */}
                <motion.div
                    className="zoom-controls"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <button className="zoom-btn" onClick={() => handleZoom(-0.1)} title="Zoom out"><ZoomOut size={15} /></button>
                    <span className="zoom-label">{Math.round(zoom * 100)}%</span>
                    <button className="zoom-btn" onClick={() => handleZoom(0.1)} title="Zoom in"><ZoomIn size={15} /></button>
                    <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
                    <button className="zoom-btn" onClick={handleFitToScreen} title="Fit to screen"><Maximize size={14} /></button>
                </motion.div>

                {/* ── Undo / Redo (bottom-right) ── */}
                <motion.div
                    className="undoredo-controls"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    style={{ right: panelOpen ? 340 : 16 }}
                >
                    <button type="button" className="zoom-btn" onClick={handleUndo} title="Undo (Ctrl+Z)" style={{ opacity: canUndo ? 1 : 0.35 }}>
                        <Undo2 size={15} />
                    </button>
                    <button type="button" className="zoom-btn" onClick={handleRedo} title="Redo (Ctrl+Y)" style={{ opacity: canRedo ? 1 : 0.35 }}>
                        <Redo2 size={15} />
                    </button>
                </motion.div>

                {/* Screen share notification (small toast when chat is closed) */}
                <AnimatePresence>
                    {screenShareUser && !isWatchingScreen && !showChat && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{
                                position: 'absolute', top: 60, right: 14,
                                zIndex: 35, background: 'var(--bg-surface)', border: '1px solid var(--accent-purple)',
                                padding: '6px 12px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 600,
                                boxShadow: '0 4px 20px rgba(124,58,237,0.25)',
                                display: 'flex', alignItems: 'center', gap: 8,
                                color: 'var(--text-primary)', cursor: 'pointer',
                            }}
                            onClick={() => { setShowChat(true); setShowMembers(false); }}
                        >
                            <Monitor size={14} style={{ color: 'var(--accent-purple)' }} />
                            <span>{screenShareUser} is sharing</span>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>tap to view</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Audio sharing indicator (bottom center) ── */}
                <AnimatePresence>
                    {audioSpeakers.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={{
                                position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
                                zIndex: 35, background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                padding: '6px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                display: 'flex', alignItems: 'center', gap: 8,
                                color: 'var(--text-primary)',
                            }}
                        >
                            <div style={{
                                width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }} />
                            <Mic size={13} style={{ color: '#22c55e' }} />
                            <span>{audioSpeakers.join(', ')} speaking</span>
                            <button
                                onClick={() => setIsListeningAudio(!isListeningAudio)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: isListeningAudio ? 'var(--text-muted)' : '#ef4444',
                                    padding: 2, display: 'flex', alignItems: 'center',
                                }}
                                title={isListeningAudio ? 'Mute' : 'Unmute'}
                            >
                                {isListeningAudio ? <MicOff size={13} /> : <Mic size={13} />}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating emoji reactions */}
                <div style={{ position: 'absolute', bottom: '5rem', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 50, display: 'flex', gap: '0.5rem' }}>
                    <AnimatePresence>
                        {emojiQueue.map(({ emoji, id }) => (
                            <motion.div key={id} initial={{ y: 0, opacity: 1, scale: 1 }} animate={{ y: -120, opacity: 0, scale: 1.5 }} transition={{ duration: 2.5, ease: 'easeOut' }}
                                style={{ fontSize: '2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{emoji}</motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Settings Modal */}
            <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="⚙️ Room Settings">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '1rem', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Room ID</p>
                        <code style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-purple)' }}>{roomId}</code>
                    </div>
                    {useRoomStore.getState().isHost && (
                        <button className="btn-secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => { emit('room:close', { roomId }); navigate('/dashboard'); }}>
                            🗑 Close Room
                        </button>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default WhiteboardPage;
