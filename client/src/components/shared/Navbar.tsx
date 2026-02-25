import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Paintbrush, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCanvasStore } from '../../store/canvasStore';
import { authService } from '../../services/authService';
import { useSocketContext } from '../../context/SocketContext';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const { disconnect } = useSocketContext();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch { }
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
            className="glass sticky top-0 z-50 border-b"
            style={{ borderColor: 'var(--border)', padding: '0.75rem 1.5rem' }}
        >
            <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Paintbrush size={18} color="white" />
                    </div>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                        Wecn<span className="gradient-text">Draw</span>
                    </span>
                </Link>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ThemeToggle />

                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                                <button className="btn-ghost" title="Dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                                    <LayoutDashboard size={18} />
                                    <span style={{ fontSize: '0.875rem' }}>Dashboard</span>
                                </button>
                            </Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.username} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-purple)' }} />
                                    ) : (
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>{user?.username?.[0]?.toUpperCase()}</span>
                                        </div>
                                    )}
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{user?.username}</span>
                                </div>
                                <button className="btn-ghost" onClick={handleLogout} title="Logout">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/auth" style={{ textDecoration: 'none' }}>
                                <button className="btn-secondary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.875rem' }}>Sign in</button>
                            </Link>
                            <Link to="/auth?mode=register" style={{ textDecoration: 'none' }}>
                                <button className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.875rem' }}>Get started</button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
