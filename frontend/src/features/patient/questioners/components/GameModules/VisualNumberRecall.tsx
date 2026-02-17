import { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import MorenButton from '../../../../../components/button';
import GenericModal from '../../../../../components/modal';
import ConfirmationModal from '../../../../../components/modal/ConfirmationModal';
import type { SessionData } from '../../../../../services/gameApi';
import SpeechInput from '../../../../../components/SpeechInput';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';

interface VisualNumberRecallProps {
    session: SessionData;
    onComplete: (answers: any[]) => void;
    languageCode: string;
}

const VisualNumberRecall = ({ session, onComplete, languageCode }: VisualNumberRecallProps) => {
    const { languageConstants } = useLanguageConstantContext();

    // Translations
    const t = {
        instructions: getLanguageText(languageConstants, 'game_instructions'),
        start: getLanguageText(languageConstants, 'game_start'),
        next: getLanguageText(languageConstants, 'game_next'),
        completed: getLanguageText(languageConstants, 'game_completed_status'),
        enterAnswers: getLanguageText(languageConstants, 'game_answer_now') || 'Answer Now', // Changed from game_enter_answers
        inputPlaceholder: getLanguageText(languageConstants, 'game_input_placeholder') || 'Type the numbers...',
        answerNow: getLanguageText(languageConstants, 'game_next') || 'NEXT', // Changed from game_answer_now/ANSWER NOW
        submitContinue: getLanguageText(languageConstants, 'submit_continue') || 'Submit & Continue',
        audioInstruction: getLanguageText(languageConstants, 'game_audio_instruction') || 'Audio Instruction'
    };

    // Phases: 
    // 'instruction' -> Initial instructions
    // 'display' -> Number is shown (10s)
    // 'input' -> User types answer
    const [phase, setPhase] = useState<'instruction' | 'display' | 'input'>('instruction');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);

    const [inputText, setInputText] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [responseCountdown, setResponseCountdown] = useState(60);
    const liveTranscriptRef = useRef('');

    const questions = session.questions || [];
    const currentQuestion = questions[currentIndex];

    // Timer for display phase
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (phase === 'display') {
            timer = setTimeout(() => {
                setPhase('input');
                setResponseCountdown(60);
            }, 10000); // 10 seconds
        }
        return () => clearTimeout(timer);
    }, [phase]);

    // Response timer for input phase
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (phase === 'input' && responseCountdown > 0) {
            timer = setTimeout(() => {
                setResponseCountdown(prev => prev - 1);
            }, 1000);
        } else if (phase === 'input' && responseCountdown === 0) {
            // Auto-submit on timeout
            const finalAnswerText = (inputText + ' ' + liveTranscriptRef.current).replace(/\s/g, '');
            processSubmit(finalAnswerText);
        }
        return () => clearTimeout(timer);
    }, [phase, responseCountdown, inputText]);

    const handleStart = () => {
        setPhase('display');
    };

    const handleSubmit = () => {
        const pendingText = liveTranscriptRef.current;
        const rawText = inputText + ' ' + pendingText;
        const finalAnswerText = rawText.replace(/\s/g, '');

        if (!finalAnswerText) {
            setShowConfirmation(true);
            return;
        }

        processSubmit(finalAnswerText);
    };

    const handleConfirmSubmit = () => {
        setShowConfirmation(false);
        const finalAnswerText = (inputText + ' ' + liveTranscriptRef.current).replace(/\s/g, '');
        processSubmit(finalAnswerText);
    };

    const processSubmit = (finalAnswerText: string) => {
        const answer = {
            question_id: currentQuestion.question_id,
            answer_text: finalAnswerText
        };

        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);
        setInputText('');
        liveTranscriptRef.current = '';
        setResponseCountdown(60);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setPhase('display');
        } else {
            onComplete(newAnswers);
        }
    };

    if (!currentQuestion) {
        return <Typography color="error">No questions loaded.</Typography>;
    }

    const currentItem = currentQuestion.items && currentQuestion.items.length > 0 ? currentQuestion.items[0] : null;
    const numberToRecall = currentItem ? currentItem.accepted_answers : '';

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            minHeight: '80vh',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4
        }}>
            {/* Instruction Modal */}
            <GenericModal
                isOpen={phase === 'instruction'}
                onClose={() => { }}
                title={`${session.module?.name || ''} ${t.instructions}`}
                hideCancelButton={true}
                submitButtonText={t.start}
                onSubmit={handleStart}
                instructionText={session.instructions || "Remember the combination of the numbers will be displayed for 10 seconds. Speak or type to enter the same number in the text box."}
                enableAudio={true}
                audioButtonLabel={t.audioInstruction}
                audioButtonAlignment="center"
                languageCode={languageCode}
            >
                <Typography>{session.instructions}</Typography>
            </GenericModal>

            {/* Display Phase */}
            {phase === 'display' && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    paddingTop: '30vh',
                    height: '100vh',
                    width: '100%'
                }}>
                    <Box sx={{
                        border: '2px solid #274765',
                        borderRadius: '12px',
                        padding: '20px 60px',
                        backgroundColor: 'white',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <Typography variant="h2" sx={{
                            fontWeight: '500',
                            color: 'black',
                            letterSpacing: '2px',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            msUserSelect: 'none',
                            mozUserSelect: 'none'
                        }}>
                            {numberToRecall}
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Input Phase */}
            {phase === 'input' && (
                <Box sx={{ width: '100%', height: '100%', minHeight: '85vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', pt: 0 }}>
                    <Box sx={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: { xs: 3, sm: 4 }, px: 2, mt: { xs: 2, sm: 8 } }}>
                        <Typography variant="h6" sx={{ textAlign: 'center' }}>
                            {t.enterAnswers}
                        </Typography>

                        <SpeechInput
                            fullWidth
                            value={inputText}
                            onChange={setInputText}
                            onSpeechResult={(text) => setInputText(prev => prev + ' ' + text)}
                            languageCode={languageCode}
                            // placeholder={t.inputPlaceholder}
                            enableModeSelection={true}
                            slotProps={{
                                htmlInput: {
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*'
                                }
                            }}
                        />

                        <MorenButton
                            variant="contained"
                            onClick={handleSubmit}
                            sx={{
                                width: '100%',
                                fontSize: '1.1rem',
                                py: 2.8,
                                fontWeight: 'bold',
                                borderRadius: '10px',
                                mt: { xs: 2, sm: 4 },
                                mb: { xs: 0, sm: 6 }
                            }}
                        >
                            {t.submitContinue}
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

export default VisualNumberRecall;
