import React, { useEffect, useRef } from 'react';
import { Canvas as FabricCanvas, PencilBrush, Rect, Circle, Triangle, Polygon, Line, IText, Group, Point, util } from 'fabric';
import { useCanvasStore } from '../../store/canvasStore';
import { useSocket } from '../../hooks/useSocket';
import { throttle, getKanbanTemplate, getFlowchartTemplate } from '../../utils/canvasHelpers';
import { roomService } from '../../services/roomService';

const AUTO_SAVE_INTERVAL = 60000;

interface CanvasProps {
    roomId: string;
    template?: string;
}

const Canvas: React.FC<CanvasProps> = ({ roomId, template = 'blank' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<FabricCanvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const laserTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { tool, brushSettings, pushHistory, cursors } = useCanvasStore();
    const { emit, on } = useSocket();

    // Helper: get scene-space (canvas-space) point from a mouse event
    // This accounts for pan and zoom so objects appear exactly at cursor
    const getScenePoint = (canvas: FabricCanvas, e: MouseEvent): Point => {
        const vpt = canvas.viewportTransform!;
        const rect = (canvas as any).upperCanvasEl.getBoundingClientRect();
        const x = (e.clientX - rect.left - vpt[4]) / vpt[0];
        const y = (e.clientY - rect.top - vpt[5]) / vpt[3];
        return new Point(x, y);
    };

    // Initialize Fabric.js canvas
    useEffect(() => {
        if (!canvasRef.current || fabricRef.current) return;

        const canvas = new FabricCanvas(canvasRef.current, {
            width: containerRef.current?.clientWidth || window.innerWidth,
            height: containerRef.current?.clientHeight || window.innerHeight,
            backgroundColor: 'transparent',
            selection: true,
            preserveObjectStacking: true,
        });

        fabricRef.current = canvas;
        (window as any).__fabricCanvas = canvas;

        // Apply template
        if (template === 'kanban') {
            canvas.loadFromJSON(getKanbanTemplate()).then(() => canvas.renderAll());
        } else if (template === 'flowchart') {
            canvas.loadFromJSON(getFlowchartTemplate()).then(() => canvas.renderAll());
        } else if (template === 'wireframe') {
            canvas.backgroundColor = 'rgba(0,0,0,0.02)';
            canvas.renderAll();
        }

        // Push initial state
        pushHistory(JSON.stringify(canvas.toJSON()));

        // Flag used to suppress pushHistory during loadFromJSON (undo/redo/sync)
        (canvas as any)._isLoadingState = false;

        // Auto-save
        autoSaveRef.current = setInterval(async () => {
            const state = JSON.stringify(canvas.toJSON());
            try {
                await roomService.saveSession(roomId, state);
            } catch { }
        }, AUTO_SAVE_INTERVAL);

        return () => {
            if (autoSaveRef.current) clearInterval(autoSaveRef.current);
            laserTimeoutsRef.current.forEach((t) => clearTimeout(t));
            canvas.dispose();
            fabricRef.current = null;
            (window as any).__fabricCanvas = null;
        };
    }, []);

    // Keep window ref updated
    useEffect(() => {
        if (fabricRef.current) {
            (window as any).__fabricCanvas = fabricRef.current;
        }
    });

    // Handle canvas events (object added/modified/removed)
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const onObjectAdded = (e: any) => {
            if (!e.target || e.target._skipEmit) return;
            // Don't record history during loadFromJSON (undo/redo/sync)
            if ((canvas as any)._isLoadingState) return;
            const data = e.target.toJSON(['id']);
            emit('draw:object-added', { roomId, data });
            pushHistory(JSON.stringify(canvas.toJSON()));
        };

        const onObjectModified = (e: any) => {
            if (!e.target) return;
            if ((canvas as any)._isLoadingState) return;
            const data = e.target.toJSON(['id']);
            emit('draw:object-modified', { roomId, data });
            pushHistory(JSON.stringify(canvas.toJSON()));
        };

        const onObjectRemoved = (e: any) => {
            if (!e.target || e.target._skipEmit) return;
            if ((canvas as any)._isLoadingState) return;
            emit('draw:object-removed', { roomId, data: { id: (e.target as any).id } });
            pushHistory(JSON.stringify(canvas.toJSON()));
        };

        const onPathCreated = (e: any) => {
            if (!e.path) return;
            if ((canvas as any)._isLoadingState) return;
            const data = e.path.toJSON();
            emit('draw:object-added', { roomId, data });
            pushHistory(JSON.stringify(canvas.toJSON()));
        };

        canvas.on('object:added', onObjectAdded);
        canvas.on('object:modified', onObjectModified);
        canvas.on('object:removed', onObjectRemoved);
        canvas.on('path:created', onPathCreated);

        return () => {
            canvas.off('object:added', onObjectAdded);
            canvas.off('object:modified', onObjectModified);
            canvas.off('object:removed', onObjectRemoved);
            canvas.off('path:created', onPathCreated);
        };
    }, [roomId, emit, pushHistory]);

    // Apply tool settings to canvas
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        canvas.hoverCursor = 'crosshair';

        // Make all objects non-interactive by default
        canvas.forEachObject((obj: any) => {
            obj.selectable = tool === 'select';
            obj.evented = tool === 'select' || tool === 'eraser';
        });

        switch (tool) {
            case 'pencil':
            case 'highlighter':
            case 'sketch': {
                canvas.isDrawingMode = true;
                const brush = new PencilBrush(canvas);
                if (tool === 'highlighter') {
                    brush.color = brushSettings.color + '80';
                    brush.width = brushSettings.size * 3;
                } else if (tool === 'sketch') {
                    // Sketch = wide brush, lower opacity, like a marker/crayon
                    brush.color = brushSettings.color + '55';
                    brush.width = brushSettings.size * 6;
                } else {
                    brush.color = brushSettings.color;
                    brush.width = brushSettings.size;
                }
                canvas.freeDrawingBrush = brush;
                canvas.defaultCursor = 'crosshair';
                break;
            }
            case 'eraser': {
                canvas.isDrawingMode = false;
                canvas.selection = false;
                canvas.defaultCursor = 'not-allowed';
                canvas.hoverCursor = 'pointer';
                // Make all objects respond to click events for eraser
                canvas.forEachObject((obj: any) => {
                    obj.selectable = false;
                    obj.evented = true;
                    obj.hoverCursor = 'pointer';
                });
                break;
            }
            case 'select': {
                canvas.isDrawingMode = false;
                canvas.selection = true;
                canvas.defaultCursor = 'default';
                canvas.hoverCursor = 'move';
                canvas.forEachObject((obj: any) => {
                    obj.selectable = true;
                    obj.evented = true;
                });
                break;
            }
            case 'pan': {
                canvas.defaultCursor = 'grab';
                canvas.hoverCursor = 'grab';
                canvas.forEachObject((obj: any) => {
                    obj.selectable = false;
                    obj.evented = false;
                });
                break;
            }
        }
    }, [tool, brushSettings]);

    // Mouse events for pan, shapes, text, laser, eraser
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        let isDragging = false;
        let startX = 0, startY = 0;
        let tempShape: any = null;
        let isPanning = false;
        let panStartX = 0, panStartY = 0;

        // Helper: create diamond polygon points
        const createDiamondPoints = (w: number, h: number) => [
            { x: w / 2, y: 0 },
            { x: w, y: h / 2 },
            { x: w / 2, y: h },
            { x: 0, y: h / 2 },
        ];

        // Helper: create arrow with arrowhead using a group
        const createArrowLine = (x1: number, y1: number, x2: number, y2: number, opts: any, isTemp = false) => {
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const headLen = Math.max(12, opts.strokeWidth * 4);

            const line = new Line([x1, y1, x2, y2], {
                stroke: opts.stroke,
                strokeWidth: opts.strokeWidth,
                opacity: opts.opacity,
                strokeDashArray: opts.strokeDashArray,
            });

            const headX = x2;
            const headY = y2;
            const p1x = headX - headLen * Math.cos(angle - Math.PI / 6);
            const p1y = headY - headLen * Math.sin(angle - Math.PI / 6);
            const p2x = headX - headLen * Math.cos(angle + Math.PI / 6);
            const p2y = headY - headLen * Math.sin(angle + Math.PI / 6);

            const head = new Polygon([
                { x: headX, y: headY },
                { x: p1x, y: p1y },
                { x: p2x, y: p2y }
            ], {
                fill: opts.stroke,
                stroke: opts.stroke,
                strokeWidth: 1,
                opacity: opts.opacity,
            });

            const group = new Group([line, head], {
                selectable: !isTemp,
                evented: !isTemp,
            });

            return group;
        };

        const handleMouseDown = (e: any) => {
            const evt = e.e as MouseEvent;

            // Pan tool: start panning
            if (tool === 'pan') {
                isPanning = true;
                canvas.defaultCursor = 'grabbing';
                panStartX = evt.clientX;
                panStartY = evt.clientY;
                return;
            }

            // Eraser: remove object under cursor
            if (tool === 'eraser') {
                const pointer = getScenePoint(canvas, evt);
                const objects = canvas.getObjects();
                for (let i = objects.length - 1; i >= 0; i--) {
                    const obj = objects[i];
                    if (obj.containsPoint(pointer)) {
                        canvas.remove(obj);
                        canvas.renderAll();
                        break;
                    }
                }
                return;
            }

            if (['pencil', 'highlighter', 'sketch', 'select'].includes(tool)) return;

            // Use scene point (accounts for pan + zoom) so objects appear at cursor
            const pointer = getScenePoint(canvas, evt);
            startX = pointer.x;
            startY = pointer.y;
            isDragging = true;

            if (tool === 'text') {
                const text = new IText('Click to edit', {
                    left: startX,
                    top: startY,
                    fontSize: brushSettings.fontSize,
                    fontFamily: brushSettings.fontFamily,
                    fill: brushSettings.color,
                    opacity: brushSettings.opacity,
                    editable: true,
                });
                (text as any).id = Date.now().toString();
                canvas.add(text);
                canvas.setActiveObject(text);
                text.enterEditing();
                isDragging = false;
                return;
            }

            if (tool === 'laser') {
                const dot = new Circle({
                    left: startX, top: startY, radius: 8,
                    fill: 'rgba(239,68,68,0.9)',
                    evented: false, selectable: false,
                    originX: 'center', originY: 'center',
                });
                (dot as any)._skipEmit = true;
                canvas.add(dot);
                emit('cursor:move', { roomId, x: startX, y: startY });
                const timeout = setTimeout(() => { canvas.remove(dot); canvas.renderAll(); }, 1500);
                laserTimeoutsRef.current.set('local', timeout);
                isDragging = false;
                return;
            }
        };

        const handleMouseMove = (e: any) => {
            const evt = e.e as MouseEvent;

            // Pan: move viewport
            if (isPanning && tool === 'pan') {
                const vpt = canvas.viewportTransform!;
                vpt[4] += evt.clientX - panStartX;
                vpt[5] += evt.clientY - panStartY;
                panStartX = evt.clientX;
                panStartY = evt.clientY;
                canvas.requestRenderAll();
                return;
            }

            if (!isDragging) return;

            const pointer = getScenePoint(canvas, evt);
            const w = pointer.x - startX;
            const h = pointer.y - startY;

            if (tempShape) canvas.remove(tempShape);

            const dashArr = brushSettings.strokeStyle === 'dashed' ? [8, 6] : undefined;
            const shapeOpts: any = {
                left: startX, top: startY,
                stroke: brushSettings.color,
                strokeWidth: brushSettings.size,
                fill: brushSettings.fillColor || 'transparent',
                opacity: brushSettings.opacity,
                strokeDashArray: dashArr,
                evented: false,
                selectable: false,
            };

            if (tool === 'rectangle') {
                tempShape = new Rect({ ...shapeOpts, width: Math.abs(w), height: Math.abs(h), left: w < 0 ? pointer.x : startX, top: h < 0 ? pointer.y : startY });
            } else if (tool === 'circle') {
                const r = Math.max(Math.abs(w), Math.abs(h)) / 2;
                tempShape = new Circle({ ...shapeOpts, radius: r, left: startX, top: startY });
            } else if (tool === 'triangle') {
                tempShape = new Triangle({ ...shapeOpts, width: Math.abs(w), height: Math.abs(h), left: w < 0 ? pointer.x : startX, top: h < 0 ? pointer.y : startY });
            } else if (tool === 'diamond') {
                const dw = Math.abs(w);
                const dh = Math.abs(h);
                tempShape = new Polygon(createDiamondPoints(dw, dh), {
                    ...shapeOpts,
                    left: w < 0 ? pointer.x : startX,
                    top: h < 0 ? pointer.y : startY,
                });
            } else if (tool === 'line') {
                tempShape = new Line([startX, startY, pointer.x, pointer.y], { ...shapeOpts });
            } else if (tool === 'arrow') {
                tempShape = createArrowLine(startX, startY, pointer.x, pointer.y, {
                    stroke: brushSettings.color,
                    strokeWidth: brushSettings.size,
                    opacity: brushSettings.opacity,
                    strokeDashArray: dashArr,
                }, true);
            }

            if (tempShape) {
                (tempShape as any)._skipEmit = true;
                canvas.add(tempShape);
                canvas.renderAll();
            }
        };

        const handleMouseUp = (e: any) => {
            // End panning
            if (isPanning) {
                isPanning = false;
                canvas.defaultCursor = 'grab';
                return;
            }

            if (!isDragging || !tempShape) { isDragging = false; return; }

            const evt = e.e as MouseEvent;
            const pointer = getScenePoint(canvas, evt);
            canvas.remove(tempShape);

            const w = pointer.x - startX;
            const h = pointer.y - startY;
            const dashArr = brushSettings.strokeStyle === 'dashed' ? [8, 6] : undefined;
            const shapeOpts: any = {
                left: startX, top: startY,
                stroke: brushSettings.color,
                strokeWidth: brushSettings.size,
                fill: brushSettings.fillColor || 'transparent',
                opacity: brushSettings.opacity,
                strokeDashArray: dashArr,
            };

            let finalShape: any;
            if (tool === 'rectangle') {
                finalShape = new Rect({ ...shapeOpts, width: Math.abs(w), height: Math.abs(h), left: w < 0 ? pointer.x : startX, top: h < 0 ? pointer.y : startY });
            } else if (tool === 'circle') {
                const r = Math.max(Math.abs(w), Math.abs(h)) / 2;
                finalShape = new Circle({ ...shapeOpts, radius: r, left: startX, top: startY });
            } else if (tool === 'triangle') {
                finalShape = new Triangle({ ...shapeOpts, width: Math.abs(w), height: Math.abs(h), left: w < 0 ? pointer.x : startX, top: h < 0 ? pointer.y : startY });
            } else if (tool === 'diamond') {
                const dw = Math.abs(w);
                const dh = Math.abs(h);
                finalShape = new Polygon(createDiamondPoints(dw, dh), {
                    ...shapeOpts,
                    left: w < 0 ? pointer.x : startX,
                    top: h < 0 ? pointer.y : startY,
                });
            } else if (tool === 'line') {
                finalShape = new Line([startX, startY, pointer.x, pointer.y], { ...shapeOpts });
            } else if (tool === 'arrow') {
                finalShape = createArrowLine(startX, startY, pointer.x, pointer.y, {
                    stroke: brushSettings.color,
                    strokeWidth: brushSettings.size,
                    opacity: brushSettings.opacity,
                    strokeDashArray: dashArr,
                });
            }

            if (finalShape) {
                (finalShape as any).id = Date.now().toString();
                canvas.add(finalShape);
                canvas.setActiveObject(finalShape);
            }

            isDragging = false;
            tempShape = null;
        };

        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);

        return () => {
            canvas.off('mouse:down', handleMouseDown);
            canvas.off('mouse:move', handleMouseMove);
            canvas.off('mouse:up', handleMouseUp);
        };
    }, [tool, brushSettings, roomId, emit]);

    // Mouse wheel zoom — zoom at cursor point (like Excalidraw)
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const handleWheel = (opt: any) => {
            const e = opt.e as WheelEvent;
            e.preventDefault();
            e.stopPropagation();

            // Ctrl + wheel = zoom (like Excalidraw)
            // Regular wheel = also zoom for simplicity (Excalidraw behavior)
            const delta = e.deltaY;
            let newZoom = canvas.getZoom() * (1 - delta / 400);
            newZoom = Math.min(5, Math.max(0.1, newZoom));

            // Zoom at mouse pointer position
            const rect = (canvas as any).upperCanvasEl.getBoundingClientRect();
            const point = new Point(e.clientX - rect.left, e.clientY - rect.top);
            canvas.zoomToPoint(point, newZoom);
            canvas.requestRenderAll();

            useCanvasStore.getState().setZoom(newZoom);
        };

        canvas.on('mouse:wheel', handleWheel);
        return () => { canvas.off('mouse:wheel', handleWheel); };
    }, []);

    // Cursor tracking (throttled)
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const throttledCursorEmit = throttle((x: number, y: number) => {
            emit('cursor:move', { roomId, x, y });
        }, 33);

        const handleMouseMove = (e: any) => {
            const pointer = getScenePoint(canvas, e.e);
            throttledCursorEmit(pointer.x, pointer.y);
        };

        canvas.on('mouse:move', handleMouseMove);
        return () => { canvas.off('mouse:move', handleMouseMove); };
    }, [roomId, emit]);

    // Socket event handlers for remote drawing
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const cleanup: Array<() => void> = [];

        cleanup.push(on('draw:object-added', (args: any) => {
            const data = args.data || args;
            (canvas as any)._isLoadingState = true;
            util.enlivenObjects([data]).then((objects: any[]) => {
                objects.forEach((obj: any) => {
                    obj._skipEmit = true;
                    canvas.add(obj);
                });
                (canvas as any)._isLoadingState = false;
                canvas.renderAll();
            });
        }));

        cleanup.push(on('draw:object-modified', (args: any) => {
            const data = args.data || args;
            const obj = canvas.getObjects().find((o) => (o as any).id === data.id);
            if (obj) { obj.set(data); canvas.renderAll(); }
        }));

        cleanup.push(on('draw:object-removed', (args: any) => {
            const data = args.data || args;
            const obj = canvas.getObjects().find((o) => (o as any).id === data.id);
            if (obj) { (obj as any)._skipEmit = true; canvas.remove(obj); canvas.renderAll(); }
        }));

        cleanup.push(on('canvas:clear', () => {
            canvas.clear();
            canvas.renderAll();
        }));

        cleanup.push(on('canvas:undo', (args: any) => {
            const canvasState = args.canvasState || args;
            (canvas as any)._isLoadingState = true;
            canvas.loadFromJSON(canvasState).then(() => { (canvas as any)._isLoadingState = false; canvas.renderAll(); });
        }));

        cleanup.push(on('canvas:redo', (args: any) => {
            const canvasState = args.canvasState || args;
            (canvas as any)._isLoadingState = true;
            canvas.loadFromJSON(canvasState).then(() => { (canvas as any)._isLoadingState = false; canvas.renderAll(); });
        }));

        cleanup.push(on('canvas:sync-response', (args: any) => {
            const canvasState = args.canvasState || args;
            if (canvasState) {
                (canvas as any)._isLoadingState = true;
                canvas.loadFromJSON(canvasState).then(() => { (canvas as any)._isLoadingState = false; canvas.renderAll(); });
            }
        }));

        return () => { cleanup.forEach((fn) => fn()); };
    }, [on]);

    // Keyboard shortcuts
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                const state = useCanvasStore.getState().undo();
                if (state !== null) {
                    (canvas as any)._isLoadingState = true;
                    canvas.loadFromJSON(state).then(() => { (canvas as any)._isLoadingState = false; canvas.renderAll(); });
                    emit('canvas:undo', { roomId, canvasState: state });
                }
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
                e.preventDefault();
                const state = useCanvasStore.getState().redo();
                if (state !== null) {
                    (canvas as any)._isLoadingState = true;
                    canvas.loadFromJSON(state).then(() => { (canvas as any)._isLoadingState = false; canvas.renderAll(); });
                    emit('canvas:redo', { roomId, canvasState: state });
                }
            }
            if (e.key === 'Delete' || (e.key === 'Backspace' && !(canvas as any)._activeObject?.isEditing)) {
                const activeObj = canvas.getActiveObject();
                if (activeObj && !canvas.isDrawingMode) {
                    canvas.remove(activeObj);
                    canvas.renderAll();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [roomId, emit]);

    // Resize handler — fill container
    useEffect(() => {
        const handleResize = () => {
            const canvas = fabricRef.current;
            if (!canvas || !containerRef.current) return;
            canvas.setDimensions({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight,
            });
            canvas.renderAll();
        };

        handleResize(); // initial size
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>


            <canvas ref={canvasRef} style={{ display: 'block' }} />

            {/* Live cursors overlay */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
                {Array.from(cursors.values()).map((cursor) => {
                    // Transform scene-space cursor to screen-space using viewport transform
                    const canvas = fabricRef.current;
                    const vpt = canvas?.viewportTransform || [1, 0, 0, 1, 0, 0];
                    const screenX = cursor.x * vpt[0] + vpt[4];
                    const screenY = cursor.y * vpt[3] + vpt[5];

                    return (
                        <div
                            key={cursor.socketId}
                            style={{
                                position: 'absolute', left: screenX, top: screenY,
                                transition: 'left 0.05s linear, top 0.05s linear',
                                transform: 'translate(-4px, -4px)',
                            }}
                        >
                            <svg width="20" height="24" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }}>
                                <path d="M 0 0 L 0 20 L 6 14 L 10 22 L 12 21 L 8 13 L 16 13 Z" fill="#ef4444" />
                            </svg>
                            <div style={{
                                position: 'absolute', top: 18, left: 14,
                                padding: '2px 6px', borderRadius: 4,
                                background: '#ef4444', color: 'white',
                                fontSize: '0.65rem', fontWeight: 600,
                                whiteSpace: 'nowrap', fontFamily: 'Inter',
                            }}>
                                {cursor.user.username}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Canvas;
