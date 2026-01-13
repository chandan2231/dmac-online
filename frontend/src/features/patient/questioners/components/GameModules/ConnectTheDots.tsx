import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
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
// L is center-ish, 5 is right, M is below 5...
const FIXED_POSITIONS: Record<string, { x: number, y: number }> = {
    'L': { x: 50, y: 45 },
    '5': { x: 67, y: 45 },
    'M': { x: 67, y: 60 },
    '6': { x: 80, y: 65 },
    '11': { x: 65, y: 30 },
    'R': { x: 50, y: 18 },
    '10': { x: 25, y: 22 },
    'Q': { x: 35, y: 33 },
    '9': { x: 15, y: 45 },
    'P': { x: 35, y: 53 },
    '8': { x: 18, y: 68 },
    'O': { x: 40, y: 78 },
    '7': { x: 52, y: 63 },
    'N': { x: 70, y: 78 },
};

const ConnectTheDots = ({ session, onComplete }: ConnectTheDotsProps) => {
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

        // Explicitly sort items by order to ensure strict sequence
        // API returns 'order', handle potential string/number mix
        items = [...items].sort((a: any, b: any) => {
            const orderA = a.order || a.item_order || 0;
            const orderB = b.order || b.item_order || 0;
            return orderA - orderB;
        });

        const newDots: Dot[] = items.map((item: any, index: number) => {
            const label = item.image_key || item.display_text || '?';
            // Default to random if label not found in map (fallback)
            const pos = FIXED_POSITIONS[label] || {
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10
            };

            return {
                id: index, // index reflects the sorted order (0=L, 1=5, 2=M, 3=6...)
                label,
                x: pos.x,
                y: pos.y
            };
        });

        setDots(newDots);
        setStartTime(Date.now());

        // Pre-fill connection L (0) -> 5 (1) -> M (2)
        // Check if we have at least 3 dots to start from M
        if (newDots.length >= 3) {
            setConnections([
                { from: 0, to: 1 },
                { from: 1, to: 2 }
            ]);
            setLastConnectedIndex(2);
        } else if (newDots.length >= 2) {
            // Fallback just in case
            setConnections([{ from: 0, to: 1 }]);
            setLastConnectedIndex(1);
        } else if (newDots.length === 1) {
            // Should not happen in this game, but safety
            setLastConnectedIndex(0);
        }

    }, [session]);

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
        if (index === 0 || index === 1) return '#d32f2f'; // Red

        // If connected (user tapped), GREEN
        if (isConnected) return '#4caf50'; // Green

        // Default (unconnected) -> Purple/Blue from screenshot
        return '#512da8'; // Deep Purple
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <GenericModal
                isOpen={showInstruction}
                onClose={() => { }}
                title={`${session.module?.name || ''} ${instructionsTitle}`}
                hideCancelButton={true}
                submitButtonText={startText}
                onSubmit={handleInstructionSubmit}
                enableAudio={true}
                audioButtonLabel={audioInstructionText}
                instructionText={session.instructions || ''}
                languageCode={session.language_code || 'en'}
            >
                <Typography>{session.instructions}</Typography>
            </GenericModal>

            <Typography variant="h5" sx={{ mt: 6, mb: 2, color: '#274765', fontWeight: 'bold' }}>
                {session?.questions?.[0]?.prompt_text || 'DRAW PATTERN'}
            </Typography>

            <Box
                sx={{
                    width: '95%',
                    height: '75vh',
                    position: 'relative',
                    // border: '1px solid #ccc', // Screenshot doesn't show border
                    // borderRadius: 2,
                    touchAction: 'none',
                    bgcolor: 'transparent' // Screenshot shows white/transparent bg
                }}
            >
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <defs>
                        <marker id="arrowhead" markerWidth="20" markerHeight="7" refX="36" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
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
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                bgcolor: getDotColor(dot.id, isConnected),
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                userSelect: 'none',
                                boxShadow: 3,
                                zIndex: 2,
                                transition: 'background-color 0.3s ease'
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
