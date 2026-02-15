import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { type SessionData } from '../../../../../services/gameApi';
import GenericModal from '../../../../../components/modal';
import ConfirmationModal from '../../../../../components/modal/ConfirmationModal';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';
import MorenButton from '../../../../../components/button';

interface GroupMatchingProps {
    session: SessionData;
    onComplete: (answers: any[]) => void;
    languageCode: string;
}

interface DraggableItem {
    id: number;
    text: string;
    category: string; // "Cities", "Meats", etc. - from accepted_answers
}

const GroupMatching = ({ session, onComplete, languageCode }: GroupMatchingProps) => {
    const { languageConstants } = useLanguageConstantContext();

    // Translations
    const t = {
        instructionsTitle: getLanguageText(languageConstants, 'game_instructions') || 'Instructions',
        start: getLanguageText(languageConstants, 'game_start') || 'Start',
        audioInstruction: getLanguageText(languageConstants, 'game_audio_instruction') || 'Audio Instruction',
        next: getLanguageText(languageConstants, 'game_next') || 'Next',
        finish: getLanguageText(languageConstants, 'game_finish') || 'Finish',
        dragItems: getLanguageText(languageConstants, 'game_drag_items_instruction') || 'Drag items to their correct groups'
    };

    const [roundIndex, setRoundIndex] = useState(0);
    const [gameState, setGameState] = useState<'instruction' | 'playing'>('instruction');

    // State for the current round items
    const [pool, setPool] = useState<DraggableItem[]>([]);
    const [group1, setGroup1] = useState<DraggableItem[]>([]);
    const [group2, setGroup2] = useState<DraggableItem[]>([]);

    // Track dragged item
    const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);

    // Confirmation Modal State
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Score accumulating across rounds
    const [roundScores, setRoundScores] = useState<number[]>([]);

    // Refs for drop zones to support mobile touch detection
    const poolRef = useRef<HTMLDivElement>(null);
    const group1Ref = useRef<HTMLDivElement>(null);
    const group2Ref = useRef<HTMLDivElement>(null);
    const touchDraggedItemRef = useRef<DraggableItem | null>(null);

    const questions = session.questions || [];
    const currentQuestion = questions[roundIndex];

    // Initialize round
    useEffect(() => {
        if (!currentQuestion) return;

        const items = (currentQuestion.items || []).map((item, idx) => ({
            id: idx,
            text: item.display_text || item.image_key || '?',
            category: item.accepted_answers || 'Unknown' // We stored category in accepted_answers in SQL
        }));

        // Shuffle items for the pool initially
        const shuffled = [...items].sort(() => Math.random() - 0.5);

        setPool(shuffled);
        setGroup1([]);
        setGroup2([]);

    }, [roundIndex, currentQuestion]);

    const handleInstructionSubmit = () => {
        setGameState('playing');
    };

    // --- Drag and Drop Logic ---

    const handleDragStart = (e: React.DragEvent, item: DraggableItem) => {
        setDraggedItem(item);
        // Required for Firefox
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Essential to allow dropping
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetContainerId: 'pool' | 'group1' | 'group2') => {
        e.preventDefault();
        if (!draggedItem) return;

        // Helper to remove item from its source array
        const removeFromSource = (item: DraggableItem) => {
            setPool(prev => prev.filter(i => i.id !== item.id));
            setGroup1(prev => prev.filter(i => i.id !== item.id));
            setGroup2(prev => prev.filter(i => i.id !== item.id));
        };

        // Remove from wherever it was
        removeFromSource(draggedItem);

        // Add to new container
        if (targetContainerId === 'pool') {
            setPool(prev => [...prev, draggedItem]);
        } else if (targetContainerId === 'group1') {
            setGroup1(prev => [...prev, draggedItem]);
        } else if (targetContainerId === 'group2') {
            setGroup2(prev => [...prev, draggedItem]);
        }

        setDraggedItem(null);
    };

    // --- Mobile Touch Logic ---
    const handleTouchStart = (_e: React.TouchEvent, item: DraggableItem) => {
        touchDraggedItemRef.current = item;
    };

    const handleTouchEnd = (e: React.TouchEvent, _item: DraggableItem) => {
        const touch = e.changedTouches[0];
        if (!touch) return;

        const x = touch.clientX;
        const y = touch.clientY;

        const isInside = (ref: React.RefObject<HTMLDivElement>) => {
            if (!ref.current) return false;
            const rect = ref.current.getBoundingClientRect();
            return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        };

        let target: 'pool' | 'group1' | 'group2' | null = null;
        if (isInside(poolRef)) target = 'pool';
        else if (isInside(group1Ref)) target = 'group1';
        else if (isInside(group2Ref)) target = 'group2';

        if (target && touchDraggedItemRef.current) {
            const dragged = touchDraggedItemRef.current;
            // Helper to remove item from its source array
            const removeFromSource = (i: DraggableItem) => {
                setPool(prev => prev.filter(p => p.id !== i.id));
                setGroup1(prev => prev.filter(p => p.id !== i.id));
                setGroup2(prev => prev.filter(p => p.id !== i.id));
            };

            removeFromSource(dragged);

            if (target === 'pool') setPool(prev => [...prev, dragged]);
            else if (target === 'group1') setGroup1(prev => [...prev, dragged]);
            else if (target === 'group2') setGroup2(prev => [...prev, dragged]);
        }

        touchDraggedItemRef.current = null;
    };


    const handleNextRound = () => {
        if (group1.length === 0 && group2.length === 0) {
            setShowConfirmation(true);
            return;
        }
        processNextRound();
    };

    const handleConfirmSubmit = () => {
        setShowConfirmation(false);
        processNextRound();
    };

    const processNextRound = () => {
        // Scoring Logic
        let score = 0;

        const allItems = [...pool, ...group1, ...group2];
        const distinctCategories = Array.from(new Set(allItems.map(i => i.category)));

        if (distinctCategories.length >= 2) {
            const catA = distinctCategories[0];
            const catB = distinctCategories[1];

            // Check Option 1: Group 1 has all A, Group 2 has all B
            const g1HasAllA = itemsMatchCategory(group1, catA, 3);
            const g2HasAllB = itemsMatchCategory(group2, catB, 3);

            // Check Option 2: Group 1 has all B, Group 2 has all A
            const g1HasAllB = itemsMatchCategory(group1, catB, 3);
            const g2HasAllA = itemsMatchCategory(group2, catA, 3);

            if ((g1HasAllA && g2HasAllB) || (g1HasAllB && g2HasAllA)) {
                score = 1;
            }
        }

        const newScores = [...roundScores, score];
        setRoundScores(newScores);

        // Move to next or finish
        if (roundIndex < questions.length - 1) {
            setRoundIndex(prev => prev + 1);
        } else {
            // Finish
            finishGame(newScores);
        }
    };

    const itemsMatchCategory = (list: DraggableItem[], category: string, requiredCount: number) => {
        if (list.length !== requiredCount) return false;
        return list.every(item => item.category === category);
    };

    const finishGame = (finalScores: number[]) => {
        const validAnswers = questions.map((q, idx) => ({
            question_id: q.question_id,
            answer_text: `Score: ${finalScores[idx] || 0}`,
        }));

        onComplete(validAnswers);
    };

    return (
        <Box sx={{ width: '100%', height: '100%', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2, overflowY: 'auto' }}>
            <GenericModal
                isOpen={gameState === 'instruction'}
                onClose={() => { }}
                title={`${session.module?.name || ''} ${t.instructionsTitle}`}
                hideCancelButton={true}
                submitButtonText={t.start}
                onSubmit={handleInstructionSubmit}
                enableAudio={true}
                audioButtonLabel={t.audioInstruction}
                audioButtonAlignment="center"
                instructionText={session.instructions || ''}
                languageCode={languageCode}
            >
                <Typography>{session.instructions}</Typography>
            </GenericModal>

            {gameState === 'playing' && (
                <Box sx={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: 3, paddingBottom: 4 }}>
                    <Box>
                        <Typography variant="h6" align="center" gutterBottom color="primary">
                            {currentQuestion?.prompt_text || t.dragItems}
                        </Typography>
                    </Box>

                    {/* Pool Area */}
                    <Paper
                        ref={poolRef}
                        elevation={3}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'pool')}
                        sx={{
                            minHeight: '120px',
                            p: 2,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                            justifyContent: 'center',
                            bgcolor: '#f5f5f5',
                            border: '2px dashed #999',
                            touchAction: 'none' // Prevent scrolling while dragging
                        }}
                    >
                        {pool.length === 0 && (
                            <Typography variant="body2" color="textSecondary" sx={{ alignSelf: 'center' }}>
                                {/* Empty Pool Placeholder if needed */}
                            </Typography>
                        )}
                        {pool.map(item => (
                            <DraggableCard
                                key={item.id}
                                item={item}
                                onDragStart={handleDragStart}
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            />
                        ))}
                    </Paper>

                    {/* Groups Area */}
                    <Box sx={{
                        display: 'flex',
                        gap: { xs: 1, sm: 2 },
                        flexDirection: 'row', // Always horizontal
                        width: '100%'
                    }}>
                        {/* Group 1 Drop Zone */}
                        <Paper
                            ref={group1Ref}
                            elevation={3}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 'group1')}
                            sx={{
                                flex: 1,
                                minHeight: { xs: '150px', sm: '200px' },
                                p: { xs: 1, sm: 2 },
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                                bgcolor: '#e3f2fd', // Light Blue
                                border: '2px solid #2196f3',
                                position: 'relative',
                                borderRadius: '12px',
                                touchAction: 'none'
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                                Group 1
                            </Typography>
                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {group1.map(item => (
                                    <DraggableCard
                                        key={item.id}
                                        item={item}
                                        onDragStart={handleDragStart}
                                        onTouchStart={handleTouchStart}
                                        onTouchEnd={handleTouchEnd}
                                        fullWidth
                                    />
                                ))}
                            </Box>
                            {group1.length === 0 && (
                                <Typography variant="caption" color="textSecondary" sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center',
                                    width: '100%',
                                    px: 1,
                                    fontSize: { xs: '0.65rem', sm: '0.8rem' }
                                }}>
                                    Drag Group 1 Here
                                </Typography>
                            )}
                        </Paper>

                        {/* Group 2 Drop Zone */}
                        <Paper
                            ref={group2Ref}
                            elevation={3}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 'group2')}
                            sx={{
                                flex: 1,
                                minHeight: { xs: '150px', sm: '200px' },
                                p: { xs: 1, sm: 2 },
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                                bgcolor: '#e8f5e9', // Light Green
                                border: '2px solid #4caf50',
                                position: 'relative',
                                borderRadius: '12px',
                                touchAction: 'none'
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                                Group 2
                            </Typography>
                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {group2.map(item => (
                                    <DraggableCard
                                        key={item.id}
                                        item={item}
                                        onDragStart={handleDragStart}
                                        onTouchStart={handleTouchStart}
                                        onTouchEnd={handleTouchEnd}
                                        fullWidth
                                    />
                                ))}
                            </Box>
                            {group2.length === 0 && (
                                <Typography variant="caption" color="textSecondary" sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center',
                                    width: '100%',
                                    px: 1,
                                    fontSize: { xs: '0.65rem', sm: '0.8rem' }
                                }}>
                                    Drag Group 2 Here
                                </Typography>
                            )}
                        </Paper>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                        <MorenButton
                            variant="contained"
                            onClick={handleNextRound}
                            sx={{
                                backgroundColor: '#1976d2',
                                color: 'white',
                                px: 4,
                                py: 1.5,
                                fontSize: '1.2rem',
                                '&:hover': {
                                    backgroundColor: '#1565c0'
                                }
                            }}
                        >
                            {t.next}
                        </MorenButton>
                    </Box>
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

// Helper Item Component
const DraggableCard = ({
    item,
    onDragStart,
    onTouchStart,
    onTouchEnd,
    fullWidth
}: {
    item: DraggableItem,
    onDragStart: (e: React.DragEvent, i: DraggableItem) => void,
    onTouchStart: (e: React.TouchEvent, i: DraggableItem) => void,
    onTouchEnd: (e: React.TouchEvent, i: DraggableItem) => void,
    fullWidth?: boolean
}) => {
    return (
        <Paper
            draggable
            onDragStart={(e) => onDragStart(e, item)}
            onTouchStart={(e) => onTouchStart(e, item)}
            onTouchEnd={(e) => onTouchEnd(e, item)}
            elevation={2}
            sx={{
                p: 1.5,
                cursor: 'grab',
                bgcolor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                minWidth: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                width: fullWidth ? '100%' : 'auto',
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.9rem' },
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                },
                '&:active': {
                    cursor: 'grabbing'
                }
            }}
        >
            <Typography variant="inherit" sx={{ lineHeight: 1.2, width: '100%' }}>
                {item.text}
            </Typography>
        </Paper>
    );
};

export default GroupMatching;
