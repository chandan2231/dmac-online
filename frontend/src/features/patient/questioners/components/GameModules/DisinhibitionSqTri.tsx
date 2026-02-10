import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { getLanguageText } from '../../../../../utils/functions';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import GenericModal from '../../../../../components/modal';

interface DisinhibitionSqTriProps {
    session: any;
    onComplete: (answers: any[]) => void;
    languageCode: string;
}

const TOTAL_TRIALS = 20;
const TRIAL_DURATION_MS = 3000;
const SCORING = {
    CORRECT: 0.25,
    WRONG: -0.25
};

const SHAPES = {
    SQUARE: 'SQUARE',
    TRIANGLE: 'TRIANGLE'
};

const DisinhibitionSqTri = ({ session, onComplete, languageCode }: DisinhibitionSqTriProps) => {
    const { languageConstants } = useLanguageConstantContext();
    const [gameState, setGameState] = useState<'INSTRUCTION' | 'PLAYING' | 'FINISHED'>('INSTRUCTION');
    const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
    const [currentShape, setCurrentShape] = useState<string | null>(null);
    const [, setScore] = useState(0);
    const [trials, setTrials] = useState<string[]>([]);
    const [isExiting, setIsExiting] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Get translations
    const t = {
        instructions: getLanguageText(languageConstants, 'game_instructions') || 'Instructions',
        start: getLanguageText(languageConstants, 'game_start') || 'START',
        audioInstruction: getLanguageText(languageConstants, 'game_audio_instruction') || 'Audio Instruction'
    };

    // Initialize trials
    useEffect(() => {
        const newTrials = [];
        for (let i = 0; i < TOTAL_TRIALS; i++) {
            newTrials.push(Math.random() < 0.5 ? SHAPES.SQUARE : SHAPES.TRIANGLE);
        }
        setTrials(newTrials);
    }, []);

    const startGame = () => {
        setGameState('PLAYING');
        startTrial(0);
    };

    const startTrial = (index: number) => {
        if (index >= TOTAL_TRIALS) {
            finishGame();
            return;
        }

        setCurrentTrialIndex(index);
        setCurrentShape(trials[index]);

        // Auto-advance if no input after duration (treated as incorrect/timeout)
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            handleAnswerSafe('TIMEOUT');
        }, TRIAL_DURATION_MS);
    };

    // Track score in a Ref for sync access during rapid state changes
    const scoreRef = useRef(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleAnswerSafe = (selectedShape: string) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // Guard against double clicks or clicks during animation
        if (currentTrialIndex >= TOTAL_TRIALS || isExiting) return;

        // Trigger exit animation
        setIsExiting(true);

        const target = trials[currentTrialIndex];
        let isCorrect = false;

        if (selectedShape !== 'TIMEOUT') {
            if (target === SHAPES.SQUARE && selectedShape === SHAPES.TRIANGLE) {
                isCorrect = true;
            } else if (target === SHAPES.TRIANGLE && selectedShape === SHAPES.SQUARE) {
                isCorrect = true;
            }
        }

        const change = isCorrect ? SCORING.CORRECT : SCORING.WRONG;
        scoreRef.current += change;
        setScore(scoreRef.current);

        const nextIndex = currentTrialIndex + 1;

        // Delay for animation (300ms)
        setTimeout(() => {
            setIsExiting(false);
            if (nextIndex < TOTAL_TRIALS) {
                startTrial(nextIndex);
            } else {
                finishGame();
            }
        }, 300);
    };

    const finishGame = () => {
        setGameState('FINISHED');

        onComplete([{
            question_id: session.questions?.[0]?.question_id || 0,
            answer_text: `Completed Disinhibition. Score: ${scoreRef.current}`,
            score: scoreRef.current,
        }]);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const instructionText = session.instructions || 'A square or triangle image will be flash on the screen. Tap or select tab word triangle if the square is flashed, tap or select the word square if triangle is flashed on screen, is the test for opposite visual processing abilities.';

    return (
        <Box sx={{ width: '100%', height: '100%', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

            {/* Instruction Modal */}
            <GenericModal
                isOpen={gameState === 'INSTRUCTION'}
                onClose={() => { }}
                title={`${session.module?.name || ''} ${t.instructions}`}
                hideCancelButton={true}
                submitButtonText={t.start}
                onSubmit={startGame}
                enableAudio={true}
                audioButtonLabel={t.audioInstruction}
                audioButtonAlignment="center"
                instructionText={instructionText}
                languageCode={languageCode}
            >
                <Typography>{instructionText}</Typography>
            </GenericModal>

            {gameState === 'PLAYING' && (
                <>
                    <Box sx={{ mb: 8, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{
                            transition: 'opacity 0.2s linear',
                            opacity: isExiting ? 0 : 1
                        }}>
                            {currentShape === SHAPES.SQUARE && (
                                <svg width="160" height="160" viewBox="0 0 160 160">
                                    <rect x="20" y="20" width="120" height="120" rx="20" ry="20" fill="#d32f2f" stroke="black" strokeWidth="8" />
                                </svg>
                            )}
                            {currentShape === SHAPES.TRIANGLE && (
                                <svg width="160" height="160" viewBox="0 0 160 160">
                                    <polygon points="80,15 145,145 15,145" fill="#d32f2f" stroke="black" strokeWidth="8" strokeLinejoin="round" />
                                </svg>
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 4 }}>
                        <Button
                            variant="contained"
                            color="success"
                            size="large"
                            sx={{ width: 150, height: 60, fontSize: '1.2rem' }}
                            onClick={() => handleAnswerSafe(SHAPES.SQUARE)}
                        >
                            {getLanguageText(languageConstants, 'SQUARE')}
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            size="large"
                            sx={{ width: 150, height: 60, fontSize: '1.2rem' }}
                            onClick={() => handleAnswerSafe(SHAPES.TRIANGLE)}
                        >
                            {getLanguageText(languageConstants, 'TRIANGLE')}
                        </Button>
                    </Box>
                </>
            )}

            {gameState === 'FINISHED' && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="h5">Completed!</Typography>
                </Box>
            )}

        </Box>
    );
};

export default DisinhibitionSqTri;
