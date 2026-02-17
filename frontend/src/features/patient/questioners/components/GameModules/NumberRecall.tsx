import { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MorenButton from '../../../../../components/button';
import GenericModal from '../../../../../components/modal';
import ConfirmationModal from '../../../../../components/modal/ConfirmationModal';
import type { SessionData } from '../../../../../services/gameApi';
import SpeechInput, { type SpeechInputHandle } from '../../../../../components/SpeechInput';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';
import AudioPlayer from './Shared/AudioPlayer';

// Import local audio assets
import firstAudio from '../../../../../assets/NumberRecall/first.mp3';
import secondAudio from '../../../../../assets/NumberRecall/second.mp3';
import thirdAudio from '../../../../../assets/NumberRecall/third.mp3';
import fourthAudio from '../../../../../assets/NumberRecall/fourth.mp3';
import fifthAudio from '../../../../../assets/NumberRecall/fifth.mp3';
import sixAudio from '../../../../../assets/NumberRecall/six.mp3';
import sevenAudio from '../../../../../assets/NumberRecall/seven.mp3';
import eightAudio from '../../../../../assets/NumberRecall/eight.mp3';
import nineAudio from '../../../../../assets/NumberRecall/nine.mp3';
import tenAudio from '../../../../../assets/NumberRecall/ten.mp3';

// Import local audio assets for Reverse Number Recall
import reverseFirstAudio from '../../../../../assets/ReverseAudioNumberRecall/reverse_first.mp3';
import reverseSecondAudio from '../../../../../assets/ReverseAudioNumberRecall/reverse_second.mp3';
import reverseThirdAudio from '../../../../../assets/ReverseAudioNumberRecall/reverse_third.mp3';
import reverseFourthAudio from '../../../../../assets/ReverseAudioNumberRecall/reverse_fourth.mp3';
import reverseFifthAudio from '../../../../../assets/ReverseAudioNumberRecall/reverse_fifth.mp3';
import reverseSixthAudio from '../../../../../assets/ReverseAudioNumberRecall/reverse_sixth.mp3';
import reverseSeventhAudio from '../../../../../assets/ReverseAudioNumberRecall/reverse_seven.mp3';
import reverseEighthAudio from '../../../../../assets/ReverseAudioNumberRecall/reverse_eight.mp3';
import reverseNinthAudio from '../../../../../assets/ReverseAudioNumberRecall/reverse_nine.mp3';
import reverseTenthAudio from '../../../../../assets/ReverseAudioNumberRecall/reverse_ten.mp3';

interface NumberRecallProps {
    session: SessionData;
    onComplete: (answers: any[]) => void;
    languageCode: string;
}

const NumberRecall = ({ session, onComplete, languageCode }: NumberRecallProps) => {
    const { languageConstants } = useLanguageConstantContext();
    const speechInputRef = useRef<SpeechInputHandle>(null);

    // Translations
    const t = {
        instructions: getLanguageText(languageConstants, 'game_instructions'),
        start: getLanguageText(languageConstants, 'game_start'),
        next: getLanguageText(languageConstants, 'game_next'),
        playing: getLanguageText(languageConstants, 'game_playing'),
        completed: getLanguageText(languageConstants, 'game_completed_status'),
        enterAnswers: getLanguageText(languageConstants, 'game_answer_now') || 'Answer Now',
        inputPlaceholder: getLanguageText(languageConstants, 'game_input_placeholder') || 'Type the numbers...',
        answerNow: getLanguageText(languageConstants, 'game_next') || 'NEXT',
        submitContinue: getLanguageText(languageConstants, 'submit_continue') || 'Submit & Continue',
        validationError: getLanguageText(languageConstants, 'game_validation_error') || 'Please enter an answer',
        audioInstruction: getLanguageText(languageConstants, 'game_audio_instruction') || 'Audio Instruction'
    };

    const [phase, setPhase] = useState<'instruction' | 'playing' | 'input'>('instruction');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [error, setError] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [responseCountdown, setResponseCountdown] = useState(60);
    const liveTranscriptRef = useRef('');

    const questions = session.questions || [];
    const currentQuestion = questions[currentIndex];

    // Response timer for input phase
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (phase === 'input' && responseCountdown > 0) {
            timer = setTimeout(() => {
                setResponseCountdown(prev => prev - 1);
            }, 1000);
        } else if (phase === 'input' && responseCountdown === 0) {
            const finalAnswerText = (inputText + ' ' + liveTranscriptRef.current).replace(/\s/g, '');
            processSubmit(finalAnswerText);
        }
        return () => clearTimeout(timer);
    }, [phase, responseCountdown, inputText]);

    const resolveAudioUrl = (url: string) => {
        if (!url) return '';
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('reverse_first')) return reverseFirstAudio;
        if (lowerUrl.includes('reverse_second')) return reverseSecondAudio;
        if (lowerUrl.includes('reverse_third')) return reverseThirdAudio;
        if (lowerUrl.includes('reverse_fourth')) return reverseFourthAudio;
        if (lowerUrl.includes('reverse_fifth')) return reverseFifthAudio;
        if (lowerUrl.includes('reverse_sixth')) return reverseSixthAudio;
        if (lowerUrl.includes('reverse_seven')) return reverseSeventhAudio;
        if (lowerUrl.includes('reverse_eight')) return reverseEighthAudio;
        if (lowerUrl.includes('reverse_nine')) return reverseNinthAudio;
        if (lowerUrl.includes('reverse_ten')) return reverseTenthAudio;

        if (lowerUrl.includes('first')) return firstAudio;
        if (lowerUrl.includes('second')) return secondAudio;
        if (lowerUrl.includes('third')) return thirdAudio;
        if (lowerUrl.includes('fourth')) return fourthAudio;
        if (lowerUrl.includes('fifth')) return fifthAudio;
        if (lowerUrl.includes('six')) return sixAudio;
        if (lowerUrl.includes('seven')) return sevenAudio;
        if (lowerUrl.includes('eight')) return eightAudio;
        if (lowerUrl.includes('nine')) return nineAudio;
        if (lowerUrl.includes('ten')) return tenAudio;
        if (url.startsWith('http')) return url;
        return url;
    };

    const getAudioUrl = resolveAudioUrl;

    const handleStart = () => {
        setPhase('playing');
        setResponseCountdown(60);
    };

    const handleAudioEnded = useCallback(() => {
        setPhase('input');
        setResponseCountdown(60);
    }, []);

    const handleSubmit = () => {
        if (speechInputRef.current) {
            speechInputRef.current.stopListening();
        }
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
        setError('');
        setResponseCountdown(60);
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setPhase('playing');
        } else {
            onComplete(newAnswers);
        }
    };

    if (!currentQuestion) {
        return <Typography color="error">No questions loaded.</Typography>;
    }

    const currentItem = currentQuestion.items && currentQuestion.items.length > 0 ? currentQuestion.items[0] : null;

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
            <GenericModal
                isOpen={phase === 'instruction'}
                onClose={() => { }}
                title={`${session.module?.name || ''} ${t.instructions}`}
                hideCancelButton={true}
                submitButtonText={t.start}
                onSubmit={handleStart}
                instructionText={session.instructions || "You will hear number sequences. After each, type what you heard."}
                enableAudio={true}
                audioButtonLabel={t.audioInstruction}
                audioButtonAlignment="center"
                languageCode={languageCode}
            >
                <Typography>{session.instructions || "You will hear number sequences. After each, type what you heard."}</Typography>
            </GenericModal>

            {phase === 'playing' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <Box sx={{
                        border: '2px solid #274765',
                        px: 8,
                        py: 2,
                        minWidth: '300px',
                        display: 'flex',
                        justifyContent: 'center',
                        backgroundColor: '#f0f4f8'
                    }}>
                        <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                            {t.playing || 'Listen carefully...'}
                        </Typography>
                    </Box>
                    {(() => {
                        const urlToResolve = currentItem?.audio_url || currentItem?.image_url || '';
                        const resolvedSrc = getAudioUrl(urlToResolve);
                        return (urlToResolve) && (
                            <AudioPlayer
                                src={resolvedSrc}
                                play={true}
                                onEnded={handleAudioEnded}
                            />
                        );
                    })()}
                </Box>
            )}

            {phase === 'input' && (
                <Box sx={{ width: '100%', height: '100%', minHeight: '85vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', pt: 0 }}>
                    <Box sx={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: { xs: 3, sm: 4 }, px: 2, mt: { xs: 2, sm: 8 } }}>
                        <Typography variant="h6" sx={{ textAlign: 'center' }}>
                            {t.enterAnswers}
                        </Typography>

                        <SpeechInput
                            ref={speechInputRef}
                            fullWidth
                            value={inputText}
                            onChange={setInputText}
                            onSpeechResult={(text) => setInputText(prev => prev + ' ' + text)}
                            onTranscriptChange={(text) => {
                                liveTranscriptRef.current = text;
                            }}
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

                        {error && (
                            <Typography color="error" textAlign="center">{error}</Typography>
                        )}

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

export default NumberRecall;
