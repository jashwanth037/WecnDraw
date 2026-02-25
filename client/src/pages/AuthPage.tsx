import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { Paintbrush } from 'lucide-react';

// Animated canvas background strokes
const AnimatedStroke: React.FC<{ delay?: number; x: string; y: string; rotate?: number; length?: number; color?: string }> = ({ delay = 0, x, y, rotate = 0, length = 120, color = 'rgba(124,58,237,0.15)' }) => (
    <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 0.6, 0.6, 0] }}
        transition={{ duration: 4, delay, repeat: Infinity, repeatDelay: Math.random() * 3 + 2, ease: 'easeInOut' }}
        style={{ position: 'absolute', left: x, top: y, width: length, height: 4, background: color, borderRadius: 4, transformOrigin: 'left', transform: `rotate(${rotate}deg)` }}
    />
);

const AuthPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [mode, setMode] = useState<'login' | 'register'>(
        searchParams.get('mode') === 'register' ? 'register' : 'login'
    );

    useEffect(() => {
        document.title = mode === 'login' ? 'Sign In — WecnDraw' : 'Register — WecnDraw';
    }, [mode]);

    return (
        <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-primary)' }}>
            {/* Left: Animated splash */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(13,13,20,1) 60%, rgba(6,182,212,0.08) 100%)' }}>
                {/* Animated strokes */}
                {[...Array(12)].map((_, i) => (
                    <AnimatedStroke
                        key={i}
                        delay={i * 0.5}
                        x={`${10 + Math.random() * 80}%`}
                        y={`${10 + Math.random() * 80}%`}
                        rotate={(Math.random() - 0.5) * 60}
                        length={60 + Math.random() * 120}
                        color={['rgba(124,58,237,0.25)', 'rgba(6,182,212,0.2)', 'rgba(236,72,153,0.2)'][i % 3]}
                    />
                ))}

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '2rem' }}>
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
                        style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}
                    >
                        <Paintbrush size={36} color="white" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem' }}
                    >
                        <span className="gradient-text">Create Together,</span>
                        <br />
                        Draw Together
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: 360 }}
                    >
                        The infinite canvas for creative minds. Real-time collaboration for designers, artists, and thinkers.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}
                    >
                        {['🎨 Real-time Sync', '🛠️ Smart Tools', '☁️ Always Saved'].map((item, i) => (
                            <span key={i} className="chip">{item}</span>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right: Form */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass"
                    style={{ width: '100%', maxWidth: 440, padding: '2.5rem', borderRadius: 20 }}
                >
                    <AnimatePresence mode="wait">
                        {mode === 'login' ? (
                            <LoginForm key="login" onSwitch={() => setMode('register')} />
                        ) : (
                            <RegisterForm key="register" onSwitch={() => setMode('login')} />
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Mobile: stack vertically */}
            <style>{`@media (max-width: 768px) { .auth-grid { grid-template-columns: 1fr !important; } .auth-left { display: none !important; } }`}</style>
        </div>
    );
};

export default AuthPage;
