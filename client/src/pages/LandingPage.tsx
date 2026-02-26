import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Layers, Wifi, Palette, Users, Zap, Shield } from 'lucide-react';
import Navbar from '../components/shared/Navbar';

/* ── Animated particle canvas background ── */
const ParticleCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        let animFrame: number;
        let particles: { x: number; y: number; vx: number; vy: number; r: number; color: string; alpha: number }[] = [];

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener('resize', resize);

        const colors = ['#8b5cf6', '#d946ef', '#f472b6', '#fbbf24', '#22d3ee'];
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 2 + 0.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.5 + 0.2,
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
            });
            // Draw connections
            ctx.globalAlpha = 0.06;
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    if (dx * dx + dy * dy < 18000) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            ctx.globalAlpha = 1;
            animFrame = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(animFrame); window.removeEventListener('resize', resize); };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />;
};

const FEATURES = [
    { icon: <Wifi size={22} />, title: 'Real-time Sync', desc: 'Every stroke, cursor, and change syncs instantly across all collaborators.', color: '#8b5cf6' },
    { icon: <Palette size={22} />, title: 'Creative Tools', desc: 'Pencil, shapes, text, sticky notes, highlighter, and more — all in one toolbar.', color: '#d946ef' },
    { icon: <Layers size={22} />, title: 'Templates', desc: 'Start with blank canvas, wireframe, flowchart, or kanban — your choice.', color: '#f472b6' },
    { icon: <Users size={22} />, title: 'Team Rooms', desc: 'Invite your team, share your screen, and chat — all within the board.', color: '#22d3ee' },
    { icon: <Zap size={22} />, title: 'Lightning Fast', desc: 'Built on WebSockets for zero-latency collaboration. No lag, ever.', color: '#fbbf24' },
    { icon: <Shield size={22} />, title: 'Always Saved', desc: 'Auto-saves every 60 seconds. Export as PNG anytime.', color: '#10b981' },
];

const STATS = [
    { value: '10K+', label: 'Boards Created' },
    { value: '50+', label: 'Countries' },
    { value: '99.9%', label: 'Uptime' },
    { value: '<50ms', label: 'Sync Latency' },
];

const LandingPage: React.FC = () => {
    useEffect(() => { document.title = 'WecnDraw — Create Together, Draw Together'; }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />

            {/* ═══ HERO ═══ */}
            <section style={{ position: 'relative', minHeight: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '4rem 1.5rem 3rem' }}>
                <ParticleCanvas />

                {/* Gradient orbs */}
                <div style={{ position: 'absolute', top: '10%', left: '10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(40px)' }} />
                <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(244,114,182,0.1) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(40px)' }} />
                <div style={{ position: 'absolute', top: '40%', right: '30%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(40px)' }} />

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 860 }}>
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', borderRadius: 999, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', marginBottom: '1.75rem' }}
                    >
                        <Sparkles size={14} style={{ color: '#c4b5fd' }} />
                        <span style={{ fontSize: '0.8rem', color: '#c4b5fd', fontWeight: 500, letterSpacing: '0.02em' }}>The collaborative whiteboard for creative minds</span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(2.75rem, 7vw, 5rem)', lineHeight: 1.05, marginBottom: '1.5rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
                    >
                        Where Ideas Come<br />
                        <span className="gradient-text" style={{ display: 'inline-block' }}>Alive Together</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.7 }}
                    >
                        The infinite canvas for teams. Draw, brainstorm, and collaborate in real-time with powerful tools, live cursors, and screen sharing.
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.35 }}
                        style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
                    >
                        <Link to="/auth?mode=register" style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                className="btn-primary animated-border"
                                style={{ padding: '0.9rem 2.25rem', fontSize: '1.05rem', gap: '0.6rem' }}
                            >
                                Start Drawing Free <ArrowRight size={18} />
                            </motion.button>
                        </Link>
                        <button
                            className="btn-secondary"
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            style={{ padding: '0.9rem 2.25rem', fontSize: '1.05rem' }}
                        >
                            Explore Features
                        </button>
                    </motion.div>
                </div>

                {/* ── Animated board mockup ── */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.55 }}
                    style={{
                        position: 'relative', zIndex: 1, marginTop: '3.5rem', width: '100%', maxWidth: 860,
                        borderRadius: 20, overflow: 'hidden', aspectRatio: '16/9',
                        background: 'rgba(17,17,25,0.85)', backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(139,92,246,0.15)',
                        boxShadow: '0 20px 80px rgba(139,92,246,0.12), 0 0 0 1px rgba(139,92,246,0.08)',
                    }}
                >
                    {/* Window chrome */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 38, background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 14px' }}>
                        {['#ef4444', '#fbbf24', '#22c55e'].map((c, i) => (
                            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.9 }} />
                        ))}
                        <span style={{ marginLeft: 10, fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono' }}>WecnDraw — /room/xKj3Mz8q</span>
                    </div>

                    {/* SVG sketches */}
                    <svg width="100%" height="100%" style={{ position: 'absolute', top: 38, left: 0 }}>
                        <motion.path d="M 60 80 Q 130 30 200 80 T 340 80" stroke="#8b5cf6" strokeWidth="3" fill="none" opacity="0.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.8 }} />
                        <motion.rect x="380" y="60" width="140" height="90" rx="10" fill="none" stroke="#f472b6" strokeWidth="2" opacity="0.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1.2 }} />
                        <motion.circle cx="600" cy="120" r="45" fill="none" stroke="#22d3ee" strokeWidth="2" opacity="0.4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1.5 }} />
                        <motion.path d="M 80 180 L 320 180" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.4" strokeDasharray="6 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.8 }} />
                        <text x="80" y="220" fill="rgba(255,255,255,0.25)" fontSize="13" fontFamily="Inter">Hello, team! ✏️</text>
                    </svg>

                    {/* Animated cursors */}
                    {[
                        { x: '28%', y: '40%', name: 'Alex', color: '#8b5cf6' },
                        { x: '58%', y: '32%', name: 'Sam', color: '#22d3ee' },
                        { x: '72%', y: '60%', name: 'Maya', color: '#f472b6' },
                    ].map((c, i) => (
                        <motion.div
                            key={i}
                            animate={{ x: [0, 8, -5, 0], y: [0, -5, 8, 0] }}
                            transition={{ repeat: Infinity, duration: 4 + i, ease: 'easeInOut', delay: i * 0.6 + 1 }}
                            style={{ position: 'absolute', left: c.x, top: c.y, display: 'flex', alignItems: 'flex-end', gap: '4px', pointerEvents: 'none' }}
                        >
                            <svg width="14" height="18"><path d="M 0 0 L 0 14 L 4 10 L 7 16 L 9 15 L 6 9 L 11 9 Z" fill={c.color} /></svg>
                            <div style={{ padding: '2px 7px', borderRadius: 5, background: c.color, fontSize: '0.6rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap' }}>{c.name}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ═══ STATS ═══ */}
            <section style={{ padding: '3rem 1.5rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
                    {STATS.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                            <div className="gradient-text" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>{s.value}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ FEATURES ═══ */}
            <section id="features" style={{ padding: '6rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                        Built for <span className="gradient-text">creative teams</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: 520, margin: '0 auto' }}>
                        Powerful tools wrapped in a stunning interface designed for real collaboration.
                    </p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ y: -4 }}
                            className="card"
                            style={{ padding: '2rem', cursor: 'default', position: 'relative', overflow: 'hidden' }}
                        >
                            <div style={{
                                width: 48, height: 48, borderRadius: 14,
                                background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '1.25rem', color: f.color, border: `1px solid ${f.color}25`,
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.6rem' }}>{f.title}</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, fontSize: '0.88rem' }}>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section style={{ padding: '6rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Glow */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        Ready to <span className="gradient-text">start creating?</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: 480, margin: '0 auto 2.5rem' }}>
                        Join thousands of designers and teams who collaborate on WecnDraw every day. It's free.
                    </p>
                    <Link to="/auth?mode=register" style={{ textDecoration: 'none' }}>
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-primary animated-border" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', gap: '0.6rem' }}>
                            Get Started Free <ArrowRight size={18} />
                        </motion.button>
                    </Link>
                </motion.div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    © 2025 WecnDraw. Built with ❤️ for creative minds.
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;
