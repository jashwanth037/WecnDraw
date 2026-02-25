import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, X, Monitor, Eye } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { useAuthStore } from '../../store/authStore';
import { useRoomStore } from '../../store/roomStore';
import type { Message } from '../../types';
import { roomService } from '../../services/roomService';

interface ChatPanelProps {
    roomId: string;
    isOpen: boolean;
    onClose: () => void;
    screenShareUser?: string | null;
    onWatchScreen?: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ roomId, isOpen, onClose, screenShareUser, onWatchScreen }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const { emit, on } = useSocket();
    const { user } = useAuthStore();
    const { roomUsers } = useRoomStore();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Load history
    useEffect(() => {
        roomService.getMessages(roomId).then((res) => setMessages(res.data.messages || [])).catch(() => { });
    }, [roomId]);

    // Socket listeners
    useEffect(() => {
        const cleanups: Array<() => void> = [];

        cleanups.push(on('chat:message', (msg: any) => {
            setMessages((prev) => [...prev, msg as Message]);
        }));

        return () => cleanups.forEach((fn) => fn());
    }, [on]);

    // Auto-scroll
    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isOpen, messages]);

    const sendMessage = () => {
        if (!text.trim()) return;
        emit('chat:message', { roomId, text: text.trim() });
        setText('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 340, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 340, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="glass"
                    style={{ position: 'absolute', right: 0, top: 52, bottom: 0, width: 320, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border)', zIndex: 20 }}
                >
                    {/* Header */}
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageCircle size={18} style={{ color: 'var(--accent-purple)' }} />
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif', fontSize: '0.9rem' }}>Chat</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '1px 6px', borderRadius: 8 }}>
                                {roomUsers.length} online
                            </span>
                        </div>
                        <button className="floating-btn" onClick={onClose} style={{ width: 28, height: 28 }}>
                            <X size={14} />
                        </button>
                    </div>

                    {/* Screen share card (pinned at top of chat) */}
                    <AnimatePresence>
                        {screenShareUser && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{
                                    margin: '0.5rem 0.75rem', padding: '0.6rem 0.75rem',
                                    borderRadius: 10, background: 'rgba(124, 58, 237, 0.08)',
                                    border: '1px solid rgba(124, 58, 237, 0.2)',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: 'rgba(124, 58, 237, 0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <Monitor size={13} style={{ color: 'var(--accent-purple)' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {screenShareUser} is sharing
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            Screen share is live
                                        </div>
                                    </div>
                                    {onWatchScreen && (
                                        <button
                                            onClick={onWatchScreen}
                                            style={{
                                                background: 'var(--accent-purple)', color: 'white',
                                                border: 'none', borderRadius: 8, padding: '4px 10px',
                                                fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 4,
                                                whiteSpace: 'nowrap', flexShrink: 0,
                                            }}
                                        >
                                            <Eye size={11} /> Watch
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2rem' }}>
                                No messages yet. Say hi! 👋
                            </div>
                        )}
                        {messages.map((msg, i) => {
                            const isMine = msg.sender?._id === user?._id;
                            return (
                                <motion.div
                                    key={msg._id || i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        padding: '6px 10px', borderRadius: 10, maxWidth: '85%',
                                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                                        background: isMine ? 'var(--accent-purple)' : 'var(--bg-surface)',
                                        color: isMine ? 'white' : 'var(--text-primary)',
                                        fontSize: '0.8rem', lineHeight: 1.4,
                                    }}
                                >
                                    {!isMine && (
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 2 }}>
                                            {msg.sender?.username}
                                        </div>
                                    )}
                                    {msg.text}
                                </motion.div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.4rem' }}>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                            className="input"
                            style={{ flex: 1, fontSize: '0.8rem', padding: '6px 10px' }}
                        />
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={sendMessage}
                            className={`floating-btn ${text.trim() ? 'active' : ''}`}
                            disabled={!text.trim()}
                            style={{ width: 32, height: 32 }}
                        >
                            <Send size={14} />
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChatPanel;
