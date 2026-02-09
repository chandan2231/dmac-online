import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import MorenButton from '../../../../../components/button';
import GenericModal from '../../../../../components/modal';
import ConfirmationModal from '../../../../../components/modal/ConfirmationModal';
import type { SessionData } from '../../../../../services/gameApi';
import SpeechInput from '../../../../../components/SpeechInput';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';
import AudioPlayer from './Shared/AudioPlayer';
import story1English from '../../../../../assets/AudioStoryRecal/john_hapton_vacation_story_english.mp3';
import story1Spanish from '../../../../../assets/AudioStoryRecal/john_hapton_vacation_story_spanish.mp3';
import story1Hindi from '../../../../../assets/AudioStoryRecal/john_hapton_vacation_story_hindi.mp3';
import story1Arabic from '../../../../../assets/AudioStoryRecal/john_hapton_vacation_story_arabic.mp3';

import story2English from '../../../../../assets/AudioStoryRecal/marynotingham_hidentreassure_story_english.mp3';
import story2Spanish from '../../../../../assets/AudioStoryRecal/marynotingham_hidentreassure_story_spanish.mp3';
import story2Hindi from '../../../../../assets/AudioStoryRecal/marynotingham_hidentreassure_story_hindi.mp3';
import story2Arabic from '../../../../../assets/AudioStoryRecal/marynotingham_hidentreassure_story_arabic.mp3';

interface AudioStoryRecallProps {
    session: SessionData;
    onComplete: (answers: any[]) => void;
    languageCode: string;
    isRecallOnly?: boolean;
}

const AudioStoryRecall = ({ session, onComplete, languageCode, isRecallOnly = false }: AudioStoryRecallProps) => {
    const { languageConstants } = useLanguageConstantContext();

    // Translations
    const t = {
        instructions: getLanguageText(languageConstants, 'game_instructions'),
        start: getLanguageText(languageConstants, 'game_start'),
        next: getLanguageText(languageConstants, 'game_next'),
        repeat: getLanguageText(languageConstants, 'game_repeat'),
        playing: getLanguageText(languageConstants, 'game_playing'),
        completed: getLanguageText(languageConstants, 'game_completed_status'),
        enterAnswers: getLanguageText(languageConstants, 'game_answer_now') || 'Answer Now',
        inputPlaceholder: getLanguageText(languageConstants, 'game_input_placeholder') || 'Type your recall here...',
        validationError: getLanguageText(languageConstants, 'game_validation_error'),
        answerNow: getLanguageText(languageConstants, 'game_next') || 'NEXT',
        audioInstruction: getLanguageText(languageConstants, 'game_audio_instruction') || 'Audio Instruction'
    };

    // Phases: 'pre_audio_instruction' -> 'playing_audio' -> 'playing_complete' -> 'post_audio_instruction' -> 'recall'
    const [phase, setPhase] = useState<'pre_audio_instruction' | 'playing_audio' | 'playing_complete' | 'post_audio_instruction' | 'recall'>('pre_audio_instruction');
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);

    // Current input
    const [inputText, setInputText] = useState('');
    const [error, setError] = useState('');

    // Confirmation Modal State
    const [showConfirmation, setShowConfirmation] = useState(false);

    const stories = session.questions || [];
    const currentStory = stories[currentStoryIndex];

    const getLanguageSuffix = (code: string) => {
        if (!code) return 'english';
        const lang = code.toLowerCase();
        if (lang.startsWith('es')) return 'spanish';
        if (lang.startsWith('hi')) return 'hindi';
        if (lang.startsWith('ar')) return 'arabic';
        return 'english';
    };

    const resolveAudioUrl = (url: string) => {
        if (!url) {
            console.warn('[AudioStoryRecall] No audio URL provided');
            return '';
        }

        const langSuffix = getLanguageSuffix(languageCode);
        console.log(`[AudioStoryRecall] Resolving audio for language: ${languageCode} (${langSuffix})`);

        // Map local filenames to imports
        // We look for substrings that identify the story
        if (url.includes('john_hapton') || url.includes('vacation_story')) {
            console.log('[AudioStoryRecall] Mapped to Story 1 Audio');
            switch (langSuffix) {
                case 'spanish': return story1Spanish;
                case 'hindi': return story1Hindi;
                case 'arabic': return story1Arabic;
                default: return story1English;
            }
        }

        if (url.includes('marynotingham') || url.includes('hidentreassure')) {
            console.log('[AudioStoryRecall] Mapped to Story 2 Audio');
            switch (langSuffix) {
                case 'spanish': return story2Spanish;
                case 'hindi': return story2Hindi;
                case 'arabic': return story2Arabic;
                default: return story2English;
            }
        }

        if (url.startsWith('http') || url.startsWith('https')) return url;

        console.warn('[AudioStoryRecall] Could not map URL to local asset, returning raw:', url);
        return url; // Fallback to whatever was provided
    };

    // Debug log
    const resolvedUrl = currentStory?.item?.audio_url ? resolveAudioUrl(currentStory.item.audio_url) : '';
    console.log('[AudioStoryRecall] Current Story Audio URL:', currentStory?.item?.audio_url);
    console.log('[AudioStoryRecall] Resolved Audio URL:', resolvedUrl);


    const handleAudioComplete = () => {
        setPhase('playing_complete');
    };

    const handleNextFromInstruction = () => {
        if (isRecallOnly) {
            setPhase('recall');
        } else {
            setPhase('playing_audio');
        }
    };

    const handleNextFromPostInstruction = () => {
        setPhase('recall');
    };

    const handleRepeat = () => {
        setPhase('playing_audio');
    };

    const handleNextFromComplete = () => {
        setPhase('post_audio_instruction');
    };

    const handleSubmitAnswer = () => {
        // Validation removed as per request
        if (!inputText.trim()) {
            setShowConfirmation(true);
            return;
        }

        processSubmit();
    };

    const handleConfirmSubmit = () => {
        setShowConfirmation(false);
        processSubmit();
    };

    const processSubmit = () => {
        const answer = {
            question_id: currentStory.question_id,
            answer_text: inputText.trim()
        };

        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);
        setInputText('');
        setError('');

        if (currentStoryIndex < stories.length - 1) {
            // Move to next story
            setCurrentStoryIndex(prev => prev + 1);
            setPhase('pre_audio_instruction'); // Start with instruction for next story
        } else {
            // All done
            onComplete(newAnswers);
        }
    };

    if (!currentStory) {
        return <Typography color="error">No stories available.</Typography>;
    }

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
        }}>

            {/* Pre Audio Instruction Modal */}
            <GenericModal
                isOpen={phase === 'pre_audio_instruction'}
                onClose={() => { }}
                title={`${session.module?.name || ''} ${t.instructions}`}
                hideCancelButton={true}
                submitButtonText={t.start}
                onSubmit={handleNextFromInstruction}
                enableAudio={true}
                audioButtonLabel={t.audioInstruction}
                audioButtonAlignment="center"
                instructionText={currentStory.prompt_text || ''}
                languageCode={languageCode}
            >
                <Typography>{currentStory.prompt_text}</Typography>
            </GenericModal>

            {/* Post Audio Instruction Modal (RED Text) */}
            <GenericModal
                isOpen={phase === 'post_audio_instruction'}
                onClose={() => { }}
                title={(() => {
                    const val = getLanguageText(languageConstants, 'game_instructions_for_answer');
                    return (val && val !== 'game_instructions_for_answer') ? val : 'Instructions For Answer';
                })()}
                hideCancelButton={true}
                submitButtonText={t.next}
                onSubmit={handleNextFromPostInstruction}
                enableAudio={true}
                audioButtonLabel={t.audioInstruction}
                audioButtonAlignment="center"
                instructionText={currentStory.post_instruction_text || ''}
                languageCode={languageCode}
            >
                <Typography sx={{ color: '#d32f2f', fontSize: '1.1rem' }}>
                    {currentStory.post_instruction_text}
                </Typography>
            </GenericModal>


            {/* Playing Phase: Playing... */}
            {
                phase === 'playing_audio' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>

                        <Box sx={{
                            border: '2px solid #274765', // Using a dark blue similar to screenshot or primary
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

                        {currentStory.item?.audio_url && resolvedUrl && (
                            <AudioPlayer
                                src={resolvedUrl}
                                play={true}
                                onEnded={handleAudioComplete}
                            />
                        )}
                    </Box>
                )
            }

            {/* Playing Phase: Completed */}
            {
                phase === 'playing_complete' && (
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
                                variant="outlined"
                                onClick={handleRepeat}
                                sx={{
                                    borderColor: '#274765',
                                    color: '#274765',
                                    minWidth: '180px',
                                    fontWeight: 'bold',
                                    borderWidth: 2,
                                    borderRadius: '12px',
                                    px: 4,
                                    py: 2,
                                    '&:hover': {
                                        borderWidth: 2,
                                        borderColor: '#1e3650',
                                        backgroundColor: 'rgba(39, 71, 101, 0.04)'
                                    }
                                }}
                            >
                                {t.repeat || 'REPEAT'}
                            </MorenButton>

                            <MorenButton
                                variant="contained"
                                onClick={handleNextFromComplete}
                                sx={{
                                    minWidth: '180px',
                                    backgroundColor: '#274765',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderRadius: '12px',
                                    px: 4,
                                    py: 2,
                                    fontSize: '1.1rem'
                                }}>
                                {t.answerNow}
                            </MorenButton>
                        </Box>
                    </Box>
                )
            }

            {/* Recall Phase */}
            {
                phase === 'recall' && (
                    <Box sx={{ width: '100%', maxWidth: '600px', p: 2, pb: 25, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                            enableModeSelection={true}
                        />

                        {error && (
                            <Typography color="error" textAlign="center">{error}</Typography>
                        )}

                        <MorenButton
                            variant="contained"
                            onClick={handleSubmitAnswer}
                            sx={{
                                position: 'absolute',
                                bottom: '150px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '90%',
                                maxWidth: '600px',
                                zIndex: 10,
                                mt: 2,
                                fontSize: '1.2rem',
                                py: 1.5,
                                fontWeight: 'bold'
                            }}
                        >
                            {t.answerNow}
                        </MorenButton>
                    </Box >
                )
            }

            <ConfirmationModal
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleConfirmSubmit}
            />
        </Box >
    );
};

export default AudioStoryRecall;
