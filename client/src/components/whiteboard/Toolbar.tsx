import React from 'react';
import { motion } from 'framer-motion';
import {
    MousePointer2, Pencil, Eraser, Highlighter, Square, Circle, Triangle,
    Minus, ArrowRight, Type, Zap, Hand, Image, Diamond, PenTool,
} from 'lucide-react';
import { FabricImage } from 'fabric';
import { useCanvasStore } from '../../store/canvasStore';
import type { CanvasTool } from '../../types';

// Flat tool list — ordered like Excalidraw
const TOOLS: { id: CanvasTool; icon: React.ReactNode; title: string; shortcut?: string; group: number }[] = [
    { id: 'pan', icon: <Hand size={17} />, title: 'Pan', shortcut: 'H', group: 0 },
    { id: 'select', icon: <MousePointer2 size={17} />, title: 'Select', shortcut: 'V', group: 0 },
    // shapes
    { id: 'rectangle', icon: <Square size={17} />, title: 'Rectangle', shortcut: 'R', group: 1 },
    { id: 'circle', icon: <Circle size={17} />, title: 'Ellipse', shortcut: 'O', group: 1 },
    { id: 'triangle', icon: <Triangle size={17} />, title: 'Triangle', group: 1 },
    { id: 'diamond', icon: <Diamond size={17} />, title: 'Diamond', shortcut: 'D', group: 1 },
    { id: 'arrow', icon: <ArrowRight size={17} />, title: 'Arrow', shortcut: 'A', group: 1 },
    { id: 'line', icon: <Minus size={17} />, title: 'Line', shortcut: 'L', group: 1 },
    // drawing
    { id: 'pencil', icon: <Pencil size={17} />, title: 'Pencil', shortcut: 'P', group: 2 },
    { id: 'sketch', icon: <PenTool size={17} />, title: 'Sketch', shortcut: 'S', group: 2 },
    { id: 'highlighter', icon: <Highlighter size={17} />, title: 'Highlighter', group: 2 },
    { id: 'eraser', icon: <Eraser size={17} />, title: 'Eraser', shortcut: 'E', group: 2 },
    // other
    { id: 'text', icon: <Type size={17} />, title: 'Text', shortcut: 'T', group: 3 },
    { id: 'laser', icon: <Zap size={17} />, title: 'Laser', group: 3 },
    { id: 'image', icon: <Image size={17} />, title: 'Image', group: 3 },
];

const Toolbar: React.FC<{ roomId: string }> = () => {
    const { tool, setTool } = useCanvasStore();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            FabricImage.fromURL(ev.target!.result as string).then((img: any) => {
                const canvas = (window as any).__fabricCanvas;
                if (!canvas) return;
                img.scaleToWidth(300);
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
                setTool('select');
            });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const elements: React.ReactNode[] = [];
    let lastGroup = TOOLS[0].group;

    TOOLS.forEach((t, i) => {
        if (t.group !== lastGroup) {
            elements.push(<div key={`sep-${i}`} className="tool-sep" />);
            lastGroup = t.group;
        }

        const shortcutLabel = t.shortcut ? ` (${t.shortcut})` : '';

        if (t.id === 'image') {
            elements.push(
                <label
                    key={t.id}
                    className={`tool-btn ${tool === t.id ? 'active' : ''}`}
                    title={`${t.title}${shortcutLabel}`}
                >
                    {t.icon}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                </label>
            );
        } else {
            elements.push(
                <motion.button
                    key={t.id}
                    whileTap={{ scale: 0.88 }}
                    className={`tool-btn ${tool === t.id ? 'active' : ''}`}
                    title={`${t.title}${shortcutLabel}`}
                    onClick={() => setTool(t.id)}
                >
                    {t.icon}
                </motion.button>
            );
        }
    });

    return (
        <div className="toolbar-center-wrapper">
            <motion.div
                className="toolbar-floating"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            >
                {elements}
            </motion.div>
        </div>
    );
};

export default Toolbar;
