import { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { type SessionData } from '../../../../../services/gameApi';
import GenericModal from '../../../../../components/modal';
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

    // Score accumulating across rounds
    const [roundScores, setRoundScores] = useState<number[]>([]);

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

    const handleNextRound = () => {
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
                            border: '2px dashed #999'
                        }}
                    >
                        {pool.length === 0 && (
                            <Typography variant="body2" color="textSecondary" sx={{ alignSelf: 'center' }}>
                                {/* Empty Pool Placeholder if needed */}
                            </Typography>
                        )}
                        {pool.map(item => (
                            <DraggableCard key={item.id} item={item} onDragStart={handleDragStart} />
                        ))}
                    </Paper>

                    {/* Groups Area */}
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                        {/* Group 1 Drop Zone */}
                        <Paper
                            elevation={3}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 'group1')}
                            sx={{
                                flex: 1,
                                minHeight: '200px',
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                bgcolor: '#e3f2fd', // Light Blue
                                border: '2px solid #2196f3',
                                position: 'relative'
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                Group 1
                            </Typography>
                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {group1.map(item => (
                                    <DraggableCard key={item.id} item={item} onDragStart={handleDragStart} fullWidth />
                                ))}
                            </Box>
                            {group1.length === 0 && (
                                <Typography variant="body2" color="textSecondary" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    Drag Group 1 Here
                                </Typography>
                            )}
                        </Paper>

                        {/* Group 2 Drop Zone */}
                        <Paper
                            elevation={3}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 'group2')}
                            sx={{
                                flex: 1,
                                minHeight: '200px',
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                bgcolor: '#e8f5e9', // Light Green
                                border: '2px solid #4caf50',
                                position: 'relative'
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                                Group 2
                            </Typography>
                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {group2.map(item => (
                                    <DraggableCard key={item.id} item={item} onDragStart={handleDragStart} fullWidth />
                                ))}
                            </Box>
                            {group2.length === 0 && (
                                <Typography variant="body2" color="textSecondary" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
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
        </Box>
    );
};

// Helper Item Component
const DraggableCard = ({ item, onDragStart, fullWidth }: { item: DraggableItem, onDragStart: (e: React.DragEvent, i: DraggableItem) => void, fullWidth?: boolean }) => {
    return (
        <Paper
            draggable
            onDragStart={(e) => onDragStart(e, item)}
            elevation={2}
            sx={{
                p: 1.5,
                cursor: 'grab',
                bgcolor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                minWidth: '100px',
                textAlign: 'center',
                width: fullWidth ? '100%' : 'auto',
                fontWeight: 500,
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
            {item.text}
        </Paper>
    );
};

export default GroupMatching;
