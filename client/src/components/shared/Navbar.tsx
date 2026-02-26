import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Paintbrush, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { useSocketContext } from '../../context/SocketContext';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const { disconnect } = useSocketContext();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try { await authService.logout(); } catch { }
        disconnect();
        logout();
        navigate('/');
        toast.success('Logged out successfully');
    };

    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="glass"
            style={{
                position: 'sticky', top: 0, zIndex: 50,
                borderBottom: '1px solid var(--border)',
                padding: '0.65rem 1.5rem',
            }}
        >
            <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <motion.div
                        whileHover={{ rotate: 15 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        style={{
                            width: 36, height: 36, borderRadius: 11,
                            background: 'var(--gradient-btn)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(139,92,246,0.25)',
                        }}
                    >
                        <Paintbrush size={17} color="white" />
                    </motion.div>
                    <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                        Wecn<span className="gradient-text">Draw</span>
                    </span>
                </Link>

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ThemeToggle />

                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                                <button className="btn-ghost" title="Dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <LayoutDashboard size={17} />
                                    <span style={{ fontSize: '0.85rem' }}>Dashboard</span>
                                </button>
                            </Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.username} style={{
                                        width: 32, height: 32, borderRadius: '50%', objectFit: 'cover',
                                        border: '2px solid var(--accent-purple)',
                                        boxShadow: '0 0 12px rgba(139,92,246,0.2)',
                                    }} />
                                ) : (
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: 'var(--gradient-btn)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>{user?.username?.[0]?.toUpperCase()}</span>
                                    </div>
                                )}
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{user?.username}</span>
                                <button className="btn-ghost" onClick={handleLogout} title="Logout">
                                    <LogOut size={17} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/auth" style={{ textDecoration: 'none' }}>
                                <button className="btn-secondary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>Sign in</button>
                            </Link>
                            <Link to="/auth?mode=register" style={{ textDecoration: 'none' }}>
                                <button className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>Get started</button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
