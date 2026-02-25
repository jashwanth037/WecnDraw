import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Paintbrush, Download, ArrowLeft, MoreVertical,
    Trash2, ZoomIn, ZoomOut, Maximize, Undo2, Redo2,
} from 'lucide-react';
import Canvas from '../components/whiteboard/Canvas';
import Toolbar from '../components/whiteboard/Toolbar';
import ToolSettings from '../components/whiteboard/ToolSettings';
import ThemeToggle from '../components/shared/ThemeToggle';
import { useCanvasStore } from '../store/canvasStore';
import { downloadCanvasAsImage } from '../utils/canvasHelpers';
import toast from 'react-hot-toast';

const LOCAL_ROOM_ID = `local-${Date.now()}`;

const DrawPage: React.FC = () => {
    const navigate = useNavigate();
    const { zoom, setZoom, canUndo, canRedo } = useCanvasStore();
    const [showActionMenu, setShowActionMenu] = useState(false);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => { document.title = 'Free Draw — WecnDraw'; }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) setShowActionMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDownload = () => {
        const canvas = (window as any).__fabricCanvas;
        if (canvas) downloadCanvasAsImage(canvas, 'my-drawing.png');
    };

    const handleClear = () => {
        const canvas = (window as any).__fabricCanvas;
        if (canvas) { canvas.clear(); canvas.renderAll(); toast.success('Canvas cleared'); }
    };

    const handleUndo = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const canvas = (window as any).__fabricCanvas;
        const state = useCanvasStore.getState().undo();
        if (state !== null && canvas) {
            canvas._isLoadingState = true;
            canvas.loadFromJSON(state).then(() => { canvas._isLoadingState = false; canvas.renderAll(); });
        }
    };

    const handleRedo = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const canvas = (window as any).__fabricCanvas;
        const state = useCanvasStore.getState().redo();
        if (state !== null && canvas) {
            canvas._isLoadingState = true;
            canvas.loadFromJSON(state).then(() => { canvas._isLoadingState = false; canvas.renderAll(); });
        }
    };

    const handleZoom = (delta: number) => {
        const newZoom = Math.min(3, Math.max(0.25, zoom + delta));
        setZoom(newZoom);
        const canvas = (window as any).__fabricCanvas;
        if (canvas) { canvas.setZoom(newZoom); canvas.renderAll(); }
    };

    const handleFitToScreen = () => {
        setZoom(1);
        const canvas = (window as any).__fabricCanvas;
        if (canvas) { canvas.setZoom(1); canvas.setViewportTransform([1, 0, 0, 1, 0, 0]); canvas.renderAll(); }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>
            {/* ─── Top Bar ─── */}
            <div className="wb-topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/dashboard')} className="btn-ghost" title="Back">
                        <ArrowLeft size={16} />
                    </motion.button>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Paintbrush size={13} color="white" />
                    </div>
                    <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        Free Draw
                    </h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ThemeToggle />
                    <div ref={actionMenuRef} style={{ position: 'relative' }}>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowActionMenu(!showActionMenu)} className="btn-ghost" title="Actions"
                            style={{ color: showActionMenu ? 'var(--accent-purple)' : 'var(--text-muted)' }}>
                            <MoreVertical size={16} />
                        </motion.button>
                        <AnimatePresence>
                            {showActionMenu && (
                                <motion.div className="action-menu" initial={{ opacity: 0, y: -6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.95 }} transition={{ duration: 0.12 }}>

                                    <button className="action-menu-item" onClick={() => { handleDownload(); setShowActionMenu(false); }}>
                                        <Download size={15} /> Download as PNG
                                    </button>
                                    <div className="action-menu-sep" />
                                    <button className="action-menu-item danger" onClick={() => { handleClear(); setShowActionMenu(false); }}>
                                        <Trash2 size={15} /> Clear Canvas
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ─── Main Canvas Area ─── */}
            <div className="canvas-bg-dots" style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
                <Toolbar roomId={LOCAL_ROOM_ID} />
                <ToolSettings />
                <Canvas roomId={LOCAL_ROOM_ID} />

                {/* Zoom (bottom-left) */}
                <motion.div className="zoom-controls" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <button className="zoom-btn" onClick={() => handleZoom(-0.1)} title="Zoom out"><ZoomOut size={15} /></button>
                    <span className="zoom-label">{Math.round(zoom * 100)}%</span>
                    <button className="zoom-btn" onClick={() => handleZoom(0.1)} title="Zoom in"><ZoomIn size={15} /></button>
                    <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
                    <button className="zoom-btn" onClick={handleFitToScreen} title="Fit to screen"><Maximize size={14} /></button>
                </motion.div>

                {/* Undo / Redo (bottom-right) */}
                <motion.div className="undoredo-controls" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <button type="button" className="zoom-btn" onClick={handleUndo} title="Undo" style={{ opacity: canUndo ? 1 : 0.35 }}><Undo2 size={15} /></button>
                    <button type="button" className="zoom-btn" onClick={handleRedo} title="Redo" style={{ opacity: canRedo ? 1 : 0.35 }}><Redo2 size={15} /></button>
                </motion.div>
            </div>
        </div>
    );
};

export default DrawPage;
