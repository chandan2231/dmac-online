import { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import type { SessionData } from '../../../../../services/gameApi';
import MorenButton from '../../../../../components/button';
import SpeechInput from '../../../../../components/SpeechInput';
import GenericModal from '../../../../../components/modal';
import ConfirmationModal from '../../../../../components/modal/ConfirmationModal';
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
    const [showConfirmation, setShowConfirmation] = useState(false);
    const liveTranscriptRef = useRef('');

    // Translations
    const t = {
        instructions: getLanguageText(languageConstants, 'game_instruction') || 'Instructions',
        start: getLanguageText(languageConstants, 'game_start') || 'START',
        answerNow: getLanguageText(languageConstants, 'game_next') || 'NEXT', // Changed from game_answer_now/NEXT
        submitContinue: getLanguageText(languageConstants, 'submit_continue') || 'Submit & Continue',
        inputPlaceholder: 'Enter Answers (e.g., red blue)',
        audioInstruction: getLanguageText(languageConstants, 'game_audio_instruction') || 'Audio Instruction'
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
        const finalText = inputText.trim() || liveTranscriptRef.current.trim();

        if (!finalText) {
            setShowConfirmation(true);
            return;
        }

        processSubmit(finalText);
    };

    const handleConfirmSubmit = () => {
        setShowConfirmation(false);
        const finalText = inputText.trim() || liveTranscriptRef.current.trim();
        processSubmit(finalText);
    };

    const processSubmit = (finalText: string) => {
        setIsActive(false);

        const answer = {
            question_id: question?.question_id,
            answer_text: finalText,
            language_code: languageCode
        };

        onComplete([answer]);
    };

    return (
        <Box sx={{ width: '100%', height: '100%', minHeight: '80vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>

            {/* Instruction Modal */}
            <GenericModal
                isOpen={showInstruction}
                onClose={() => { }}
                title={`${session.module?.name} ${t.instructions}`}
                hideCancelButton={true}
                submitButtonText={t.start}
                onSubmit={handleInstructionSubmit}
                instructionText={session.module?.description || session.instructions}
                enableAudio={true}
                audioButtonLabel={t.audioInstruction}
                audioButtonAlignment="center"
                languageCode={languageCode}
            >
                <Typography>{session.module?.description || session.instructions}</Typography>
            </GenericModal>



            {/* Input Area */}
            {!showInstruction && (
                <Box sx={{ width: '100%', maxWidth: '600px', pb: 25, display: 'flex', flexDirection: 'column', gap: 3, mt: 4 }}>
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
                        // placeholder={t.inputPlaceholder}
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
                        {t.submitContinue}
                    </MorenButton>
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

export default ColorRecall;
