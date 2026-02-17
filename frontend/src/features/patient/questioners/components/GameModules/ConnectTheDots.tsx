import { useState, useEffect } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { type SessionData } from '../../../../../services/gameApi';
import GenericModal from '../../../../../components/modal';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';


interface ConnectTheDotsProps {
    session: SessionData;
    onComplete: (payload: any) => void;
}

interface Dot {
    id: number;
    label: string;
    x: number; // percentage
    y: number; // percentage
}

interface Connection {
    from: number; // dot index/id
    to: number;   // dot index/id
}

// Fixed positions based on the user's screenshot
// 5 is Top Center, M is Right of 5, O (0) is Bottom Center...
const FIXED_POSITIONS: Record<string, { x: number, y: number }> = {
    '5': { x: 55, y: 15 },
    'M': { x: 65, y: 30 },
    '6': { x: 80, y: 50 },
    'N': { x: 60, y: 50 },
    '7': { x: 70, y: 70 },
    'O': { x: 50, y: 70 }, // Displayed as 0 in new design
    '10': { x: 30, y: 70 },
    '8': { x: 40, y: 50 },
    'Q': { x: 20, y: 50 },
    '9': { x: 15, y: 29 },
    'P': { x: 35, y: 27 },
    'R': { x: 10, y: 75 }
};

// Portrait/Vertical layout for mobile as per requested image
const MOBILE_FIXED_POSITIONS: Record<string, { x: number, y: number }> = {
    '5': { x: 35, y: 15 },
    'M': { x: 65, y: 15 },
    '10': { x: 11, y: 35 },
    'N': { x: 60, y: 40 },
    '6': { x: 85, y: 35 },
    'Q': { x: 35, y: 50 },
    'O': { x: 60, y: 60 }, // Displayed as 0
    '7': { x: 85, y: 52 },
    'R': { x: 11, y: 75 },
    '9': { x: 35, y: 75 },
    'P': { x: 60, y: 80 },
    '8': { x: 85, y: 75 }
};

const ConnectTheDots = ({ session, onComplete }: ConnectTheDotsProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { languageConstants } = useLanguageConstantContext();
    const startText = getLanguageText(languageConstants, 'game_start') || 'Start';
    const instructionsTitle = getLanguageText(languageConstants, 'game_instructions') || 'Instructions';
    const audioInstructionText = getLanguageText(languageConstants, 'game_audio_instruction') || 'Audio Instruction';

    const [dots, setDots] = useState<Dot[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [lastConnectedIndex, setLastConnectedIndex] = useState<number | null>(null);
    const [startTime, setStartTime] = useState<number>(Date.now());

    // Instruction Modal State
    const [showInstruction, setShowInstruction] = useState(true);

    const handleInstructionSubmit = () => {
        setShowInstruction(false);
        setStartTime(Date.now()); // Reset start time when game actually begins
    };

    // Initialize dots and positions
    useEffect(() => {
        let items = session.questions?.[0]?.items || [];

        // Filter out L, R, 11 as per new requirement
        items = items.filter((item: any) => {
            const key = item.image_key || item.display_text;
            return !['L', '11'].includes(key);
        });

        // Explicitly sort items by order to ensure strict sequence
        // API returns 'order', handle potential string/number mix
        items = [...items].sort((a: any, b: any) => {
            const orderA = a.order || a.item_order || 0;
            const orderB = b.order || b.item_order || 0;
            return orderA - orderB;
        });

        const newDots: Dot[] = items.map((item: any, index: number) => {
            const label = item.display_text || item.image_key || '?';
            // Default to random if label not found in map (fallback)
            // Use image_key for position lookup to be safe if display_text changes
            const lookupKey = item.image_key || label;
            const positionsMap = isMobile ? MOBILE_FIXED_POSITIONS : FIXED_POSITIONS;
            const pos = positionsMap[lookupKey] || positionsMap[label] || {
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10
            };

            return {
                id: index, // index reflects the sorted order
                label, // Should display '0' if DB updated, else 'O'
                x: pos.x,
                y: pos.y
            };
        });

        setDots(newDots);
        setStartTime(Date.now());

        // Pre-fill connection 5 (0) -> M (1)
        // Check if we have at least 2 dots
        if (newDots.length >= 2) {
            setConnections([{ from: 0, to: 1 }]);
            setLastConnectedIndex(1);
        } else if (newDots.length === 1) {
            setLastConnectedIndex(0);
        }

    }, [session, isMobile]);

    const handleDotClick = (index: number) => {
        if (lastConnectedIndex === null) return;

        // User requested to allow ANY connection (not just the correct next one)
        // so we remove the validation check.

        // Prevent clicking the same dot twice in a row instantly? 
        // Or re-clicking already connected dots?
        // Let's rely on standard UI behavior: simply draw the line.

        if (index !== lastConnectedIndex) {
            const newConn = { from: lastConnectedIndex, to: index };
            const newConnections = [...connections, newConn];
            setConnections(newConnections);
            setLastConnectedIndex(index);

            // Check Completion
            // Must have visited ALL dots to finish.
            const uniqueVisited = new Set<number>();
            // Add start points and end points from all connections
            newConnections.forEach(c => {
                uniqueVisited.add(c.from);
                uniqueVisited.add(c.to);
            });

            // "Connect dots in order" -> target is the last item.
            // AND we must have touched every dot id.
            // Simplified: If we have visited ALL dots, we are done.
            if (uniqueVisited.size === dots.length) {
                handleComplete(newConnections);
            }
        }
    };

    const handleComplete = (finalConnections: Connection[]) => {
        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000;

        const sequenceIds = [0];
        for (const conn of finalConnections) {
            sequenceIds.push(conn.to);
        }

        const answerText = sequenceIds.map(id => dots.find(d => d.id === id)?.label).join(',');

        const payload = {
            question_id: session.questions?.[0]?.question_id,
            answer_text: answerText,
            time_taken: timeTaken
        };

        onComplete(payload);
    };

    // Render Lines
    const renderConnections = () => {
        return connections.map((conn, i) => {
            const from = dots.find(d => d.id === conn.from);
            const to = dots.find(d => d.id === conn.to);
            if (!from || !to) return null;
            return (
                <line
                    key={i}
                    x1={`${from.x}%`}
                    y1={`${from.y}%`}
                    x2={`${to.x}%`}
                    y2={`${to.y}%`}
                    stroke="black"
                    strokeWidth="3"
                    markerEnd="url(#arrowhead)"
                />
            );
        });
    };

    const getDotColor = (index: number, isConnected: boolean) => {
        // L (0) and 5 (1) are always RED (as per screenshot/mockup request)
        if (index === 0) return '#d32f2f'; // Red

        // If connected (user tapped), GREEN
        if (isConnected) return '#4caf50'; // Green

        // Default (unconnected) -> Purple/Blue from screenshot
        return '#512da8'; // Deep Purple
    };

    const dotSizeSx = {
        width: { xs: 52, sm: 60, md: 65 },
        height: { xs: 52, sm: 60, md: 65 },
        fontSize: { xs: '1.25rem', sm: '1.4rem', md: '1.5rem' },
    } as const;

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                minHeight: { xs: 'calc(100vh - 140px)', sm: '80vh' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                px: { xs: 1.5, sm: 2 },
                py: { xs: 2, sm: 3 },
            }}
        >
            {/* ... Modal ... */}
            <GenericModal
                isOpen={showInstruction}
                onClose={() => { }}
                title={`${session.module?.name || ''} ${instructionsTitle}`}
                hideCancelButton={true}
                submitButtonText={startText}
                onSubmit={handleInstructionSubmit}
                enableAudio={true}
                audioButtonLabel={audioInstructionText}
                audioButtonAlignment="center"
                instructionText={session.instructions || ''}
                languageCode={session.language_code || 'en'}
            >
                <Typography>{session.instructions}</Typography>
            </GenericModal>

            <Typography
                variant="h5"
                sx={{
                    mt: { xs: -2, sm: -4 },
                    mb: { xs: 2, sm: 2 },
                    color: '#274765',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: { xs: '1.35rem', sm: '1.6rem', md: '1.75rem' },
                    px: { xs: 1, sm: 0 },
                }}
            >
                {session?.questions?.[0]?.prompt_text || 'DRAW PATTERN'}
            </Typography>

            <Box
                sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: 600, md: 750 },
                    height: {
                        xs: 'min(60vh, 450px)',
                        sm: 'min(60vh, 500px)',
                        md: 'min(65vh, 600px)',
                    },
                    position: 'relative',
                    // border: '1px solid #ccc', // Screenshot doesn't show border
                    // borderRadius: 2,
                    touchAction: 'none',
                    bgcolor: 'transparent', // Screenshot shows white/transparent bg
                    mx: 'auto',
                }}
            >
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <defs>
                        <marker id="arrowhead" markerWidth="14" markerHeight="6" refX="22" refY="3" orient="auto" markerUnits="userSpaceOnUse">
                            <polygon points="0 0, 10 3.5, 0 7" fill="black" />
                        </marker>
                    </defs>
                    {renderConnections()}
                </svg>

                {dots.map(dot => {
                    // Check if this dot is connected
                    // A dot is "connected" if it is the 'to' of any connection, OR if it is '0' (start)
                    // But for coloring, we use index logic + connection status
                    const isConnected = connections.some(c => c.to === dot.id) || dot.id === 0;

                    return (
                        <Box
                            key={dot.id}
                            onClick={() => handleDotClick(dot.id)}
                            sx={{
                                position: 'absolute',
                                left: `${dot.x}%`,
                                top: `${dot.y}%`,
                                transform: 'translate(-50%, -50%)',
                                ...dotSizeSx,
                                borderRadius: '50%',
                                bgcolor: getDotColor(dot.id, isConnected),
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                userSelect: 'none',
                                boxShadow: 3,
                                zIndex: 2,
                                transition: 'background-color 0.3s ease',
                                '&:active': {
                                    transform: 'translate(-50%, -50%) scale(0.98)',
                                },
                            }}
                        >
                            {dot.label}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default ConnectTheDots;
