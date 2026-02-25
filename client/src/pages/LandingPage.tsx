import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Cloud, ArrowRight, Brain } from 'lucide-react';
import Navbar from '../components/shared/Navbar';

const FEATURES = [
    { icon: <Zap size={24} />, title: 'Real-time Sync', desc: 'See every stroke, shape, and cursor from collaborators instantly — zero delay, zero conflict.', color: '#7c3aed' },
    { icon: <Brain size={24} />, title: 'Smart Tools', desc: 'Pencil, shapes, text, sticky notes, highlighter, laser pointer and more — all in a sleek toolbar.', color: '#06b6d4' },
    { icon: <Cloud size={24} />, title: 'Always Saved', desc: 'Canvas auto-saves every 60 seconds to the cloud. Snapshots, replays, and exports included.', color: '#ec4899' },
];

const TESTIMONIALS = [
    { name: 'Maya Chen', role: 'UX Designer at Figma', quote: 'WecnDraw changed how our team brainstorms. The real-time cursors and laser pointer are game-changers.', avatar: '🧑‍🎨' },
    { name: 'Jordan Park', role: 'Engineering Lead at Stripe', quote: 'We use it for architecture diagrams in every standup. The Kanban template saved us hours.', avatar: '👨‍💻' },
    { name: 'Sara Ahmed', role: 'Product Manager at Notion', quote: 'The replay feature is brilliant — I can review my team\'s brainstorm sessions step by step.', avatar: '👩‍💼' },
];

// Floating brush stroke animation
const FloatingStroke: React.FC<{ style: React.CSSProperties; delay: number; color: string; width: number; rotate: number }> = ({ style, delay, color, width, rotate }) => (
    <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: [0, 0.5, 0.5, 0], scaleX: [0, 1, 1, 0] }}
        transition={{ duration: 5, delay, repeat: Infinity, repeatDelay: Math.random() * 4 + 3, ease: 'easeInOut' }}
        style={{ position: 'absolute', height: 5, width, background: color, borderRadius: 3, transformOrigin: 'left center', transform: `rotate(${rotate}deg)`, ...style }}
    />
);

const strokes = [
    { top: '15%', left: '5%', width: 180, rotate: 20, color: 'rgba(124,58,237,0.35)', delay: 0 },
    { top: '30%', right: '8%', width: 120, rotate: -15, color: 'rgba(6,182,212,0.3)', delay: 1.5 },
    { top: '60%', left: '10%', width: 90, rotate: 35, color: 'rgba(236,72,153,0.3)', delay: 3 },
    { top: '70%', right: '15%', width: 200, rotate: -25, color: 'rgba(124,58,237,0.2)', delay: 0.8 },
    { top: '85%', left: '30%', width: 140, rotate: 10, color: 'rgba(6,182,212,0.25)', delay: 2.2 },
    { top: '45%', left: '3%', width: 160, rotate: -40, color: 'rgba(236,72,153,0.2)', delay: 4 },
    { top: '20%', right: '25%', width: 80, rotate: 50, color: 'rgba(124,58,237,0.15)', delay: 1 },
    { top: '90%', right: '5%', width: 110, rotate: -10, color: 'rgba(236,72,153,0.25)', delay: 2.8 },
];

const LandingPage: React.FC = () => {
    useEffect(() => {
        document.title = 'WecnDraw — Create Together, Draw Together';
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />

            {/* Hero Section */}
            <section style={{ position: 'relative', minHeight: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '3rem 1.5rem' }}>
                {/* Animated paint strokes background */}
                {strokes.map((s, i) => (
                    <FloatingStroke key={i} style={{ top: s.top, left: (s as any).left, right: (s as any).right }} delay={s.delay} color={s.color} width={s.width} rotate={s.rotate} />
                ))}

                {/* Gradient orbs */}
                <div style={{ position: 'absolute', top: '20%', left: '15%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 800 }}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: 999, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', marginBottom: '1.5rem' }}
                    >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
                        <span style={{ fontSize: '0.825rem', color: '#a78bfa', fontWeight: 500 }}>Collaborative whiteboard, now in real-time</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.08, marginBottom: '1.25rem', color: 'var(--text-primary)' }}
                    >
                        Create Together,
                        <br />
                        <span className="gradient-text">Draw Together</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}
                    >
                        The infinite canvas for creative minds. Collaborate in real-time with powerful drawing tools, live cursors, and persistent sessions.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
                    >
                        <Link to="/auth?mode=register">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="btn-primary animated-border"
                                style={{ padding: '0.85rem 2rem', fontSize: '1rem', gap: '0.5rem' }}
                            >
                                Start Drawing <ArrowRight size={18} />
                            </motion.button>
                        </Link>
                        <button
                            className="btn-secondary"
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
                        >
                            See features
                        </button>
                    </motion.div>
                </div>

                {/* Canvas preview mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="glass"
                    style={{ position: 'relative', zIndex: 1, marginTop: '3rem', width: '100%', maxWidth: 800, borderRadius: 20, overflow: 'hidden', aspectRatio: '16/9', background: 'rgba(13,13,20,0.8)', border: '1px solid rgba(124,58,237,0.2)' }}
                >
                    {/* Fake toolbar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 40, background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px' }}>
                        {['#ef4444', '#f59e0b', '#22c55e'].map((c, i) => (
                            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                        ))}
                        <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono' }}>WecnDraw — /room/xKj3Mz8q</span>
                    </div>
                    {/* Fake canvas content */}
                    <svg width="100%" height="100%" style={{ position: 'absolute', top: 40, left: 0 }}>
                        <path d="M 80 100 Q 140 60 200 100 T 320 100" stroke="#7c3aed" strokeWidth="3" fill="none" opacity="0.7" />
                        <path d="M 100 160 L 280 160" stroke="#06b6d4" strokeWidth="2" fill="none" opacity="0.5" />
                        <rect x="350" y="80" width="120" height="80" rx="8" fill="none" stroke="#ec4899" strokeWidth="2" opacity="0.6" />
                        <circle cx="550" cy="140" r="40" fill="none" stroke="#7c3aed" strokeWidth="2" opacity="0.5" />
                        <text x="80" y="230" fill="#94a3b8" fontSize="14" fontFamily="Inter">Hello World ✏️</text>
                    </svg>
                    {/* Fake cursors */}
                    {[
                        { x: '30%', y: '45%', name: 'Alex', color: '#7c3aed' },
                        { x: '60%', y: '35%', name: 'Sam', color: '#06b6d4' },
                        { x: '75%', y: '65%', name: 'Maya', color: '#ec4899' },
                    ].map((cursor, i) => (
                        <motion.div
                            key={i}
                            animate={{ x: [0, 5, -3, 0], y: [0, -3, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 3 + i, ease: 'easeInOut', delay: i * 0.5 }}
                            style={{ position: 'absolute', left: cursor.x, top: cursor.y, display: 'flex', alignItems: 'flex-end', gap: '4px', pointerEvents: 'none' }}
                        >
                            <svg width="16" height="20"><path d="M 0 0 L 0 16 L 5 11 L 8 18 L 10 17 L 7 10 L 13 10 Z" fill={cursor.color} /></svg>
                            <div style={{ padding: '2px 6px', borderRadius: 4, background: cursor.color, fontSize: '0.65rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap' }}>{cursor.name}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" style={{ padding: '5rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                >
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                        Everything you need to <span className="gradient-text">create together</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto' }}>
                        Powerful tools wrapped in a stunning interface designed for real collaboration.
                    </p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {FEATURES.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.15 }}
                            whileHover={{ y: -6, scale: 1.01 }}
                            className="card"
                            style={{ padding: '2rem', cursor: 'default' }}
                        >
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${feature.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: feature.color, border: `1px solid ${feature.color}30` }}>
                                {feature.icon}
                            </div>
                            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section style={{ padding: '5rem 1.5rem', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', textAlign: 'center', color: 'var(--text-primary)', marginBottom: '3rem' }}
                    >
                        Loved by creative teams
                    </motion.h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="card"
                                style={{ padding: '1.75rem' }}
                            >
                                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem', fontSize: '0.925rem', fontStyle: 'italic' }}>
                                    "{t.quote}"
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>{t.avatar}</div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{t.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        Ready to <span className="gradient-text">start creating?</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.05rem' }}>Join thousands of designers and teams who collaborate on WecnDraw every day.</p>
                    <Link to="/auth?mode=register">
                        <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>Get started free <ArrowRight size={18} /></button>
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    © 2025 WecnDraw. Built with ❤️ for creative minds. &nbsp;|&nbsp;
                    <a href="#" style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}>Privacy</a> &nbsp;|&nbsp;
                    <a href="#" style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}>Terms</a>
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;
