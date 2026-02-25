import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Paintbrush, Sparkles } from 'lucide-react';
import { roomService } from '../../services/roomService';
import { useRoomStore } from '../../store/roomStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/* Floating SVG doodle elements for the drawing-themed background */
const DoodleBackground: React.FC = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: 16 }}>
        {/* Gradient orbs */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />

        {/* SVG doodles */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            {/* Squiggly line top-right */}
            <motion.path
                d="M 280 20 Q 300 40 320 25 T 360 30"
                stroke="rgba(124,58,237,0.15)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.3 }}
            />
            {/* Star shape */}
            <motion.path
                d="M 50 30 L 53 40 L 63 40 L 55 46 L 58 56 L 50 50 L 42 56 L 45 46 L 37 40 L 47 40 Z"
                stroke="rgba(236,72,153,0.2)"
                strokeWidth="1.5"
                fill="rgba(236,72,153,0.05)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            />
            {/* Circle doodle */}
            <motion.circle
                cx="340"
                cy="140"
                r="18"
                stroke="rgba(6,182,212,0.15)"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="4 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.7 }}
            />
            {/* Small triangle */}
            <motion.path
                d="M 30 160 L 45 135 L 60 160 Z"
                stroke="rgba(245,158,11,0.18)"
                strokeWidth="1.5"
                fill="rgba(245,158,11,0.04)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
            />
            {/* Pencil stroke */}
            <motion.path
                d="M 300 180 Q 310 170 325 175 T 355 168"
                stroke="rgba(124,58,237,0.12)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, delay: 1.1 }}
            />
            {/* Dots pattern */}
            {[
                { cx: 100, cy: 20 }, { cx: 115, cy: 25 }, { cx: 130, cy: 18 },
                { cx: 200, cy: 180 }, { cx: 215, cy: 175 }, { cx: 230, cy: 182 },
            ].map((dot, i) => (
                <motion.circle
                    key={i}
                    cx={dot.cx}
                    cy={dot.cy}
                    r="2"
                    fill="rgba(148,163,184,0.2)"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                />
            ))}
        </svg>
    </div>
);

const CreateRoom: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [boardName, setBoardName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addRoom } = useRoomStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!boardName.trim()) return;
        setIsLoading(true);
        try {
            const res = await roomService.createRoom({
                name: boardName.trim(),
                template: 'blank',
                maxUsers: 10,
            });
            addRoom(res.data.room);
            toast.success('Board created! 🎨');
            onClose();
            navigate(`/room/${res.data.room.roomId}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create board');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <DoodleBackground />

            {/* Illustration header */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 }}
            >
                <div style={{
                    width: 64, height: 64, borderRadius: 18,
                    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
                }}>
                    <Paintbrush size={28} color="white" />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>
                        Name your board
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: '0.25rem 0 0' }}>
                        Give it a creative name and start drawing!
                    </p>
                </div>
            </motion.div>

            {/* Board Name Input */}
            <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                style={{ position: 'relative', zIndex: 1 }}
            >
                <div style={{
                    position: 'relative',
                    borderRadius: 14,
                    background: 'var(--bg-secondary)',
                    border: '2px solid var(--border)',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    overflow: 'hidden',
                }}>
                    <Paintbrush size={16} style={{
                        position: 'absolute', left: 14, top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--accent-purple)', opacity: 0.7,
                    }} />
                    <input
                        className="input-field"
                        placeholder="e.g. Sprint Planning, Design Jam..."
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        autoFocus
                        required
                        maxLength={60}
                        style={{
                            paddingLeft: '2.75rem',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: 500,
                            background: 'transparent',
                            height: 52,
                        }}
                    />
                </div>
                <div style={{
                    display: 'flex', justifyContent: 'flex-end',
                    marginTop: 6,
                    fontSize: '0.7rem',
                    color: boardName.length > 50 ? 'rgba(239,68,68,0.8)' : 'var(--text-muted)',
                }}>
                    {boardName.length}/60
                </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
                type="submit"
                className="btn-primary"
                disabled={isLoading || !boardName.trim()}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    gap: '0.5rem',
                    position: 'relative',
                    zIndex: 1,
                    opacity: boardName.trim() ? 1 : 0.5,
                    cursor: boardName.trim() ? 'pointer' : 'not-allowed',
                }}
            >
                {isLoading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                        <Sparkles size={18} />
                    </motion.div>
                ) : (
                    <>
                        <Sparkles size={18} />
                        Create Board
                    </>
                )}
            </motion.button>
        </form>
    );
};

export default CreateRoom;
