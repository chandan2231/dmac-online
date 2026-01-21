import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MorenButton from '../../../../../components/button';
import GenericModal from '../../../../../components/modal';
import type { SessionData } from '../../../../../services/gameApi';
import SpeechInput from '../../../../../components/SpeechInput';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';
import AudioPlayer from './Shared/AudioPlayer';

// Assets
import audioV1 from '../../../../../assets/AudioWordRecal/audio_words_version_1.mp3';
import audioV2 from '../../../../../assets/AudioWordRecal/audio_words_version_2.mp3';

interface AudioWordsRecallProps {
    session: SessionData;
    onComplete: (answers: any[]) => void;
    languageCode: string;
    isRecallOnly?: boolean;
}

const AudioWordsRecall = ({ session, onComplete, languageCode, isRecallOnly = false }: AudioWordsRecallProps) => {
    const { languageConstants } = useLanguageConstantContext();

    // Translations
    const t = {
        instructions: getLanguageText(languageConstants, 'game_instructions'),
        start: getLanguageText(languageConstants, 'game_start'),
        next: getLanguageText(languageConstants, 'game_next'),
        repeat: getLanguageText(languageConstants, 'game_repeat'),
        playing: getLanguageText(languageConstants, 'game_playing'),
        completed: getLanguageText(languageConstants, 'game_completed_status'),
        enterAnswers: getLanguageText(languageConstants, 'game_enter_answers'),
        inputPlaceholder: getLanguageText(languageConstants, 'game_input_placeholder') || 'Type your recall here...',
        answerNow: getLanguageText(languageConstants, 'game_answer_now') || 'ANSWER NOW',
        audioInstruction: getLanguageText(languageConstants, 'game_audio_instruction') || 'Audio Instruction'
    };

    // State
    const [phase, setPhase] = useState<'pre_audio_instruction' | 'playing_audio' | 'playing_complete' | 'post_audio_instruction' | 'recall'>(() => {
        return isRecallOnly ? 'recall' : 'pre_audio_instruction';
    });
    const [inputText, setInputText] = useState('');
    const [selectedVersion, setSelectedVersion] = useState<1 | 2>(1);

    // Select version once on mount
    useEffect(() => {
        // Randomly select 1 or 2
        const ver = Math.random() < 0.5 ? 1 : 2;
        console.log('[AudioWordsRecall] Selected Version:', ver);
        setSelectedVersion(ver);
    }, []);

    const question = session.questions?.[0] as any; // Cast to access post_game_text which might be dynamic
    const audioUrl = selectedVersion === 1 ? audioV1 : audioV2;

    const handleAudioComplete = () => {
        setPhase('playing_complete');
    };

    const handleStart = () => {
        window.speechSynthesis.cancel(); // Stop any instruction audio
        setPhase('playing_audio');
    };

    const handleRepeat = () => {
        window.speechSynthesis.cancel();
        setPhase('playing_audio');
    };

    const handleNextToPost = () => {
        window.speechSynthesis.cancel();
        setPhase('post_audio_instruction');
    };

    const handleNextToRecall = () => {
        window.speechSynthesis.cancel();
        setPhase('recall');
    };

    const handleSubmit = () => {
        if (!question) return;

        const answer = {
            question_id: question.question_id,
            answer_text: inputText.trim(),
            language_code: languageCode
        };

        onComplete([answer]);
    };

    if (!question) {
        return <Typography color="error">No question content available.</Typography>;
    }

    // Use prompt_text from DB for instructions
    const preInstruction = question.prompt_text || 'Please listen to and remember the following spoken words...';
    // Use post_game_text from DB for post-instructions (as stored in DB insert)
    const postInstruction = question.post_game_text || 'Please recall the words...';

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: phase === 'recall' ? 'flex-start' : 'center',
            pt: phase === 'recall' ? 12 : 0
        }}>
            {/* Pre Audio Instruction */}
            <GenericModal
                isOpen={phase === 'pre_audio_instruction'}
                onClose={() => { }}
                title={`${session.module?.name || ''} ${t.instructions}`}
                hideCancelButton={true}
                submitButtonText={t.start}
                onSubmit={handleStart}
                enableAudio={true}
                audioButtonLabel={t.audioInstruction}
                instructionText={preInstruction}
                languageCode={languageCode}
            >
                <Typography>{preInstruction}</Typography>
            </GenericModal>

            {/* Post Audio Instruction */}
            <GenericModal
                isOpen={phase === 'post_audio_instruction'}
                onClose={() => { }}
                title={(() => {
                    const val = getLanguageText(languageConstants, 'game_instructions_for_answer');
                    return (val && val !== 'game_instructions_for_answer') ? val : 'Instructions For Answer';
                })()}
                hideCancelButton={true}
                submitButtonText={t.next}
                onSubmit={handleNextToRecall}
                enableAudio={true}
                audioButtonLabel={t.audioInstruction}
                instructionText={postInstruction}
                languageCode={languageCode}
            >
                <Typography sx={{ color: '#d32f2f', fontSize: '1.1rem' }}>
                    {postInstruction}
                </Typography>
            </GenericModal>

            {/* Playing Phase */}
            {phase === 'playing_audio' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <Box sx={{
                        border: '2px solid #274765',
                        px: 8,
                        py: 2,
                        minWidth: '300px',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                            {t.playing || 'Playing...'}
                        </Typography>
                    </Box>
                    <AudioPlayer
                        src={audioUrl}
                        play={true}
                        onEnded={handleAudioComplete}
                    />
                </Box>
            )}

            {/* Playing Complete Phase */}
            {phase === 'playing_complete' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <Box sx={{
                        border: '2px solid #274765',
                        px: 8,
                        py: 2,
                        minWidth: '300px',
                        display: 'flex',
                        justifyContent: 'center'
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
                            {t.repeat || 'REPEAT'}
                        </MorenButton>

                        <MorenButton
                            variant="contained"
                            onClick={handleNextToPost}
                            sx={{ minWidth: '160px', px: 2, backgroundColor: '#274765' }}>
                            {t.answerNow}
                        </MorenButton>
                    </Box>
                </Box>
            )}

            {/* Recall Phase */}
            {phase === 'recall' && (
                <Box sx={{ width: '100%', maxWidth: '600px', p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" sx={{ textAlign: 'center' }}>
                        {t.enterAnswers}
                    </Typography>

                    <SpeechInput
                        fullWidth
                        value={inputText}
                        onChange={setInputText}
                        onSpeechResult={(text) => setInputText(prev => prev + ' ' + text)}
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

export default AudioWordsRecall;
