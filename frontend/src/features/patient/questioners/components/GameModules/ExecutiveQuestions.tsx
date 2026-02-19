import { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MorenButton from '../../../../../components/button';
import GenericModal from '../../../../../components/modal';
import ConfirmationModal from '../../../../../components/modal/ConfirmationModal';
import type { SessionData } from '../../../../../services/gameApi';
import SpeechInput from '../../../../../components/SpeechInput';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';

interface ExecutiveQuestionsProps {
    session: SessionData;
    onComplete: (answers: any[], time_taken?: number) => void;
    languageCode: string;
}

const ExecutiveQuestions = ({ session, onComplete, languageCode }: ExecutiveQuestionsProps) => {
    const { languageConstants } = useLanguageConstantContext();

    // Translations
    const t = {
        instructions: getLanguageText(languageConstants, 'game_instruction') || 'Instructions',
        start: getLanguageText(languageConstants, 'game_start') || 'START',
        next: getLanguageText(languageConstants, 'game_next') || 'NEXT',
        submitContinue: getLanguageText(languageConstants, 'submit_continue') || 'Submit & Continue',
        enterAnswers: getLanguageText(languageConstants, 'game_enter_answers') || 'Enter Answers',
        inputPlaceholder: getLanguageText(languageConstants, 'game_input_placeholder') || 'Type here...',
        answerNow: getLanguageText(languageConstants, 'game_answer_now') || 'ANSWER NOW',
        audioInstruction: getLanguageText(languageConstants, 'game_audio_instruction') || 'Audio Instruction'
    };

    const [phase, setPhase] = useState<'instruction' | 'playing'>('instruction');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [inputText, setInputText] = useState('');
    const [answers, setAnswers] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startTime, setStartTime] = useState<number>(Date.now());

    // Confirmation Modal State
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Refs to handle microphone race conditions
    const liveTranscriptRef = useRef('');
    const isTransitioningRef = useRef(false);
    const inputTextRef = useRef('');

    const questions = session.questions || [];
    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    // Sync ref with state for timer access
    useEffect(() => {
        inputTextRef.current = inputText;
    }, [inputText]);

    // Reset transition flag and start timer when question changes
    useEffect(() => {
        setIsSubmitting(false);
        // Add a small safety buffer to ignore ghost speech events from previous question
        const safetyTimer = setTimeout(() => {
            isTransitioningRef.current = false;
            liveTranscriptRef.current = '';
        }, 500);

        // Auto-advance timer (70 seconds)
        const autoAdvanceTimer = setTimeout(() => {
            if (phase === 'playing' && !isSubmitting) {
                console.log('Auto-advancing due to timeout');
                submitAnswer(inputTextRef.current, true);
            }
        }, 70000);

        return () => {
            clearTimeout(safetyTimer);
            clearTimeout(autoAdvanceTimer);
        };
    }, [currentQuestionIndex, phase]); // Re-run when question or phase changes

    const handleStart = () => {
        setStartTime(Date.now());
        setPhase('playing');
    };

    const submitAnswer = (textValue: string, isAuto: boolean = false) => {
        if (!currentQuestion) return;

        if (isTransitioningRef.current && !isAuto) return;

        // Check for empty input (manual only)
        // If auto, we proceed regardless of empty since it's a timeout.
        const pendingText = liveTranscriptRef.current;
        const finalAnswerText = (textValue + ' ' + pendingText).trim();

        if (!isAuto && !finalAnswerText) {
            setShowConfirmation(true);
            return;
        }

        processSubmission(finalAnswerText);
    };

    const processSubmission = (finalAnswerText: string) => {
        isTransitioningRef.current = true;
        setIsSubmitting(true);

        const newAnswer = {
            question_id: currentQuestion.question_id,
            answer_text: finalAnswerText,
            language_code: languageCode
        };

        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);
        setInputText('');
        liveTranscriptRef.current = '';

        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // All done
            const timeTaken = (Date.now() - startTime) / 1000;
            onComplete(updatedAnswers, timeTaken);
        }
    };

    const handleConfirmSubmit = () => {
        setShowConfirmation(false);
        // User confirmed YES to empty answer
        const pendingText = liveTranscriptRef.current;
        const finalAnswerText = (inputTextRef.current + ' ' + pendingText).trim();
        processSubmission(finalAnswerText);
    };

    const handleNext = () => {
        submitAnswer(inputText);
    };

    if (!currentQuestion && phase === 'playing') {
        return <Typography>No questions found.</Typography>;
    }

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            minHeight: '85vh',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            px: 2,
            pt: 0
        }}>
            {/* Instruction Modal */}
            < GenericModal
                isOpen={phase === 'instruction'}
                onClose={() => { }}
                title={`${session.module?.name || ''} ${t.instructions}`}
                hideCancelButton={true}
                submitButtonText={t.start}
                onSubmit={handleStart}
                enableAudio={true}
                audioButtonLabel={t.audioInstruction}
                audioButtonAlignment="center"
                instructionText={session.instructions || ''}
                languageCode={languageCode}
            >
                <Typography sx={{ fontSize: '1.2rem', color: '#333' }}>
                    {session.instructions}
                </Typography>
            </GenericModal >

            {phase === 'playing' && currentQuestion && (
                <Box sx={{ width: '100%', maxWidth: '600px', pb: 25, display: 'flex', flexDirection: 'column', gap: 4, mt: { xs: 2, sm: 8 } }}>
                    <Typography variant="h5" sx={{ textAlign: 'center', color: '#666', mb: 2 }}>
                        {currentQuestion.prompt_text}
                    </Typography>



                    <Box sx={{ width: '100%' }}>
                        <SpeechInput
                            key={currentQuestion.question_id}
                            fullWidth
                            value={inputText}
                            onChange={(val) => {
                                if (!isTransitioningRef.current) {
                                    setInputText(val);
                                }
                            }}
                            onSpeechResult={(text) => {
                                if (!isTransitioningRef.current) {
                                    setInputText(prev => (prev ? prev + ' ' : '') + text);
                                }
                            }}
                            onTranscriptChange={(text) => {
                                if (!isTransitioningRef.current) {
                                    liveTranscriptRef.current = text;
                                }
                            }}
                            languageCode={languageCode}
                            // placeholder={t.inputPlaceholder}
                            enableModeSelection={true}
                        />
                    </Box>

                    {/* Show button only if user has typed something? Or always? 
                        User said: "when user start typing button appear" */}
                    {/* Button always visible */}
                    <MorenButton
                        variant="contained"
                        onClick={handleNext}
                        disabled={isSubmitting}
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
                        {isSubmitting ? 'Submitting...' : t.submitContinue}
                    </MorenButton>
                </Box>
            )}

            <ConfirmationModal
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleConfirmSubmit}
            />
        </Box >
    );
};

export default ExecutiveQuestions;
