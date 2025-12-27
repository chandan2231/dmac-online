import { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MorenButton from '../../../../../components/button';
import GenericModal from '../../../../../components/modal';
import type { SessionData } from '../../../../../services/gameApi';
import SpeechInput from '../../../../../components/SpeechInput';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';

interface ExecutiveQuestionsProps {
    session: SessionData;
    onComplete: (answers: any[]) => void;
    languageCode: string;
}

const ExecutiveQuestions = ({ session, onComplete, languageCode }: ExecutiveQuestionsProps) => {
    const { languageConstants } = useLanguageConstantContext();

    // Translations
    const t = {
        instructions: getLanguageText(languageConstants, 'game_instruction') || 'Instructions',
        start: getLanguageText(languageConstants, 'game_start') || 'START',
        next: getLanguageText(languageConstants, 'game_next') || 'NEXT',
        enterAnswers: getLanguageText(languageConstants, 'game_enter_answers') || 'Enter Answers',
        inputPlaceholder: getLanguageText(languageConstants, 'game_input_placeholder') || 'Type here...',
        answerNow: getLanguageText(languageConstants, 'game_answer_now') || 'ANSWER NOW'
    };

    const [phase, setPhase] = useState<'instruction' | 'playing'>('instruction');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [inputText, setInputText] = useState('');
    const [answers, setAnswers] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Refs to handle microphone race conditions
    const liveTranscriptRef = useRef('');
    const isTransitioningRef = useRef(false);

    const questions = session.questions || [];
    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    // Reset transition flag when question changes
    useEffect(() => {
        setIsSubmitting(false);
        // Add a small safety buffer to ignore ghost speech events from previous question
        const timer = setTimeout(() => {
            isTransitioningRef.current = false;
            liveTranscriptRef.current = '';
        }, 500);
        return () => clearTimeout(timer);
    }, [currentQuestionIndex]);

    const handleStart = () => {
        setPhase('playing');
    };

    const handleNext = () => {
        if (!currentQuestion || isTransitioningRef.current) return;

        // Set transitioning flag to ignore late speech results and prevent double clicks
        isTransitioningRef.current = true;
        setIsSubmitting(true);

        // Combine committed text with any pending live transcript
        const pendingText = liveTranscriptRef.current;
        const finalAnswerText = (inputText + ' ' + pendingText).trim();

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
            onComplete(updatedAnswers);
        }
    };

    if (!currentQuestion && phase === 'playing') {
        return <Typography>No questions found.</Typography>;
    }

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            pt: 10,
            px: 2
        }}>
            {/* Instruction Modal */}
            <GenericModal
                isOpen={phase === 'instruction'}
                onClose={() => { }}
                title={t.instructions}
                hideCancelButton={true}
                submitButtonText={t.start}
                onSubmit={handleStart}
                enableAudio={true}
                instructionText={session.instructions || ''}
                languageCode={languageCode}
            >
                <Typography sx={{ fontSize: '1.2rem', color: '#333' }}>
                    {session.instructions}
                </Typography>
            </GenericModal>

            {phase === 'playing' && currentQuestion && (
                <Box sx={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {/* Date/Time Header similar to screenshot? Using simple layout for now */}

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
                            placeholder={t.enterAnswers}
                        />
                    </Box>

                    {/* Show button only if user has typed something? Or always? 
                        User said: "when user start typing button appear" */}
                    {/* Button always visible */}
                    <MorenButton
                        variant="contained"
                        onClick={handleNext}
                        disabled={isSubmitting}
                        sx={{ width: '100%', mt: 2, backgroundColor: '#274765' }}
                    >
                        {isSubmitting ? 'Submitting...' : t.answerNow}
                    </MorenButton>
                </Box>
            )}
        </Box>
    );
};

export default ExecutiveQuestions;
