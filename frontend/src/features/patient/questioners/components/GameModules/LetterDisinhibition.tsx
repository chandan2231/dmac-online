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

const SCORING = {
    CORRECT: 0.25,
    WRONG: -0.25, // Or just 0 if we don't want strict penalty, but user said -0.25
    MISS: 0 // If missed V? Or is it incorrect? 
    // User: "-0.25 for wrong answer". Missed V is a wrong answer.
    // I will apply -0.25 for missed V as well to be consistent, or arguably just 0?
    // "Total 20 times flashed 0.25 per correct answer".
    // 20 * 0.25 = 5.
    // If I answer wrong, I get -0.25. 
    // This implies 0 is neutral? No, usually it's binary.
    // Let's implement: Score += 0.25 if correct, Score -= 0.25 if wrong.
};

const LetterDisinhibition = ({ session, onComplete, languageCode }: LetterDisinhibitionProps) => {
    const { languageConstants } = useLanguageConstantContext();
    const [gameState, setGameState] = useState<'INSTRUCTION' | 'PLAYING' | 'FINISHED'>('INSTRUCTION');
    const [, setCurrentTrialIndex] = useState(0);
    const [currentLetter, setCurrentLetter] = useState<string | null>(null);
    const [, setScore] = useState(0);
    const [trials, setTrials] = useState<string[]>([]);
    const [hasTapped, setHasTapped] = useState(false); // Track if user tapped in current trial

    // Refs for timer and score
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const scoreRef = useRef(0);
    const hasTappedRef = useRef(false);

    // Get translations
    const t = {
        instructions: getLanguageText(languageConstants, 'game_instructions') || 'Instructions',
        start: getLanguageText(languageConstants, 'game_start') || 'START',
        tap: getLanguageText(languageConstants, 'TAP') || 'TAP',
        audioInstruction: getLanguageText(languageConstants, 'game_audio_instruction') || 'Audio Instruction'
    };

    // Initialize trials
    useEffect(() => {
        // Generate Sequence: 10 'V's and 10 Distractors
        const targets = Array(10).fill(TARGET_LETTER);
        const others = Array(10).fill(null).map(() => DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)]);

        // Combine and Shuffle
        const combined = [...targets, ...others];
        for (let i = combined.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [combined[i], combined[j]] = [combined[j], combined[i]];
        }

        setTrials(combined);
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

        if (letter === TARGET_LETTER) {
            // Should have tapped
            isCorrect = tapped;
        } else {
            // Should NOT have tapped
            isCorrect = !tapped;
        }

        if (isCorrect) {
            scoreRef.current += SCORING.CORRECT;
        } else {
            scoreRef.current += SCORING.WRONG;
        }

        setScore(scoreRef.current);

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

        // Visual feedback is immediate (button turns blue via active/focus or custom style)
        // Logic evaluation happens at end of trial OR immediate?
        // Prompt: "Random letters flash on screen (1 second each)"
        // Usually in these tests, the trial continues for the full duration even if you tap.
        // So we just mark "Tapped" and wait for timer to expire.
    };

    const finishGame = () => {
        setGameState('FINISHED');

        // Ensure score is not negative for submission?
        const finalScore = Math.max(0, scoreRef.current);

        onComplete([{
            question_id: session.questions?.[0]?.question_id || 0,
            answer_text: `Completed Letter Disinhibition. Score: ${finalScore}`,
            score: finalScore,
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
                        // Button should be blue when clicked/tapped. 
                        // MUI 'primary' is blue. 'success' is green. 
                        // User said "Turn button to blue when user clicks".
                        // Let's use 'success' (Green) as default (like the image shows Green 'TAP' button)
                        // And change to 'primary' (Blue) if tapped? 
                        // Prompt image shows Green "TAP". "We need to turn the button to blue when user clicks".
                        color={hasTapped ? "primary" : "success"}
                        size="large"
                        sx={{
                            width: 240,
                            height: 120,
                            fontSize: '2.5rem',
                            pointerEvents: hasTapped ? 'none' : 'auto' // Disable after tap?
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
