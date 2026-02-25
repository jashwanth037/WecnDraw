import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Crown, UserMinus } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { useRoomStore } from '../../store/roomStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface MembersPanelProps {
    roomId: string;
    isOpen: boolean;
    onClose: () => void;
}

const MembersPanel: React.FC<MembersPanelProps> = ({ roomId, isOpen, onClose }) => {
    const { emit } = useSocket();
    const { roomUsers, isHost } = useRoomStore();
    const { user: currentUser } = useAuthStore();

    const handleKick = (targetSocketId: string, username: string) => {
        if (!isHost) return;
        if (window.confirm(`Remove ${username} from the room?`)) {
            emit('room:kick', { roomId, targetSocketId });
            toast.success(`${username} has been removed`);
        }
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
                    style={{
                        position: 'absolute', right: 0, top: 52, bottom: 0, width: 300,
                        display: 'flex', flexDirection: 'column',
                        borderLeft: '1px solid var(--border)', zIndex: 20,
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={18} style={{ color: 'var(--accent-purple)' }} />
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif', fontSize: '0.9rem' }}>
                                Members
                            </span>
                            <span style={{
                                fontSize: '0.65rem', color: 'var(--text-muted)',
                                background: 'var(--bg-surface)', padding: '1px 6px', borderRadius: 8,
                            }}>
                                {roomUsers.length}
                            </span>
                        </div>
                        <button className="floating-btn" onClick={onClose} style={{ width: 28, height: 28 }}>
                            <X size={14} />
                        </button>
                    </div>

                    {/* User list */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                        {roomUsers.map((entry, i) => {
                            const isMe = entry.user._id === currentUser?._id;
                            const isFirstUser = i === 0; // first user is host

                            return (
                                <motion.div
                                    key={entry.socketId}
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                                        padding: '0.5rem 0.6rem', borderRadius: 10,
                                        background: isMe ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                                        marginBottom: 2,
                                    }}
                                >
                                    {/* Avatar */}
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: entry.color || 'var(--accent-purple)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.75rem', fontWeight: 700, color: 'white',
                                        flexShrink: 0, position: 'relative',
                                    }}>
                                        {entry.user.username?.[0]?.toUpperCase() || '?'}
                                        {/* Online dot */}
                                        <div style={{
                                            position: 'absolute', bottom: -1, right: -1,
                                            width: 10, height: 10, borderRadius: '50%',
                                            background: '#22c55e', border: '2px solid var(--bg-primary)',
                                        }} />
                                    </div>

                                    {/* Name + role */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '0.8rem', fontWeight: 600,
                                            color: 'var(--text-primary)',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            display: 'flex', alignItems: 'center', gap: 4,
                                        }}>
                                            {entry.user.username}
                                            {isMe && (
                                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>(you)</span>
                                            )}
                                        </div>
                                        {isFirstUser && (
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                                fontSize: '0.6rem', color: '#f59e0b', fontWeight: 600,
                                                background: 'rgba(245, 158, 11, 0.1)',
                                                padding: '1px 6px', borderRadius: 6, marginTop: 1,
                                            }}>
                                                <Crown size={9} /> Host
                                            </div>
                                        )}
                                    </div>

                                    {/* Kick button — only visible to host, not on self */}
                                    {isHost && !isMe && !isFirstUser && (
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleKick(entry.socketId, entry.user.username)}
                                            className="floating-btn"
                                            title={`Remove ${entry.user.username}`}
                                            style={{
                                                width: 28, height: 28, color: '#ef4444',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <UserMinus size={13} />
                                        </motion.button>
                                    )}
                                </motion.div>
                            );
                        })}

                        {roomUsers.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2rem' }}>
                                No members yet
                            </div>
                        )}
                    </div>

                    {/* Footer with role info */}
                    {isHost && (
                        <div style={{
                            padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border)',
                            fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center',
                        }}>
                            You are the host — you can remove members
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MembersPanel;
