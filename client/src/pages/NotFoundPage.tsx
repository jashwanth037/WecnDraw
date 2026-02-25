import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', textAlign: 'center', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>
                    <motion.span
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                        style={{ display: 'inline-block' }}
                    >
                        🎨
                    </motion.span>
                </div>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '3rem', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>404</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: 400 }}>
                    This canvas doesn't exist. It may have been deleted or you have the wrong URL.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/dashboard"><button className="btn-primary">Go to Dashboard</button></Link>
                    <Link to="/"><button className="btn-secondary">Back to Home</button></Link>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFoundPage;
