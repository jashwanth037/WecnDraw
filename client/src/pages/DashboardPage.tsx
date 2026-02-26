import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Hash, Paintbrush, Sparkles } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import Modal from '../components/shared/Modal';
import CreateRoom from '../components/room/CreateRoom';
import JoinRoom from '../components/room/JoinRoom';
import RoomCard from '../components/room/RoomCard';
import Loader from '../components/shared/Loader';
import { roomService } from '../services/roomService';
import { useRoomStore } from '../store/roomStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const { myRooms, setMyRooms } = useRoomStore();
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Dashboard — WecnDraw';
        roomService.getMyRooms().then((res) => setMyRooms(res.data.rooms || [])).catch(() => { }).finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <Loader text="Loading your boards..." />;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />

            {/* ── Hero header ── */}
            <div style={{ position: 'relative', overflow: 'hidden', padding: '3rem 1.5rem 2.5rem', borderBottom: '1px solid var(--border)' }}>
                {/* Background glow */}
                <div style={{ position: 'absolute', top: '-50%', left: '20%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(40px)' }} />
                <div style={{ position: 'absolute', top: '-30%', right: '10%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(244,114,182,0.04) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(40px)' }} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                                Hey, <span className="gradient-text">{user?.username || 'Creator'}</span> 👋
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                {myRooms.length === 0 ? 'Create your first board to get started!' : `You have ${myRooms.length} board${myRooms.length === 1 ? '' : 's'}. Pick up where you left off.`}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="btn-primary"
                                onClick={() => setShowCreate(true)}
                                style={{ gap: '0.5rem', fontSize: '0.9rem' }}
                            >
                                <Plus size={17} /> New Board
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="btn-secondary"
                                onClick={() => setShowJoin(true)}
                                style={{ gap: '0.5rem', fontSize: '0.9rem' }}
                            >
                                <Hash size={15} /> Join Room
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="btn-secondary"
                                onClick={() => navigate('/draw')}
                                style={{ gap: '0.5rem', fontSize: '0.9rem' }}
                            >
                                <Paintbrush size={15} /> Free Draw
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── Boards Grid ── */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
                {myRooms.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            textAlign: 'center', padding: '4rem 2rem', borderRadius: 20,
                            border: '1.5px dashed rgba(139,92,246,0.2)',
                            background: 'rgba(139,92,246,0.03)',
                        }}
                    >
                        <motion.div
                            animate={{ rotate: [0, -8, 8, 0] }}
                            transition={{ repeat: Infinity, duration: 4, repeatDelay: 2 }}
                            style={{ fontSize: '4rem', marginBottom: '1rem' }}
                        >
                            🎨
                        </motion.div>
                        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            No boards yet
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: 360, margin: '0 auto 1.5rem' }}>
                            Create a new board to start collaborating with your team, or join an existing room.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            className="btn-primary"
                            onClick={() => setShowCreate(true)}
                            style={{ gap: '0.5rem', padding: '0.75rem 1.75rem' }}
                        >
                            <Sparkles size={17} /> Create Your First Board
                        </motion.button>
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                            {myRooms.map((room, i) => (
                                <RoomCard key={room._id} room={room} index={i} />
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>

            {/* Modals */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="✨ Create Board">
                <CreateRoom onClose={() => setShowCreate(false)} />
            </Modal>
            <Modal isOpen={showJoin} onClose={() => setShowJoin(false)} title="🔗 Join Room">
                <JoinRoom onClose={() => setShowJoin(false)} />
            </Modal>
        </div>
    );
};

export default DashboardPage;
