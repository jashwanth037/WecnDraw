import React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { useRoomStore } from '../../store/roomStore';
import { useAuthStore } from '../../store/authStore';
import { useSocketContext } from '../../context/SocketContext';
import { generateUserColor } from '../../utils/canvasHelpers';

const PresenceBar: React.FC = () => {
    const { roomUsers, currentRoom } = useRoomStore();
    const { user } = useAuthStore();
    const { isConnected } = useSocketContext();

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Avatar cluster */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {roomUsers.slice(0, 6).map((ru, i) => {
                    const isHost = currentRoom?.host._id === ru.user._id;
                    const isSelf = ru.user._id === user?._id;
                    const color = generateUserColor(ru.user._id);

                    return (
                        <motion.div
                            key={ru.socketId}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            title={`${ru.user.username}${isHost ? ' (Host)' : ''}${isSelf ? ' (You)' : ''}`}
                            style={{ marginLeft: i === 0 ? 0 : -8, position: 'relative', zIndex: roomUsers.length - i }}
                        >
                            <div style={{
                                width: 26, height: 26, borderRadius: '50%',
                                border: `2px solid ${isSelf ? 'var(--accent-purple)' : 'var(--bg-card)'}`,
                                background: ru.user.avatar ? `url(${ru.user.avatar}) center/cover` : color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.6rem', fontWeight: 700, color: 'white',
                                overflow: 'hidden',
                            }}>
                                {!ru.user.avatar && ru.user.username?.[0]?.toUpperCase()}
                            </div>
                            {/* Connection status dot on your own avatar */}
                            {isSelf && (
                                <div style={{
                                    position: 'absolute', bottom: -1, right: -1,
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: isConnected ? '#10b981' : '#ef4444',
                                    border: '1.5px solid var(--bg-primary)',
                                }} />
                            )}
                            {isHost && (
                                <div style={{ position: 'absolute', top: -3, right: -3, background: '#f59e0b', borderRadius: '50%', padding: 1 }}>
                                    <Crown size={7} color="white" />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
                {roomUsers.length > 6 && (
                    <div style={{ marginLeft: -8, width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-surface)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        +{roomUsers.length - 6}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PresenceBar;
