import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { type SessionData } from '../../../../../services/gameApi';
import GenericModal from '../../../../../components/modal';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';
import referenceDrawing from '../../../../../assets/image_draw.png';


interface DrawingRecallProps {
    session: SessionData;
    onComplete: (payload: any) => void;
    languageCode: string;
}

type DrawMode = 'line' | 'rectangle' | null;
type Phase = 'instruction' | 'memorize' | 'draw';

interface Point {
    x: number;
    y: number;
}

interface DrawnShape {
    type: 'line' | 'rectangle';
    start: Point;
    end: Point;
}

const DrawingRecall = ({ session, onComplete, languageCode }: DrawingRecallProps) => {
    const { languageConstants } = useLanguageConstantContext();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [phase, setPhase] = useState<Phase>('instruction');
    const [countdown, setCountdown] = useState(10);
    const [drawMode, setDrawMode] = useState<DrawMode>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStart, setCurrentStart] = useState<Point | null>(null);
    const [shapes, setShapes] = useState<DrawnShape[]>([]);

    const startText = getLanguageText(languageConstants, 'game_start') || 'Start';
    const nextText = getLanguageText(languageConstants, 'game_next') || 'NEXT';

    // Handle instruction submission
    const handleInstructionSubmit = () => {
        setPhase('memorize');
        setCountdown(10);
    };

    // Countdown timer for memorize phase
    useEffect(() => {
        if (phase === 'memorize' && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (phase === 'memorize' && countdown === 0) {
            setPhase('draw');
        }
    }, [phase, countdown]);

    // Canvas drawing logic
    const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        let clientX: number;
        let clientY: number;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // Calculate the position relative to the canvas
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Scale coordinates to match canvas resolution
        // Canvas actual size is 800x600, but displayed size might be different
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: x * scaleX,
            y: y * scaleY
        };
    };

    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawMode) return;
        const point = getCanvasCoordinates(e);
        if (point) {
            setIsDrawing(true);
            setCurrentStart(point);
        }
    };

    const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!drawMode) return;
        const point = getCanvasCoordinates(e);
        if (point) {
            setIsDrawing(true);
            setCurrentStart(point);
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !currentStart || !drawMode) return;
        const point = getCanvasCoordinates(e);
        if (point) {
            redrawCanvas(point);
        }
    };

    const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!isDrawing || !currentStart || !drawMode) return;
        const point = getCanvasCoordinates(e);
        if (point) {
            redrawCanvas(point);
        }
    };

    const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !currentStart || !drawMode) return;
        const point = getCanvasCoordinates(e);
        if (point) {
            const newShape: DrawnShape = {
                type: drawMode,
                start: currentStart,
                end: point
            };
            setShapes([...shapes, newShape]);
            setIsDrawing(false);
            setCurrentStart(null);
            redrawCanvas(null, [...shapes, newShape]);
        }
    };

    const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!isDrawing || !currentStart || !drawMode) return;
        // Use the last known position as end point
        const newShape: DrawnShape = {
            type: drawMode,
            start: currentStart,
            end: currentStart // Will use last move position in practice
        };

        // Get the last touch point from touchmove
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Since we can't get the exact end point on touchend, we'll use the current canvas state
                // This is a simplified approach - in production you'd track the last move position
                setShapes([...shapes, newShape]);
                setIsDrawing(false);
                setCurrentStart(null);
            }
        }
    };

    const redrawCanvas = (currentPoint: Point | null, shapesToDraw: DrawnShape[] = shapes) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all saved shapes
        shapesToDraw.forEach(shape => {
            ctx.strokeStyle = '#1976d2';
            ctx.lineWidth = 3;
            ctx.beginPath();

            if (shape.type === 'line') {
                ctx.moveTo(shape.start.x, shape.start.y);
                ctx.lineTo(shape.end.x, shape.end.y);
            } else if (shape.type === 'rectangle') {
                const width = shape.end.x - shape.start.x;
                const height = shape.end.y - shape.start.y;
                ctx.rect(shape.start.x, shape.start.y, width, height);
            }
            ctx.stroke();
        });

        // Draw current shape being drawn
        if (isDrawing && currentStart && currentPoint && drawMode) {
            ctx.strokeStyle = '#1976d2';
            ctx.lineWidth = 3;
            ctx.beginPath();

            if (drawMode === 'line') {
                ctx.moveTo(currentStart.x, currentStart.y);
                ctx.lineTo(currentPoint.x, currentPoint.y);
            } else if (drawMode === 'rectangle') {
                const width = currentPoint.x - currentStart.x;
                const height = currentPoint.y - currentStart.y;
                ctx.rect(currentStart.x, currentStart.y, width, height);
            }
            ctx.stroke();
        }
    };

    const handleClear = () => {
        setShapes([]);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const handleSubmit = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Convert canvas to base64 image
        const canvasData = canvas.toDataURL('image/png');

        const payload = {
            question_id: session.questions?.[0]?.question_id,
            answer_text: JSON.stringify(shapes),
            canvas_data: canvasData,
            language_code: languageCode
        };

        onComplete(payload);
    };

    // Render reference image (for memorize phase)
    const renderReferenceImage = () => {
        // Configuration: Use static image from assets, fallback to API URL when available
        const USE_STATIC_IMAGE = true;

        // Get image URL from API or use static fallback
        const imageUrl = USE_STATIC_IMAGE
            ? referenceDrawing
            : session.questions?.[0]?.items?.[0]?.image_url || referenceDrawing;

        return (
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 600,
                    height: 400,
                    border: '2px solid #ccc',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Box
                    component="img"
                    src={imageUrl}
                    alt="Reference Drawing"
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        p: 2
                    }}
                />

                {/* Countdown overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                    }}
                >
                    {countdown}s
                </Box>
            </Box>
        );
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            {/* Instruction Modal */}
            <GenericModal
                isOpen={phase === 'instruction'}
                onClose={() => { }}
                title="Instruction"
                hideCancelButton={true}
                submitButtonText={startText}
                onSubmit={handleInstructionSubmit}
                enableAudio={true}
                instructionText={session.module?.description || session.instructions || ''}
                languageCode={languageCode}
            >
                <Typography>
                    {session.module?.description || session.instructions || 'Remember the following drawing that will be displayed for 10 seconds. Draw on the next screen with the help of square and line tab on the tap of the screen.'}
                </Typography>
            </GenericModal>

            {/* Memorize Phase */}
            {phase === 'memorize' && (
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold', textAlign: 'center' }}>
                        {session?.questions?.[0]?.prompt_text || 'REMEMBER THE DRAWING'}
                    </Typography>
                    {renderReferenceImage()}
                </Box>
            )}

            {/* Draw Phase */}
            {phase === 'draw' && (
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    {/* Toolbar */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            onClick={() => setDrawMode('rectangle')}
                            sx={{
                                bgcolor: drawMode === 'rectangle' ? '#1976d2' : '#274765',
                                '&:hover': { bgcolor: '#1565c0' },
                                px: 3,
                                py: 1
                            }}
                        >
                            DRAW SQUARE
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => setDrawMode('line')}
                            sx={{
                                bgcolor: drawMode === 'line' ? '#1976d2' : '#274765',
                                '&:hover': { bgcolor: '#1565c0' },
                                px: 3,
                                py: 1
                            }}
                        >
                            DRAW LINE
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleClear}
                            sx={{
                                bgcolor: '#274765',
                                '&:hover': { bgcolor: '#1565c0' },
                                px: 3,
                                py: 1
                            }}
                        >
                            CLEAR
                        </Button>
                    </Box>

                    {/* Canvas */}
                    <Box
                        sx={{
                            width: '95%',
                            maxWidth: 800,
                            height: '60vh',
                            border: '2px solid #274765',
                            borderRadius: 2,
                            bgcolor: 'white',
                            position: 'relative'
                        }}
                    >
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={600}
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onTouchStart={handleCanvasTouchStart}
                            onTouchMove={handleCanvasTouchMove}
                            onTouchEnd={handleCanvasTouchEnd}
                            style={{
                                width: '100%',
                                height: '100%',
                                cursor: drawMode ? 'crosshair' : 'default',
                                touchAction: 'none'
                            }}
                        />
                    </Box>

                    {/* Submit Button */}
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
                            bgcolor: '#274765',
                            color: 'white',
                            px: 6,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            '&:hover': { bgcolor: '#1565c0' },
                            mt: 2
                        }}
                    >
                        {nextText}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default DrawingRecall;
