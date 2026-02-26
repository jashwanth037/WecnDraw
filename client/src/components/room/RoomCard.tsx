import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Lock, Clock, ArrowRight, Crown, Trash2 } from 'lucide-react';
import type { Room } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useRoomStore } from '../../store/roomStore';
import { roomService } from '../../services/roomService';
import { formatDistanceToNow } from '../../utils/canvasHelpers';
import toast from 'react-hot-toast';

const GRADIENTS = [
    'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
    'linear-gradient(135deg, #f472b6 0%, #fbbf24 100%)',
    'linear-gradient(135deg, #22d3ee 0%, #10b981 100%)',
    'linear-gradient(135deg, #d946ef 0%, #f472b6 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)',
];

const RoomCard: React.FC<{ room: Room; index: number }> = ({ room, index }) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { myRooms, setMyRooms } = useRoomStore();
    const isHost = room.host._id === user?._id;
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm(`Delete "${room.name}"? This cannot be undone.`)) return;
        setIsDeleting(true);
        try {
            await roomService.deleteRoom(room.roomId);
            setMyRooms(myRooms.filter((r) => r._id !== room._id));
            toast.success('Room deleted');
        } catch { toast.error('Failed to delete room'); }
        finally { setIsDeleting(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -5 }}
            onClick={() => navigate(`/room/${room.roomId}`)}
            style={{ cursor: 'pointer' }}
        >
            <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                {/* Thumbnail */}
                <div style={{
                    height: 140, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: room.lastSnapshot ? `url(${room.lastSnapshot}) center/cover` : GRADIENTS[index % GRADIENTS.length],
                }}>
                    {!room.lastSnapshot && (
                        <div style={{ fontSize: '2.5rem', opacity: 0.85 }}>
                            {{ blank: '🎨', wireframe: '📐', flowchart: '🔀', kanban: '📋' }[room.template] || '🎨'}
                        </div>
                    )}

                    {isHost && (
                        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', fontSize: '0.68rem', color: '#fbbf24', fontWeight: 600 }}>
                            <Crown size={10} /> Host
                        </div>
                    )}
                    {room.isPasswordProtected && (
                        <div style={{ position: 'absolute', top: 8, right: 8, padding: '4px 8px', borderRadius: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#94a3b8' }}>
                            <Lock size={11} />
                        </div>
                    )}

                    {isHost && (
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={handleDelete} disabled={isDeleting} title="Delete room"
                            style={{
                                position: 'absolute', bottom: 8, right: 8, width: 30, height: 30, borderRadius: '50%',
                                background: 'rgba(239, 68, 68, 0.85)', backdropFilter: 'blur(4px)',
                                border: 'none', color: 'white', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                opacity: isDeleting ? 0.5 : 1, zIndex: 5,
                            }}>
                            <Trash2 size={13} />
                        </motion.button>
                    )}

                    {/* Hover overlay */}
                    <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
                        <div className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                            Enter Room <ArrowRight size={14} />
                        </div>
                    </motion.div>
                </div>

                {/* Info */}
                <div style={{ padding: '1rem 1.25rem', position: 'relative', zIndex: 1 }}>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{room.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {room.host.avatar ? (
                            <img src={room.host.avatar} alt="" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                        ) : (
                            <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--accent-purple)' }} />
                        )}
                        {room.host.username}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.7rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <Users size={12} /> {room.participants.length}/{room.maxUsers}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <Clock size={12} /> {formatDistanceToNow(room.updatedAt)}
                        </div>
                    </div>

                    {room.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                            {room.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="chip" style={{ fontSize: '0.63rem' }}>{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default RoomCard;
