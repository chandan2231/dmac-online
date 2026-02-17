import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MorenButton from '../../../../../components/button';
import GenericModal from '../../../../../components/modal';
import ConfirmationModal from '../../../../../components/modal/ConfirmationModal';
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
        enterAnswers: getLanguageText(languageConstants, 'game_answer_now') || 'Answer Now', // Changed from game_enter_answers
        inputPlaceholder: getLanguageText(languageConstants, 'game_input_placeholder') || 'Type your recall here...',
        answerNow: getLanguageText(languageConstants, 'game_next') || 'NEXT', // Changed from game_answer_now/ANSWER NOW
        submitContinue: getLanguageText(languageConstants, 'submit_continue') || 'Submit & Continue',
        audioInstruction: getLanguageText(languageConstants, 'game_audio_instruction') || 'Audio Instruction'
    };

    // State
    const [phase, setPhase] = useState<'pre_audio_instruction' | 'playing_audio' | 'playing_complete' | 'post_audio_instruction' | 'recall'>('pre_audio_instruction');
    const [inputText, setInputText] = useState('');

    // Audio Playlist State
    const [playlist, setPlaylist] = useState<string[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

    // Allow only a single manual repeat after the initial auto-play
    const [repeatUsed, setRepeatUsed] = useState(false);

    // Confirmation Modal State
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Initialization: Logic to determine playlist (Backend items OR Local V1/V2)
    useEffect(() => {
        const items = session.questions?.[0]?.items || [];

        if (items.length > 0) {
            // Case 1: Backend provides items (Individual words)
            // Filter items that have audio/multimedia_url and shuffle them
            const audioItems = items
                .filter((item: any) => item.multimedia_url || item.audio_url)
                .map((item: any) => item.multimedia_url || item.audio_url);

            if (audioItems.length > 0) {
                // Shuffle
                const shuffled = [...audioItems].sort(() => Math.random() - 0.5);
                console.log('[AudioWordsRecall] Using randomized backend items:', shuffled);
                setPlaylist(shuffled);
            } else {
                console.warn('[AudioWordsRecall] Items present but no audio URLs found. Falling back.');
                setupFallbackAudio();
            }
        } else {
            // Case 2: No backend items - use existing fallback logic
            setupFallbackAudio();
        }
    }, [session]);

    const setupFallbackAudio = () => {
        const ver = Math.random() < 0.5 ? 1 : 2;
        console.log('[AudioWordsRecall] Using fallback local audio version:', ver);
        const audioUrl = ver === 1 ? audioV1 : audioV2;
        setPlaylist([audioUrl]);
    };

    const question = session.questions?.[0] as any;

    // Current audio source
    const currentAudioUrl = playlist[currentTrackIndex];

    const handleAudioComplete = () => {
        if (currentTrackIndex < playlist.length - 1) {
            // Play next track
            // Small delay could be nice, but for now direct transition
            setCurrentTrackIndex(prev => prev + 1);
        } else {
            // All finished
            setPhase('playing_complete');
        }
    };

    const handleStart = () => {
        window.speechSynthesis.cancel();
        if (isRecallOnly) {
            setPhase('recall');
        } else {
            // Reset playlist position if restarting
            setRepeatUsed(false);
            setCurrentTrackIndex(0);
            setPhase('playing_audio');
        }
    };

    const handleRepeat = () => {
        window.speechSynthesis.cancel();
        if (repeatUsed) return;
        setRepeatUsed(true);
        setCurrentTrackIndex(0); // Restart playlist
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
            minHeight: '80vh',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
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
                audioButtonAlignment="center"
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
                audioButtonAlignment="center"
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
                            {playlist.length > 1 && ` (${currentTrackIndex + 1}/${playlist.length})`}
                        </Typography>
                    </Box>
                    {currentAudioUrl && (
                        <AudioPlayer
                            // Add key to force remount/update when src changes
                            key={currentAudioUrl}
                            src={currentAudioUrl}
                            play={true}
                            onEnded={handleAudioComplete}
                        />
                    )}
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

                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 2,
                        mt: 4,
                        width: '100%'
                    }}>
                        <MorenButton
                            variant="outlined"
                            onClick={handleRepeat}
                            disabled={repeatUsed}
                            sx={{
                                borderColor: '#274765',
                                color: '#274765',
                                width: { xs: 140, sm: 180 },
                                minWidth: { xs: 'none', sm: '180px' },
                                fontWeight: 'bold',
                                borderWidth: 2,
                                borderRadius: '12px',
                                px: { xs: 2, sm: 4 },
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
                            onClick={handleNextToPost}
                            sx={{
                                width: { xs: 140, sm: 180 },
                                minWidth: { xs: 'none', sm: '180px' },
                                backgroundColor: '#274765',
                                color: 'white',
                                fontWeight: 'bold',
                                borderRadius: '12px',
                                px: { xs: 2, sm: 4 },
                                py: 2,
                                fontSize: '1.1rem'
                            }}>
                            {t.answerNow}
                        </MorenButton>
                    </Box>
                </Box>
            )}

            {/* Recall Phase */}
            {phase === 'recall' && (
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
                        />

                        <MorenButton
                            variant="contained"
                            onClick={handleSubmit}
                            sx={{
                                width: '100%',
                                maxWidth: '600px',
                                fontSize: '1.2rem',
                                py: 2.5,
                                fontWeight: 'bold',
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

export default AudioWordsRecall;
