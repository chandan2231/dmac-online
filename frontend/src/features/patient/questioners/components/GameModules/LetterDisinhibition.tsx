import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { getLanguageText } from '../../../../../utils/functions';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import GenericModal from '../../../../../components/modal';

interface LetterDisinhibitionProps {
    session: any;
    onComplete: (answers: any[]) => void;
    languageCode: string;
}

const TOTAL_TRIALS = 20;
const TRIAL_DURATION_MS = 2000;
const TARGET_LETTER = 'V';
const DISTRACTORS = ['>', '<', '^', 'A', 'U', 'W', 'Y'];



const LetterDisinhibition = ({ session, onComplete, languageCode }: LetterDisinhibitionProps) => {
    const { languageConstants } = useLanguageConstantContext();
    const [gameState, setGameState] = useState<'INSTRUCTION' | 'PLAYING' | 'FINISHED'>('INSTRUCTION');
    const [, setCurrentTrialIndex] = useState(0);
    const [currentLetter, setCurrentLetter] = useState<string | null>(null);
    const [trials, setTrials] = useState<string[]>([]);
    const [hasTapped, setHasTapped] = useState(false); // Track if user tapped in current trial
    // Use ref to track history without re-render dependencies or stale closures
    const trialHistoryRef = useRef<any[]>([]);

    // Refs for timer and score
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const hasTappedRef = useRef(false);
    const currentIndexRef = useRef(0);

    // Get translations
    const t = {
        instructions: getLanguageText(languageConstants, 'game_instructions') || 'Instructions',
        start: getLanguageText(languageConstants, 'game_start') || 'START',
        tap: getLanguageText(languageConstants, 'TAP') || 'TAP',
        audioInstruction: getLanguageText(languageConstants, 'game_audio_instruction') || 'Audio Instruction'
    };

    // Initialize trials
    useEffect(() => {
        const generateSequence = (): string[] => {
            let targetsLeft = 10;
            let othersLeft = 10;
            const result: string[] = [];
            let lastType: 'target' | 'other' | null = null;
            let streak = 0;

            for (let i = 0; i < TOTAL_TRIALS; i++) {
                const canPickTarget = targetsLeft > 0 && !(lastType === 'target' && streak >= 2);
                const canPickOther = othersLeft > 0 && !(lastType === 'other' && streak >= 2);

                let pick: 'target' | 'other';
                if (canPickTarget && canPickOther) {
                    pick = Math.random() < 0.5 ? 'target' : 'other';
                } else if (canPickTarget) {
                    pick = 'target';
                } else if (canPickOther) {
                    pick = 'other';
                } else {
                    // Fallback: If we reach a state where we can't satisfy the condition (rare with 1:1 ratio)
                    // Restart generation
                    return generateSequence();
                }

                if (pick === 'target') {
                    result.push(TARGET_LETTER);
                    targetsLeft--;
                    if (lastType === 'target') streak++;
                    else {
                        lastType = 'target';
                        streak = 1;
                    }
                } else {
                    const randomDistractor = DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)];
                    result.push(randomDistractor);
                    othersLeft--;
                    if (lastType === 'other') streak++;
                    else {
                        lastType = 'other';
                        streak = 1;
                    }
                }
            }
            return result;
        };

        setTrials(generateSequence());
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
        currentIndexRef.current = index;
        setCurrentLetter(trials[index]);
        setHasTapped(false);
        hasTappedRef.current = false;

        // Auto-advance
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            handleTrialEnd(index);
        }, TRIAL_DURATION_MS);
    };

    const handleTrialEnd = (index: number) => {
        // Evaluate result of the JUST finished trial
        // We do this at the END of the timer (or implied end)
        // Actually, if we use setTimeout, this fires when time is up.
        // We check if they tapped. 

        const letter = trials[index];
        const tapped = hasTappedRef.current; // Use ref for latest state

        let isCorrect = false;
        let score = 0;

        if (letter === TARGET_LETTER) {
            // Should have tapped
            isCorrect = tapped;
            score = tapped ? 0.25 : -0.25;
        } else {
            // Should NOT have tapped
            isCorrect = !tapped;
            score = tapped ? -0.50 : 0.00;
        }

        // Record trial result
        const trialResult = {
            trial: index + 1,
            target: letter,
            action: tapped ? 'TAPPED' : 'NO_ACTION',
            result: isCorrect ? 'CORRECT' : 'WRONG',
            score: score,
            timestamp: new Date().toISOString()
        };

        // Use ref to ensure immediate availability
        trialHistoryRef.current.push(trialResult);

        // Move to next
        const nextIndex = index + 1;
        if (nextIndex < TOTAL_TRIALS) {
            startTrial(nextIndex);
        } else {
            finishGame();
        }
    };

    // Handle User Tap
    const handleTap = () => {
        if (hasTappedRef.current) return; // Prevent multiple taps

        setHasTapped(true);
        hasTappedRef.current = true;

        // Advance to next letter immediately on tap (with small delay for visual feedback)
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // Delay trial end by 200ms so user sees the blue button
        setTimeout(() => {
            handleTrialEnd(currentIndexRef.current);
        }, 200);
    };

    const finishGame = () => {
        setGameState('FINISHED');

        console.log('[LetterDisinhibition] Finishing game with history:', trialHistoryRef.current);

        onComplete([{
            question_id: session.questions?.[0]?.question_id || 0,
            answer_text: JSON.stringify(trialHistoryRef.current),
        }]);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const instructionText = session.instructions || 'Tap the button only when the letter V appears.';

    return (
        <Box sx={{ width: '100%', height: '100%', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

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
                        <Typography sx={{ fontSize: '12rem', fontWeight: 'bold' }}>
                            {currentLetter}
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        // Button should be blue when clicked/tapped or hovered.
                        // Default to success (green)
                        color={hasTapped ? "primary" : "success"}
                        size="large"
                        sx={{
                            width: 240,
                            height: 120,
                            fontSize: '2.5rem',
                            pointerEvents: hasTapped ? 'none' : 'auto',
                            transition: 'all 0.2s',
                        }}
                        onClick={handleTap}
                    >
                        {t.tap}
                    </Button>
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

export default LetterDisinhibition;
