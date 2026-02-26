import React from 'react';
import { motion } from 'framer-motion';
import { Paintbrush } from 'lucide-react';

const Loader: React.FC<{ fullscreen?: boolean; text?: string }> = ({
    fullscreen = true,
    text = 'Loading...',
}) => {
    const content = (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: 'var(--gradient-btn)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(139,92,246,0.35)',
                }}
            >
                <Paintbrush size={22} color="white" />
            </motion.div>
            <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', letterSpacing: '0.02em' }}
            >
                {text}
            </motion.p>
        </div>
    );

    if (fullscreen) {
        return (
            <div style={{
                position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-primary)', zIndex: 9999,
            }}>
                {content}
            </div>
        );
    }

    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>{content}</div>;
};

export default Loader;
