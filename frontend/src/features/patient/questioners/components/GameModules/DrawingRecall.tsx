import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Slider, IconButton } from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';
import { type SessionData } from '../../../../../services/gameApi';
import GenericModal from '../../../../../components/modal';
import ConfirmationModal from '../../../../../components/modal/ConfirmationModal';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';
import referenceDrawing from '../../../../../assets/image_draw.png';
import instructionVideo from '../../../../../assets/drawingModuleVideo/Video_20260207_172612_306.mp4';


interface DrawingRecallProps {
    session: SessionData;
    onComplete: (payload: any) => void;
    languageCode: string;
}

type DrawMode = 'line' | 'rectangle' | null;
type Phase = 'instruction' | 'video_instruction' | 'memorize_instruction' | 'memorize' | 'draw';

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
    const videoRef = useRef<HTMLVideoElement>(null);

    const [phase, setPhase] = useState<Phase>('instruction');
    const [countdown, setCountdown] = useState(10);
    const [drawMode, setDrawMode] = useState<DrawMode>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStart, setCurrentStart] = useState<Point | null>(null);
    const [shapes, setShapes] = useState<DrawnShape[]>([]);
    const lastPointRef = useRef<Point | null>(null);

    // Video State
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const curr = videoRef.current.currentTime;
            const dur = videoRef.current.duration;
            if (dur > 0) {
                setProgress((curr / dur) * 100);
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (event: any, newValue: number | number[]) => {
        void event;
        if (videoRef.current) {
            const seekTime = ((newValue as number) / 100) * duration;
            videoRef.current.currentTime = seekTime;
            setProgress(newValue as number);
        }
    };

    // Confirmation Modal State
    const [showConfirmation, setShowConfirmation] = useState(false);

    const startText = getLanguageText(languageConstants, 'game_start') || 'Start';
    const nextText = getLanguageText(languageConstants, 'game_next') || 'NEXT';
    const submitContinueText = getLanguageText(languageConstants, 'submit_continue') || 'Submit & Continue';
    const instructionsText = getLanguageText(languageConstants, 'game_instructions') || 'Instructions';
    const audioInstructionText = getLanguageText(languageConstants, 'game_audio_instruction') || 'Audio Instruction';

    // New translations for video screen buttons - fallback to English if not found
    const repeatText = getLanguageText(languageConstants, 'game_repeat') || 'Repeat';
    const undoText = getLanguageText(languageConstants, 'game_undo') || 'UNDO';

    // Handle instruction submission - Go to Video Instruction first
    const handleInstructionSubmit = () => {
        setPhase('video_instruction');
    };

    const handleVideoNext = () => {
        setPhase('memorize_instruction');
    };

    const handleMemorizeInstructionSubmit = () => {
        setPhase('memorize');
        setCountdown(10);
    };

    const handleVideoRepeat = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            setIsPlaying(true);
        }
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
        if (!drawMode) return;
        const point = getCanvasCoordinates(e);
        if (point) {
            setIsDrawing(true);
            setCurrentStart(point);
            lastPointRef.current = point;
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !currentStart || !drawMode) return;
        const point = getCanvasCoordinates(e);
        if (point) {
            lastPointRef.current = point;
            redrawCanvas(point);
        }
    };

    const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !currentStart || !drawMode) return;
        const point = getCanvasCoordinates(e);
        if (point) {
            lastPointRef.current = point;
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
            setShapes(prev => {
                const updated = [...prev, newShape];
                redrawCanvas(null, updated);
                return updated;
            });
            setIsDrawing(false);
            setCurrentStart(null);
            lastPointRef.current = null;
        }
    };

    const handleCanvasTouchEnd = () => {
        if (!isDrawing || !currentStart || !drawMode || !lastPointRef.current) return;

        const newShape: DrawnShape = {
            type: drawMode,
            start: currentStart,
            end: lastPointRef.current
        };

        setShapes(prev => {
            const updated = [...prev, newShape];
            redrawCanvas(null, updated);
            return updated;
        });

        setIsDrawing(false);
        setCurrentStart(null);
        lastPointRef.current = null;
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

    const handleUndo = () => {
        setShapes(prev => {
            if (prev.length === 0) return prev;
            const newShapes = prev.slice(0, -1);
            redrawCanvas(null, newShapes);
            return newShapes;
        });
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

    const calculateScore = (shapesToScore: DrawnShape[]) => {
        let score = 0;
        const TOLERANCE = 20;

        const lines = shapesToScore.filter(s => s.type === 'line');
        const rects = shapesToScore.filter(s => s.type === 'rectangle');

        // 1. One Horizontal Line (0.5)
        const activeHorizontal = lines.filter(l =>
            Math.abs(l.start.y - l.end.y) < TOLERANCE &&
            Math.abs(l.start.x - l.end.x) > TOLERANCE
        );
        if (activeHorizontal.length >= 1) score += 0.5;

        // 2. Two Vertical Lines (0.5 + 0.5)
        const activeVertical = lines.filter(l =>
            Math.abs(l.start.x - l.end.x) < TOLERANCE &&
            Math.abs(l.start.y - l.end.y) > TOLERANCE
        );
        if (activeVertical.length >= 2) score += 1.0;
        else if (activeVertical.length === 1) score += 0.5;

        // 3. Two Angle (Diagonal) Lines (0.5 + 0.5)
        const activeAngle = lines.filter(l =>
            Math.abs(l.start.x - l.end.x) >= TOLERANCE &&
            Math.abs(l.start.y - l.end.y) >= TOLERANCE
        );
        if (activeAngle.length >= 2) score += 1.0;
        else if (activeAngle.length === 1) score += 0.5;

        // 4. Two Squares (0.5 + 0.5)
        if (rects.length >= 2) score += 1.0;
        else if (rects.length === 1) score += 0.5;

        // 5. Vertical line touching the rectangle (0.5 + 0.5 = 1.0)
        let isTouching = false;
        // Check intersections or proximity between any vertical line and any rectangle
        for (const v of activeVertical) {
            for (const r of rects) {
                // Rect bounds
                const minX = Math.min(r.start.x, r.end.x);
                const maxX = Math.max(r.start.x, r.end.x);
                const minY = Math.min(r.start.y, r.end.y);
                const maxY = Math.max(r.start.y, r.end.y);
                const t = TOLERANCE;

                // Check endpoints near borders
                const points = [v.start, v.end];
                for (const p of points) {
                    const nearVert = (Math.abs(p.x - minX) < t || Math.abs(p.x - maxX) < t) && (p.y >= minY - t && p.y <= maxY + t);
                    const nearHorz = (Math.abs(p.y - minY) < t || Math.abs(p.y - maxY) < t) && (p.x >= minX - t && p.x <= maxX + t);
                    if (nearVert || nearHorz) {
                        isTouching = true;
                        break;
                    }
                }
                if (isTouching) break;
            }
            if (isTouching) break;
        }
        if (isTouching) score += 1.0;

        return score;
    };

    const handleSubmit = () => {
        // If no shapes drawn, show confirmation
        if (shapes.length === 0) {
            setShowConfirmation(true);
            return;
        }
        processSubmit();
    };

    const handleConfirmSubmit = () => {
        setShowConfirmation(false);
        processSubmit();
    };

    const processSubmit = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Convert canvas to base64 image
        const canvasData = canvas.toDataURL('image/png');

        // Calculate Score
        const calculatedScore = calculateScore(shapes);
        console.log('Calculated Drawing Recall Score:', calculatedScore);

        const payload = {
            question_id: session.questions?.[0]?.question_id,
            answer_text: JSON.stringify(shapes),
            canvas_data: canvasData,
            language_code: languageCode,
            score: calculatedScore
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

            </Box>
        );
    };

    return (
        <Box sx={{ width: '100%', height: '100%', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', py: 2, pt: { xs: 1, md: 2 } }}>
            {/* Instruction Modal - Shows initially and before memorize phase */}
            <GenericModal
                isOpen={phase === 'instruction' || phase === 'memorize_instruction'}
                onClose={() => { }}
                title={`${session.module?.name || ''} ${instructionsText}`}
                hideCancelButton={true}
                submitButtonText={startText}
                onSubmit={phase === 'instruction' ? handleInstructionSubmit : handleMemorizeInstructionSubmit}
                enableAudio={true}
                audioButtonLabel={audioInstructionText}
                audioButtonAlignment="center"
                instructionText={
                    phase === 'instruction'
                        ? (session.module?.description || session.instructions || '')
                        : (session.questions?.[0]?.prompt_text || 'Remember the drawing')
                }
                languageCode={languageCode}
            >
                <Typography>
                    {phase === 'instruction'
                        ? (session.module?.description || session.instructions || 'Remember the following drawing that will be displayed for 10 seconds. Draw on the next screen with the help of square and line tab on the tap of the screen.')
                        : (session.questions?.[0]?.prompt_text || 'The picture will be displayed for 10 seconds, you are instructed to draw the same picture with the square and line tools provided as shown in the video before.')
                    }
                </Typography>
            </GenericModal>

            {/* Video Instruction Phase */}
            {phase === 'video_instruction' && (
                <Box sx={{ width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                        Instructions
                    </Typography>

                    <Box sx={{
                        // Container matches the aspect ratio of the rotated video (320w / 600h = 0.533)
                        height: { xs: 'min(65vh, 550px)', sm: 'min(65vh, 550px)' },
                        aspectRatio: '320 / 600',
                        width: 'auto', // Width is driven by height and aspect ratio
                        bgcolor: '#000',
                        borderRadius: '20px', // Sleeker radius
                        overflow: 'hidden',
                        border: '8px solid #222', // Thinner border
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <video
                            ref={videoRef}
                            onClick={togglePlay}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            autoPlay
                            style={{
                                width: 'min(65vh, 550px)', // Matches container height
                                height: 'calc(min(65vh, 550px) * 320 / 600)', // Matches container width
                                transform: 'rotate(90deg)',
                                objectFit: 'contain',
                                maxWidth: 'none',
                                maxHeight: 'none',
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transformOrigin: 'center center',
                                margin: 0,
                                translate: '-50% -50%'
                            }}
                            // Placeholder source - user to add logic for video file
                            src={instructionVideo}
                        >
                            Your browser does not support the video tag.
                        </video>

                        {/* Custom Controls Overlay */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: 20,
                            left: 0,
                            width: '100%',
                            px: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            zIndex: 10,
                            // Gradient background for visibility
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                            pb: 1,
                            pt: 4
                        }}>
                            <IconButton onClick={togglePlay} sx={{ color: 'white' }}>
                                {isPlaying ? <Pause /> : <PlayArrow />}
                            </IconButton>

                            <Slider
                                value={progress}
                                onChange={handleSeek}
                                sx={{
                                    color: 'white',
                                    '& .MuiSlider-thumb': {
                                        width: 12,
                                        height: 12,
                                        '&:hover, &.Mui-focusVisible': {
                                            boxShadow: '0px 0px 0px 8px rgba(255, 255, 255, 0.16)',
                                        },
                                    },
                                    '& .MuiSlider-rail': {
                                        opacity: 0.5,
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Button
                            variant="outlined"
                            onClick={handleVideoRepeat}
                            sx={{
                                borderColor: '#274765',
                                color: '#274765',
                                minWidth: { xs: '140px', sm: '180px' },
                                width: { xs: '100%', sm: 'auto' },
                                fontWeight: 'bold',
                                borderWidth: 2,
                                borderRadius: '12px',
                                px: { xs: 2, sm: 4 },
                                py: 2,
                                textTransform: 'uppercase',
                                '&:hover': {
                                    borderWidth: 2,
                                    borderColor: '#1e3650',
                                    backgroundColor: 'rgba(39, 71, 101, 0.04)'
                                }
                            }}
                        >
                            {repeatText}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleVideoNext}
                            sx={{
                                backgroundColor: '#274765',
                                color: 'white',
                                minWidth: { xs: '140px', sm: '180px' },
                                width: { xs: '100%', sm: 'auto' },
                                fontWeight: 'bold',
                                borderRadius: '12px',
                                px: { xs: 2, sm: 4 },
                                py: 2,
                                textTransform: 'uppercase'
                            }}
                        >
                            {nextText}
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Memorize Phase */}
            {phase === 'memorize' && (
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    {renderReferenceImage()}
                </Box>
            )}

            {/* Draw Phase */}
            {phase === 'draw' && (
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    {/* Toolbar */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                        <Button
                            variant="contained"
                            onClick={() => setDrawMode('rectangle')}
                            sx={{
                                bgcolor: drawMode === 'rectangle' ? '#1976d2' : '#274765',
                                '&:hover': { bgcolor: '#1565c0' },
                                px: { xs: 1, sm: 3 },
                                py: 1,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                minWidth: { xs: 'auto', sm: '64px' }
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
                                px: { xs: 1, sm: 3 },
                                py: 1,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                minWidth: { xs: 'auto', sm: '64px' }
                            }}
                        >
                            DRAW LINE
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleUndo}
                            disabled={shapes.length === 0}
                            sx={{
                                bgcolor: '#274765',
                                '&:hover': { bgcolor: '#1565c0' },
                                px: { xs: 1, sm: 3 },
                                py: 1,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                minWidth: { xs: 'auto', sm: '64px' },
                                '&.Mui-disabled': {
                                    bgcolor: '#e0e0e0',
                                    color: '#9e9e9e'
                                }
                            }}
                        >
                            {undoText}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleClear}
                            sx={{
                                bgcolor: '#274765',
                                '&:hover': { bgcolor: '#1565c0' },
                                px: { xs: 1, sm: 3 },
                                py: 1,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                minWidth: { xs: 'auto', sm: '64px' }
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
                            height: { xs: '50vh', sm: '60vh' },
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
                            py: 3.5,
                            borderRadius: '10px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            '&:hover': { bgcolor: '#1565c0' },
                            mt: 2,
                            width: { xs: '90%', sm: 'auto' }
                        }}
                    >
                        {submitContinueText}
                    </Button>
                </Box>
            )}

            <ConfirmationModal
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleConfirmSubmit}
            />
        </Box>
    );
};

export default DrawingRecall;
