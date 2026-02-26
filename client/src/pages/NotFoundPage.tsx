import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', textAlign: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
            {/* Glow */}
            <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
                    <motion.span animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }} style={{ display: 'inline-block' }}>
                        🎨
                    </motion.span>
                </div>
                <h1 className="gradient-text" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '4rem', marginBottom: '0.5rem' }}>404</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem', maxWidth: 400 }}>
                    This canvas doesn't exist. It may have been deleted or you have the wrong URL.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/dashboard" style={{ textDecoration: 'none' }}><button className="btn-primary">Go to Dashboard</button></Link>
                    <Link to="/" style={{ textDecoration: 'none' }}><button className="btn-secondary">Back to Home</button></Link>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFoundPage;
