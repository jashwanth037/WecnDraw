export const generateHSLColor = (seed: string): string => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`;
};

export const hexToHsl = (hex: string): [number, number, number] => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

export const isLightColor = (hex: string): boolean => {
    const [, , l] = hexToHsl(hex);
    return l > 60;
};

export const PRESET_COLORS = [
    '#7c3aed', '#06b6d4', '#ec4899', '#f59e0b', '#10b981',
    '#ef4444', '#8b5cf6', '#f97316', '#84cc16', '#14b8a6',
    '#ffffff', '#000000', '#94a3b8', '#1e293b', '#fef3c7',
];
