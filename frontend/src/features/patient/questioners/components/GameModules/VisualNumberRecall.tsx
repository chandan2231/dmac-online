import { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import MorenButton from '../../../../../components/button';
import GenericModal from '../../../../../components/modal';
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
    const liveTranscriptRef = useRef('');

    const questions = session.questions || [];
    const currentQuestion = questions[currentIndex];

    // Timer for display phase
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (phase === 'display') {
            timer = setTimeout(() => {
                setPhase('input');
            }, 10000); // 10 seconds
        }
        return () => clearTimeout(timer);
    }, [phase]);

    const handleStart = () => {
        setPhase('display');
    };

    const handleSubmit = () => {
        const pendingText = liveTranscriptRef.current;
        const rawText = inputText + ' ' + pendingText;
        const finalAnswerText = rawText.replace(/\s/g, '');

        const answer = {
            question_id: currentQuestion.question_id,
            answer_text: finalAnswerText
        };

        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);
        setInputText('');
        liveTranscriptRef.current = '';

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
                    alignItems: 'center',
                    height: '50vh',
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
                            letterSpacing: '2px'
                        }}>
                            {numberToRecall}
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Input Phase */}
            {phase === 'input' && (
                <Box sx={{ width: '100%', maxWidth: '600px', p: 2, pb: 25, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" sx={{ textAlign: 'center' }}>
                        {t.enterAnswers}
                    </Typography>

                    <SpeechInput
                        fullWidth
                        value={inputText}
                        onChange={setInputText}
                        onSpeechResult={(text) => setInputText(prev => prev + ' ' + text)}
                        onTranscriptChange={(text) => {
                            liveTranscriptRef.current = text;
                        }}
                        languageCode={languageCode}
                        placeholder={t.inputPlaceholder}
                        enableModeSelection={true}
                    />

                    <MorenButton
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
                            position: 'absolute',
                            bottom: '150px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '90%',
                            maxWidth: '600px',
                            zIndex: 10,
                            fontSize: '1.2rem',
                            py: 2.5,
                            fontWeight: 'bold'
                        }}
                    >
                        {t.answerNow}
                    </MorenButton>
                </Box>
            )}
        </Box>
    );
};

export default VisualNumberRecall;
