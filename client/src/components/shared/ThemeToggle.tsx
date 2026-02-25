import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useCanvasStore();

    const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggle}
            className="floating-btn"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;
