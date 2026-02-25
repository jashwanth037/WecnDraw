import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Users, LogIn, BarChart2, Paintbrush } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import RoomCard from '../components/room/RoomCard';
import CreateRoom from '../components/room/CreateRoom';
import JoinRoom from '../components/room/JoinRoom';
import Modal from '../components/shared/Modal';
import Loader from '../components/shared/Loader';
import { roomService } from '../services/roomService';
import { useRoomStore } from '../store/roomStore';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
    const { myRooms, setMyRooms } = useRoomStore();
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Dashboard — WecnDraw';
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await roomService.getMyRooms();
            setMyRooms(res.data.rooms);
        } catch {
            toast.error('Failed to load rooms');
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = myRooms.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />

            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}
                >
                    <div>
                        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Your Canvases</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{myRooms.length} room{myRooms.length !== 1 ? 's' : ''} — {myRooms.reduce((acc, r) => acc + r.participants.length, 0)} total participants</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn-secondary" onClick={() => navigate('/draw')} style={{ gap: '0.4rem', display: 'flex', alignItems: 'center' }}>
                            <Paintbrush size={16} /> Free Draw
                        </button>
                        <button className="btn-secondary" onClick={() => setShowJoin(true)} style={{ gap: '0.4rem', display: 'flex', alignItems: 'center' }}>
                            <LogIn size={16} /> Join Room
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary animated-border"
                            onClick={() => setShowCreate(true)}
                            style={{ gap: '0.4rem' }}
                        >
                            <Plus size={16} /> Create Room
                        </motion.button>
                    </div>
                </motion.div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{ position: 'relative', maxWidth: 400, marginBottom: '2rem' }}
                >
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="input-field"
                        placeholder="Search rooms..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </motion.div>

                {/* Content */}
                {isLoading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{ borderRadius: 12, overflow: 'hidden' }}>
                                <div className="skeleton" style={{ height: 140 }} />
                                <div style={{ padding: '1rem', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <div className="skeleton" style={{ height: 16, width: '70%' }} />
                                    <div className="skeleton" style={{ height: 12, width: '50%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ textAlign: 'center', padding: '5rem 2rem' }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎨</div>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            {search ? 'No rooms found' : 'No rooms yet'}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            {search ? 'Try a different search term' : 'Create your first collaborative canvas to get started.'}
                        </p>
                        {!search && (
                            <button className="btn-primary" onClick={() => setShowCreate(true)}>
                                <Plus size={16} /> Create your first room
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                        <AnimatePresence>
                            {filtered.map((room, i) => (
                                <RoomCard key={room._id} room={room} index={i} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Create Room Modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="" width={420}>
                <CreateRoom onClose={() => setShowCreate(false)} />
            </Modal>

            {/* Join Room Modal */}
            <Modal isOpen={showJoin} onClose={() => setShowJoin(false)} title="🔗 Join a Room" width={400}>
                <JoinRoom onClose={() => setShowJoin(false)} />
            </Modal>
        </div>
    );
};

export default DashboardPage;
