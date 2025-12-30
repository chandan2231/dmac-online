import { useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import MorenButton from '../../../../../components/button';
import GenericModal from '../../../../../components/modal';
import type { SessionData } from '../../../../../services/gameApi';
import SpeechInput from '../../../../../components/SpeechInput';
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

interface NumberRecallProps {
    session: SessionData;
    onComplete: (answers: any[]) => void;
    languageCode: string;
}

const NumberRecall = ({ session, onComplete, languageCode }: NumberRecallProps) => {
    const { languageConstants } = useLanguageConstantContext();

    // Translations
    const t = {
        instructions: getLanguageText(languageConstants, 'game_instructions'),
        start: getLanguageText(languageConstants, 'game_start'),
        next: getLanguageText(languageConstants, 'game_next'),
        playing: getLanguageText(languageConstants, 'game_playing'),
        completed: getLanguageText(languageConstants, 'game_completed_status'),
        enterAnswers: getLanguageText(languageConstants, 'game_enter_answers'),
        inputPlaceholder: getLanguageText(languageConstants, 'game_input_placeholder') || 'Type the numbers...',
        answerNow: getLanguageText(languageConstants, 'game_answer_now') || 'ANSWER NOW',
        validationError: getLanguageText(languageConstants, 'game_validation_error') || 'Please enter an answer'
    };

    // Phases: 
    // 'instruction' -> Initial instructions
    // 'playing' -> Audio is playing
    // 'input' -> User types answer
    const [phase, setPhase] = useState<'instruction' | 'playing' | 'playing_complete' | 'input'>('instruction');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);

    const [inputText, setInputText] = useState('');
    const [error, setError] = useState('');

    // Ref to hold live transcript for real-time capture
    const liveTranscriptRef = useRef('');

    const questions = session.questions || [];
    const currentQuestion = questions[currentIndex];

    // Map keywords in URL/filename to imported assets
    const resolveAudioUrl = (url: string) => {
        if (!url) return '';

        console.log(`[NumberRecall] Resolving URL: ${url}`);

        const lowerUrl = url.toLowerCase();

        // Simple mapping based on filename keywords
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

        // Fallback: If URL is absolute, return it
        if (url.startsWith('http')) return url;

        // Fallback: Return as is (might be relative path valid in public/)
        return url;
    };

    const getAudioUrl = resolveAudioUrl; // Alias for consistency with existing code calls

    const handleStart = () => {
        setPhase('playing');
    };

    const handleAudioEnded = () => {
        setPhase('playing_complete');
    };

    const handleRepeat = () => {
        setPhase('playing');
    };

    const handleNextFromComplete = () => {
        setPhase('input');
    };

    const handleSubmit = () => {
        // Combine committed text with any pending live transcript
        const pendingText = liveTranscriptRef.current;
        const rawText = inputText + ' ' + pendingText;
        // Remove all spaces for backend submission as per user request and scoring logic
        const finalAnswerText = rawText.replace(/\s/g, '');

        // Removed validation check as per user request
        /*
        if (!finalAnswerText) {
            setError(t.validationError);
            return;
        }
        */

        const answer = {
            question_id: currentQuestion.question_id,
            answer_text: finalAnswerText
        };

        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);
        setInputText('');
        liveTranscriptRef.current = ''; // Clear live transcript
        setError('');

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            // Check if we need instructions again? 
            // Usually just "You will hear number sequences..." at start is enough.
            // But if each question has a prompt like "Sequence 1", maybe we show a brief "Get Ready" or just play?
            // Let's just play next.
            setPhase('playing');
        } else {
            onComplete(newAnswers);
        }
    };

    if (!currentQuestion) {
        return <Typography color="error">No questions loaded.</Typography>;
    }

    // Helper: Access item safely (API returns items array)
    const currentItem = currentQuestion.items && currentQuestion.items.length > 0 ? currentQuestion.items[0] : null;

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: phase === 'input' ? 'flex-start' : 'center',
            pt: phase === 'input' ? 12 : 0,
            gap: 4
        }}>
            {/* Instruction Modal */}
            <GenericModal
                isOpen={phase === 'instruction'}
                onClose={() => { }}
                title={t.instructions}
                hideCancelButton={true}
                submitButtonText={t.start}
                onSubmit={handleStart}
                instructionText={session.instructions || "You will hear number sequences. After each, type what you heard."}
                enableAudio={true} // Read instructions
                languageCode={languageCode}
            >
                <Typography>{session.instructions || "You will hear number sequences. After each, type what you heard."}</Typography>
            </GenericModal>

            {/* Playing State */}
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

                    {/* Audio Player - auto plays */}
                    {/* Audio Player - auto plays */}
                    {currentItem?.audio_url && (
                        <AudioPlayer
                            src={getAudioUrl(currentItem.audio_url)}
                            play={true}
                            onEnded={handleAudioEnded}
                        />
                    )}
                </Box>
            )}

            {/* Playing Complete State */}
            {phase === 'playing_complete' && (
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
                            {t.completed || 'Completed'}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                        <MorenButton
                            variant="contained"
                            onClick={handleRepeat}
                            sx={{ width: '150px', backgroundColor: '#274765' }}
                        >
                            {t.next === 'SIGUIENTE' ? 'REPETIR' : 'REPEAT'}
                        </MorenButton>

                        <MorenButton
                            variant="contained"
                            onClick={handleNextFromComplete}
                            sx={{ minWidth: '160px', px: 2, backgroundColor: '#274765' }}>
                            {t.answerNow}
                        </MorenButton>
                    </Box>
                </Box>
            )}

            {/* Input State */}
            {phase === 'input' && (
                <Box sx={{ width: '100%', maxWidth: '600px', p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                    />

                    {error && (
                        <Typography color="error" textAlign="center">{error}</Typography>
                    )}

                    <MorenButton
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{ width: '100%', mt: 2 }}
                    >
                        {t.answerNow}
                    </MorenButton>
                </Box>
            )}

        </Box>
    );
};

export default NumberRecall;
