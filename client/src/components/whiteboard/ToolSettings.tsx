import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '../../store/canvasStore';
import type { CanvasTool } from '../../types';

/* ──────────────────────────────────────────────
   Palette swatches  (Excalidraw-style but unique)
   ────────────────────────────────────────────── */
const STROKE_COLORS = [
    '#1e1e1e', '#e03131', '#2f9e44', '#1971c2',
    '#f08c00', '#7c3aed', '#0891b2', '#e64980',
    '#ffffff', '#868e96',
];

const FILL_COLORS = [
    'transparent', '#ffc9c9', '#b2f2bb', '#a5d8ff',
    '#ffec99', '#d0bfff', '#99e9f2', '#fcc2d7',
    '#ffe8cc', '#e9ecef',
];

const SIZE_PRESETS = [
    { value: 1, label: 'S' },
    { value: 2, label: 'M' },
    { value: 4, label: 'L' },
    { value: 8, label: 'XL' },
];

const FONT_FAMILIES = ['Inter', 'Georgia', 'Courier New', 'Comic Sans MS'];

/* Tools that show the settings panel */
const TOOLS_WITH_SETTINGS: CanvasTool[] = [
    'pencil', 'highlighter', 'sketch', 'rectangle', 'circle', 'triangle', 'diamond',
    'arrow', 'line', 'text', 'eraser',
];

/* Shapes that show fill color + stroke style */
const SHAPE_TOOLS: CanvasTool[] = ['rectangle', 'circle', 'triangle', 'diamond'];

/* Line tools (no fill) */
const LINE_TOOLS: CanvasTool[] = ['arrow', 'line'];

const ToolSettings: React.FC = () => {
    const { tool, brushSettings, updateBrush, addRecentColor } = useCanvasStore();

    if (!TOOLS_WITH_SETTINGS.includes(tool)) return null;

    const isShape = SHAPE_TOOLS.includes(tool);
    const isLine = LINE_TOOLS.includes(tool);
    const isText = tool === 'text';
    const isEraser = tool === 'eraser';

    const handleColorSelect = (color: string) => {
        updateBrush({ color });
        addRecentColor(color);
    };

    return (
        <AnimatePresence>
            <motion.div
                className="tool-settings-panel"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                key={tool}
            >
                {/* ── Stroke Color ── */}
                {!isEraser && (
                    <div className="settings-group">
                        <span className="settings-label">Stroke</span>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                            {STROKE_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`color-swatch${brushSettings.color === c ? ' active' : ''}`}
                                    style={{ background: c, border: c === '#ffffff' ? '1px solid var(--border)' : undefined }}
                                    onClick={() => handleColorSelect(c)}
                                    title={c}
                                />
                            ))}
                            <input
                                type="color"
                                className="color-input-mini"
                                value={brushSettings.color}
                                onChange={(e) => handleColorSelect(e.target.value)}
                                title="Custom color"
                            />
                        </div>
                    </div>
                )}

                {/* ── Fill Color (closed shapes only — no arrows/lines) ── */}
                {isShape && (
                    <div className="settings-group">
                        <span className="settings-label">Fill</span>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                            {FILL_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`color-swatch${brushSettings.fillColor === c ? ' active' : ''}`}
                                    style={{
                                        background: c === 'transparent'
                                            ? 'repeating-conic-gradient(rgba(148,163,184,0.25) 0% 25%, transparent 0% 50%) 50% / 8px 8px'
                                            : c,
                                    }}
                                    onClick={() => updateBrush({ fillColor: c })}
                                    title={c === 'transparent' ? 'No fill' : c}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Stroke Width ── */}
                {!isText && (
                    <div className="settings-group">
                        <span className="settings-label">{isEraser ? 'Size' : 'Width'}</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {SIZE_PRESETS.map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    className={`size-preset${brushSettings.size === s.value ? ' active' : ''}`}
                                    onClick={() => updateBrush({ size: s.value })}
                                    title={`${s.label} (${s.value}px)`}
                                >
                                    <div
                                        style={{
                                            width: Math.min(s.value * 2.5 + 2, 18),
                                            height: Math.min(s.value * 2.5 + 2, 18),
                                            borderRadius: '50%',
                                            background: isEraser ? 'var(--text-muted)' : brushSettings.color,
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Stroke Style (shapes & lines, not pencil) ── */}
                {(isShape || isLine) && (
                    <div className="settings-group">
                        <span className="settings-label">Style</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button
                                type="button"
                                className={`stroke-style-btn${brushSettings.strokeStyle === 'solid' ? ' active' : ''}`}
                                onClick={() => updateBrush({ strokeStyle: 'solid' })}
                                title="Solid"
                            >
                                <svg width="20" height="2"><line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="2" /></svg>
                            </button>
                            <button
                                type="button"
                                className={`stroke-style-btn${brushSettings.strokeStyle === 'dashed' ? ' active' : ''}`}
                                onClick={() => updateBrush({ strokeStyle: 'dashed' })}
                                title="Dashed"
                            >
                                <svg width="20" height="2"><line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" /></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Opacity ── */}
                {!isEraser && (
                    <div className="settings-group">
                        <span className="settings-label">Opacity</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input
                                type="range"
                                className="slider-accent"
                                min="0.1"
                                max="1"
                                step="0.05"
                                value={brushSettings.opacity}
                                onChange={(e) => updateBrush({ opacity: parseFloat(e.target.value) })}
                                style={{ width: 64 }}
                            />
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', minWidth: 28, textAlign: 'right' }}>
                                {Math.round(brushSettings.opacity * 100)}%
                            </span>
                        </div>
                    </div>
                )}

                {/* ── Font (text / sticky) ── */}
                {isText && (
                    <>
                        <div className="settings-group">
                            <span className="settings-label">Font</span>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {FONT_FAMILIES.map((f) => (
                                    <button
                                        key={f}
                                        type="button"
                                        className={`size-preset${brushSettings.fontFamily === f ? ' active' : ''}`}
                                        style={{ fontFamily: f, fontSize: '0.7rem', width: 'auto', padding: '0 8px' }}
                                        onClick={() => updateBrush({ fontFamily: f })}
                                    >
                                        {f.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="settings-group">
                            <span className="settings-label">Size</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input
                                    type="range"
                                    className="slider-accent"
                                    min="10"
                                    max="72"
                                    step="1"
                                    value={brushSettings.fontSize}
                                    onChange={(e) => updateBrush({ fontSize: parseInt(e.target.value) })}
                                    style={{ width: 80 }}
                                />
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', minWidth: 24, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                    {brushSettings.fontSize}px
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default ToolSettings;
