import { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import type { SessionData } from '../../../../../services/gameApi';
import MorenButton from '../../../../../components/button';
import SpeechInput from '../../../../../components/SpeechInput';
import GenericModal from '../../../../../components/modal';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';

interface ColorRecallProps {
    session: SessionData;
    onComplete: (answers: any[]) => void;
    languageCode: string;
}

const ColorRecall = ({ session, onComplete, languageCode }: ColorRecallProps) => {
    const { languageConstants } = useLanguageConstantContext();
    const [inputText, setInputText] = useState('');
    const [showInstruction, setShowInstruction] = useState(true);
    const [timeLeft, setTimeLeft] = useState(120);
    const [isActive, setIsActive] = useState(false);
    const liveTranscriptRef = useRef('');

    // Translations
    const t = {
        instructions: getLanguageText(languageConstants, 'game_instruction') || 'Instructions',
        start: getLanguageText(languageConstants, 'game_start') || 'START',
        answerNow: getLanguageText(languageConstants, 'game_answer_now') || 'SUBMIT',
        inputPlaceholder: 'Enter Answers (e.g., red blue)',
    };

    const question = session.questions?.[0];

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleSubmit();
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleInstructionSubmit = () => {
        setShowInstruction(false);
        setIsActive(true);
    };

    const handleSubmit = () => {
        setIsActive(false);
        const finalText = inputText.trim() || liveTranscriptRef.current.trim();

        const answer = {
            question_id: question?.question_id,
            answer_text: finalText,
            language_code: languageCode
        };

        onComplete([answer]);
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>

            {/* Instruction Modal */}
            <GenericModal
                isOpen={showInstruction}
                onClose={() => { }}
                title={`${session.module?.name} ${t.instructions}`}
                hideCancelButton={true}
                submitButtonText={t.start}
                onSubmit={handleInstructionSubmit}
                instructionText={session.module?.description || session.instructions}
                languageCode={languageCode}
                enableAudio={true}
            >
                <Typography>{session.module?.description || session.instructions}</Typography>
            </GenericModal>

            {/* Timer Display */}
            {!showInstruction && (
                <Box sx={{
                    alignSelf: 'flex-end',
                    mb: 2,
                    p: 1,
                    border: '2px solid #274765',
                    borderRadius: '8px',
                    backgroundColor: timeLeft < 10 ? '#ffebee' : '#e3f2fd'
                }}>
                    <Typography variant="h6" sx={{ color: timeLeft < 10 ? 'red' : '#274765', fontWeight: 'bold' }}>
                        Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </Typography>
                </Box>
            )}

            {/* Input Area */}
            {!showInstruction && (
                <Box sx={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 3, mt: 4 }}>
                    <Typography variant="h6" sx={{ textAlign: 'center' }}>
                        {question?.prompt_text || "Please enter the colors you recall"}
                    </Typography>

                    <SpeechInput
                        fullWidth
                        value={inputText}
                        onChange={setInputText}
                        onSpeechResult={(text) => setInputText(prev => prev + (prev ? ', ' : '') + text)}
                        onTranscriptChange={(text) => {
                            liveTranscriptRef.current = text;
                        }}
                        languageCode={languageCode}
                        placeholder={t.inputPlaceholder}
                    />

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

export default ColorRecall;
