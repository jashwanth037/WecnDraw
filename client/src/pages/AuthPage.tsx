import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

/* Animated SVG drawing on left panel */
const DrawingAnimation: React.FC = () => (
    <svg width="280" height="280" viewBox="0 0 280 280" style={{ opacity: 0.9 }}>
        <motion.circle cx="140" cy="140" r="100" stroke="#8b5cf6" strokeWidth="2" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: 'easeInOut' }} />
        <motion.circle cx="140" cy="140" r="75" stroke="#d946ef" strokeWidth="1.5" fill="none" strokeDasharray="6 6"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.3 }} />
        <motion.path d="M 80 140 Q 110 80 140 140 T 200 140" stroke="#f472b6" strokeWidth="2.5" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.8 }} />
        <motion.path d="M 100 180 L 180 180" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="4 4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.3 }} />
        {/* Stars */}
        {[{ cx: 70, cy: 70 }, { cx: 210, cy: 60 }, { cx: 60, cy: 200 }, { cx: 220, cy: 210 }].map((p, i) => (
            <motion.circle key={i} cx={p.cx} cy={p.cy} r="3" fill="#8b5cf6"
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: [0, 1, 0.5, 1] }}
                transition={{ duration: 2, delay: 0.5 + i * 0.3, repeat: Infinity, repeatDelay: 3 }} />
        ))}
    </svg>
);

const AuthPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');

    useEffect(() => { document.title = isLogin ? 'Sign In — WecnDraw' : 'Register — WecnDraw'; }, [isLogin]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
            {/* Left — Branding side */}
            <div style={{
                flex: '0 0 45%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(160deg, #0a0a15 0%, #111128 50%, #0f0f1e 100%)',
                position: 'relative', overflow: 'hidden', padding: '3rem',
            }}>
                {/* Gradient orbs */}
                <div style={{ position: 'absolute', top: '15%', left: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(30px)' }} />
                <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(30px)' }} />

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <DrawingAnimation />
                    <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '1.5rem' }}>
                        Create <span className="gradient-text">Together</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', maxWidth: 280 }}>
                        The infinite canvas for creative minds. Real-time collaboration, powerful tools.
                    </p>
                </motion.div>

                {/* Hide on mobile */}
                <style>{`@media (max-width: 768px) { .auth-left { display: none !important; } }`}</style>
            </div>

            {/* Right — Form side */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: '100%', maxWidth: 420 }}
                >
                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <LoginForm key="login" onSwitch={() => setIsLogin(false)} />
                        ) : (
                            <RegisterForm key="register" onSwitch={() => setIsLogin(true)} />
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;
