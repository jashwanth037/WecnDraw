import React from 'react';
import { motion } from 'framer-motion';
import { Paintbrush } from 'lucide-react';

const Loader: React.FC<{ fullscreen?: boolean; text?: string }> = ({
    fullscreen = true,
    text = 'Loading...',
}) => {
    const content = (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(124,58,237,0.5)',
                }}
            >
                <Paintbrush size={22} color="white" />
            </motion.div>
            <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem' }}
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
