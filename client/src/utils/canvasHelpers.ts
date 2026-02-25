// Canvas helper utilities

export const formatDistanceToNow = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

export const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const downloadCanvasAsImage = (canvas: any, filename = 'canvas.png') => {
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
};

export const downloadCanvasAsSVG = (canvas: any, filename = 'canvas.svg') => {
    const svg = canvas.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
};

export const downloadCanvasAsPDF = async (canvas: any, filename = 'canvas.pdf') => {
    // Use canvas toDataURL and embed in basic PDF via jsPDF or download as image
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });
    // Fallback: download as PNG with .pdf hint name
    const link = document.createElement('a');
    link.download = filename.replace('.pdf', '.png');
    link.href = dataUrl;
    link.click();
};

export const throttle = <T extends (...args: any[]) => void>(func: T, limit: number): T => {
    let inThrottle = false;
    return ((...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => { inThrottle = false; }, limit);
        }
    }) as T;
};

export const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

export const generateUserColor = (userId: string): string => {
    const colors = ['#7c3aed', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#f97316', '#14b8a6'];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export const getKanbanTemplate = () => {
    return JSON.stringify({
        version: '5.3.0',
        objects: [
            { type: 'rect', left: 50, top: 50, width: 220, height: 400, fill: 'rgba(124,58,237,0.08)', stroke: 'rgba(124,58,237,0.4)', rx: 10, ry: 10, strokeWidth: 1.5 },
            { type: 'rect', left: 290, top: 50, width: 220, height: 400, fill: 'rgba(6,182,212,0.08)', stroke: 'rgba(6,182,212,0.4)', rx: 10, ry: 10, strokeWidth: 1.5 },
            { type: 'rect', left: 530, top: 50, width: 220, height: 400, fill: 'rgba(16,185,129,0.08)', stroke: 'rgba(16,185,129,0.4)', rx: 10, ry: 10, strokeWidth: 1.5 },
            { type: 'text', left: 155, top: 65, text: '📋 To Do', fontSize: 14, fontWeight: 'bold', fontFamily: 'Syne', fill: '#a78bfa', originX: 'center' },
            { type: 'text', left: 400, top: 65, text: '⚡ Doing', fontSize: 14, fontWeight: 'bold', fontFamily: 'Syne', fill: '#67e8f9', originX: 'center' },
            { type: 'text', left: 640, top: 65, text: '✅ Done', fontSize: 14, fontWeight: 'bold', fontFamily: 'Syne', fill: '#6ee7b7', originX: 'center' },
        ],
    });
};

export const getFlowchartTemplate = () => {
    return JSON.stringify({
        version: '5.3.0',
        objects: [
            { type: 'rect', left: 200, top: 50, width: 160, height: 60, fill: 'rgba(124,58,237,0.1)', stroke: '#7c3aed', rx: 8, ry: 8, strokeWidth: 1.5 },
            { type: 'text', left: 280, top: 80, text: 'Start', fontSize: 14, fontFamily: 'Inter', fill: '#a78bfa', originX: 'center', originY: 'center' },
            { type: 'line', x1: 280, y1: 110, x2: 280, y2: 150, stroke: '#94a3b8', strokeWidth: 1.5 },
            { type: 'rect', left: 165, top: 150, width: 230, height: 60, fill: 'rgba(6,182,212,0.1)', stroke: '#06b6d4', rx: 4, ry: 4, strokeWidth: 1.5 },
            { type: 'text', left: 280, top: 180, text: 'Process', fontSize: 14, fontFamily: 'Inter', fill: '#67e8f9', originX: 'center', originY: 'center' },
        ],
    });
};
